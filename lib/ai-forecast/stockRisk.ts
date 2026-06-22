import { estimateDailyDemand, buildProductSignals } from "./signals";
import type { StockRiskAssessment, StockRiskLevel } from "./types";

function resolveRisk(
  currentStock: number,
  dailyDemand: number
): { risk: StockRiskLevel; daysUntilStockout: number | null; priority: number } {
  if (dailyDemand <= 0) {
    return { risk: "low", daysUntilStockout: null, priority: 0 };
  }

  const daysUntilStockout = Number((currentStock / dailyDemand).toFixed(1));

  if (currentStock <= 0 || daysUntilStockout <= 5) {
    return { risk: "high", daysUntilStockout, priority: 100 - daysUntilStockout };
  }

  if (daysUntilStockout <= 14) {
    return { risk: "medium", daysUntilStockout, priority: 70 - daysUntilStockout };
  }

  return { risk: "low", daysUntilStockout, priority: Math.max(0, 20 - daysUntilStockout) };
}

export async function assessStockRisk(
  signalsInput?: Awaited<ReturnType<typeof buildProductSignals>>
): Promise<StockRiskAssessment[]> {
  const signals = signalsInput ?? (await buildProductSignals());
  return signals
    .map((signal) => {
      const dailyDemand = estimateDailyDemand(signal);
      const { risk, daysUntilStockout, priority } = resolveRisk(
        signal.currentStock,
        dailyDemand
      );

      return {
        productId: signal.productId,
        productName: signal.productName,
        risk,
        currentStock: signal.currentStock,
        dailyDemand: Number(dailyDemand.toFixed(2)),
        daysUntilStockout,
        restockPriority: Number((priority + dailyDemand * 10).toFixed(2)),
      };
    })
    .sort((a, b) => b.restockPriority - a.restockPriority);
}

export async function getRestockRecommendations(
  risksInput?: Awaited<ReturnType<typeof assessStockRisk>>
) {
  const risks = risksInput ?? (await assessStockRisk());
  return risks
    .filter((item) => item.risk !== "low")
    .slice(0, 12)
    .map((item) => {
      const projectedDemand30d = Number((item.dailyDemand * 30).toFixed(0));
      const buffer = item.risk === "high" ? 1.35 : 1.2;
      const suggestedRestockQty = Math.max(
        1,
        Math.ceil(projectedDemand30d * buffer - item.currentStock)
      );

      return {
        productId: item.productId,
        productName: item.productName,
        risk: item.risk,
        suggestedRestockQty,
        projectedDemand30d,
        reason:
          item.risk === "high"
            ? `Stock may run out in ~${item.daysUntilStockout ?? 0} days at current demand.`
            : `Demand is steady and inventory is trending low (${item.daysUntilStockout ?? "?"} days left).`,
      };
    });
}
