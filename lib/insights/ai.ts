import { EMPTY_ORDER_STATS } from "@/lib/admin/fallbacks";
import { listAnalyticsEvents } from "@/lib/db/analytics";
import { getCustomerStats } from "@/lib/db/customers";
import { getInventoryAlerts, getInventoryStats } from "@/lib/db/inventory";
import { safeQuery } from "@/lib/db/safe-query";
import { getOrderStats, listOrders } from "@/lib/db/orders";
import { getPaymentStats } from "@/lib/db/payments";
import { products } from "@/lib/inventory/products";

export type ProductRankingScore = {
  productId: number;
  name: string;
  demandVelocity: number;
  views: number;
  cartAdds: number;
  orders: number;
  rank: number;
};

export type InventoryRiskScore = {
  productId: number;
  productName: string;
  quantity: number;
  riskScore: number;
  severity: "low" | "medium" | "high" | "critical";
  reason: string;
};

export type ChurnRiskCustomer = {
  segment: string;
  churnRisk: number;
  reason: string;
};

export type AiInsightsReport = {
  generatedAt: number;
  predictedRevenueNext7Days: number;
  predictedBestSellingProducts: Array<{
    productId: number;
    name: string;
    projectedUnits: number;
    projectedRevenue: number;
  }>;
  inventoryRiskScores: InventoryRiskScore[];
  customerChurnRisk: ChurnRiskCustomer[];
  productRankingScores: ProductRankingScore[];
  source: "live" | "fallback";
};

const FALLBACK: AiInsightsReport = {
  generatedAt: Date.now(),
  predictedRevenueNext7Days: 0,
  predictedBestSellingProducts: [],
  inventoryRiskScores: [],
  customerChurnRisk: [
    {
      segment: "New visitors",
      churnRisk: 42,
      reason: "Insufficient order history for precise scoring.",
    },
  ],
  productRankingScores: [],
  source: "fallback",
};

function scoreInventoryRisk(
  alert: Awaited<ReturnType<typeof getInventoryAlerts>>[number],
  demandVelocity: number
): InventoryRiskScore {
  const base =
    alert.severity === "out" ? 90 : alert.severity === "low" ? 65 : 40;
  const riskScore = Math.min(100, Math.round(base + demandVelocity * 2));

  return {
    productId: alert.productId,
    productName: alert.productName,
    quantity: alert.quantity,
    riskScore,
    severity:
      riskScore >= 85
        ? "critical"
        : riskScore >= 65
          ? "high"
          : riskScore >= 40
            ? "medium"
            : "low",
    reason:
      alert.severity === "out"
        ? "Out of stock with active demand signals."
        : `Low stock (${alert.quantity} units) with demand velocity ${demandVelocity}.`,
  };
}

export async function getAiInsightsReport(): Promise<AiInsightsReport> {
  const [events, orderStats, inventoryStats, customerStats, alerts, orders] =
    await Promise.all([
      safeQuery(() => listAnalyticsEvents(4000), [], "ai-insights-events"),
      safeQuery(
        () => getOrderStats(),
        EMPTY_ORDER_STATS,
        "ai-insights-orders"
      ),
      safeQuery(
        () => getInventoryStats(),
        { totalSkus: 0, outOfStock: 0, lowStock: 0, totalUnits: 0 },
        "ai-insights-inventory"
      ),
      safeQuery(
        () => getCustomerStats(),
        { totalCustomers: 0, newCustomers30d: 0 },
        "ai-insights-customers"
      ),
      safeQuery(() => getInventoryAlerts(), [], "ai-insights-alerts"),
      safeQuery(() => listOrders(300), [], "ai-insights-order-list"),
    ]);

  if (!events.length && !orders.length) {
    return { ...FALLBACK, generatedAt: Date.now() };
  }

  const productMetrics = new Map<
    number,
    { views: number; cartAdds: number; orders: number; name: string }
  >();

  for (const event of events) {
    const productId = Number(event.payload?.productId);
    if (!productId) continue;
    const name =
      typeof event.payload?.productName === "string"
        ? event.payload.productName
        : products.find((p) => p.id === productId)?.name ?? `Product ${productId}`;
    const row = productMetrics.get(productId) ?? {
      views: 0,
      cartAdds: 0,
      orders: 0,
      name,
    };
    if (event.name === "product_view") row.views += 1;
    if (event.name === "add_to_cart") row.cartAdds += 1;
    if (event.name === "order_completed") row.orders += 1;
    productMetrics.set(productId, row);
  }

  const productRankingScores: ProductRankingScore[] = [...productMetrics.entries()]
    .map(([productId, row]) => ({
      productId,
      name: row.name,
      views: row.views,
      cartAdds: row.cartAdds,
      orders: row.orders,
      demandVelocity: row.views + row.cartAdds * 3 + row.orders * 8,
      rank: 0,
    }))
    .sort((a, b) => b.demandVelocity - a.demandVelocity)
    .map((item, index) => ({ ...item, rank: index + 1 }))
    .slice(0, 15);

  const velocityByProduct = new Map(
    productRankingScores.map((p) => [p.productId, p.demandVelocity])
  );

  const paidOrders = orders.filter((o) => o.status === "paid");
  const hasPaidHistory = paidOrders.length > 0;

  const avgOrderValue = hasPaidHistory
    ? paidOrders.reduce((sum, o) => sum + Number(o.total), 0) / paidOrders.length
    : 0;

  const dailyVelocity = hasPaidHistory
    ? paidOrders.length / Math.max(1, Math.min(30, paidOrders.length))
    : 0;

  const predictedRevenueNext7Days = hasPaidHistory
    ? Math.round(avgOrderValue * dailyVelocity * 7 * 1.08)
    : 0;

  const predictedBestSellingProducts = productRankingScores.slice(0, 5).map((p) => {
    const catalog = products.find((item) => item.id === p.productId);
    const price = catalog?.price ?? avgOrderValue;
    const projectedUnits = Math.max(1, Math.round(p.demandVelocity / 10));
    return {
      productId: p.productId,
      name: p.name,
      projectedUnits,
      projectedRevenue: Math.round(projectedUnits * price),
    };
  });

  const inventoryRiskScores = alerts
    .map((alert) =>
      scoreInventoryRisk(alert, velocityByProduct.get(alert.productId) ?? 0)
    )
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 12);

  const repeatRate =
    orders.length > 0
      ? Math.round(
          ((orders.length -
            new Set(orders.map((o) => o.customer?.email).filter(Boolean)).size) /
            orders.length) *
            1000
        ) / 10
      : 0;

  const customerChurnRisk: ChurnRiskCustomer[] = [
    {
      segment: "One-time buyers",
      churnRisk: Math.min(95, Math.round(55 + (100 - repeatRate) * 0.3)),
      reason: `${orderStats.pendingOrders} pending orders may delay repeat purchase.`,
    },
    {
      segment: "Cart abandoners",
      churnRisk: Math.min(
        90,
        Math.round(
          (events.filter((e) => e.name === "add_to_cart").length /
            Math.max(1, events.filter((e) => e.name === "order_completed").length)) *
            8
        )
      ),
      reason: "High cart-to-order gap detected in recent analytics.",
    },
    {
      segment: "Low-engagement catalog",
      churnRisk: inventoryStats.outOfStock > 3 ? 72 : 38,
      reason: `${inventoryStats.outOfStock} SKUs out of stock may push buyers away.`,
    },
    {
      segment: "New customers (30d)",
      churnRisk: customerStats.newCustomers30d > 0 ? 48 : 60,
      reason: `${customerStats.newCustomers30d} new customers need onboarding follow-up.`,
    },
  ];

  await getPaymentStats().catch(() => null);

  return {
    generatedAt: Date.now(),
    predictedRevenueNext7Days,
    predictedBestSellingProducts,
    inventoryRiskScores,
    customerChurnRisk,
    productRankingScores,
    source: "live",
  };
}
