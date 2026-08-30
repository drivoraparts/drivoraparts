/* =========================================================
   DRIVORAPARTS — SEARCH ANALYTICS (AGGREGATION)
   ---------------------------------------------------------
   Reads `search`, `search_result_click` and `add_to_cart`
   rows out of analytics_events and folds them into the
   reports the admin dashboard renders.

   Runs only when an admin opens the dashboard -- never on a
   customer's search request. Nothing here can slow search
   down, because search never calls it.
========================================================= */

import { listAnalyticsEventsSince } from "@/lib/db/analytics";
import type { AnalyticsEventRow } from "@/lib/db/analytics";

export type SearchRangeKey =
  | "today"
  | "yesterday"
  | "7d"
  | "30d"
  | "90d"
  | "custom";

export type SearchQualityBand = "strong" | "attention" | "poor";

export type QuerySummary = {
  query: string;
  normalizedQuery: string;
  searches: number;
  uniqueSessions: number;
  averageResults: number;
  zeroResultRate: number;
  clicks: number;
  clickThroughRate: number;
  cartAdds: number;
  cartRate: number;
  averageClickPosition: number | null;
  lastSearchedAt: number;
  /** The correction the live search applied, when it applied one. */
  correction: string | null;
  topClickedProducts: { productId: number; productName: string; clicks: number }[];
};

export type ZeroResultQuery = {
  query: string;
  searches: number;
  uniqueSessions: number;
  lastSearchedAt: number;
  firstSearchedAt: number;
  /** True when live search rewrote the query, i.e. it looks misspelled. */
  looksMisspelled: boolean;
  correction: string | null;
};

export type ProductDemand = {
  productId: number;
  productName: string;
  /** Times this product was the top result of a search. */
  topResultAppearances: number;
  clicks: number;
  cartAdds: number;
};

export type SearchTimePoint = {
  date: string;
  searches: number;
  zeroResults: number;
  clicks: number;
};

export type SearchFunnel = {
  searches: number;
  searchesWithResults: number;
  productClicks: number;
  addToCart: number;
  checkoutStart: number;
  orders: number;
};

export type SearchInsights = {
  rangeStart: number;
  rangeEnd: number;
  totalSearches: number;
  uniqueSessions: number;
  zeroResultSearches: number;
  zeroResultRate: number;
  clickThroughRate: number;
  cartRate: number;
  averageResponseMs: number | null;
  quality: SearchQualityBand;
  qualityReasons: string[];
  topQueries: QuerySummary[];
  zeroResultQueries: ZeroResultQuery[];
  topClickedProducts: ProductDemand[];
  productDemand: ProductDemand[];
  overTime: SearchTimePoint[];
  funnel: SearchFunnel;
  corrections: { typed: string; corrected: string; count: number }[];
  deviceBreakdown: { device: string; searches: number }[];
  /** True when analytics storage is unreachable, so the UI can say so rather
   * than presenting an empty range as "no searches". */
  degraded: boolean;
};

const DAY_MS = 24 * 60 * 60 * 1000;

export function resolveRange(
  range: SearchRangeKey,
  from?: string,
  to?: string
): { start: number; end: number } {
  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  ).getTime();

  switch (range) {
    case "today":
      return { start: startOfToday, end: now.getTime() };
    case "yesterday":
      return { start: startOfToday - DAY_MS, end: startOfToday };
    case "7d":
      return { start: startOfToday - 6 * DAY_MS, end: now.getTime() };
    case "30d":
      return { start: startOfToday - 29 * DAY_MS, end: now.getTime() };
    case "90d":
      return { start: startOfToday - 89 * DAY_MS, end: now.getTime() };
    case "custom": {
      const startMs = from ? Date.parse(from) : NaN;
      const endMs = to ? Date.parse(to) : NaN;
      return {
        start: Number.isNaN(startMs) ? startOfToday - 29 * DAY_MS : startMs,
        // A date-only "to" means the whole of that day, not midnight at its start.
        end: Number.isNaN(endMs) ? now.getTime() : endMs + DAY_MS - 1,
      };
    }
    default:
      return { start: startOfToday - 29 * DAY_MS, end: now.getTime() };
  }
}

const str = (value: unknown): string =>
  typeof value === "string" ? value : "";
const num = (value: unknown): number | null =>
  typeof value === "number" && Number.isFinite(value) ? value : null;

function averageOf(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function rate(part: number, whole: number): number {
  return whole > 0 ? part / whole : 0;
}

/**
 * Quality band from measured behaviour only.
 *
 * Three signals, each a real number from the range: how often searches come
 * back empty, how often a result is good enough to click, and whether clicks
 * are landing near the top. No label is ever assigned arbitrarily, and a range
 * with too little traffic reports "needs attention" rather than inventing
 * confidence from a handful of events.
 */
function assessQuality(input: {
  totalSearches: number;
  zeroResultRate: number;
  clickThroughRate: number;
  averageClickPosition: number | null;
}): { band: SearchQualityBand; reasons: string[] } {
  const reasons: string[] = [];

  if (input.totalSearches < 20) {
    return {
      band: "attention",
      reasons: [
        `Only ${input.totalSearches} searches in this range — not enough data to judge quality yet.`,
      ],
    };
  }

  let score = 0;

  if (input.zeroResultRate <= 0.05) score += 2;
  else if (input.zeroResultRate <= 0.15) score += 1;
  else reasons.push(`${Math.round(input.zeroResultRate * 100)}% of searches return nothing.`);

  if (input.clickThroughRate >= 0.5) score += 2;
  else if (input.clickThroughRate >= 0.25) score += 1;
  else reasons.push(`Only ${Math.round(input.clickThroughRate * 100)}% of searches lead to a click.`);

  if (input.averageClickPosition != null) {
    if (input.averageClickPosition <= 3) score += 2;
    else if (input.averageClickPosition <= 8) score += 1;
    else {
      reasons.push(
        `Customers click result #${input.averageClickPosition.toFixed(1)} on average — the best match may not be first.`
      );
    }
  }

  if (score >= 5) return { band: "strong", reasons };
  if (score >= 3) return { band: "attention", reasons };
  return { band: "poor", reasons };
}

/** Folds raw event rows into the dashboard's reports. Pure — easy to test. */
export function buildSearchInsights(
  rows: AnalyticsEventRow[],
  range: { start: number; end: number },
  degraded = false
): SearchInsights {
  const inRange = rows.filter((row) => {
    const at = new Date(row.created_at).getTime();
    return at >= range.start && at <= range.end;
  });

  const searches = inRange.filter((row) => row.name === "search");
  const clicks = inRange.filter((row) => row.name === "search_result_click");
  const cartAdds = inRange.filter((row) => row.name === "add_to_cart");
  const checkouts = inRange.filter((row) => row.name === "checkout_start");
  const orders = inRange.filter((row) => row.name === "order_completed");

  // Cart adds only count toward search analytics when the click that led to
  // them carried a search id -- otherwise they belong to ordinary browsing.
  const searchCartAdds = cartAdds.filter((row) => str(row.payload.searchId));

  const clicksBySearchId = new Set(
    clicks.map((row) => str(row.payload.searchId)).filter(Boolean)
  );
  const cartBySearchId = new Set(
    searchCartAdds.map((row) => str(row.payload.searchId)).filter(Boolean)
  );

  const sessions = new Set(
    searches.map((row) => str(row.payload.sessionId)).filter(Boolean)
  );

  const zeroResultSearches = searches.filter(
    (row) => row.payload.zeroResults === true || num(row.payload.resultCount) === 0
  );

  const responseTimes = searches
    .map((row) => num(row.payload.tookMs))
    .filter((value): value is number => value != null);

  /* ---- per-query rollup ---- */
  type Bucket = {
    query: string;
    normalizedQuery: string;
    searches: number;
    sessions: Set<string>;
    results: number[];
    zeroCount: number;
    searchIds: Set<string>;
    lastSearchedAt: number;
    firstSearchedAt: number;
    correction: string | null;
    clicks: number;
    positions: number[];
    cartAdds: number;
    clickedProducts: Map<number, { name: string; clicks: number }>;
  };

  const buckets = new Map<string, Bucket>();

  const bucketFor = (key: string, display: string): Bucket => {
    let bucket = buckets.get(key);
    if (!bucket) {
      bucket = {
        query: display,
        normalizedQuery: key,
        searches: 0,
        sessions: new Set(),
        results: [],
        zeroCount: 0,
        searchIds: new Set(),
        lastSearchedAt: 0,
        firstSearchedAt: Number.MAX_SAFE_INTEGER,
        correction: null,
        clicks: 0,
        positions: [],
        cartAdds: 0,
        clickedProducts: new Map(),
      };
      buckets.set(key, bucket);
    }
    return bucket;
  };

  for (const row of searches) {
    const normalized =
      str(row.payload.normalizedQuery) || str(row.payload.query).toLowerCase();
    if (!normalized) continue;

    const bucket = bucketFor(normalized, str(row.payload.query) || normalized);
    const at = new Date(row.created_at).getTime();

    bucket.searches += 1;
    bucket.lastSearchedAt = Math.max(bucket.lastSearchedAt, at);
    bucket.firstSearchedAt = Math.min(bucket.firstSearchedAt, at);

    const sessionId = str(row.payload.sessionId);
    if (sessionId) bucket.sessions.add(sessionId);

    const searchId = str(row.payload.searchId);
    if (searchId) bucket.searchIds.add(searchId);

    const resultCount = num(row.payload.resultCount) ?? 0;
    bucket.results.push(resultCount);
    if (resultCount === 0) bucket.zeroCount += 1;

    const correction = str(row.payload.correctedQuery);
    if (correction && correction !== normalized) bucket.correction = correction;
  }

  for (const row of clicks) {
    const normalized =
      str(row.payload.normalizedQuery) || str(row.payload.query).toLowerCase();
    if (!normalized) continue;

    const bucket = buckets.get(normalized);
    if (!bucket) continue;

    bucket.clicks += 1;
    const position = num(row.payload.position);
    if (position != null) bucket.positions.push(position);

    const productId = num(row.payload.productId);
    if (productId != null) {
      const existing = bucket.clickedProducts.get(productId);
      const name = str(row.payload.productName) || `Product ${productId}`;
      bucket.clickedProducts.set(productId, {
        name,
        clicks: (existing?.clicks ?? 0) + 1,
      });
    }
  }

  for (const row of searchCartAdds) {
    const query = str(row.payload.searchQuery);
    if (!query) continue;
    const bucket = buckets.get(query.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim());
    if (bucket) bucket.cartAdds += 1;
  }

  const topQueries: QuerySummary[] = [...buckets.values()]
    .map((bucket) => ({
      query: bucket.query,
      normalizedQuery: bucket.normalizedQuery,
      searches: bucket.searches,
      uniqueSessions: bucket.sessions.size,
      averageResults: averageOf(bucket.results) ?? 0,
      zeroResultRate: rate(bucket.zeroCount, bucket.searches),
      clicks: bucket.clicks,
      clickThroughRate: rate(bucket.clicks, bucket.searches),
      cartAdds: bucket.cartAdds,
      cartRate: rate(bucket.cartAdds, bucket.searches),
      averageClickPosition: averageOf(bucket.positions),
      lastSearchedAt: bucket.lastSearchedAt,
      correction: bucket.correction,
      topClickedProducts: [...bucket.clickedProducts.entries()]
        .map(([productId, value]) => ({
          productId,
          productName: value.name,
          clicks: value.clicks,
        }))
        .sort((a, b) => b.clicks - a.clicks)
        .slice(0, 5),
    }))
    .sort((a, b) => b.searches - a.searches);

  const zeroResultQueries: ZeroResultQuery[] = [...buckets.values()]
    .filter((bucket) => bucket.zeroCount > 0)
    .map((bucket) => ({
      query: bucket.query,
      searches: bucket.zeroCount,
      uniqueSessions: bucket.sessions.size,
      lastSearchedAt: bucket.lastSearchedAt,
      firstSearchedAt:
        bucket.firstSearchedAt === Number.MAX_SAFE_INTEGER
          ? bucket.lastSearchedAt
          : bucket.firstSearchedAt,
      looksMisspelled: Boolean(bucket.correction),
      correction: bucket.correction,
    }))
    .sort((a, b) => b.searches - a.searches);

  /* ---- product demand ---- */
  const demand = new Map<number, ProductDemand>();
  const demandFor = (productId: number, productName: string): ProductDemand => {
    let entry = demand.get(productId);
    if (!entry) {
      entry = {
        productId,
        productName,
        topResultAppearances: 0,
        clicks: 0,
        cartAdds: 0,
      };
      demand.set(productId, entry);
    }
    if (productName && entry.productName.startsWith("Product ")) {
      entry.productName = productName;
    }
    return entry;
  };

  for (const row of searches) {
    const productId = num(row.payload.topProductId);
    if (productId == null) continue;
    demandFor(productId, str(row.payload.topProductName)).topResultAppearances += 1;
  }
  for (const row of clicks) {
    const productId = num(row.payload.productId);
    if (productId == null) continue;
    demandFor(productId, str(row.payload.productName)).clicks += 1;
  }
  for (const row of searchCartAdds) {
    const productId = num(row.payload.productId);
    if (productId == null) continue;
    demandFor(productId, str(row.payload.productName)).cartAdds += 1;
  }

  const productDemand = [...demand.values()].sort(
    (a, b) =>
      b.clicks - a.clicks ||
      b.topResultAppearances - a.topResultAppearances ||
      a.productId - b.productId
  );

  /* ---- over time ---- */
  const byDay = new Map<string, SearchTimePoint>();
  const dayKey = (at: number) => new Date(at).toISOString().slice(0, 10);
  const pointFor = (key: string): SearchTimePoint => {
    let point = byDay.get(key);
    if (!point) {
      point = { date: key, searches: 0, zeroResults: 0, clicks: 0 };
      byDay.set(key, point);
    }
    return point;
  };

  for (const row of searches) {
    const point = pointFor(dayKey(new Date(row.created_at).getTime()));
    point.searches += 1;
    if (row.payload.zeroResults === true || num(row.payload.resultCount) === 0) {
      point.zeroResults += 1;
    }
  }
  for (const row of clicks) {
    pointFor(dayKey(new Date(row.created_at).getTime())).clicks += 1;
  }

  const overTime = [...byDay.values()].sort((a, b) =>
    a.date.localeCompare(b.date)
  );

  /* ---- corrections ---- */
  const correctionCounts = new Map<string, { typed: string; corrected: string; count: number }>();
  for (const row of searches) {
    const corrected = str(row.payload.correctedQuery);
    const typed = str(row.payload.query);
    if (!corrected || !typed) continue;
    const key = `${typed.toLowerCase()}->${corrected}`;
    const existing = correctionCounts.get(key);
    correctionCounts.set(key, {
      typed,
      corrected,
      count: (existing?.count ?? 0) + 1,
    });
  }

  /* ---- devices ---- */
  const deviceCounts = new Map<string, number>();
  for (const row of searches) {
    const device = str(row.payload.device) || "unknown";
    deviceCounts.set(device, (deviceCounts.get(device) ?? 0) + 1);
  }

  const totalSearches = searches.length;
  const allPositions = clicks
    .map((row) => num(row.payload.position))
    .filter((value): value is number => value != null);

  const clickThroughRate = rate(clicksBySearchId.size, totalSearches);
  const zeroResultRate = rate(zeroResultSearches.length, totalSearches);

  const quality = assessQuality({
    totalSearches,
    zeroResultRate,
    clickThroughRate,
    averageClickPosition: averageOf(allPositions),
  });

  return {
    rangeStart: range.start,
    rangeEnd: range.end,
    totalSearches,
    uniqueSessions: sessions.size,
    zeroResultSearches: zeroResultSearches.length,
    zeroResultRate,
    clickThroughRate,
    cartRate: rate(cartBySearchId.size, totalSearches),
    averageResponseMs: averageOf(responseTimes),
    quality: quality.band,
    qualityReasons: quality.reasons,
    topQueries: topQueries.slice(0, 50),
    zeroResultQueries: zeroResultQueries.slice(0, 50),
    topClickedProducts: productDemand.filter((p) => p.clicks > 0).slice(0, 10),
    productDemand: productDemand.slice(0, 25),
    overTime,
    funnel: {
      searches: totalSearches,
      searchesWithResults: totalSearches - zeroResultSearches.length,
      productClicks: clicksBySearchId.size,
      addToCart: cartBySearchId.size,
      checkoutStart: checkouts.length,
      orders: orders.length,
    },
    corrections: [...correctionCounts.values()]
      .sort((a, b) => b.count - a.count)
      .slice(0, 20),
    deviceBreakdown: [...deviceCounts.entries()]
      .map(([device, count]) => ({ device, searches: count }))
      .sort((a, b) => b.searches - a.searches),
    degraded,
  };
}

/** Loads events for the range and folds them. Admin-only entry point. */
export async function getSearchInsights(
  range: SearchRangeKey,
  from?: string,
  to?: string
): Promise<SearchInsights> {
  const resolved = resolveRange(range, from, to);
  const rows = await listAnalyticsEventsSince(new Date(resolved.start).toISOString());

  // listAnalyticsEventsSince is read-guarded and returns [] when Supabase is
  // unreachable. An empty result is indistinguishable from a quiet range, so
  // the flag lets the page say "analytics unavailable" instead of "no
  // searches" -- an honest empty state matters more than a tidy one.
  return buildSearchInsights(rows, resolved, rows.length === 0);
}
