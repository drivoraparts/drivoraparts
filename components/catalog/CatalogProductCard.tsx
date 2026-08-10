"use client";

import Link from "next/link";
import AddToCartButton, {
  type AddToCartProduct,
} from "@/app/components/AddToCartButton";
import ProductPrice from "@/components/currency/ProductPrice";
import TranslatedText from "@/components/i18n/TranslatedText";
import ProductImage from "@/components/media/ProductImage";
import { ProductDiscountBadge } from "@/components/product/DiscountBadge";
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
      className="group relative overflow-hidden rounded-xl border border-neutral-200/80 bg-white shadow-sm transition-all duration-300 hover:border-red-300 hover:shadow-lg"
    >
      <Link
        href={productHref}
        className="absolute inset-0 z-10 rounded-xl"
        aria-label={`View ${product.name}`}
        onClick={() => {
          if (scrollListKey) {
            saveListScrollOnProductClick(scrollListKey, product.id);
          }
        }}
      />

      <div className="pointer-events-none absolute inset-0 bg-red-500/5 opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100" />

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
          <ProductImage
            src={thumbnail}
            alt={product.name}
            profile="grid"
            className="h-full w-full object-cover"
          />
        </div>

        <div className="mt-3 rounded-lg">
          <h3 className="font-semibold text-neutral-900 group-hover:text-red-600">
            <TranslatedText as="span">{product.name}</TranslatedText>
          </h3>
          <ProductPrice
            price={product.price}
            compareAtPrice={product.compareAtPrice}
            size="md"
          />
          <div className="mt-2">
            <ProductDiscountBadge category={product.category} />
          </div>
        </div>
      </div>

      <div className="relative z-20 px-4 pb-4">
        <AddToCartButton product={cartProduct} compact />
      </div>

      <div className="pointer-events-none absolute bottom-0 left-0 h-[2px] w-0 bg-red-500 transition-all duration-300 group-hover:w-full" />
    </article>
  );
}
