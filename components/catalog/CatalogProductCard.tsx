"use client";

import Link from "next/link";
import AddToCartButton, {
  type AddToCartProduct,
} from "@/app/components/AddToCartButton";
import ProductPrice from "@/components/currency/ProductPrice";
import TranslatedText from "@/components/i18n/TranslatedText";
import ProductImage from "@/components/media/ProductImage";
import { ProductDiscountBadge } from "@/components/product/DiscountBadge";
import { getProductThumbnail } from "@/lib/inventory/media";
import { routes } from "@/lib/inventory/routes";

export type CatalogProductCardData = {
  id: number;
  name: string;
  price: number;
  compareAtPrice?: number;
  thumbnail: string;
  images?: string[];
  category: string;
  brand?: string;
};

export default function CatalogProductCard({
  product,
}: {
  product: CatalogProductCardData;
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
    <article className="group relative overflow-hidden rounded-xl border border-neutral-300 bg-white shadow-sm transition-all duration-300 hover:border-red-500 hover:shadow-md">
      <Link
        href={productHref}
        className="absolute inset-0 z-10 rounded-xl"
        aria-label={`View ${product.name}`}
      />

      <div className="pointer-events-none absolute inset-0 bg-red-500/5 opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100" />

      <div className="relative p-4">
        <div className="relative h-40 w-full overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50">
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
