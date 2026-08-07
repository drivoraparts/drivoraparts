import { listAnalyticsEventsSince } from "@/lib/db/analytics";
import { getAllProducts } from "@/lib/inventory";
import type { Product } from "@/lib/inventory/types";

const TRENDING_WINDOW_DAYS = 7;

/** Real product_view analytics from the trailing window, ranked by view count. */
export async function getTrendingProducts(limit = 12): Promise<Product[]> {
  const since = new Date(
    Date.now() - TRENDING_WINDOW_DAYS * 24 * 60 * 60 * 1000
  ).toISOString();

  const events = await listAnalyticsEventsSince(since);
  if (events.length === 0) return [];

  const viewCounts = new Map<number, number>();
  for (const event of events) {
    if (event.name !== "product_view") continue;
    const productId = event.payload?.productId;
    if (typeof productId !== "number") continue;
    viewCounts.set(productId, (viewCounts.get(productId) ?? 0) + 1);
  }

  if (viewCounts.size === 0) return [];

  const productsById = new Map(getAllProducts().map((p) => [p.id, p]));

  return Array.from(viewCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([productId]) => productsById.get(productId))
    .filter((product): product is Product => Boolean(product))
    .slice(0, limit);
}
