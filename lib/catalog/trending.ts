import { guardedSupabaseRead } from "@/lib/db/read-guard";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getAllProducts } from "@/lib/inventory";
import type { Product } from "@/lib/inventory/types";

const TRENDING_WINDOW_DAYS = 7;

/*
 * Bounds on the work one render may do for this rail.
 *
 * This used to call listAnalyticsEventsSince(), which pages through EVERY
 * analytics event of the last seven days -- every column, every event name --
 * on each uncached render of the homepage and /catalog/all. The cost grew
 * with traffic: once a week held enough events, a single render buffered the
 * whole table slice in the Worker, exceeded the 128 MB isolate limit and
 * Cloudflare killed the isolate with error 1102 -- taking every other request
 * in flight on that isolate with it, so unrelated routes failed too.
 *
 * A ranking of "what is being viewed" does not need every event. The most
 * recent MAX_VIEW_EVENTS product views are a fair sample, only the product id
 * is read, and the answer is kept in isolate memory for CACHE_TTL_MS so most
 * renders make no database request at all.
 */
const PAGE_SIZE = 1000;
const MAX_VIEW_EVENTS = 3000;
const CACHE_TTL_MS = 10 * 60 * 1000;
const FAILURE_TTL_MS = 60 * 1000;
const QUERY_TIMEOUT_MS = 4000;
const MAX_RANKED_IDS = 48;

type RankedCache = { ids: number[]; expiresAt: number };

let cache: RankedCache | null = null;

async function fetchRankedProductIds(): Promise<number[] | null> {
  const since = new Date(
    Date.now() - TRENDING_WINDOW_DAYS * 24 * 60 * 60 * 1000
  ).toISOString();

  return guardedSupabaseRead<number[] | null>("trendingProductViews", null, async () => {
    const supabase = getSupabaseAdmin();
    const viewCounts = new Map<number, number>();

    for (let from = 0; from < MAX_VIEW_EVENTS; from += PAGE_SIZE) {
      const { data, error } = await supabase
        .from("analytics_events")
        .select("productId:payload->productId")
        .eq("name", "product_view")
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .range(from, from + PAGE_SIZE - 1)
        .abortSignal(AbortSignal.timeout(QUERY_TIMEOUT_MS));

      if (error) throw error;

      const batch = (data ?? []) as Array<{ productId: unknown }>;
      for (const row of batch) {
        const productId = row.productId;
        if (typeof productId !== "number") continue;
        viewCounts.set(productId, (viewCounts.get(productId) ?? 0) + 1);
      }
      if (batch.length < PAGE_SIZE) break;
    }

    return Array.from(viewCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, MAX_RANKED_IDS)
      .map(([productId]) => productId);
  });
}

/*
 * Only plain data is shared between requests. A promise is deliberately not:
 * on Workers, awaiting I/O that another request started is an error, so two
 * renders that miss the cache together each make their own (bounded) read.
 */
async function getRankedProductIds(): Promise<number[]> {
  if (cache && cache.expiresAt > Date.now()) return cache.ids;

  const stale = cache?.ids ?? [];
  const ids = await fetchRankedProductIds();

  // A failed read keeps serving the last good ranking and backs off for a
  // minute, rather than retrying the database on every render.
  cache =
    ids === null
      ? { ids: stale, expiresAt: Date.now() + FAILURE_TTL_MS }
      : { ids, expiresAt: Date.now() + CACHE_TTL_MS };
  return cache.ids;
}

/** Real product_view analytics from the trailing window, ranked by view count. */
export async function getTrendingProducts(limit = 12): Promise<Product[]> {
  const rankedIds = await getRankedProductIds();
  if (rankedIds.length === 0) return [];

  const productsById = new Map(getAllProducts().map((p) => [p.id, p]));

  return rankedIds
    .map((productId) => productsById.get(productId))
    .filter((product): product is Product => Boolean(product))
    .slice(0, limit);
}
