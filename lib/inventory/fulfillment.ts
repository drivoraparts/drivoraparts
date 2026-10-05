import type { Product } from "./types";

/**
 * Where a listing says it ships from.
 *
 * DrivoraParts fills some orders from its own inventory and others straight
 * from a supplier, depending on where the specific part sits. `location` is
 * the only field that says which, and its values are not equally reliable:
 *
 *  - "our supplier network" is written by the supplier importer, so it is
 *    specific and is kept.
 *  - "Import -- Ships Worldwide" and the "...warehouse or supplier network,
 *    depending on your location" wording already say no more than is known.
 *  - "USA Warehouse" and its EU/UK variants are constants the import scripts
 *    and a few hand-authored blocks stamp on every listing. Nothing records
 *    that the unit is in a warehouse we operate, so on their own they claim
 *    more than the data supports.
 *
 * A warehouse label therefore survives to the page only when the listing sets
 * `shipsFromVerified: true`. Every other one reads as the neutral sentence
 * below, once, here, so the product page, cards, ad copy and social copy agree.
 *
 * This is wording only. Stock, availability labels and the Meta feed are not
 * read or changed here.
 */
export const NEUTRAL_FULFILLMENT_LOCATION =
  "DrivoraParts or our supplier network, depending on part availability and location";

const WAREHOUSE_LABEL = /warehouse/i;
const ALREADY_QUALIFIED = /supplier|network|import/i;

export function applyFulfillmentWording(items: Product[]): Product[] {
  return items.map((product) => {
    const location = product.location?.trim();
    if (
      !location ||
      product.shipsFromVerified === true ||
      ALREADY_QUALIFIED.test(location) ||
      !WAREHOUSE_LABEL.test(location)
    ) {
      return product;
    }
    return { ...product, location: NEUTRAL_FULFILLMENT_LOCATION };
  });
}
