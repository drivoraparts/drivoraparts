/*
 * Kit bundles: "add all to cart" groups of existing listings.
 *
 * A bundle is not a product. It has no SKU, price or stock of its own: the
 * button adds each component listing to the cart at that listing's own live
 * price, and checkout prices, stock-checks and ships them exactly as if they
 * had been added one by one. Nothing about checkout, payments or shipping
 * changes.
 *
 * Definitions mirror the staged kits in
 * docs/catalog-expansion/toyota-service-kits-batch-*.json (the validator,
 * scripts/check-toyota-expansion.mjs, checks that they match). A bundle is
 * shown only when ALL of these hold:
 *   - `approved` is true (set by hand, only on the owner's approval);
 *   - every component resolves to exactly one deployed listing with that
 *     Toyota part number;
 *   - every component listing is publicly listed, purchasable (not out of
 *     stock, not a held / inquiry-only listing) and has a price.
 * Until the component parts are published, no bundle can appear.
 */
import {
  getAllProducts,
  getProductById,
  isPubliclyListed,
  type Product,
} from "@/lib/inventory";
import { isHeldListing } from "@/lib/inventory/held";
import { getProductThumbnail } from "@/lib/inventory/media";
import { MAX_LINE_ITEMS, MAX_QUANTITY_PER_ITEM } from "@/lib/checkout/limits";
import bundleData from "./data/bundles.json";

export type BundleComponent = {
  /** Toyota part number, as on the listing. */
  partNumber: string;
  quantity: number;
  /** Pin to a listing id once published; must still carry the part number. */
  productId?: number;
};

export type BundleDefinition = {
  id: string;
  name: string;
  /** One sentence on what the kit covers. Fitment stays on each listing. */
  summary: string;
  /** What the kit does not include, so nobody assumes it is complete. */
  notIncluded: string;
  components: BundleComponent[];
  approved: boolean;
};

/*
 * Definitions live in lib/catalog/data/bundles.json so the kit validator
 * (scripts/check-toyota-expansion.mjs) can check them against the staged kits.
 * `approved` is set to true by hand, only on the owner's approval.
 */
export const BUNDLE_DEFINITIONS: BundleDefinition[] = bundleData.bundles;

export type ResolvedBundleLine = {
  product: {
    id: number;
    name: string;
    price: number;
    image: string;
    category: string;
    brand?: string;
  };
  partNumber: string;
  quantity: number;
};

export type ResolvedBundle = {
  id: string;
  name: string;
  summary: string;
  notIncluded: string;
  lines: ResolvedBundleLine[];
  /** Sum of the component listings' own prices; no bundle discount. */
  total: number;
  itemCount: number;
};

/** "04152-YZZA1", "04152YZZA1 (supersedes ...)" -> "04152YZZA1". */
export function normalizePartNumber(value: string | undefined): string {
  const first = String(value ?? "").trim().split(/[\s(,;/]+/)[0] ?? "";
  return first.replace(/-/g, "").toUpperCase();
}

function isPurchasable(product: Product): boolean {
  return (
    isPubliclyListed(product.id) &&
    product.stock !== false &&
    !isHeldListing(product) &&
    typeof product.price === "number" &&
    product.price > 0
  );
}

function findListing(component: BundleComponent, pool: Product[]): Product | null {
  const wanted = normalizePartNumber(component.partNumber);
  if (component.productId != null) {
    const pinned = getProductById(component.productId);
    return pinned && normalizePartNumber(pinned.partNumber) === wanted ? pinned : null;
  }
  const matches = pool.filter((p) => normalizePartNumber(p.partNumber) === wanted);
  return matches.length === 1 ? matches[0] : null; // ambiguous -> not shown
}

/** The bundle with live listings and prices, or null if it cannot be shown. */
export function resolveBundle(
  definition: BundleDefinition,
  pool: Product[] = getAllProducts()
): ResolvedBundle | null {
  if (!definition.approved || !definition.components.length) return null;
  if (definition.components.length > MAX_LINE_ITEMS) return null;
  const lines: ResolvedBundleLine[] = [];
  const seen = new Set<number>();
  for (const component of definition.components) {
    if (!(component.quantity >= 1) || component.quantity > MAX_QUANTITY_PER_ITEM) return null;
    const listing = findListing(component, pool);
    if (!listing || !isPurchasable(listing) || seen.has(listing.id)) return null;
    seen.add(listing.id);
    lines.push({
      product: {
        id: listing.id,
        name: listing.name,
        price: listing.price,
        image: getProductThumbnail(listing),
        category: listing.category,
        brand: listing.brand,
      },
      partNumber: component.partNumber,
      quantity: component.quantity,
    });
  }
  const total = Math.round(lines.reduce((s, l) => s + l.product.price * l.quantity, 0) * 100) / 100;
  return {
    id: definition.id,
    name: definition.name,
    summary: definition.summary,
    notIncluded: definition.notIncluded,
    lines,
    total,
    itemCount: lines.reduce((s, l) => s + l.quantity, 0),
  };
}

/** Showable bundles that include this listing. */
export function getBundlesForProduct(
  productId: number,
  definitions: BundleDefinition[] = BUNDLE_DEFINITIONS,
  pool?: Product[]
): ResolvedBundle[] {
  const approved = definitions.filter((d) => d.approved);
  if (!approved.length) return [];
  const listings = pool ?? getAllProducts();
  return approved
    .map((d) => resolveBundle(d, listings))
    .filter((b): b is ResolvedBundle => b !== null && b.lines.some((l) => l.product.id === productId));
}
