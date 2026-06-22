import { getInventoryAlerts } from "@/lib/db/inventory";
import { safeQuery } from "@/lib/db/safe-query";
import { listAnalyticsEvents } from "@/lib/db/analytics";
import { getProductById } from "@/lib/inventory";
import { getSuppliers } from "./catalog";
import type { Supplier } from "./types";

export type SupplierEngineRecommendation = {
  productId: number;
  productName: string;
  urgencyScore: number;
  restockRecommendation: string;
  estimatedProfitImpact: number;
  suggestedQty: number;
  recommendedSupplier: {
    id: string;
    name: string;
    unitCostEstimate: number;
    leadTimeDays: number;
  };
  demandVelocity: number;
};

export type SupplierEngineReport = {
  generatedAt: number;
  recommendations: SupplierEngineRecommendation[];
  source: "live" | "fallback";
};

function pickBestSupplier(
  category: string,
  platform?: string,
  brand?: string
): Supplier | null {
  const hints = [platform, brand, category].filter(Boolean).join(" ").toLowerCase();

  const ranked = getSuppliers()
    .map((supplier) => {
      let score = supplier.reliabilityScore;
      if (supplier.categories.includes(category)) score += 12;
      for (const specialty of supplier.specialties) {
        if (hints.includes(specialty)) score += 8;
      }
      score -= supplier.leadTimeDays * 0.4;
      return { supplier, score };
    })
    .sort((a, b) => b.score - a.score);

  return ranked[0]?.supplier ?? null;
}

function estimateUnitCost(retailPrice: number): number {
  return Math.round(retailPrice * 0.58);
}

export async function getSupplierEngineRecommendations(): Promise<SupplierEngineReport> {
  const [alerts, events] = await Promise.all([
    safeQuery(() => getInventoryAlerts(), [], "supplier-engine-alerts"),
    safeQuery(() => listAnalyticsEvents(2500), [], "supplier-engine-events"),
  ]);

  const demand = new Map<number, number>();

  for (const event of events) {
    const productId = Number(event.payload?.productId);
    if (!productId) continue;
    const current = demand.get(productId) ?? 0;
    if (event.name === "product_view") demand.set(productId, current + 1);
    if (event.name === "add_to_cart") demand.set(productId, current + 4);
    if (event.name === "order_completed") demand.set(productId, current + 10);
  }

  const recommendations: SupplierEngineRecommendation[] = [];

  for (const alert of alerts) {
    const product = getProductById(alert.productId);
    if (!product) continue;

    const velocity = demand.get(alert.productId) ?? 0;
    const urgencyBase = alert.severity === "out" ? 85 : alert.severity === "low" ? 60 : 35;
    const urgencyScore = Math.min(100, Math.round(urgencyBase + velocity * 1.5));
    const suggestedQty = Math.max(3, Math.round(velocity / 2) + (alert.severity === "out" ? 8 : 4));
    const supplier = pickBestSupplier(
      product.category,
      product.platform,
      product.brand
    );

    const unitCost = estimateUnitCost(product.price);
    const marginPerUnit = product.price - unitCost;
    const estimatedProfitImpact = Math.round(marginPerUnit * suggestedQty);

    recommendations.push({
      productId: alert.productId,
      productName: alert.productName,
      urgencyScore,
      restockRecommendation:
        alert.severity === "out"
          ? `Restock immediately — ${suggestedQty} units via ${supplier?.name ?? "primary supplier"}.`
          : `Reorder ${suggestedQty} units before stockout (${alert.quantity} remaining).`,
      estimatedProfitImpact,
      suggestedQty,
      recommendedSupplier: {
        id: supplier?.id ?? "unknown",
        name: supplier?.name ?? "Generic Parts Wholesale",
        unitCostEstimate: unitCost,
        leadTimeDays: supplier?.leadTimeDays ?? 7,
      },
      demandVelocity: velocity,
    });
  }

  recommendations.sort((a, b) => b.urgencyScore - a.urgencyScore);

  return {
    generatedAt: Date.now(),
    recommendations,
    source: recommendations.length ? "live" : "fallback",
  };
}
