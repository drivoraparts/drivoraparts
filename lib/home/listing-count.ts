/**
 * Catalog size for the site-wide fallback meta description.
 *
 * THE AUTHORITATIVE COUNT IS getActiveListingCount() IN lib/catalog/counts.ts.
 * Anything rendered on a page should call that and count the catalog it is
 * already holding. This constant exists for one caller — DEFAULT_DESCRIPTION
 * in lib/seo/constants.ts — which is pulled into the module graph of every
 * route on the site, including ones that otherwise never touch the catalog.
 * Importing a 5MB product bundle there to produce one number in a meta tag
 * would be a poor trade, so that one place reads a literal instead.
 *
 * Kept in step by scripts/sync-home-listing-count.mjs, and checked by
 * scripts/audit-storefront-claims.mjs, which fails when it drifts — the
 * previous version of this file had no check and sat at 1,446 while the
 * catalog held 1,867.
 */
export const HOME_LISTING_COUNT = 4041;
