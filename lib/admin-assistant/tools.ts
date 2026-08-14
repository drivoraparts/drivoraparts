import { EMPTY_ORDER_STATS, EMPTY_PAYMENT_STATS } from "@/lib/admin/fallbacks";
import { getAnalyticsSummary } from "@/lib/analytics";
import { listAnalyticsEvents } from "@/lib/db/analytics";
import { getOrderByNumber } from "@/lib/db/orders";
import { getInventoryAlerts, getInventoryStats } from "@/lib/db/inventory";
import { getOrderStats, listOrders } from "@/lib/db/orders";
import { getPaymentStats, listPayments } from "@/lib/db/payments";
import { getAiInsightsReport } from "@/lib/insights/ai";
import { getLiveUsersSnapshot } from "@/lib/live/users";
import { getRevenueOptimizationReport } from "@/lib/optimization/revenue";
import { getSupplierEngineRecommendations } from "@/lib/suppliers/engine";
import { getDailyBusinessDecisions } from "@/lib/ai/decision-brain";
import { getDailyBusinessReport } from "@/lib/ai/daily-report";
import { getActionRecommendations } from "@/lib/ai/action-recommender";
import { simulateBusinessScenario } from "@/lib/ai/simulator";
import { getRealtimeDashboard } from "@/lib/realtime/engine";
import { safeQuery } from "@/lib/db/safe-query";

export async function getRevenue() {
  const [analytics, orders, payments] = await Promise.all([
    safeQuery(
      () => getAnalyticsSummary(),
      {
        totalRevenue: 0,
        totalOrders: 0,
        productViews: 0,
        cartAdds: 0,
        checkoutCount: 0,
        conversionRate: 0,
        topViewedProducts: [],
        topCartProducts: [],
        recentEvents: [],
      },
      "assistant-revenue"
    ),
    safeQuery(
      () => getOrderStats(),
      EMPTY_ORDER_STATS,
      "assistant-order-stats"
    ),
    safeQuery(
      () => getPaymentStats(),
      EMPTY_PAYMENT_STATS,
      "assistant-payments"
    ),
  ]);

  return { analytics, orders, payments };
}

export async function getTopProducts() {
  const ai = await safeQuery(() => getAiInsightsReport(), null, "assistant-top-products");
  return ai?.productRankingScores.slice(0, 8) ?? [];
}

export async function getRecentOrders(limit = 10) {
  const orders = await safeQuery(() => listOrders(limit), [], "assistant-recent-orders");
  return orders.map((order) => ({
    id: order.id,
    total: Number(order.total),
    status: order.status,
    customer: order.customer?.email ?? "unknown",
    createdAt: order.created_at,
  }));
}

/**
 * How many events the per-product counts look back over. Matches the window
 * getAnalyticsSummary() uses, so a product's figures reconcile with the
 * dashboard totals rather than disagreeing with them.
 */
const PRODUCT_EVENT_WINDOW = 2000;

/**
 * Engagement for one specific product.
 *
 * The ranking report only keeps its top 15, so a product missing from it has
 * not necessarily seen zero activity — it may simply be 16th. Counting the
 * event stream directly is what lets the assistant tell those two apart
 * instead of reporting an absence as a zero.
 */
export async function getProductActivity(productId: number) {
  const events = await safeQuery(
    () => listAnalyticsEvents(PRODUCT_EVENT_WINDOW),
    [],
    "assistant-product-activity"
  );

  let views = 0;
  let cartAdds = 0;
  let checkouts = 0;
  let orders = 0;

  for (const event of events) {
    const payload = (event.payload ?? {}) as Record<string, unknown>;
    if (Number(payload.productId) !== productId) continue;

    if (event.name === "product_view") views += 1;
    else if (event.name === "add_to_cart") cartAdds += 1;
    else if (event.name === "checkout_start") checkouts += 1;
    else if (event.name === "order_completed") orders += 1;
  }

  const oldest = events.at(-1)?.created_at ?? null;

  return {
    views,
    cartAdds,
    checkouts,
    orders,
    /** True when the window is saturated, so older activity exists but is unread. */
    windowSaturated: events.length >= PRODUCT_EVENT_WINDOW,
    windowOldest: oldest,
  };
}

export async function findOrderByNumber(orderNumber: string) {
  return safeQuery(() => getOrderByNumber(orderNumber), null, "assistant-order-lookup");
}

export async function getInventoryStatus() {
  const [stats, alerts] = await Promise.all([
    safeQuery(
      () => getInventoryStats(),
      { totalSkus: 0, outOfStock: 0, lowStock: 0, totalUnits: 0 },
      "assistant-inventory-stats"
    ),
    safeQuery(() => getInventoryAlerts(), [], "assistant-inventory-alerts"),
  ]);

  return { stats, alerts: alerts.slice(0, 8) };
}

export async function getLiveOperations() {
  const [realtime, live] = await Promise.all([
    safeQuery(() => getRealtimeDashboard(), null, "assistant-realtime"),
    safeQuery(() => getLiveUsersSnapshot(), null, "assistant-live"),
  ]);

  return { realtime, live };
}

export async function getBusinessSnapshot() {
  const [revenue, topProducts, recentOrders, inventory, suppliers, optimization, ai] =
    await Promise.all([
      getRevenue(),
      getTopProducts(),
      getRecentOrders(8),
      getInventoryStatus(),
      safeQuery(() => getSupplierEngineRecommendations(), null, "assistant-suppliers"),
      safeQuery(() => getRevenueOptimizationReport(), null, "assistant-optimization"),
      safeQuery(() => getAiInsightsReport(), null, "assistant-ai"),
    ]);

  return {
    revenue,
    topProducts,
    recentOrders,
    inventory,
    suppliers,
    optimization,
    ai,
  };
}

export async function getAnalyticsOverview() {
  return getRevenue();
}

export async function getUsersOnline() {
  const live = await safeQuery(() => getLiveUsersSnapshot(), null, "assistant-users");
  return live;
}

export async function getStockAlerts() {
  return getInventoryStatus();
}

export async function getPaymentRecords(limit = 20) {
  return safeQuery(() => listPayments(limit), [], "assistant-payment-records");
}

export async function getDecisionBrainSnapshot() {
  const [brain, report, actions] = await Promise.all([
    safeQuery(() => getDailyBusinessDecisions(), null, "assistant-brain"),
    safeQuery(() => getDailyBusinessReport(), null, "assistant-daily"),
    safeQuery(() => getActionRecommendations(), null, "assistant-actions"),
  ]);

  return { brain, report, actions };
}

export async function simulateProductScenario(
  productId: number,
  type: "price_increase" | "tiktok_campaign" | "restock"
) {
  return safeQuery(
    () =>
      simulateBusinessScenario({
        type,
        productId,
        percent: 10,
        budgetTier: "medium",
      }),
    null,
    "assistant-simulate"
  );
}
