"use client";

import Link from "next/link";
import AddToCartButton from "@/app/components/AddToCartButton";
import type { CatalogProductCardData } from "@/components/catalog/CatalogProductCard";
import ProductPrice from "@/components/currency/ProductPrice";
import {
  LIST_SCROLL_KEYS,
  catalogProductAnchorId,
  saveListScrollOnProductClick,
} from "@/lib/catalog/list-scroll-restore";
import { routes } from "@/lib/inventory";
import { directAssetUrl } from "@/lib/media/optimize-image";
import SaleBadge, { isProductOnSale } from "@/components/product/SaleBadge";

export default function HomeFeaturedCard({
  product,
}: {
  product: CatalogProductCardData;
}) {
  const href = routes.product(product.id);
  const imageSrc = directAssetUrl(product.thumbnail);

  return (
    <article
      id={catalogProductAnchorId(product.id)}
      className="group relative overflow-hidden rounded-xl border border-neutral-300 bg-white shadow-sm transition-colors hover:bg-neutral-50"
    >
      {/* Full-tile link underneath, cart button stacked above it — the same
          arrangement CatalogProductCard uses, so adding the button doesn't
          nest interactive elements or shrink the tap target. */}
      <Link
        href={href}
        prefetch={false}
        className="touch-manipulation absolute inset-0 z-10 rounded-xl active:bg-red-50/40"
        aria-label={`View ${product.name}`}
        onClick={() =>
          saveListScrollOnProductClick(
            LIST_SCROLL_KEYS.homeFeatured,
            product.id
          )
        }
      />

      <div className="relative p-4">
        <div className="relative">
          {isProductOnSale(product.price, product.compareAtPrice) ? (
            <div className="absolute left-1 top-1 z-20">
              <SaleBadge />
            </div>
          ) : null}
          <img
            src={imageSrc}
            alt={product.name}
            width={320}
            height={320}
            loading="lazy"
            decoding="async"
            className="aspect-square w-full rounded-lg bg-neutral-100 object-cover"
          />
        </div>
        <h3 className="mt-3 line-clamp-2 font-semibold text-neutral-900">
          {product.name}
        </h3>
        {/* ProductPrice, not formatMoney(BASE_CURRENCY): these tiles were the
            one place still hard-coded to USD, so a visitor being shown AUD
            everywhere else saw dollars here. */}
        <ProductPrice
          price={product.price}
          compareAtPrice={product.compareAtPrice}
          size="md"
          className="mt-1"
        />
      </div>

      <div className="relative z-20 px-4 pb-4">
        <AddToCartButton
          product={{
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.thumbnail,
            category: product.category,
            brand: product.brand,
          }}
          compact
        />
      </div>
    </article>
  );
}
