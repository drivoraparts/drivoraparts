import { getAnalyticsSummary } from "@/lib/analytics";
import { getAiInsightsReport } from "@/lib/insights/ai";
import { getRevenueOptimizationReport } from "@/lib/optimization/revenue";
import { getSupplierEngineRecommendations } from "@/lib/suppliers/engine";
import { safeQuery } from "@/lib/db/safe-query";
import { getInventoryAlerts } from "@/lib/db/inventory";
import { getProductById } from "@/lib/inventory";
import { persistAiDecisions } from "@/lib/db/ai-decisions";
import { detectViralProducts } from "./viral-detector";
import { getPricingRecommendations } from "./pricing";
import { collectProductSignals } from "./product-metrics";

export type ProductDecision = {
  productId: number;
  productName: string;
  action: string;
  confidence: number;
  expectedImpact: string;
};

export type DailyBusinessDecisions = {
  date: string;
  generatedAt: number;
  topActions: string[];
  productDecisions: ProductDecision[];
  source: "live" | "fallback";
};

const FALLBACK: DailyBusinessDecisions = {
  date: new Date().toISOString().slice(0, 10),
  generatedAt: Date.now(),
  topActions: [
    "collect more analytics data",
    "review inventory levels",
    "monitor checkout conversion",
  ],
  productDecisions: [],
  source: "fallback",
};

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function pushDecision(
  map: Map<number, ProductDecision>,
  decision: ProductDecision
) {
  const existing = map.get(decision.productId);
  if (!existing || decision.confidence > existing.confidence) {
    map.set(decision.productId, decision);
  }
}

export async function getDailyBusinessDecisions(): Promise<DailyBusinessDecisions> {
  try {
    return await buildDailyBusinessDecisions();
  } catch (error) {
    console.error("[getDailyBusinessDecisions]", error);
    return { ...FALLBACK, date: todayKey(), generatedAt: Date.now() };
  }
}

async function buildDailyBusinessDecisions(): Promise<DailyBusinessDecisions> {
  const [analytics, viral, pricing, suppliers, revenueOpt, aiInsights, alerts, signals] =
    await Promise.all([
      safeQuery(
        () => getAnalyticsSummary(),
        null,
        "decision-brain-analytics"
      ),
      safeQuery(() => detectViralProducts(10), null, "decision-brain-viral"),
      safeQuery(() => getPricingRecommendations(), null, "decision-brain-pricing"),
      safeQuery(() => getSupplierEngineRecommendations(), null, "decision-brain-suppliers"),
      safeQuery(() => getRevenueOptimizationReport(), null, "decision-brain-revenue"),
      safeQuery(() => getAiInsightsReport(), null, "decision-brain-ai"),
      safeQuery(() => getInventoryAlerts(), [], "decision-brain-alerts"),
      safeQuery(() => collectProductSignals(), [], "decision-brain-signals"),
    ]);

  if (!analytics && !signals.length) {
    return { ...FALLBACK, date: todayKey(), generatedAt: Date.now() };
  }

  const decisionMap = new Map<number, ProductDecision>();
  const topActionSet = new Set<string>();

  for (const product of viral?.products ?? []) {
    if (product.viralScore >= 55) {
      topActionSet.add("run ad campaign");
      pushDecision(decisionMap, {
        productId: product.productId,
        productName: product.name,
        action: "run ad campaign",
        confidence: Math.min(98, product.viralScore + 5),
        expectedImpact: `Viral score ${product.viralScore} — scale TikTok/Meta creative now.`,
      });
    }
  }

  for (const rec of pricing?.recommendations ?? []) {
    if (rec.direction === "increase") {
      topActionSet.add("increase price");
      pushDecision(decisionMap, {
        productId: rec.productId,
        productName: rec.productName,
        action: "increase price",
        confidence: rec.marginProtected ? 82 : 65,
        expectedImpact: rec.expectedImpact,
      });
    } else if (rec.direction === "decrease") {
      topActionSet.add("push discount");
      pushDecision(decisionMap, {
        productId: rec.productId,
        productName: rec.productName,
        action: "push discount",
        confidence: 74,
        expectedImpact: rec.expectedImpact,
      });
    }
  }

  for (const rec of suppliers?.recommendations ?? []) {
    if (rec.urgencyScore >= 50) {
      topActionSet.add("restock product");
      pushDecision(decisionMap, {
        productId: rec.productId,
        productName: rec.productName,
        action: "restock product",
        confidence: Math.min(95, rec.urgencyScore),
        expectedImpact: `Restock ${rec.suggestedQty} units — ${formatMoney(rec.estimatedProfitImpact)} profit potential.`,
      });
    }
  }

  for (const alert of alerts) {
    if (alert.severity === "out") {
      topActionSet.add("pause ads");
      pushDecision(decisionMap, {
        productId: alert.productId,
        productName: alert.productName,
        action: "stop selling",
        confidence: 96,
        expectedImpact: "Out of stock — pause traffic until replenished.",
      });
    }
  }

  for (const risk of revenueOpt?.riskAlerts ?? []) {
    if (risk.severity === "critical" || risk.severity === "high") {
      pushDecision(decisionMap, {
        productId: risk.productId,
        productName: risk.productName,
        action: "restock product",
        confidence: risk.severity === "critical" ? 93 : 78,
        expectedImpact: risk.message,
      });
    }
  }

  for (const row of signals.filter((s) => s.orders >= 1).slice(0, 4)) {
    pushDecision(decisionMap, {
      productId: row.productId,
      productName: row.name,
      action: "scale winning SKU",
      confidence: Math.min(90, 60 + row.conversionRate * 5),
      expectedImpact: `${row.orders} orders at ${row.conversionRate}% conversion — increase ad spend.`,
    });
  }

  if (analytics && analytics.conversionRate < 2 && analytics.cartAdds > 5) {
    topActionSet.add("push discount");
    topActionSet.add("fix checkout funnel");
  }

  if (aiInsights && analytics && aiInsights.predictedRevenueNext7Days > analytics.totalRevenue * 0.1) {
    topActionSet.add("run ad campaign");
  }

  const productDecisions = [...decisionMap.values()]
    .filter((d) => getProductById(d.productId) || d.productId === 0)
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 20);

  const topActions = [
    ...topActionSet,
    ...(productDecisions.some((d) => d.action === "increase price") ? [] : []),
  ].slice(0, 6);

  if (!topActions.length && productDecisions.length) {
    topActions.push(
      productDecisions[0].action,
      "monitor conversion",
      "review supplier lead times"
    );
  }

  const report: DailyBusinessDecisions = {
    date: todayKey(),
    generatedAt: Date.now(),
    topActions: topActions.length ? topActions : FALLBACK.topActions,
    productDecisions,
    source: signals.length || analytics ? "live" : "fallback",
  };

  await persistAiDecisions({ type: "daily_business_decisions", ...report });

  return report;
}

function formatMoney(value: number): string {
  return `$${value.toLocaleString()}`;
}
