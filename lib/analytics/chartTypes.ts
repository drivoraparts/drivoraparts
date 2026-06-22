export type DailyRevenuePoint = {
  date: string;
  label: string;
  revenue: number;
};

export type DailyOrdersPoint = {
  date: string;
  label: string;
  orders: number;
};

export type DailyTrafficPoint = {
  date: string;
  label: string;
  views: number;
};

export type DailyConversionPoint = {
  date: string;
  label: string;
  rate: number;
};

export type TopProductChartPoint = {
  name: string;
  views: number;
  cartAdds: number;
  score: number;
};

export type DashboardChartData = {
  revenueOverTime: DailyRevenuePoint[];
  ordersPerDay: DailyOrdersPoint[];
  trafficOverTime: DailyTrafficPoint[];
  conversionOverTime: DailyConversionPoint[];
  topProducts: TopProductChartPoint[];
};
