import { listAnalyticsEventsSince } from "@/lib/db/analytics";
import { safeQuery } from "@/lib/db/safe-query";
import { listOrdersSince } from "@/lib/db/orders";
import { getLiveUsersSummary } from "@/lib/live/users";
import { products } from "@/lib/inventory/products";

export type TrendingProduct = {
  productId: number;
  name: string;
  score: number;
  views: number;
  cartAdds: number;
  velocity: number;
};

export type RealtimeDashboard = {
  activeUsers: number;
  revenueLast60Min: number;
  conversionRate: number;
  topTrendingProducts: TrendingProduct[];
  checkoutDropoffRate: number;
  cartActivityLast60Min: number;
  generatedAt: number;
  source: "live" | "fallback";
};

const FALLBACK: RealtimeDashboard = {
  activeUsers: 0,
  revenueLast60Min: 0,
  conversionRate: 0,
  topTrendingProducts: [],
  checkoutDropoffRate: 0,
  cartActivityLast60Min: 0,
  generatedAt: Date.now(),
  source: "fallback",
};

function sinceMinutesAgo(minutes: number): string {
  return new Date(Date.now() - minutes * 60 * 1000).toISOString();
}

function buildHotProducts(
  events: Awaited<ReturnType<typeof listAnalyticsEventsSince>>
): TrendingProduct[] {
  const scores = new Map<
    number,
    { views: number; cartAdds: number; name: string }
  >();

  for (const event of events) {
    const productId = Number(event.payload?.productId);
    if (!productId) continue;

    const name =
      typeof event.payload?.productName === "string"
        ? event.payload.productName
        : products.find((p) => p.id === productId)?.name ?? `Product ${productId}`;

    const row = scores.get(productId) ?? { views: 0, cartAdds: 0, name };
    if (event.name === "product_view") row.views += 1;
    if (event.name === "add_to_cart") row.cartAdds += 1;
    scores.set(productId, row);
  }

  return [...scores.entries()]
    .map(([productId, row]) => {
      const velocity = row.views + row.cartAdds * 4;
      return {
        productId,
        name: row.name,
        views: row.views,
        cartAdds: row.cartAdds,
        velocity,
        score: velocity,
      };
    })
    .sort((a, b) => b.velocity - a.velocity)
    .slice(0, 8);
}

export async function getRealtimeDashboard(): Promise<RealtimeDashboard> {
  const since60 = sinceMinutesAgo(60);

  const [live, events, recentOrders] = await Promise.all([
    safeQuery(() => getLiveUsersSummary(), null, "live-users"),
    safeQuery(
      () => listAnalyticsEventsSince(since60),
      [],
      "analytics-events-60m"
    ),
    safeQuery(() => listOrdersSince(since60), [], "orders-60m"),
  ]);

  if (!live && !events.length && !recentOrders.length) {
    return { ...FALLBACK, generatedAt: Date.now() };
  }

  const productViews = events.filter((e) => e.name === "product_view").length;
  const cartAdds = events.filter((e) => e.name === "add_to_cart").length;
  const checkoutStarts = events.filter((e) => e.name === "checkout_start").length;
  const orderCompletions = events.filter((e) => e.name === "order_completed").length;

  const paidRecent = recentOrders.filter((o) => o.status === "paid");
  const revenueLast60Min = paidRecent.reduce(
    (sum, order) => sum + Number(order.total),
    0
  );

  const conversionRate =
    productViews > 0
      ? Math.round((orderCompletions / productViews) * 1000) / 10
      : paidRecent.length > 0 && productViews === 0
        ? 100
        : 0;

  const checkoutDropoffRate =
    checkoutStarts > 0
      ? Math.round(((checkoutStarts - orderCompletions) / checkoutStarts) * 1000) / 10
      : 0;

  return {
    activeUsers: live?.activeUsers ?? 0,
    revenueLast60Min,
    conversionRate,
    topTrendingProducts: buildHotProducts(events),
    checkoutDropoffRate,
    cartActivityLast60Min: cartAdds,
    generatedAt: Date.now(),
    source: live || events.length ? "live" : "fallback",
  };
}
