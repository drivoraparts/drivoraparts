import { listStalePendingOrders } from "@/lib/db/orders";
import { findPaymentByOrderId } from "@/lib/db/payments";
import { getCryptomusPaymentInfo } from "@/lib/payments/cryptomus/client";
import { handlePaidWebhook, markOrderFailed } from "@/lib/checkout/service";
import { logActivity } from "@/lib/monitoring/activity";
import { logError, logInfo } from "@/lib/monitoring/logger";

export type ReconcileSummary = {
  scanned: number;
  paid: number;
  failed: number;
  stillPending: number;
  errors: number;
};

export type ReconcileOptions = {
  /** Only reconcile orders older than this many minutes (avoids racing live webhooks). */
  olderThanMinutes?: number;
  /** Max orders to process per sweep. */
  limit?: number;
};

/**
 * Anti-loss safety net: finds stale `pending` orders, asks Cryptomus for the
 * authoritative status, and finalizes via the SAME idempotent path the webhook
 * uses. Safe to run repeatedly — every finalizer is an atomic compare-and-set,
 * so already-paid/failed orders are no-ops.
 */
export async function reconcilePendingPayments(
  options?: ReconcileOptions
): Promise<ReconcileSummary> {
  const olderThanMinutes = options?.olderThanMinutes ?? 10;
  const limit = options?.limit ?? 100;
  const cutoffIso = new Date(Date.now() - olderThanMinutes * 60_000).toISOString();

  const stale = await listStalePendingOrders(cutoffIso, limit);
  const summary: ReconcileSummary = {
    scanned: stale.length,
    paid: 0,
    failed: 0,
    stillPending: 0,
    errors: 0,
  };

  for (const order of stale) {
    try {
      const payment = await findPaymentByOrderId(order.id);

      // Only Cryptomus-backed orders are reconcilable against the Cryptomus API.
      if (!payment || payment.provider !== "cryptomus") {
        summary.stillPending += 1;
        continue;
      }

      const info = await getCryptomusPaymentInfo(order.id);

      if (info.ok) {
        if (info.status === "paid") {
          await handlePaidWebhook(order.id);
          summary.paid += 1;
          await logActivity("info", "payment.reconcile_recovered_paid", {
            orderId: order.id,
            transactionId: info.providerPaymentId,
          });
        } else if (info.status === "failed") {
          await markOrderFailed(order.id);
          summary.failed += 1;
        } else {
          summary.stillPending += 1;
        }
      } else {
        summary.errors += 1;
        await logActivity("warn", "payment.reconcile_lookup_failed", {
          orderId: order.id,
          error: info.error ?? "lookup failed",
        });
      }
    } catch (error) {
      summary.errors += 1;
      logError("payment_reconcile_order_failed", error, { orderId: order.id });
    }
  }

  logInfo("payment_reconcile_complete", { ...summary, olderThanMinutes });
  await logActivity("info", "payment.reconcile_complete", { ...summary });

  return summary;
}
