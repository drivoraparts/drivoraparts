"use client";

import Link from "next/link";
import AddToCartButton, {
  type AddToCartProduct,
} from "@/app/components/AddToCartButton";
import ProductPrice from "@/components/currency/ProductPrice";
import TranslatedText from "@/components/i18n/TranslatedText";
import ProductImage from "@/components/media/ProductImage";
import { getProductDiscountLabel } from "@/lib/inventory/discounts";
import {
  catalogProductAnchorId,
  saveListScrollOnProductClick,
} from "@/lib/catalog/list-scroll-restore";
import { getProductThumbnail } from "@/lib/inventory/media";
import { routes } from "@/lib/inventory/routes";
import WishlistButton from "@/components/wishlist/WishlistButton";
import SaleBadge, { isProductOnSale } from "@/components/product/SaleBadge";

export type CatalogProductCardData = {
  id: number;
  name: string;
  price: number;
  compareAtPrice?: number;
  thumbnail: string;
  images?: string[];
  category: string;
  brand?: string;
  isNew?: boolean;
  /**
   * Supplied by the catalog query where the listing actually has them.
   * Coverage is uneven -- partNumber ~11%, fitment ~35%, condition and stock
   * ~99% -- so every consumer renders these conditionally rather than
   * reserving a row that would be empty on most cards.
   */
  brandName?: string;
  partNumber?: string;
  fitment?: string;
  condition?: string;
  inStock?: boolean;
};

export default function CatalogProductCard({
  product,
  scrollListKey,
}: {
  product: CatalogProductCardData;
  scrollListKey?: string;
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
      className="group relative overflow-hidden rounded-xl border border-neutral-200/80 bg-white shadow-sm transition-all duration-300 hover:border-accent-border hover:shadow-lg"
    >
      <Link
        href={productHref}
        // touch-manipulation drops the browser's ~300ms double-tap-to-zoom
        // wait on this target, which is what made a tap feel like it hadn't
        // registered. HomeFeaturedCard already had it; the catalog card,
        // which is most of the site's tiles, did not.
        className="touch-manipulation absolute inset-0 z-10 rounded-xl"
        aria-label={`View ${product.name}`}
        onClick={() => {
          if (scrollListKey) {
            saveListScrollOnProductClick(scrollListKey, product.id);
          }
        }}
      />

      <div className="pointer-events-none absolute inset-0 bg-accent/5 opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100" />

      <div className="relative p-4">
        <div className="relative h-40 w-full overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50">
          {isProductOnSale(product.price, product.compareAtPrice) ? (
            <div className="absolute left-1.5 top-1.5 z-20">
              <SaleBadge />
            </div>
          ) : null}
          <div className="absolute right-1.5 top-1.5 z-20">
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
          {/* Contained, not cropped -- same reason as the marketplace grid:
              a cover crop takes the ends off gearboxes and body panels, and
              a part's silhouette is most of what identifies it this small. */}
          <ProductImage
            src={thumbnail}
            alt={product.name}
            profile="grid"
            className="h-full w-full object-contain p-2 transition-transform duration-[var(--motion-duration-base)] ease-[var(--motion-ease-state)] group-hover:scale-[1.03]"
          />
        </div>

        <div className="mt-3 rounded-lg">
          <h3 className="font-semibold text-neutral-900 group-hover:text-accent-hover">
            <TranslatedText as="span">{product.name}</TranslatedText>
          </h3>
          <ProductPrice
            price={product.price}
            compareAtPrice={product.compareAtPrice}
            size="md"
          />
          {/*
            The bulk offer is real and it stays, but it is the same sentence
            on every card in every rail -- twelve filled green badges shouting
            one site-wide policy, competing with twelve different products for
            attention. It is already stated once in the announcement bar, so
            here it drops to a quiet line under the price: still visible to
            anyone weighing a second item, no longer the loudest thing on a
            card whose job is to sell the part.
          */}
          <p className="mt-1.5 text-[10px] font-medium text-neutral-500">
            {getProductDiscountLabel(product.category)}
          </p>
        </div>
      </div>

      <div className="relative z-20 px-4 pb-4">
        <AddToCartButton product={cartProduct} compact />
      </div>

      <div className="pointer-events-none absolute bottom-0 left-0 h-[2px] w-0 bg-accent transition-all duration-300 group-hover:w-full" />
    </article>
  );
}
