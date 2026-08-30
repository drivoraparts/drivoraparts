export type AnalyticsEventName =
  | "product_view"
  | "add_to_cart"
  | "checkout_start"
  | "order_completed"
  // Search analytics. Observation only -- these are written after a search has
  // already returned and never participate in ranking.
  | "search"
  | "search_result_click";

export type AnalyticsEvent = {
  id: string;
  name: AnalyticsEventName;
  payload: Record<string, unknown>;
  createdAt: number;
};

export type ProductMetric = {
  productId: number;
  productName: string;
  count: number;
};

export type AnalyticsSummary = {
  totalRevenue: number;
  totalOrders: number;
  productViews: number;
  cartAdds: number;
  checkoutCount: number;
  conversionRate: number;
  topViewedProducts: ProductMetric[];
  topCartProducts: ProductMetric[];
  recentEvents: AnalyticsEvent[];
};
