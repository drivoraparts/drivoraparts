import { getProductById } from "@/lib/inventory";
import { collectProductSignals } from "./product-metrics";
import { safeQuery } from "@/lib/db/safe-query";

export type SimulationScenario =
  | { type: "price_increase"; productId: number; percent?: number }
  | { type: "tiktok_campaign"; productId: number; budgetTier?: "low" | "medium" | "high" }
  | { type: "restock"; productId: number; quantity?: number };

export type SimulationResult = {
  scenario: string;
  productId: number;
  productName: string;
  projectedRevenueChange: number;
  projectedRevenueChangePercent: number;
  projectedConversionChange: number;
  riskLevel: "low" | "medium" | "high";
  summary: string;
  assumptions: string[];
};

const BUDGET_MULTIPLIER = { low: 1.08, medium: 1.15, high: 1.22 };

export async function simulateBusinessScenario(
  input: SimulationScenario
): Promise<SimulationResult | null> {
  const product = getProductById(input.productId);
  if (!product) return null;

  const signals = await safeQuery(() => collectProductSignals(), [], "simulator-signals");
  const metrics = signals.find((s) => s.productId === input.productId) ?? {
    views: 0,
    cartAdds: 0,
    orders: 0,
    conversionRate: 0,
    cartRate: 0,
    checkouts: 0,
    demandVelocity: 0,
    productId: input.productId,
    name: product.name,
  };

  if (input.type === "price_increase") {
    const percent = input.percent ?? 10;
    const elasticity = metrics.conversionRate >= 3 ? 0.4 : 0.65;
    const conversionDelta = -Math.round(percent * elasticity * 10) / 10;
    const volumeRetention = Math.max(0.55, 1 - (percent / 100) * elasticity);
    const revenueDelta = Math.round(
      product.price * (percent / 100) * volumeRetention * Math.max(metrics.orders, 1)
    );
    const revenuePercent = Math.round((percent * volumeRetention - percent * elasticity) * 10) / 10;

    return {
      scenario: `Increase price by ${percent}%`,
      productId: product.id,
      productName: product.name,
      projectedRevenueChange: revenueDelta,
      projectedRevenueChangePercent: revenuePercent,
      projectedConversionChange: conversionDelta,
      riskLevel: percent >= 12 && metrics.conversionRate < 2 ? "high" : "medium",
      summary: `A ${percent}% price lift on ${product.name} projects ${revenuePercent >= 0 ? "+" : ""}${revenuePercent}% revenue with ${conversionDelta}% conversion shift.`,
      assumptions: [
        "Elasticity model based on current conversion rate.",
        "Margin floor remains protected.",
        "No competitor price reaction modeled.",
      ],
    };
  }

  if (input.type === "tiktok_campaign") {
    const tier = input.budgetTier ?? "medium";
    const multiplier = BUDGET_MULTIPLIER[tier];
    const baseOrders = Math.max(metrics.orders, metrics.cartAdds * 0.2, 1);
    const projectedOrders = baseOrders * multiplier;
    const revenueDelta = Math.round((projectedOrders - baseOrders) * product.price);
    const conversionDelta = Math.round((multiplier - 1) * metrics.conversionRate * 10) / 10;

    return {
      scenario: `Run TikTok ad campaign (${tier} budget)`,
      productId: product.id,
      productName: product.name,
      projectedRevenueChange: revenueDelta,
      projectedRevenueChangePercent: Math.round((multiplier - 1) * 1000) / 10,
      projectedConversionChange: conversionDelta,
      riskLevel: metrics.views < 5 ? "medium" : "low",
      summary: `TikTok campaign on ${product.name} could add ~${formatMoney(revenueDelta)} if creative matches viral demand signals.`,
      assumptions: [
        "Uses current cart rate and demand velocity as baseline.",
        "Assumes ad creative uses autopilot hooks.",
        "Does not include ad spend ROI payback period.",
      ],
    };
  }

  if (input.type === "restock") {
    const qty = input.quantity ?? Math.max(5, Math.round(metrics.cartAdds * 1.5));
    const captureRate = Math.min(0.7, 0.25 + metrics.conversionRate / 100);
    const projectedSales = Math.round(qty * captureRate);
    const revenueDelta = projectedSales * product.price;
    const conversionDelta = metrics.views > 0 ? Math.round(captureRate * 5) : 2;

    return {
      scenario: `Restock ${qty} units`,
      productId: product.id,
      productName: product.name,
      projectedRevenueChange: revenueDelta,
      projectedRevenueChangePercent: Math.round(captureRate * 100),
      projectedConversionChange: conversionDelta,
      riskLevel: qty > 20 && metrics.demandVelocity < 10 ? "high" : "low",
      summary: `Restocking ${qty} units of ${product.name} could recover ~${formatMoney(revenueDelta)} if demand continues.`,
      assumptions: [
        `${Math.round(captureRate * 100)}% sell-through assumed within 14 days.`,
        "Supplier lead time not deducted from revenue window.",
        "Stockout lost sales included in upside estimate.",
      ],
    };
  }

  return null;
}

export async function runSimulationBatch(
  scenarios: SimulationScenario[]
): Promise<SimulationResult[]> {
  const results: SimulationResult[] = [];
  for (const scenario of scenarios) {
    const result = await simulateBusinessScenario(scenario);
    if (result) results.push(result);
  }
  return results;
}

function formatMoney(value: number): string {
  return `$${value.toLocaleString()}`;
}
