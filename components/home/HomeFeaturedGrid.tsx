"use client";

import CatalogProductCard, {
  type CatalogProductCardData,
} from "@/components/catalog/CatalogProductCard";

export default function HomeFeaturedGrid({
  products,
}: {
  products: CatalogProductCardData[];
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
      {products.map((product) => (
        <CatalogProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
