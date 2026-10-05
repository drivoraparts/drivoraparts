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

import type { Product } from "./types";

/**
 * Why a warehouse label is not treated as stock.
 *
 * `location: "USA Warehouse"` is a constant the import scripts stamp on every
 * listing they write, and `stockQty` is likewise an importer default (41 of 42
 * suspension kits carry exactly 3; the inventory table falls back to
 * `stockQty ?? 10`). Neither records that a unit is on a shelf. So a warehouse
 * name only survives to the page when the listing carries an explicit
 * `physicalStockConfirmed: true`; every other warehouse label is replaced here,
 * once, with the neutral wording below, so the product page, ad copy and feeds
 * all say the same thing.
 */
export const NEUTRAL_FULFILLMENT_LOCATION = "our fulfillment network";

const WAREHOUSE_LABEL = /warehouse/i;

export function applyFulfillmentRules(items: Product[]): Product[] {
  return items.map((product) => {
    if (
      product.physicalStockConfirmed === true ||
      !product.location ||
      !WAREHOUSE_LABEL.test(product.location)
    ) {
      return product;
    }
    return { ...product, location: NEUTRAL_FULFILLMENT_LOCATION };
  });
}

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
