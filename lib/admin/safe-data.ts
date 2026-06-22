import { isSupabaseConfigured } from "@/lib/env";
import { getAnalyticsSummary, getDashboardChartData } from "@/lib/analytics";
import { detectViralProducts } from "@/lib/ai/viral-detector";
import { getInsightsReport } from "@/lib/insights/engine";
import { getPaymentStats } from "@/lib/db/payments";
import { safeQuery } from "@/lib/db/safe-query";
import {
  EMPTY_ANALYTICS_SUMMARY,
  EMPTY_INSIGHTS_REPORT,
  EMPTY_PAYMENT_STATS,
  EMPTY_VIRAL_REPORT,
  buildEmptyDashboardCharts,
} from "@/lib/admin/fallbacks";

export type DashboardData = {
  summary: Awaited<ReturnType<typeof getAnalyticsSummary>>;
  charts: Awaited<ReturnType<typeof getDashboardChartData>>;
  insights: Awaited<ReturnType<typeof getInsightsReport>>;
  paymentStats: Awaited<ReturnType<typeof getPaymentStats>>;
  viral: Awaited<ReturnType<typeof detectViralProducts>>;
  dataUnavailable: boolean;
};

export async function loadDashboardData(): Promise<DashboardData> {
  const dataUnavailable = !isSupabaseConfigured();

  const [summary, charts, insights, paymentStats, viral] = await Promise.all([
    safeQuery(() => getAnalyticsSummary(), EMPTY_ANALYTICS_SUMMARY, "dashboard-summary"),
    safeQuery(() => getDashboardChartData(), buildEmptyDashboardCharts(), "dashboard-charts"),
    safeQuery(() => getInsightsReport(), EMPTY_INSIGHTS_REPORT, "dashboard-insights"),
    safeQuery(() => getPaymentStats(), EMPTY_PAYMENT_STATS, "dashboard-payments"),
    safeQuery(() => detectViralProducts(5), EMPTY_VIRAL_REPORT, "dashboard-viral"),
  ]);

  return {
    summary,
    charts,
    insights,
    paymentStats,
    viral,
    dataUnavailable,
  };
}
