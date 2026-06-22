import { getAiInsightsReport } from "@/lib/insights/ai";
import { getAnalyticsSummary } from "@/lib/analytics";
import { listOrdersSince } from "@/lib/db/orders";
import { safeQuery } from "@/lib/db/safe-query";
import { getProductById } from "@/lib/inventory";
import { getDailyBusinessDecisions } from "./decision-brain";
import { getActionRecommendations } from "./action-recommender";
import { detectViralProducts } from "./viral-detector";
import { collectProductSignals } from "./product-metrics";

export type DailyBusinessReport = {
  date: string;
  generatedAt: number;
  madeMoneyToday: Array<{ productId: number; name: string; revenue: number; orders: number }>;
  lostMoneyToday: Array<{ productId: number; name: string; reason: string; estimatedLoss: number }>;
  trending: Array<{ productId: number; name: string; viralScore: number; signal: string }>;
  shouldStop: Array<{ productId: number; name: string; reason: string }>;
  shouldScale: Array<{ productId: number; name: string; reason: string; confidence: number }>;
  revenuePrediction: {
    next7Days: number;
    todayEstimate: number;
    confidence: "low" | "medium" | "high";
  };
  riskAlerts: string[];
  growthOpportunities: string[];
  topActions: string[];
  source: "live" | "fallback";
};

function sinceToday(): string {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date.toISOString();
}

export async function getDailyBusinessReport(): Promise<DailyBusinessReport> {
  try {
    return await buildDailyBusinessReport();
  } catch (error) {
    console.error("[getDailyBusinessReport]", error);
    return {
      date: new Date().toISOString().slice(0, 10),
      generatedAt: Date.now(),
      madeMoneyToday: [],
      lostMoneyToday: [],
      trending: [],
      shouldStop: [],
      shouldScale: [],
      revenuePrediction: { next7Days: 0, todayEstimate: 0, confidence: "low" },
      riskAlerts: ["Live data temporarily unavailable."],
      growthOpportunities: [],
      topActions: ["Review dashboard once data sources recover."],
      source: "fallback",
    };
  }
}

async function buildDailyBusinessReport(): Promise<DailyBusinessReport> {
  const since = sinceToday();

  const [brain, actions, viral, analytics, ordersToday, signals, aiInsights] =
    await Promise.all([
      getDailyBusinessDecisions(),
      getActionRecommendations(),
      detectViralProducts(8),
      safeQuery(() => getAnalyticsSummary(), null, "daily-report-analytics"),
      safeQuery(() => listOrdersSince(since), [], "daily-report-orders"),
      safeQuery(() => collectProductSignals(), [], "daily-report-signals"),
      safeQuery(() => getAiInsightsReport(), null, "daily-report-ai"),
    ]);

  const paidToday = ordersToday.filter((o) => o.status === "paid");
  const revenueByProduct = new Map<number, { name: string; revenue: number; orders: number }>();

  for (const order of paidToday) {
    for (const item of order.items) {
      const row = revenueByProduct.get(item.product_id) ?? {
        name: item.name,
        revenue: 0,
        orders: 0,
      };
      row.revenue += Number(item.price) * item.quantity;
      row.orders += 1;
      revenueByProduct.set(item.product_id, row);
    }
  }

  const madeMoneyToday = [...revenueByProduct.entries()]
    .map(([productId, row]) => ({ productId, ...row }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 8);

  const lostMoneyToday = signals
    .filter((s) => s.views >= 8 && s.orders === 0 && s.cartAdds >= 2)
    .map((s) => {
      const product = getProductById(s.productId);
      const estimatedLoss = product ? Math.round(product.price * s.cartAdds * 0.15) : 0;
      return {
        productId: s.productId,
        name: s.name,
        reason: `${s.cartAdds} carts but zero conversions — funnel or pricing friction.`,
        estimatedLoss,
      };
    })
    .slice(0, 6);

  const shouldStop = brain.productDecisions
    .filter((d) => d.action === "stop selling")
    .map((d) => ({
      productId: d.productId,
      name: d.productName,
      reason: d.expectedImpact,
    }));

  const shouldScale = brain.productDecisions
    .filter((d) =>
      ["run ad campaign", "scale winning SKU", "increase price"].includes(d.action)
    )
    .map((d) => ({
      productId: d.productId,
      name: d.productName,
      reason: d.expectedImpact,
      confidence: d.confidence,
    }))
    .slice(0, 8);

  const trending = viral.products.map((p) => ({
    productId: p.productId,
    name: p.name,
    viralScore: p.viralScore,
    signal: p.signal,
  }));

  const todayEstimate =
    madeMoneyToday.reduce((sum, row) => sum + row.revenue, 0) ||
    Math.round((analytics?.totalRevenue ?? 0) / 30);

  const riskAlerts = [
    ...actions.highImpact
      .filter((a) => a.priority === "high")
      .slice(0, 4)
      .map((a) => `[HIGH] ${a.action}${a.productName ? `: ${a.productName}` : ""} — ${a.reason}`),
    ...(lostMoneyToday.length
      ? [`${lostMoneyToday.length} products showing cart-to-order leakage.`]
      : []),
  ];

  const growthOpportunities = [
    ...shouldScale.slice(0, 3).map((s) => `Scale ${s.name}: ${s.reason}`),
    ...trending
      .filter((t) => t.viralScore >= 50)
      .slice(0, 2)
      .map((t) => `Trending ${t.name} (score ${t.viralScore}) — prepare ad budget.`),
  ];

  return {
    date: brain.date,
    generatedAt: Date.now(),
    madeMoneyToday,
    lostMoneyToday,
    trending,
    shouldStop,
    shouldScale,
    revenuePrediction: {
      next7Days: aiInsights?.predictedRevenueNext7Days ?? todayEstimate * 7,
      todayEstimate,
      confidence: analytics && signals.length ? "medium" : "low",
    },
    riskAlerts,
    growthOpportunities,
    topActions: brain.topActions,
    source: brain.source,
  };
}
