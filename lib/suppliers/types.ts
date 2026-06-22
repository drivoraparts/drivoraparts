export type Supplier = {
  id: string;
  name: string;
  categories: string[];
  regions: string[];
  leadTimeDays: number;
  reliabilityScore: number;
  specialties: string[];
};

export type SupplierRecommendation = {
  productId: number;
  productName: string;
  suggestedQty: number;
  risk: string;
  supplier: Supplier;
  matchScore: number;
  reason: string;
};

export type SupplierReport = {
  generatedAt: number;
  recommendations: SupplierRecommendation[];
  topSuppliers: Array<Supplier & { matchCount: number }>;
};
