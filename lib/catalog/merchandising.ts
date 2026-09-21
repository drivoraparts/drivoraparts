import { getAllProducts, getProductThumbnail } from "@/lib/inventory";
import type { Product } from "@/lib/inventory/types";
import { marketScope } from "@/lib/catalog/markets";
import { hasGenericPlaceholderDescription } from "@/lib/seo/product-seo";
import snapshot from "@/lib/catalog/data/demand-snapshot.json";

/* =========================================================
   DRIVORAPARTS — WHAT THE CATALOG LEADS WITH
   ---------------------------------------------------------
   The browse order used to be "newest first", and it meant
   nothing. An audit on 2026-09-20 found 2,340 listings
   future-dated and 2,155 of them sharing a single timestamp
   generated when the module loads, so for most of the
   catalogue "newest" was really insertion order. What it
   produced: all 48 products on the first screen had zero
   recorded views in 84 days, 45 of the 48 were the same
   brand, and the 40 most-viewed products sat at a median
   position of 2,334 out of 4,044.

   This orders by what the data actually supports, in tiers,
   so every position can be explained:

     0  curated     — CURATED_IDS below, which is yours to set
     1  wanted      — recorded demand, strongest first
     2  wanted, but too thin to lead (see canLead)
     3  complete    — fitment, part number, real description,
                      its own photograph, matches a market
     4  partial
     5  thin

   WHAT THE DEMAND NUMBERS ARE, AND ARE NOT
   Views and cart adds read from analytics, snapshot dated in
   the JSON beside this file. They are recorded interest over
   84 days of light traffic that includes staff and bots, with
   no completed orders in the window. That is enough to say
   the old order was wrong and to seed a better one. It is not
   a popularity ranking, nothing in the UI calls it one, and
   no number here is invented: a listing with no recorded
   interest simply falls to the tiers below.

   Nothing about recency enters this order at any point.
========================================================= */

type DemandSnapshot = {
  generatedAt: string;
  window: { from: string; to: string };
  method: string;
  views: Record<string, number>;
  cartAdds: Record<string, number>;
};

const demand = snapshot as DemandSnapshot;

/**
 * A cart add is a far stronger statement of intent than a view, so it counts
 * for more. The ratio is the one knob in here; it is deliberately a plain
 * number rather than a fitted weight, because 44 listings carrying a cart add
 * is not enough data to fit anything.
 */
const CART_ADD_WEIGHT = 10;

/** No more than this many listings from one brand in an unbroken run. */
const MAX_BRAND_RUN = 4;

/**
 * Listings to put in front regardless of anything else, best first.
 *
 * This is the manual control: an id here leads the catalogue because someone
 * decided it should, which is a merchandising decision and not something to
 * infer from data. Empty means nothing is forced.
 */
export const CURATED_IDS: number[] = [];

export const DEMAND_SNAPSHOT_TAKEN = demand.generatedAt;

function demandScore(product: Product): number {
  const views = demand.views[String(product.id)] ?? 0;
  const carts = demand.cartAdds[String(product.id)] ?? 0;
  return carts * CART_ADD_WEIGHT + views;
}

/**
 * How completely a listing describes itself. Each of these is a fact recorded
 * on the listing, not a judgement about the part.
 */
function completeness(product: Product, sharedImage: boolean): number {
  let score = 0;
  if (product.fitment) score += 1;
  if (product.partNumber) score += 1;
  if (!hasGenericPlaceholderDescription(product.description)) score += 1;
  if (!sharedImage) score += 1;
  if (inAnyMarket(product.id)) score += 1;
  return score;
}

/**
 * The floor for leading the catalogue: a customer has to be able to tell what
 * the part fits or read a description written for it. A listing failing both
 * can still be found and bought -- it just cannot be what the front page is
 * made of, however many times it has been opened.
 */
export function canLead(product: Product): boolean {
  return Boolean(product.fitment) || !hasGenericPlaceholderDescription(product.description);
}

function inAnyMarket(id: number): boolean {
  for (const key of ["usa", "australia", "uk"]) {
    if (marketScope(key)?.has(id)) return true;
  }
  return false;
}

/**
 * Keeps one brand from owning a stretch of the grid.
 *
 * Demand alone put 45 listings from a single brand across the first screen,
 * which reads as a supplier dump rather than a catalogue. When a run reaches
 * MAX_BRAND_RUN this looks ahead for the next listing from a different brand
 * and brings it forward; the displaced listings keep their relative order.
 * The lookahead is bounded, so a brand that genuinely is everything left
 * simply continues rather than the order collapsing.
 */
export function spreadBrands(items: Product[], maxRun = MAX_BRAND_RUN): Product[] {
  const LOOKAHEAD = 400;
  const queue = [...items];
  const out: Product[] = [];
  let currentBrand: string | null = null;
  let run = 0;

  while (queue.length > 0) {
    let index = 0;

    if (currentBrand !== null && run >= maxRun && queue[0].brand === currentBrand) {
      const limit = Math.min(queue.length, LOOKAHEAD);
      const alternative = queue.findIndex(
        (item, i) => i < limit && item.brand !== currentBrand
      );
      if (alternative > 0) index = alternative;
    }

    const [next] = queue.splice(index, 1);
    run = next.brand === currentBrand ? run + 1 : 1;
    currentBrand = next.brand;
    out.push(next);
  }

  return out;
}

function tierOf(product: Product, curated: Set<number>, sharedImage: boolean): number {
  if (curated.has(product.id)) return 0;
  const wanted = demandScore(product) > 0;
  if (wanted) return canLead(product) ? 1 : 2;

  const score = completeness(product, sharedImage);
  if (score >= 4) return 3;
  if (score >= 2) return 4;
  return 5;
}

// The catalogue is a bundled array and the snapshot is a file, so this order
// is the same for every request in an isolate. Built once, on first use.
let rankCache: Map<number, number> | null = null;

/** Position of every listing in the merchandised order, by product id. */
export function merchandisingRank(): Map<number, number> {
  if (rankCache) return rankCache;

  const all = getAllProducts();

  // A photograph shared with another listing is weaker than one of its own,
  // so it costs a completeness point -- 1,314 listings share an image today.
  const imageUse = new Map<string, number>();
  for (const product of all) {
    const thumb = getProductThumbnail(product);
    imageUse.set(thumb, (imageUse.get(thumb) ?? 0) + 1);
  }

  const curated = new Set(CURATED_IDS);
  const curatedOrder = new Map(CURATED_IDS.map((id, i) => [id, i]));

  const ordered = [...all].sort((a, b) => {
    const sharedA = (imageUse.get(getProductThumbnail(a)) ?? 1) > 1;
    const sharedB = (imageUse.get(getProductThumbnail(b)) ?? 1) > 1;
    const tierA = tierOf(a, curated, sharedA);
    const tierB = tierOf(b, curated, sharedB);
    if (tierA !== tierB) return tierA - tierB;

    if (tierA === 0) {
      return (curatedOrder.get(a.id) ?? 0) - (curatedOrder.get(b.id) ?? 0);
    }

    const demandDiff = demandScore(b) - demandScore(a);
    if (demandDiff !== 0) return demandDiff;

    const completenessDiff =
      completeness(b, sharedB) - completeness(a, sharedA);
    if (completenessDiff !== 0) return completenessDiff;

    // Stable last resort. Ids ascend with insertion, so this is catalogue
    // order -- not recency dressed up as merchandising.
    return a.id - b.id;
  });

  rankCache = new Map(spreadBrands(ordered).map((product, i) => [product.id, i]));
  return rankCache;
}

/** Sort helper for a filtered result set: keeps the global order between them. */
export function compareByMerchandising(a: Product, b: Product): number {
  const rank = merchandisingRank();
  return (rank.get(a.id) ?? Number.MAX_SAFE_INTEGER) - (rank.get(b.id) ?? Number.MAX_SAFE_INTEGER);
}
