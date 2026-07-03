import type { CatalogProductCardData } from "@/components/catalog/CatalogProductCard";
import {
  getAllProducts,
  getProductsByCategory,
  toCatalogCardData,
} from "@/lib/inventory";
import type { Product } from "@/lib/inventory/types";

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

/** Curated homepage grid: truck parts, engines, transmissions, utility. */
export function getHomeFeaturedProducts(limit = 8): CatalogProductCardData[] {
  const seen = new Set<number>();
  const all = getAllProducts();

  const truckParts = all.filter((p) => p.id >= 1500 && p.id <= 1544);
  const buckets = [
    pickUnique(truckParts, 3, seen),
    pickUnique(getProductsByCategory("engine"), 2, seen),
    pickUnique(getProductsByCategory("transmission"), 1, seen),
    pickUnique(getProductsByCategory("aftermarket"), 2, seen),
  ];

  const picked = buckets.flat();
  if (picked.length < limit) {
    picked.push(...pickUnique(all, limit - picked.length, seen));
  }

  return picked.slice(0, limit).map(toCatalogCardData);
}

export function getHomeProductCount(): number {
  return getAllProducts().length;
}
