/* =========================================================
   DRIVORAPARTS — PUBLISHED US SHIPPING RATES
   ---------------------------------------------------------
   The one place a shipping CHARGE is decided before an order
   is placed. Checkout, the cart, product pages, the Shipping
   Policy page and the Google Merchant feed all read from here,
   so they cannot state different numbers.

   How a charge is worked out (United States only):

     1. Every product has a shipping label -- parcel, multibox
        or freight -- read from its own freight notes where the
        listing has them, and from its category where it does
        not (see classifyProductShipping).
     2. A cart where every item is a parcel is charged from
        US_PARCEL_RATE_TABLE, using the cart's GROSS subtotal
        (item prices x quantities, before discounts). Google
        Merchant Center's price-based table is applied to the
        order total the same way, so the two agree.
     3. A cart containing any multibox or freight item has no
        published rate yet (FREIGHT_RATE_TABLES are null). It is
        reported as "pending", never as $0, and the existing
        manual quote happens before the customer pays.
     4. Destinations outside the US, and subtotals above the top
        of the table, are also "pending" -- quoted manually, as
        the Shipping Policy already says.

   These are published policy values, not carrier quotes.
   Change the numbers here; nothing else needs to move.
========================================================= */

import { getProductById } from "@/lib/inventory";
import { getProductCatalogMeta } from "@/lib/inventory/productEnhancements";
import type { Product } from "@/lib/inventory/types";
import {
  classifyShipping,
  quoteShippingWith,
  type ShippingClassification,
  type ShippingQuote,
  type ShippingQuoteItem,
} from "./rate-table";

export * from "./rate-table";

export function classifyProductShipping(product: Product): ShippingClassification {
  const meta = getProductCatalogMeta(product);
  return classifyShipping({
    category: product.category,
    name: product.name,
    freightNotes: product.freightNotes ?? meta?.logistics?.freightNotes,
  });
}

export function classifyProductIdShipping(productId: number): ShippingClassification | null {
  const product = getProductById(productId);
  return product ? classifyProductShipping(product) : null;
}

/** The shipping charge for a cart from the catalog, or the reason there is none yet. */
export function quoteShipping(
  items: ShippingQuoteItem[],
  country: string | null | undefined
): ShippingQuote {
  return quoteShippingWith(items, country, classifyProductIdShipping);
}
