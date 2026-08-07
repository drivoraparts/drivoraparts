"use client";

import Link from "next/link";
import AddToCartButton, {
  type AddToCartProduct,
} from "@/app/components/AddToCartButton";
import ProductPrice from "@/components/currency/ProductPrice";
import TranslatedText from "@/components/i18n/TranslatedText";
import ProductImage from "@/components/media/ProductImage";
import {
  LIST_SCROLL_KEYS,
  catalogProductAnchorId,
  currentReturnPath,
  saveListScrollState,
  type ListScrollState,
} from "@/lib/catalog/list-scroll-restore";
import { getProductThumbnail } from "@/lib/inventory/media";
import { routes } from "@/lib/inventory/routes";
import type { CatalogProductCardData } from "./CatalogProductCard";
import WishlistButton from "@/components/wishlist/WishlistButton";
import CompareButton from "@/components/compare/CompareButton";
import QuickViewModal from "./QuickViewModal";

export type CatalogAllSavedState = Omit<
  ListScrollState,
  "returnPath" | "listKey"
> & {
  page: number;
  query: string;
  categoryFilter: string;
  brandFilter: string;
  priceFilter: string;
  sortFilter: string;
};

export function saveCatalogAllState(state: CatalogAllSavedState) {
  saveListScrollState(LIST_SCROLL_KEYS.catalogAll, {
    ...state,
    listKey: LIST_SCROLL_KEYS.catalogAll,
    returnPath: currentReturnPath(),
  });
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
      id={catalogProductAnchorId(product.id)}
      className="group relative flex min-w-0 flex-col overflow-hidden rounded-lg border border-neutral-200/80 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-red-200 hover:shadow-lg"
    >
      <Link
        href={productHref}
        className="absolute inset-0 z-10 rounded-lg"
        aria-label={`View ${product.name}`}
        onClick={() => onNavigate?.(product.id)}
      />

      <div className="p-1.5 pb-1">
        <div className="relative aspect-square w-full overflow-hidden rounded-md border border-neutral-200 bg-neutral-50">
          {product.isNew ? (
            <span className="absolute left-1 top-1 z-20 rounded-full bg-red-600 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide text-white sm:text-[9px]">
              New
            </span>
          ) : null}
          <div className="absolute right-1 top-1 z-20">
            <WishlistButton
              product={{
                id: product.id,
                name: product.name,
                price: product.price,
                compareAtPrice: product.compareAtPrice,
                thumbnail,
                category: product.category,
                brand: product.brand,
              }}
              size="sm"
            />
          </div>
          <div className="absolute inset-x-1 bottom-1 z-20 hidden gap-1 opacity-0 transition-opacity group-hover:opacity-100 sm:flex">
            <CompareButton
              product={{
                id: product.id,
                name: product.name,
                price: product.price,
                thumbnail,
                category: product.category,
                brand: product.brand,
              }}
              className="flex-1 justify-center !bg-white"
            />
            <QuickViewModal productId={product.id} triggerClassName="flex-1 justify-center" />
          </div>
          <ProductImage
            src={thumbnail}
            alt={product.name}
            profile="grid"
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : undefined}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
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
