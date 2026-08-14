/**
 * Keeps checkout_start to one event per cart per session.
 *
 * The page guarded the event with a ref, which only survives as long as the
 * component is mounted. Every remount fired it again — and the checkout page
 * is remounted routinely, because customers leave for NOWPayments and come
 * back without paying (the same journey readCheckoutFormDraft exists to
 * recover from). A refresh or a second visit did it too.
 *
 * The effect was a checkout count inflated well past the number of customers
 * who actually started one: 77 checkout_start events against 45 add_to_cart,
 * which made the funnel report more checkouts than carts.
 *
 * Session-scoped like the form draft, and keyed by cart contents so that
 * genuinely starting a different checkout still counts.
 */

const STORAGE_KEY = "drivora-checkout-started";

export type CheckoutSignatureItem = { id: number; quantity: number };

/** Order-independent, so reordering the cart doesn't read as a new checkout. */
export function buildCartSignature(items: readonly CheckoutSignatureItem[]): string {
  return items
    .map((item) => `${item.id}x${item.quantity}`)
    .sort()
    .join("|");
}

/**
 * Claims the checkout_start event for this cart, returning true only for the
 * first caller in the session. Returns true when storage is unavailable
 * (private browsing, quota) so tracking degrades to the old behaviour rather
 * than silently dropping the event altogether.
 */
export function claimCheckoutStart(signature: string): boolean {
  if (typeof window === "undefined") return false;

  try {
    if (window.sessionStorage.getItem(STORAGE_KEY) === signature) return false;
    window.sessionStorage.setItem(STORAGE_KEY, signature);
    return true;
  } catch {
    return true;
  }
}

/** Cleared once payment is confirmed, so a later order counts on its own. */
export function clearCheckoutStartClaim() {
  if (typeof window === "undefined") return;

  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
