export type AnalyticsEventName =
  | "product_view"
  | "add_to_cart"
  | "checkout_start"
  | "order_completed";

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
