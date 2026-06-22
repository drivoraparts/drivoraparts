import { listAnalyticsEvents } from "@/lib/db/analytics";
import { getCustomerStats } from "@/lib/db/customers";
import { getInventoryAlerts, getInventoryStats } from "@/lib/db/inventory";
import { getOrderStats, listOrders } from "@/lib/db/orders";
import { getPaymentStats } from "@/lib/db/payments";
import { products } from "@/lib/inventory/products";
import { getAiInsightsReport, type AiInsightsReport } from "./ai";

export type InsightsReport = {
  generatedAt: number;
  topProducts: Array<{ productId: number; name: string; score: number; views: number; cartAdds: number }>;
  slowProducts: Array<{ productId: number; name: string; views: number }>;
  lowInventoryAlerts: Awaited<ReturnType<typeof getInventoryAlerts>>;
  estimatedMonthlyRevenue: number;
  customerTrends: {
    totalCustomers: number;
    newCustomers30d: number;
    repeatRateEstimate: number;
  };
  conversionEstimate: number;
  orderStats: Awaited<ReturnType<typeof getOrderStats>>;
  paymentStats: Awaited<ReturnType<typeof getPaymentStats>>;
  inventoryStats: Awaited<ReturnType<typeof getInventoryStats>>;
  ai: AiInsightsReport;
};

export async function getInsightsReport(): Promise<InsightsReport> {
  const [events, orderStats, paymentStats, inventoryStats, customerStats, alerts, orders, ai] =
    await Promise.all([
      listAnalyticsEvents(3000),
      getOrderStats(),
      getPaymentStats(),
      getInventoryStats(),
      getCustomerStats(),
      getInventoryAlerts(),
      listOrders(200),
      getAiInsightsReport(),
    ]);

  const productScores = new Map<
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

    const row = productScores.get(productId) ?? { views: 0, cartAdds: 0, name };
    if (event.name === "product_view") row.views += 1;
    if (event.name === "add_to_cart") row.cartAdds += 1;
    productScores.set(productId, row);
  }

  const topProducts = [...productScores.entries()]
    .map(([productId, row]) => ({
      productId,
      name: row.name,
      views: row.views,
      cartAdds: row.cartAdds,
      score: row.views + row.cartAdds * 3,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  const slowProducts = [...productScores.entries()]
    .filter(([, row]) => row.views <= 2)
    .map(([productId, row]) => ({ productId, name: row.name, views: row.views }))
    .slice(0, 10);

  const productViews = events.filter((e) => e.name === "product_view").length;
  const conversionEstimate =
    productViews > 0
      ? Math.round((orderStats.totalOrders / productViews) * 1000) / 10
      : 0;

  const paidOrders = orders.filter((o) => o.status === "paid");
  const avgOrderValue =
    paidOrders.length > 0
      ? paidOrders.reduce((sum, o) => sum + Number(o.total), 0) / paidOrders.length
      : 0;

  const estimatedMonthlyRevenue = Math.round(avgOrderValue * paidOrders.length * 0.35);

  const uniqueCustomerEmails = new Set(
    orders.map((o) => o.customer?.email).filter(Boolean)
  );
  const repeatRateEstimate =
    uniqueCustomerEmails.size > 0
      ? Math.round(
          ((orders.length - uniqueCustomerEmails.size) / orders.length) * 1000
        ) / 10
      : 0;

  return {
    generatedAt: Date.now(),
    topProducts,
    slowProducts,
    lowInventoryAlerts: alerts,
    estimatedMonthlyRevenue,
    customerTrends: {
      totalCustomers: customerStats.totalCustomers,
      newCustomers30d: customerStats.newCustomers30d,
      repeatRateEstimate,
    },
    conversionEstimate,
    orderStats,
    paymentStats,
    inventoryStats,
    ai,
  };
}
