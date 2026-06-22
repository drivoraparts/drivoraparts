import { getOrders } from "@/lib/marketplace/orders";
import { loadEvents } from "./store";
import type { AnalyticsSummary, ProductMetric } from "./types";

function countByProduct(
  events: ReturnType<typeof loadEvents>,
  eventName: "product_view" | "add_to_cart"
): ProductMetric[] {
  const counts = new Map<number, ProductMetric>();

  for (const event of events) {
    if (event.name !== eventName) continue;

    const productId = Number(event.payload.productId);
    if (!Number.isFinite(productId)) continue;

    const productName =
      typeof event.payload.productName === "string"
        ? event.payload.productName
        : `Product #${productId}`;

    const existing = counts.get(productId);
    if (existing) {
      existing.count += 1;
    } else {
      counts.set(productId, { productId, productName, count: 1 });
    }
  }

  return [...counts.values()].sort((a, b) => b.count - a.count);
}

export function getAnalyticsSummary(): AnalyticsSummary {
  const events = loadEvents();
  const orders = getOrders();

  const productViews = events.filter((e) => e.name === "product_view").length;
  const cartAdds = events.filter((e) => e.name === "add_to_cart").length;
  const checkoutCount = events.filter((e) => e.name === "checkout_start").length;
  const orderEvents = events.filter((e) => e.name === "order_completed");

  const totalOrders = Math.max(orders.length, orderEvents.length);
  const revenueFromOrders = orders.reduce((sum, order) => sum + order.total, 0);
  const revenueFromEvents = orderEvents.reduce((sum, event) => {
    const total = Number(event.payload.total);
    return sum + (Number.isFinite(total) ? total : 0);
  }, 0);
  const totalRevenue = Math.max(revenueFromOrders, revenueFromEvents);

  const conversionRate =
    productViews > 0 ? Number(((totalOrders / productViews) * 100).toFixed(2)) : 0;

  return {
    totalRevenue,
    totalOrders,
    productViews,
    cartAdds,
    checkoutCount,
    conversionRate,
    topViewedProducts: countByProduct(events, "product_view").slice(0, 10),
    topCartProducts: countByProduct(events, "add_to_cart").slice(0, 10),
    recentEvents: [...events].sort((a, b) => b.createdAt - a.createdAt).slice(0, 25),
  };
}
