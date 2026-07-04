import type { CatalogProductCardData } from "@/components/catalog/CatalogProductCard";
import {
  getAllProducts,
  getProductsByCategory,
  toCatalogCardData,
} from "@/lib/inventory";
import type { Product } from "@/lib/inventory/types";

const SHELL_LIKE =
  /shell|camper|topper|canopy|\bcap\b|leer|snugtop|are cover|fibreglass box|fiberglass box/i;

function isShellLike(product: Product): boolean {
  return SHELL_LIKE.test(product.name);
}

/** Hosted on-site media — loads on every device (no Edmunds hotlink / placeholder). */
function hasLocalProductImage(product: Product): boolean {
  const src = product.thumbnail ?? product.images?.[0] ?? "";
  return src.startsWith("/product-media/") && !src.includes("default.svg");
}

function withLocalPhotos(products: Product[]): Product[] {
  return products.filter((product) => hasLocalProductImage(product) && !isShellLike(product));
}

function pickUnique(products: Product[], limit: number, seen: Set<number>): Product[] {
  const out: Product[] = [];
  for (const product of products) {
    if (out.length >= limit) break;
    if (seen.has(product.id)) continue;
    seen.add(product.id);
    out.push(product);
  }
  return out;
}

/** Visible featured cards on the homepage. */
export const HOME_FEATURED_DISPLAY_COUNT = 8;

/** Rotate featured cards every 10 minutes while the page is open. */
export const HOME_FEATURED_ROTATE_MS = 10 * 60 * 1000;

/** Pool size — four full rotations before the carousel repeats. */
export const HOME_FEATURED_POOL_SIZE = 32;

function buildFeaturedPool(limit: number): Product[] {
  const seen = new Set<number>();
  const all = getAllProducts();

  const truckWithPhotos = withLocalPhotos(
    all.filter((product) => product.id >= 1500 && product.id <= 1544)
  );

  const wheelsWithPhotos = withLocalPhotos(
    getProductsByCategory("wheels-tires")
  );

  const buckets = [
    pickUnique(truckWithPhotos, 6, seen),
    pickUnique(wheelsWithPhotos, 6, seen),
    pickUnique(withLocalPhotos(getProductsByCategory("engine")), 4, seen),
    pickUnique(withLocalPhotos(getProductsByCategory("transmission")), 3, seen),
    pickUnique(withLocalPhotos(getProductsByCategory("turbocharger")), 3, seen),
    pickUnique(withLocalPhotos(getProductsByCategory("brakes")), 3, seen),
    pickUnique(withLocalPhotos(getProductsByCategory("suspension")), 3, seen),
    pickUnique(withLocalPhotos(getProductsByCategory("electronics")), 2, seen),
  ];

  const picked = buckets.flat();

  if (picked.length < limit) {
    picked.push(
      ...pickUnique(withLocalPhotos(all), limit - picked.length, seen)
    );
  }

  return picked.slice(0, limit);
}

/** Larger pool used for timed homepage rotation. */
export function getHomeFeaturedProductPool(
  limit = HOME_FEATURED_POOL_SIZE
): CatalogProductCardData[] {
  return buildFeaturedPool(limit).map(toCatalogCardData);
}

export function getFeaturedTimeSlot(now = Date.now()): number {
  return Math.floor(now / HOME_FEATURED_ROTATE_MS);
}

export function getFeaturedBatch(
  pool: CatalogProductCardData[],
  slot: number,
  size = HOME_FEATURED_DISPLAY_COUNT
): CatalogProductCardData[] {
  if (pool.length === 0) return [];
  if (pool.length <= size) return pool;

  const offset = (slot * size) % pool.length;
  const batch: CatalogProductCardData[] = [];

  for (let i = 0; i < size; i += 1) {
    batch.push(pool[(offset + i) % pool.length]);
  }

  return batch;
}

/**
 * Homepage featured row (below categories): 8 cards with real photos and
 * variety across truck gear, engines, driveline, and performance parts.
 */
export function getHomeFeaturedProducts(
  limit = HOME_FEATURED_DISPLAY_COUNT
): CatalogProductCardData[] {
  const pool = getHomeFeaturedProductPool(
    Math.max(limit, HOME_FEATURED_POOL_SIZE)
  );
  return getFeaturedBatch(pool, getFeaturedTimeSlot(), limit);
}

export function getHomeProductCount(): number {
  return getAllProducts().length;
}
