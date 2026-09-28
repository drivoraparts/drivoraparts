/* =========================================================
   DRIVORAPARTS — WHAT THE STOREFRONT'S COUNTS MEAN
   ---------------------------------------------------------
   One definition per number, so two parts of the site cannot
   describe the same figure in two different ways.

   The storefront used to quote a count from three places: a
   hand-synced constant in lib/home/listing-count.ts, an
   ad-hoc getAllProducts().length in one component, and the
   catalog API's `total` in another. They agreed only as long
   as somebody remembered to re-run the sync script -- the
   constant sat at 1,446 while the catalog held 1,867, and the
   storefront quoted both figures for months.
========================================================= */

import { getAllProducts } from "@/lib/inventory";

/**
 * ACTIVE LISTINGS — every published listing in the catalog.
 *
 * This is the figure /catalog/all renders and the number the unfiltered
 * catalog API returns as `total`, because all three read getAllProducts().
 *
 * IT IS NOT A STOCK COUNT, AND MUST NOT BE WORDED AS ONE.
 * A listing carries a boolean `stock` flag and nothing else: no quantity, no
 * warehouse check, no supplier availability call. Just over half the catalog
 * is fulfilled through the supplier network rather than held by us (see the
 * `location` field), so "listings in stock" would claim something the system
 * cannot verify. Say "listings" or "active listings".
 */
export function getActiveListingCount(): number {
  return getAllProducts().length;
}

/**
 * Listings whose `stock` flag is not false.
 *
 * Still only the strength of that flag — it is an editorial state, not a
 * shelf count — so this is for internal reporting rather than shop copy.
 */
export function getStockedListingCount(): number {
  return getAllProducts().filter((product) => product.stock !== false).length;
}
