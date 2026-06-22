import { listAnalyticsEvents } from "@/lib/db/analytics";
import { getOrderStats } from "@/lib/db/orders";
import type { AnalyticsSummary, ProductMetric } from "./types";

function buildProductMetrics(
  events: Awaited<ReturnType<typeof listAnalyticsEvents>>,
  eventName: string,
  idKey: string,
  nameKey: string
): ProductMetric[] {
  const map = new Map<number, ProductMetric>();

  for (const event of events) {
    if (event.name !== eventName) continue;
    const payload = event.payload ?? {};
    const productId = Number(payload[idKey]);
    if (!productId) continue;

    const existing = map.get(productId) ?? {
      productId,
      productName: String(payload[nameKey] ?? `Product ${productId}`),
      count: 0,
    };
    existing.count += 1;
    map.set(productId, existing);
  }

  return [...map.values()].sort((a, b) => b.count - a.count).slice(0, 10);
}

export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  const [events, orderStats] = await Promise.all([
    listAnalyticsEvents(2000),
    getOrderStats(),
  ]);

  const productViews = events.filter((e) => e.name === "product_view").length;
  const cartAdds = events.filter((e) => e.name === "add_to_cart").length;
  const checkoutCount = events.filter((e) => e.name === "checkout_start").length;
  const conversionRate =
    productViews > 0
      ? Math.round((orderStats.paidOrderCount / productViews) * 1000) / 10
      : 0;

  return {
    totalRevenue: orderStats.totalRevenue,
    totalOrders: orderStats.totalOrders,
    productViews,
    cartAdds,
    checkoutCount,
    conversionRate,
    topViewedProducts: buildProductMetrics(
      events,
      "product_view",
      "productId",
      "productName"
    ),
    topCartProducts: buildProductMetrics(
      events,
      "add_to_cart",
      "productId",
      "productName"
    ),
    recentEvents: events.slice(0, 20).map((event) => ({
      id: event.id,
      name: event.name as AnalyticsSummary["recentEvents"][number]["name"],
      payload: event.payload ?? {},
      createdAt: new Date(event.created_at).getTime(),
    })),
  };
}
