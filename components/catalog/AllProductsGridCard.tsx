"use client";

import Link from "next/link";
import AddToCartButton, {
  type AddToCartProduct,
} from "@/app/components/AddToCartButton";
import ProductPrice from "@/components/currency/ProductPrice";
import TranslatedText from "@/components/i18n/TranslatedText";
import ProductImage from "@/components/media/ProductImage";
import { getProductThumbnail } from "@/lib/inventory/media";
import { routes } from "@/lib/inventory/routes";
import type { CatalogProductCardData } from "./CatalogProductCard";

export const CATALOG_ALL_STATE_KEY = "drivora:catalog-all";

export type CatalogAllSavedState = {
  scrollY: number;
  page: number;
  query: string;
  categoryFilter: string;
  brandFilter: string;
  priceFilter: string;
  productId: number;
};

export function saveCatalogAllState(state: CatalogAllSavedState) {
  try {
    sessionStorage.setItem(CATALOG_ALL_STATE_KEY, JSON.stringify(state));
  } catch {
    /* ignore quota / private mode */
  }
}

export default function AllProductsGridCard({
  product,
  priority = false,
  onNavigate,
}: {
  product: CatalogProductCardData;
  priority?: boolean;
  onNavigate?: (productId: number) => void;
}) {
  const thumbnail = getProductThumbnail(product);
  const cartProduct: AddToCartProduct = {
    id: product.id,
    name: product.name,
    price: product.price,
    image: thumbnail,
    category: product.category,
    brand: product.brand,
  };

  const productHref = routes.product(product.id);

  return (
    <article
      id={`catalog-product-${product.id}`}
      className="relative flex min-w-0 flex-col overflow-hidden rounded-lg border border-neutral-300 bg-white shadow-sm"
    >
      <Link
        href={productHref}
        className="absolute inset-0 z-10 rounded-lg"
        aria-label={`View ${product.name}`}
        onClick={() => onNavigate?.(product.id)}
      />

      <div className="p-1.5 pb-1">
        <div className="aspect-square w-full overflow-hidden rounded-md border border-neutral-200 bg-neutral-50">
          <ProductImage
            src={thumbnail}
            alt={product.name}
            profile="grid"
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : undefined}
            className="h-full w-full object-cover"
          />
        </div>
        <h3 className="mt-1 line-clamp-2 text-[10px] font-semibold leading-snug text-neutral-900 sm:text-[11px]">
          <TranslatedText as="span">{product.name}</TranslatedText>
        </h3>
        <ProductPrice
          price={product.price}
          compareAtPrice={product.compareAtPrice}
          size="sm"
          className="mt-0.5"
        />
      </div>

      <div className="relative z-20 mt-auto px-1.5 pb-1.5 pt-0.5 [&_button]:py-1.5 [&_button]:text-[10px] sm:[&_button]:py-2 sm:[&_button]:text-xs">
        <AddToCartButton product={cartProduct} compact />
      </div>
    </article>
  );
}
