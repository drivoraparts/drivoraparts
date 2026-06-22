import { getProductById } from "@/lib/inventory";
import {
  collectProductSignals,
  estimateUnitCost,
  minAllowedPrice,
} from "./product-metrics";

export type PricingRecommendation = {
  productId: number;
  productName: string;
  currentPrice: number;
  suggestedPrice: number;
  direction: "increase" | "decrease" | "hold";
  marginProtected: boolean;
  estimatedMargin: number;
  reason: string;
  expectedImpact: string;
};

export type PricingReport = {
  generatedAt: number;
  recommendations: PricingRecommendation[];
  marginFloorPercent: number;
  source: "live" | "fallback";
};

const MARGIN_FLOOR = 0.25;

export async function getPricingRecommendations(): Promise<PricingReport> {
  const signals = await collectProductSignals();
  const recommendations: PricingRecommendation[] = [];

  for (const row of signals) {
    const product = getProductById(row.productId);
    if (!product) continue;

    const cost = estimateUnitCost(product.price, MARGIN_FLOOR);
    const minPrice = minAllowedPrice(product.price, MARGIN_FLOOR);
    const currentMargin =
      product.price > 0
        ? Math.round(((product.price - cost) / product.price) * 1000) / 10
        : 0;

    let direction: PricingRecommendation["direction"] = "hold";
    let suggestedPrice = product.price;
    let reason = "Performance stable — maintain current price.";
    let expectedImpact = "Neutral margin impact";

    if (row.demandVelocity >= 20 && row.conversionRate >= 2) {
      suggestedPrice = Math.round(product.price * 1.08);
      direction = "increase";
      reason = "High demand with strong conversion — capture margin upside.";
      expectedImpact = "+5–10% margin per unit";
    } else if (row.views >= 10 && row.conversionRate < 1.5 && row.cartAdds >= 3) {
      suggestedPrice = Math.max(minPrice, Math.round(product.price * 0.92));
      direction = "decrease";
      reason = "High interest but weak conversion — test price elasticity.";
      expectedImpact = "+8–15% conversion lift estimate";
    } else if (row.views <= 2 && row.cartAdds === 0) {
      suggestedPrice = Math.max(minPrice, Math.round(product.price * 0.95));
      direction = "decrease";
      reason = "Low visibility — promotional pricing may unlock demand.";
      expectedImpact = "Demand activation";
    }

    if (suggestedPrice < minPrice) {
      suggestedPrice = minPrice;
    }

    const marginProtected = suggestedPrice >= minPrice;
    const estimatedMargin =
      suggestedPrice > 0
        ? Math.round(((suggestedPrice - cost) / suggestedPrice) * 1000) / 10
        : currentMargin;

    recommendations.push({
      productId: row.productId,
      productName: row.name,
      currentPrice: product.price,
      suggestedPrice,
      direction,
      marginProtected,
      estimatedMargin,
      reason,
      expectedImpact,
    });
  }

  return {
    generatedAt: Date.now(),
    recommendations: recommendations
      .filter((r) => r.direction !== "hold" || r.productId <= 5)
      .sort((a, b) => {
        const priority = { increase: 3, decrease: 2, hold: 1 };
        return priority[b.direction] - priority[a.direction];
      })
      .slice(0, 15),
    marginFloorPercent: MARGIN_FLOOR * 100,
    source: recommendations.length ? "live" : "fallback",
  };
}
