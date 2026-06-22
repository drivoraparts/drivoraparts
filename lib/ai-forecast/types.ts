export type DemandTrend = "rising" | "stable" | "falling";

export type StockRiskLevel = "low" | "medium" | "high";

export type ProductSignal = {
  productId: number;
  productName: string;
  category: string;
  platform?: string;
  price: number;
  currentStock: number;
  views7d: number;
  viewsPrev7d: number;
  cartAdds7d: number;
  cartAddsPrev7d: number;
  unitsSold7d: number;
  unitsSold30d: number;
  revenue30d: number;
};

export type SalesForecast = {
  productId: number;
  productName: string;
  forecast7d: number;
  forecast14d: number;
  forecast30d: number;
  projectedRevenue30d: number;
  confidence: number;
};

export type DemandPrediction = {
  productId: number;
  productName: string;
  trend: DemandTrend;
  momentum: number;
  demandScore: number;
};

export type StockRiskAssessment = {
  productId: number;
  productName: string;
  risk: StockRiskLevel;
  currentStock: number;
  dailyDemand: number;
  daysUntilStockout: number | null;
  restockPriority: number;
};

export type TrendingEngine = {
  platform: string;
  platformLabel: string;
  momentum: number;
  views7d: number;
  cartAdds7d: number;
  unitsSold7d: number;
  topProductId: number;
  topProductName: string;
};

export type RestockRecommendation = {
  productId: number;
  productName: string;
  risk: StockRiskLevel;
  suggestedRestockQty: number;
  projectedDemand30d: number;
  reason: string;
};

export type ForecastReport = {
  generatedAt: number;
  salesForecasts: SalesForecast[];
  demandPredictions: DemandPrediction[];
  stockRisks: StockRiskAssessment[];
  restockRecommendations: RestockRecommendation[];
  trendingEngines: TrendingEngine[];
};
