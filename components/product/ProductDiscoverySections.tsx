"use client";

import { useEffect, useMemo, useState } from "react";
import AllProductsGridCard from "@/components/catalog/AllProductsGridCard";
import type { CatalogProductCardData } from "@/components/catalog/CatalogProductCard";
import {
  pushRecentlyViewed,
  type RecentlyViewedProduct,
} from "@/lib/recently-viewed";

type ProductDiscoverySectionsProps = {
  currentProductId: number;
  currentProduct: RecentlyViewedProduct;
  relatedProducts: CatalogProductCardData[];
};

function ProductScrollRow({
  title,
  products,
}: {
  title: string;
  products: CatalogProductCardData[];
}) {
  if (products.length === 0) return null;

  return (
    <section className="border-t border-neutral-300 bg-[var(--background)] px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-[1200px] min-w-0">
        <h2 className="mb-4 text-[11px] font-bold uppercase tracking-[0.16em] text-neutral-600">
          {title}
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:flex sm:max-w-full sm:gap-3 sm:overflow-x-auto sm:overscroll-x-contain sm:pb-1 sm:[scrollbar-width:thin]">
          {products.map((product) => (
            <div
              key={product.id}
              className="w-full sm:w-[148px] sm:shrink-0 md:w-[168px]"
            >
              <AllProductsGridCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function ProductDiscoverySections({
  currentProductId,
  currentProduct,
  relatedProducts,
}: ProductDiscoverySectionsProps) {
  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedProduct[]>([]);

  useEffect(() => {
    setRecentlyViewed(pushRecentlyViewed(currentProduct));
  }, [currentProductId, currentProduct]);

  const recentCards = useMemo(
    () =>
      recentlyViewed
        .filter((item) => item.id !== currentProductId)
        .slice(0, 8)
        .map(
          (item): CatalogProductCardData => ({
            id: item.id,
            name: item.name,
            price: item.price,
            compareAtPrice: item.compareAtPrice,
            thumbnail: item.thumbnail,
            category: item.category,
            brand: item.brand,
          })
        ),
    [recentlyViewed, currentProductId]
  );

  const relatedCards = useMemo(
    () =>
      relatedProducts
        .filter((product) => product.id !== currentProductId)
        .slice(0, 8),
    [relatedProducts, currentProductId]
  );

  return (
    <>
      <ProductScrollRow title="Related Products" products={relatedCards} />
      <ProductScrollRow title="Recently Viewed" products={recentCards} />
    </>
  );
}
