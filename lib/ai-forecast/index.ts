import { buildProductSignals } from "./signals";
import { forecastSales } from "./forecastSales";
import { predictDemand } from "./predictDemand";
import { assessStockRisk, getRestockRecommendations } from "./stockRisk";
import { getTrendingEngines } from "./trendingProducts";
import type { ForecastReport } from "./types";

export async function getForecastReport(): Promise<ForecastReport> {
  const signals = await buildProductSignals();
  const stockRisks = await assessStockRisk(signals);

  return {
    generatedAt: Date.now(),
    salesForecasts: await forecastSales(signals),
    demandPredictions: await predictDemand(signals),
    stockRisks,
    restockRecommendations: await getRestockRecommendations(stockRisks),
    trendingEngines: await getTrendingEngines(signals),
  };
}

export { forecastSales } from "./forecastSales";
export { predictDemand } from "./predictDemand";
export { assessStockRisk, getRestockRecommendations } from "./stockRisk";
export { getTrendingEngines } from "./trendingProducts";
export { buildProductSignals } from "./signals";
export type {
  DemandPrediction,
  DemandTrend,
  ForecastReport,
  RestockRecommendation,
  SalesForecast,
  StockRiskAssessment,
  StockRiskLevel,
  TrendingEngine,
} from "./types";
