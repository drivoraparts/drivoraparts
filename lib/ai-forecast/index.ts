import { forecastSales } from "./forecastSales";
import { predictDemand } from "./predictDemand";
import { assessStockRisk, getRestockRecommendations } from "./stockRisk";
import { getTrendingEngines } from "./trendingProducts";
import type { ForecastReport } from "./types";

export function getForecastReport(): ForecastReport {
  const stockRisks = assessStockRisk();

  return {
    generatedAt: Date.now(),
    salesForecasts: forecastSales(),
    demandPredictions: predictDemand(),
    stockRisks,
    restockRecommendations: getRestockRecommendations(stockRisks),
    trendingEngines: getTrendingEngines(),
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
