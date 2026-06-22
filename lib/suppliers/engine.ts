import { getInventoryAlerts } from "@/lib/db/inventory";
import { safeQuery } from "@/lib/db/safe-query";
import { listAnalyticsEvents } from "@/lib/db/analytics";
import { getProductById } from "@/lib/inventory";
import { getSuppliers } from "./catalog";
import type { Supplier } from "./types";
import { estimateUnitCost } from "@/lib/ai/product-metrics";

export type RankedSupplierOption = {
  supplier: {
    id: string;
    name: string;
    leadTimeDays: number;
    reliabilityScore: number;
  };
  matchScore: number;
  unitCostEstimate: number;
  estimatedMargin: number;
  deliveryScore: number;
  priceScore: number;
  rank: number;
};

export type SupplierEngineRecommendation = {
  productId: number;
  productName: string;
  urgencyScore: number;
  restockRecommendation: string;
  estimatedProfitImpact: number;
  suggestedQty: number;
  demandVelocity: number;
  recommendedSupplier: {
    id: string;
    name: string;
    unitCostEstimate: number;
    leadTimeDays: number;
  };
  rankedSuppliers: RankedSupplierOption[];
};

export type SupplierEngineReport = {
  generatedAt: number;
  recommendations: SupplierEngineRecommendation[];
  source: "live" | "fallback";
};

function rankSuppliersForProduct(
  product: { category: string; platform?: string; brand?: string; price: number },
  urgencyScore: number
): RankedSupplierOption[] {
  const hints = [product.platform, product.brand, product.category]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const retail = product.price;
  const minCost = estimateUnitCost(retail, 0.25);

  return getSuppliers()
    .map((supplier) => {
      let matchScore = supplier.reliabilityScore;

      if (supplier.categories.includes(product.category)) matchScore += 12;

      for (const specialty of supplier.specialties) {
        if (hints.includes(specialty)) matchScore += 8;
      }

      const deliveryScore = Math.max(0, 100 - supplier.leadTimeDays * 6);
      const unitCostEstimate = Math.round(minCost * (0.92 + supplier.leadTimeDays * 0.008));
      const priceScore = Math.max(0, 100 - ((unitCostEstimate - minCost) / Math.max(minCost, 1)) * 100);
      const estimatedMargin = retail - unitCostEstimate;

      const composite =
        matchScore * 0.35 +
        deliveryScore * 0.2 +
        priceScore * 0.2 +
        Math.min(urgencyScore, 100) * 0.15 +
        Math.min(estimatedMargin / 50, 20);

      return {
        supplier: {
          id: supplier.id,
          name: supplier.name,
          leadTimeDays: supplier.leadTimeDays,
          reliabilityScore: supplier.reliabilityScore,
        },
        matchScore: Number(composite.toFixed(2)),
        unitCostEstimate,
        estimatedMargin,
        deliveryScore: Math.round(deliveryScore),
        priceScore: Math.round(priceScore),
        rank: 0,
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore)
    .map((entry, index) => ({ ...entry, rank: index + 1 }))
    .slice(0, 4);
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
    const suggestedQty = Math.max(
      3,
      Math.round(velocity / 2) + (alert.severity === "out" ? 8 : 4)
    );

    const rankedSuppliers = rankSuppliersForProduct(product, urgencyScore);
    const best = rankedSuppliers[0];

    const marginPerUnit = best ? best.estimatedMargin : product.price * 0.25;
    const estimatedProfitImpact = Math.round(marginPerUnit * suggestedQty);

    recommendations.push({
      productId: alert.productId,
      productName: alert.productName,
      urgencyScore,
      restockRecommendation:
        alert.severity === "out"
          ? `Restock immediately — ${suggestedQty} units via ${best?.supplier.name ?? "primary supplier"}.`
          : `Reorder ${suggestedQty} units before stockout (${alert.quantity} remaining).`,
      estimatedProfitImpact,
      suggestedQty,
      demandVelocity: velocity,
      recommendedSupplier: {
        id: best?.supplier.id ?? "unknown",
        name: best?.supplier.name ?? "Generic Parts Wholesale",
        unitCostEstimate: best?.unitCostEstimate ?? estimateUnitCost(product.price),
        leadTimeDays: best?.supplier.leadTimeDays ?? 7,
      },
      rankedSuppliers,
    });
  }

  recommendations.sort((a, b) => b.urgencyScore - a.urgencyScore);

  return {
    generatedAt: Date.now(),
    recommendations,
    source: recommendations.length ? "live" : "fallback",
  };
}
