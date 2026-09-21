import { MANUAL_METHODS } from "@/lib/payments/manual-methods";

/*
 * The purchase terms a product page states, and where each one comes from.
 *
 * Nothing here is a new promise. Every line restates something the site
 * already commits to elsewhere, so the product page can say it at the point
 * of purchase without inventing its own version:
 *
 *  - free standard shipping: lib/shipping/quote.ts prices standard at zero on
 *    every cart, and the Shipping Policy (section 4) says the same;
 *  - processing time: Shipping Policy, section 1;
 *  - returns: Returns & Refund Policy, sections 2-10;
 *  - payment methods: the enabled entries in lib/payments/manual-methods.ts,
 *    which is the list checkout renders, plus the NOWPayments crypto option.
 *
 * If a policy changes, change it here too, or the product page will quote
 * terms the policy no longer offers.
 */

export const SHIPPING_POLICY_HREF = "/policies/shipping-policy";
export const RETURN_POLICY_HREF = "/policies/refund-policy";
export const START_RETURN_HREF = "/returns";
export const CONTACT_HREF = "/contact";

/** Shipping Policy, section 1: "typically processed within 1 to 5 business days". */
export const ORDER_PROCESSING = "1–5 business days";

/** Returns & Refund Policy, section 2. */
export const RETURN_WINDOW_DAYS = 30;

/** Returns & Refund Policy, section 6. */
export const REFUND_PROCESSING = "5–10 business days";

/**
 * How the item travels, read from the listing's own freight notes.
 *
 * The notes are catalog data and stay as authored. Only the handling class is
 * taken from them: several also say "Cost calculated by destination" or offer
 * liftgate service "at checkout", and neither is true of the checkout, which
 * charges nothing for standard shipping and has no liftgate option. Listings
 * without notes return undefined -- the page says nothing rather than
 * guessing from the category.
 *
 * Order matters. "Standard insured parcel/courier -- no special freight
 * handling required" mentions freight only to rule it out, and a multi-box
 * note says larger kits "may be palletized".
 */
export function shipmentType(freightNotes?: string): string | undefined {
  const notes = (freightNotes ?? "").toLowerCase();
  if (!notes) return undefined;
  if (/multiple\b.*\bboxes|multi-?box/.test(notes)) return "Ships in multiple boxes";
  if (/\bparcel\b/.test(notes)) return "Ships as a parcel";
  if (/pallet/.test(notes)) return "Ships as palletized freight";
  if (/freight|\bltl\b|oversize|bulky/.test(notes)) return "Ships as freight (oversized item)";
  if (/courier/.test(notes)) return "Ships as a parcel";
  return undefined;
}

/** The direct methods checkout offers, in checkout's order. */
export const DIRECT_PAYMENT_METHODS = MANUAL_METHODS.filter((m) => m.enabled).map(
  (m) => m.label
);

/** "A, B, C or D" */
export function listWithOr(items: string[]): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} or ${items[items.length - 1]}`;
}
