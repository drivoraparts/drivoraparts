/* =========================================================
   TOYOTA CATALOG VISIBILITY
   ---------------------------------------------------------
   DrivoraParts lists Toyota parts only. Every listing in the
   catalog was classified by scripts/audit-toyota-catalog.mjs:

     A  Toyota-compatible  -> publicly listed
     B  other manufacturer -> hidden
     C  unverified fitment -> hidden, flagged for review

   Hidden listings are NOT deleted. Their product IDs, order
   history, admin records and Supabase rows are untouched;
   they are simply left out of everything a shopper or a
   search engine can browse: category pages, search, rails,
   recommendations, the sitemap and the Merchant / Meta feeds.
   Their product pages answer "no longer available", are not
   indexed, and checkout refuses them.

   The visible list is generated data, not a runtime guess:
   re-run `node scripts/audit-toyota-catalog.mjs --write`
   after changing listings. A listing missing from the list
   -- a new import, an admin-added product -- is hidden until
   it has been classified, so nothing reaches the storefront
   unreviewed.
========================================================= */

import toyotaCatalog from "./data/toyota-catalog.json";
import toyotaGenuine from "./data/toyota-genuine.json";

const PUBLIC_IDS: ReadonlySet<number> = new Set(toyotaCatalog.visible);

const GENUINE_IDS: ReadonlySet<number> = new Set(
  (toyotaGenuine.verified as Array<{ id: number }>).map((entry) => entry.id)
);

/** True when the listing may appear anywhere on the public storefront. */
export function isPubliclyListed(product: { id: number } | number): boolean {
  const id = typeof product === "number" ? product : product.id;
  return PUBLIC_IDS.has(id);
}

/**
 * True only for listings verified as Toyota Genuine Parts in
 * lib/inventory/data/toyota-genuine.json. A supplier title or brand field
 * saying "Toyota Genuine" does not count.
 */
export function isVerifiedToyotaGenuine(product: { id: number } | number): boolean {
  const id = typeof product === "number" ? product : product.id;
  return GENUINE_IDS.has(id) && PUBLIC_IDS.has(id);
}

export const PUBLIC_LISTING_IDS = PUBLIC_IDS;
