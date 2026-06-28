import { getAnalyticsSummary } from "@/lib/analytics";
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
      { totalRevenue: 0, pendingRevenue: 0, paidOrderCount: 0, totalOrders: 0, pendingOrders: 0 },
      "assistant-order-stats"
    ),
    safeQuery(
      () => getPaymentStats(),
      {
        total: 0,
        pending: 0,
        paid: 0,
        failed: 0,
        refunded: 0,
        paidAmount: 0,
        pendingAmount: 0,
        cryptomusPaid: 0,
        cryptomusPaidAmount: 0,
        nowpaymentsPending: 0,
        nowpaymentsPendingAmount: 0,
        manualPaid: 0,
        manualPaidAmount: 0,
      },
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
