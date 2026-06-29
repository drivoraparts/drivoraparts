import type { OrderStatus, OrderWithDetails } from "@/lib/db/orders";
import type { PaymentRecord } from "@/lib/db/payments";

/** Fulfillment pipeline — always shown in admin Orders. */
export const CONFIRMED_ORDER_STATUSES: OrderStatus[] = [
  "processing",
  "paid",
  "shipped",
  "delivered",
  "refunded",
];

/** Pending checkout still within the payment window (customer may still pay). */
export const OPEN_CHECKOUT_MAX_AGE_MS = 6 * 60 * 60 * 1000;

export function isConfirmedOrderStatus(status: OrderStatus): boolean {
  return CONFIRMED_ORDER_STATUSES.includes(status);
}

/**
 * A placed order completed checkout (customer + line items + payment session).
 * Abandoned unpaid checkouts and failed/cancelled attempts are excluded.
 */
export function isPlacedOrder(
  order: Pick<OrderWithDetails, "status" | "created_at" | "customer" | "items">,
  payment?: PaymentRecord | null
): boolean {
  if (order.status === "cancelled" || order.status === "failed") {
    return false;
  }

  if (!order.customer || order.items.length === 0) {
    return false;
  }

  if (!payment) {
    return false;
  }

  if (isConfirmedOrderStatus(order.status)) {
    return true;
  }

  if (order.status === "pending") {
    if (payment.status === "paid") {
      return true;
    }

    const ageMs = Date.now() - new Date(order.created_at).getTime();
    return ageMs <= OPEN_CHECKOUT_MAX_AGE_MS;
  }

  return false;
}
