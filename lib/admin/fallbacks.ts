import type { AnalyticsSummary } from "@/lib/analytics/types";
import type { DashboardChartData } from "@/lib/analytics/chartTypes";
import type { InsightsReport } from "@/lib/insights/engine";
import type { AiInsightsReport } from "@/lib/insights/ai";
import type { ViralProductsReport } from "@/lib/ai/viral-detector";

export const EMPTY_ORDER_STATS = {
  totalRevenue: 0,
  pendingRevenue: 0,
  paidOrderCount: 0,
  totalOrders: 0,
  pendingOrders: 0,
  placedOrders: 0,
  abandonedCheckouts: 0,
};

export const EMPTY_PAYMENT_STATS = {
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
};

export const EMPTY_CUSTOMER_STATS = {
  totalCustomers: 0,
  newCustomers30d: 0,
};

export const EMPTY_INVENTORY_STATS = {
  totalSkus: 0,
  outOfStock: 0,
  lowStock: 0,
  totalUnits: 0,
};

export const EMPTY_AI_INSIGHTS: AiInsightsReport = {
  generatedAt: Date.now(),
  predictedRevenueNext7Days: 0,
  predictedBestSellingProducts: [],
  inventoryRiskScores: [],
  customerChurnRisk: [
    {
      segment: "New visitors",
      churnRisk: 42,
      reason: "Live analytics unavailable — showing baseline estimate.",
    },
  ],
  productRankingScores: [],
  source: "fallback",
};

export const EMPTY_ANALYTICS_SUMMARY: AnalyticsSummary = {
  totalRevenue: 0,
  totalOrders: 0,
  productViews: 0,
  cartAdds: 0,
  checkoutCount: 0,
  conversionRate: 0,
  topViewedProducts: [],
  topCartProducts: [],
  recentEvents: [],
};

export const EMPTY_VIRAL_REPORT: ViralProductsReport = {
  generatedAt: Date.now(),
  products: [],
  source: "fallback",
};

function buildDateKeys(days: number): string[] {
  const keys: string[] = [];
  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = new Date();
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() - offset);
    keys.push(date.toISOString().slice(0, 10));
  }
  return keys;
}

function formatDayLabel(dateKey: string): string {
  const date = new Date(`${dateKey}T12:00:00`);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function buildEmptyDashboardCharts(days = 14): DashboardChartData {
  const dateKeys = buildDateKeys(days);

  return {
    revenueOverTime: dateKeys.map((date) => ({
      date,
      label: formatDayLabel(date),
      revenue: 0,
    })),
    ordersPerDay: dateKeys.map((date) => ({
      date,
      label: formatDayLabel(date),
      orders: 0,
    })),
    trafficOverTime: dateKeys.map((date) => ({
      date,
      label: formatDayLabel(date),
      views: 0,
    })),
    conversionOverTime: dateKeys.map((date) => ({
      date,
      label: formatDayLabel(date),
      rate: 0,
    })),
    topProducts: [],
  };
}

export const EMPTY_INSIGHTS_REPORT: InsightsReport = {
  generatedAt: Date.now(),
  topProducts: [],
  slowProducts: [],
  lowInventoryAlerts: [],
  estimatedMonthlyRevenue: 0,
  customerTrends: {
    totalCustomers: 0,
    newCustomers30d: 0,
    repeatRateEstimate: 0,
  },
  conversionEstimate: 0,
  orderStats: EMPTY_ORDER_STATS,
  paymentStats: EMPTY_PAYMENT_STATS,
  inventoryStats: EMPTY_INVENTORY_STATS,
  ai: EMPTY_AI_INSIGHTS,
};
