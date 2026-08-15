import { getAllProducts } from "@/lib/inventory";
import type { Product } from "@/lib/inventory/types";

/**
 * Affordable, photographed parts for the top of the homepage.
 *
 * The storefront led with engine packages at $3,000-6,000, but 900 of the
 * 1,865 listings are under $300 and in stock. Checkout is crypto-only and
 * irreversible, so a stranger's first order from an unfamiliar shop is not
 * going to be a $5,900 engine — it needs to be something they can risk. This
 * surfaces that half of the catalog instead of burying it.
 */

/** Low enough to be an easy first order, high enough to be a real part. */
const MIN_PRICE = 40;
const MAX_PRICE = 400;

/**
 * Trivial hardware and merch. A $1.43 lug nut or a beanie clears the price
 * filter but makes a poor shop window — nobody's first impression of a parts
 * store should be an o-ring.
 */
const TOO_TRIVIAL =
  /\b(t[\s-]?shirt|hoodie|beanie|cap(?!s?\b.*wheel)|sticker|decal|keychain|lanyard|o-?ring|washer|grommet|mounting pin|lug ?nut|wheel bolt|tire valve|valve stem|zip tie|fastener|clip)\b/i;

/** Placeholder art undermines the point of showing these first. */
function hasRealPhoto(product: Product): boolean {
  const src = product.thumbnail ?? product.images?.[0] ?? "";
  return src.startsWith("/product-media/") && !src.includes("default.svg");
}

function isStarterCandidate(product: Product): boolean {
  if (product.stock === false) return false;
  if (product.price < MIN_PRICE || product.price > MAX_PRICE) return false;
  if (!hasRealPhoto(product)) return false;
  if (TOO_TRIVIAL.test(product.name)) return false;
  return true;
}

/**
 * Spread across categories so the rail doesn't fill with eight variations of
 * the same wheel cap, which is what a straight price sort produces.
 */
export function getStarterPicks(limit = 8): Product[] {
  const candidates = getAllProducts().filter(isStarterCandidate);

  const byCategory = new Map<string, Product[]>();
  for (const product of candidates) {
    const list = byCategory.get(product.category) ?? [];
    list.push(product);
    byCategory.set(product.category, list);
  }

  // Cheapest first within each category — the entry point of each aisle.
  for (const list of byCategory.values()) {
    list.sort((a, b) => a.price - b.price);
  }

  const categories = [...byCategory.keys()].sort();
  const picks: Product[] = [];

  // Round-robin: one from each category, then a second from each, and so on.
  for (let round = 0; picks.length < limit; round += 1) {
    let addedThisRound = false;

    for (const category of categories) {
      if (picks.length >= limit) break;
      const product = byCategory.get(category)?.[round];
      if (!product) continue;
      picks.push(product);
      addedThisRound = true;
    }

    if (!addedThisRound) break;
  }

  return picks;
}

/** How many listings sit in the starter band — used in the section copy. */
export function getStarterPickCount(): number {
  return getAllProducts().filter(isStarterCandidate).length;
}
