import {
  buildProductSignals,
  computeConfidence,
  estimateDailyDemand,
} from "./signals";
import type { SalesForecast } from "./types";

export function forecastSales(signals = buildProductSignals()): SalesForecast[] {
  return signals
    .map((signal) => {
      const dailyDemand = estimateDailyDemand(signal);

      return {
        productId: signal.productId,
        productName: signal.productName,
        forecast7d: Number((dailyDemand * 7).toFixed(2)),
        forecast14d: Number((dailyDemand * 14).toFixed(2)),
        forecast30d: Number((dailyDemand * 30).toFixed(2)),
        projectedRevenue30d: Number((dailyDemand * 30 * signal.price).toFixed(2)),
        confidence: computeConfidence(signal),
      };
    })
    .sort((a, b) => b.projectedRevenue30d - a.projectedRevenue30d);
}
