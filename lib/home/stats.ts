import { brands } from "@/lib/inventory/brands";
import { categories } from "@/lib/inventory/categories";
import { HOME_LISTING_COUNT } from "./listing-count";

/** Real, derived homepage stats — no fabricated numbers. */
export function getHomeStats() {
  const brandCount = new Set(brands.map((b) => b.name)).size;

  return {
    listings: HOME_LISTING_COUNT,
    brands: brandCount,
    categories: categories.length,
  };
}
