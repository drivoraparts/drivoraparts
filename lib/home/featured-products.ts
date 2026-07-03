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

/**
 * Homepage featured row (below categories): 8 cards with real photos and
 * variety across truck gear, engines, driveline, and performance parts.
 */
export function getHomeFeaturedProducts(limit = 8): CatalogProductCardData[] {
  const seen = new Set<number>();
  const all = getAllProducts();

  const truckWithPhotos = withLocalPhotos(
    all.filter((product) => product.id >= 1500 && product.id <= 1544)
  );

  const buckets = [
    pickUnique(truckWithPhotos, 2, seen),
    pickUnique(withLocalPhotos(getProductsByCategory("engine")), 2, seen),
    pickUnique(withLocalPhotos(getProductsByCategory("transmission")), 1, seen),
    pickUnique(withLocalPhotos(getProductsByCategory("turbocharger")), 1, seen),
    pickUnique(withLocalPhotos(getProductsByCategory("brakes")), 1, seen),
    pickUnique(withLocalPhotos(getProductsByCategory("suspension")), 1, seen),
  ];

  const picked = buckets.flat();

  if (picked.length < limit) {
    picked.push(
      ...pickUnique(withLocalPhotos(all), limit - picked.length, seen)
    );
  }

  return picked.slice(0, limit).map(toCatalogCardData);
}

export function getHomeProductCount(): number {
  return getAllProducts().length;
}
