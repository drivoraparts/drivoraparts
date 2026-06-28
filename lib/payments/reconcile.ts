import { listStalePendingOrders } from "@/lib/db/orders";
import { findPaymentByOrderId } from "@/lib/db/payments";
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
  olderThanMinutes?: number;
  limit?: number;
};

/**
 * Safety net for stale pending orders. NOWPayments status is confirmed via IPN
 * webhooks; this sweep only logs non-NOWPayments pending orders for review.
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
    stillPending: stale.length,
    errors: 0,
  };

  for (const order of stale) {
    try {
      const payment = await findPaymentByOrderId(order.id);
      if (payment?.provider !== "nowpayments") {
        continue;
      }

      await logActivity("info", "payment.reconcile_still_pending", {
        orderId: order.id,
        provider: payment.provider,
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
