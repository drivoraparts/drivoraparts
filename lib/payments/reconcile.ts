import { handlePaidWebhook, markOrderFailed } from "@/lib/checkout/service";
import { listStalePendingOrders } from "@/lib/db/orders";
import { findPaymentByOrderId, updatePaymentRecord } from "@/lib/db/payments";
import {
  fetchNowPaymentsPaymentIndex,
  fetchNowPaymentsRemoteStatus,
  mapNowPaymentsStatusString,
} from "@/lib/payments/nowpayments/client";
import { logActivity } from "@/lib/monitoring/activity";
import { logError, logInfo } from "@/lib/monitoring/logger";

export type ReconcileSummary = {
  scanned: number;
  paid: number;
  failed: number;
  stillPending: number;
  errors: number;
  noPaymentRecord: number;
  noNowPaymentsRef: number;
};

export type ReconcileOptions = {
  olderThanMinutes?: number;
  limit?: number;
};

function paymentReference(
  payment: Awaited<ReturnType<typeof findPaymentByOrderId>>
): string | null {
  if (!payment) return null;

  const metadata = payment.metadata ?? {};
  const invoiceId =
    typeof metadata.invoice_id === "string" ? metadata.invoice_id : null;

  return payment.provider_payment_id ?? invoiceId;
}

/**
 * Poll NOWPayments for stale pending orders and sync payment + order status.
 * Safety net when IPN webhooks are delayed or missed.
 */
export async function reconcilePendingPayments(
  options?: ReconcileOptions
): Promise<ReconcileSummary> {
  const olderThanMinutes = options?.olderThanMinutes ?? 10;
  const limit = options?.limit ?? 100;
  const cutoffIso = new Date(Date.now() - olderThanMinutes * 60_000).toISOString();

  const stale = await listStalePendingOrders(cutoffIso, limit);
  const paymentIndex = await fetchNowPaymentsPaymentIndex(100);
  const summary: ReconcileSummary = {
    scanned: stale.length,
    paid: 0,
    failed: 0,
    stillPending: 0,
    errors: 0,
    noPaymentRecord: 0,
    noNowPaymentsRef: 0,
  };

  for (const order of stale) {
    try {
      const payment = await findPaymentByOrderId(order.id);
      if (!payment || payment.provider !== "nowpayments") {
        summary.stillPending += 1;
        summary.noPaymentRecord += 1;
        continue;
      }

      const ref = paymentReference(payment);
      let remote =
        paymentIndex.byOrderId.get(order.id) ??
        (ref ? paymentIndex.byInvoiceId.get(ref) : null) ??
        null;

      if (!remote && ref) {
        remote = await fetchNowPaymentsRemoteStatus(ref, order.id, paymentIndex);
      }

      if (!ref && !remote) {
        summary.stillPending += 1;
        summary.noNowPaymentsRef += 1;
        await logActivity("warn", "payment.reconcile_missing_ref", {
          orderId: order.id,
          paymentId: payment.id,
        });
        continue;
      }

      if (!remote) {
        summary.stillPending += 1;
        await logActivity("info", "payment.reconcile_still_pending", {
          orderId: order.id,
          provider: payment.provider,
          ref,
          note: "No NOWPayments payment row found for this order yet",
        });
        continue;
      }

      const mapped = mapNowPaymentsStatusString(remote.paymentStatus);

      if (mapped === "paid") {
        const invoiceRef = ref ?? remote.paymentId ?? "";
        const providerPaymentId = remote.paymentId ?? ref ?? invoiceRef;
        await updatePaymentRecord(payment.id, {
          status: "paid",
          provider_payment_id: providerPaymentId,
          metadata: {
            ...(payment.metadata ?? {}),
            paid_at: new Date().toISOString(),
            payment_method: "nowpayments",
            invoice_id: invoiceRef,
            payment_id: providerPaymentId,
            reconciled_at: new Date().toISOString(),
            lastRemoteStatus: remote.paymentStatus,
          },
        });
        await handlePaidWebhook(order.id);
        summary.paid += 1;
        await logActivity("info", "payment.reconcile_paid", {
          orderId: order.id,
          ref: invoiceRef,
          remoteStatus: remote.paymentStatus,
        });
        continue;
      }

      if (mapped === "failed") {
        if (payment.status !== "paid") {
          await updatePaymentRecord(payment.id, {
            status: "failed",
            metadata: {
              ...(payment.metadata ?? {}),
              lastRemoteStatus: remote.paymentStatus,
              reconciled_at: new Date().toISOString(),
            },
          });
        }
        await markOrderFailed(order.id);
        summary.failed += 1;
        await logActivity("warn", "payment.reconcile_failed", {
          orderId: order.id,
          ref,
          remoteStatus: remote.paymentStatus,
        });
        continue;
      }

      summary.stillPending += 1;
      await logActivity("info", "payment.reconcile_still_pending", {
        orderId: order.id,
        provider: payment.provider,
        ref,
        remoteStatus: remote.paymentStatus,
      });
    } catch (error) {
      summary.errors += 1;
      logError("payment_reconcile_order_failed", error, { orderId: order.id });
    }
  }

  logInfo("payment_reconcile_complete", { ...summary, olderThanMinutes });
  await logActivity("info", "payment.reconcile_complete", { ...summary });

  return summary;
}
