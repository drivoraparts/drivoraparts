"use client";

import Link from "next/link";
import type { CatalogProductCardData } from "@/components/catalog/CatalogProductCard";
import { BASE_CURRENCY } from "@/lib/currency/constants";
import { formatMoney } from "@/lib/currency/format";
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
      className="overflow-hidden rounded-xl border border-neutral-300 bg-white shadow-sm"
    >
      <Link
        href={href}
        prefetch={false}
        className="touch-manipulation block p-4 transition-colors hover:bg-neutral-50 active:bg-red-50"
        onClick={() =>
          saveListScrollOnProductClick(
            LIST_SCROLL_KEYS.homeFeatured,
            product.id
          )
        }
      >
        <div className="relative">
          {isProductOnSale(product.price, product.compareAtPrice) ? (
            <div className="absolute left-1 top-1 z-10">
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
        <p className="mt-1 text-sm font-semibold text-red-600">
          {formatMoney(product.price, BASE_CURRENCY)}
        </p>
      </Link>
    </article>
  );
}
