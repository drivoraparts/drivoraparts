/**
 * Listings held back from search engines and ad feeds.
 *
 * Listings 1945-1986 are the 42 transmission and clutch listings held in PR #22:
 * stock:false, no stock quantity, details still being confirmed with the
 * business. Their pages stay reachable by link, but are not indexed, carry no
 * Product structured data and are left out of the sitemap and the product feeds,
 * so Google cannot build a shopping listing for them from the site (which is how
 * it came to report them with no shipping label). To release one, set stock:true
 * with a real stockQty; it leaves this set as soon as stock is true.
 */
export const HELD_LISTING_FIRST_ID = 1945;
export const HELD_LISTING_LAST_ID = 1986;

export function isHeldListing(product: { id: number; stock?: boolean }): boolean {
  return (
    product.stock === false &&
    product.id >= HELD_LISTING_FIRST_ID &&
    product.id <= HELD_LISTING_LAST_ID
  );
}
