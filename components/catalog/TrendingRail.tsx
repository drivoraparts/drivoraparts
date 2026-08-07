import ProductRail from "./ProductRail";
import { getTrendingProducts } from "@/lib/catalog/trending";

export default async function TrendingRail() {
  const products = await getTrendingProducts();

  return (
    <ProductRail
      eyebrow="Trending This Week"
      title="What other shoppers are viewing"
      products={products}
      tone="muted"
    />
  );
}
