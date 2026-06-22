import { getRestockRecommendations } from "@/lib/ai-forecast";
import { getProductById } from "@/lib/inventory";
import { getSuppliers } from "./catalog";
import type { Supplier, SupplierRecommendation, SupplierReport } from "./types";

function scoreSupplier(
  supplier: Supplier,
  category: string,
  platform?: string,
  brand?: string
): number {
  let score = supplier.reliabilityScore;

  if (supplier.categories.includes(category)) score += 12;

  const hints = [platform, brand, category].filter(Boolean).join(" ").toLowerCase();

  for (const specialty of supplier.specialties) {
    if (hints.includes(specialty)) score += 8;
  }

  score -= supplier.leadTimeDays * 0.5;
  return Number(score.toFixed(2));
}

export async function getSupplierRecommendations(): Promise<SupplierReport> {
  const restockItems = await getRestockRecommendations();
  const recommendations: SupplierRecommendation[] = [];

  for (const item of restockItems) {
    const product = getProductById(item.productId);
    if (!product) continue;

    const ranked = getSuppliers()
      .map((supplier) => ({
        supplier,
        matchScore: scoreSupplier(
          supplier,
          product.category,
          product.platform,
          product.brand
        ),
      }))
      .sort((a, b) => b.matchScore - a.matchScore);

    const best = ranked[0];
    if (!best) continue;

    recommendations.push({
      productId: item.productId,
      productName: item.productName,
      suggestedQty: item.suggestedRestockQty,
      risk: item.risk,
      supplier: best.supplier,
      matchScore: best.matchScore,
      reason: `${item.reason} Best match: ${best.supplier.name}.`,
    });
  }

  const supplierCounts = new Map<string, number>();
  for (const rec of recommendations) {
    supplierCounts.set(
      rec.supplier.id,
      (supplierCounts.get(rec.supplier.id) ?? 0) + 1
    );
  }

  const topSuppliers = getSuppliers()
    .map((supplier) => ({
      ...supplier,
      matchCount: supplierCounts.get(supplier.id) ?? 0,
    }))
    .sort(
      (a, b) =>
        b.matchCount - a.matchCount || b.reliabilityScore - a.reliabilityScore
    );

  return {
    generatedAt: Date.now(),
    recommendations,
    topSuppliers,
  };
}
