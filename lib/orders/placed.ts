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

/**
 * How long a pending checkout with NO payment activity stays listed.
 *
 * Was 6 hours, which hid a live $1,083 order seven hours after it was placed:
 * DRV-LCSURBC, crypto, customer still to pay. Customer tracking kept showing it
 * to them the whole time, because that path does not apply this filter -- so the
 * buyer could see an order the owner could not.
 *
 * Six hours suits a shop where payment settles during checkout. Every method
 * here is a bank transfer, a peer-to-peer app or a crypto invoice (see
 * MANUAL_METHODS and the NOWPayments flow): none settle in minutes, and a wire
 * begun on Friday may not arrive before Monday. A week is the shortest window
 * that does not hide a customer who is simply paying at their own pace.
 *
 * Age only decides an order with no payment activity at all -- see
 * hasPaymentActivity, which keeps an engaged order listed however old it is.
 */
export const OPEN_CHECKOUT_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

/** Manual states that mean somebody has acted on the payment. */
const ENGAGED_MANUAL_STATES = new Set([
  "instructions_sent",
  "receipt_submitted",
  "under_review",
  "verified",
  "verification_failed",
]);

/**
 * Has anyone touched this payment since checkout created it?
 *
 * Read off the payment row: a provider invoice that actually exists, a manual
 * payment moved past "awaiting_payment", an uploaded receipt, or a status past
 * the initial "pending". Any of those means the order is being paid rather than
 * abandoned, so it stays listed indefinitely -- there is something for the owner
 * to do about it.
 *
 * Deliberately NOT a signal: having chosen a manual method. Since the payment
 * selector began requiring an explicit choice, every manual order carries one
 * from the moment it is placed, so treating that as activity would keep
 * genuinely abandoned carts listed forever -- which is what the age window is
 * there to prevent.
 */
function hasPaymentActivity(payment: PaymentRecord): boolean {
  if (payment.status !== "pending") return true;
  if (payment.provider_payment_id) return true;

  const meta = payment.metadata ?? {};
  const state = meta.manual_state;
  if (typeof state === "string" && ENGAGED_MANUAL_STATES.has(state)) return true;

  const receipts = meta.manual_receipts;
  return Array.isArray(receipts) && receipts.length > 0;
}

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
 * A placed order completed checkout (customer + line items + payment session).
 * Abandoned unpaid checkouts and failed/cancelled attempts are excluded.
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

    // Being paid, however slowly, is not abandonment.
    if (hasPaymentActivity(payment)) {
      return true;
    }

    const ageMs = Date.now() - new Date(order.created_at).getTime();
    return ageMs <= OPEN_CHECKOUT_MAX_AGE_MS;
  }

  return false;
}
