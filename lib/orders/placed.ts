import type { OrderStatus, OrderWithDetails } from "@/lib/db/orders";
import type { PaymentRecord } from "@/lib/db/payments";

/** Fulfillment pipeline — every one of these is a live order. */
export const CONFIRMED_ORDER_STATUSES: OrderStatus[] = [
  "processing",
  "paid",
  "shipped",
  "delivered",
  "refunded",
];

export function isConfirmedOrderStatus(status: OrderStatus): boolean {
  return CONFIRMED_ORDER_STATUSES.includes(status);
}

/**
 * What this actually needs from an order.
 *
 * Only the presence of a customer and the number of line items are checked,
 * never their contents — so callers computing stats over every order can
 * select presence instead of fetching whole joined rows. OrderWithDetails
 * still satisfies this, so existing callers are unaffected.
 */
export type PlacedOrderCandidate = {
  status: OrderStatus;
  created_at: string;
  customer: unknown;
  items: readonly unknown[];
};

/**
 * Did somebody actually place this order?
 *
 * A customer, at least one line item, and a payment session. That is the whole
 * test. Anything missing one of those is not an order somebody placed — it is a
 * row left behind by a checkout that broke partway through, which is why the
 * admin list and the order stats both exclude it.
 *
 * NOTHING IS HIDDEN BY AGE OR BY PAYMENT PROGRESS, on purpose.
 *
 * This used to drop a pending order once it passed OPEN_CHECKOUT_MAX_AGE_MS, six
 * hours, on the theory that an unpaid checkout that old had been abandoned. It
 * cost the owner a live sale: DRV-LCSURBC, $1,083, crypto, vanished from admin
 * Orders seven hours after it was placed while the customer was still arranging
 * payment. The row was fine the whole time — customer tracking does not apply
 * this filter, so the buyer could see an order the owner could not.
 *
 * Every payment method here is a bank transfer, a peer-to-peer app or a crypto
 * invoice. None settle in minutes; a wire begun on Friday may not arrive before
 * Monday. There is no age at which an unpaid order is safely assumed dead, and
 * guessing at one hides real money. The admin Orders list has a delete button on
 * every row (see components/admin/DeleteOrderButton), so removing an order that
 * really is abandoned is the owner's call to make and theirs to see.
 *
 * Cancelled and failed orders stay excluded: those are explicit end states
 * somebody or something recorded, not a guess about elapsed time.
 */
export function isPlacedOrder(
  order: PlacedOrderCandidate,
  payment?: PaymentRecord | null
): boolean {
  if (order.status === "cancelled" || order.status === "failed") {
    return false;
  }

  if (!order.customer || order.items.length === 0) {
    return false;
  }

  return Boolean(payment);
}
