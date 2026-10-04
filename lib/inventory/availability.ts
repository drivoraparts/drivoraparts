/**
 * What the storefront says about availability.
 *
 * The catalog stores a boolean `stock` and a `location` that says where the
 * listing ships from. "In stock" is only a fair thing to say where the listing
 * names a warehouse of its own. Where it ships through the supplier network --
 * or names no location at all -- physical stock is not confirmed, so the page
 * says "Available to order" instead of promising inventory nobody can verify.
 *
 * No quantity is implied either way.
 */

export type AvailabilityLabel = "In stock" | "Available to order" | "Out of stock";

const SUPPLIER_FULFILLED = /supplier|network|import|depending on your location/i;

/** True when the listing is not confirmed as held in a warehouse of ours. */
export function isSupplierFulfilled(location?: string | null): boolean {
  const value = location?.trim();
  if (!value) return true;
  return SUPPLIER_FULFILLED.test(value);
}

export function resolveAvailabilityLabel(
  stock: boolean | undefined,
  location?: string | null
): AvailabilityLabel {
  if (stock === false) return "Out of stock";
  return isSupplierFulfilled(location) ? "Available to order" : "In stock";
}
