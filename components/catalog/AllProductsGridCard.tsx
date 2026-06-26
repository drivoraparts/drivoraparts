"use client";

import Link from "next/link";
import AddToCartButton, {
  type AddToCartProduct,
} from "@/app/components/AddToCartButton";
import Price from "@/components/currency/Price";
import TranslatedText from "@/components/i18n/TranslatedText";
import { getProductThumbnail, resolveProductImage } from "@/lib/inventory/media";
import { routes } from "@/lib/inventory";
import type { CatalogProductCardData } from "./CatalogProductCard";

export default function AllProductsGridCard({
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

  return (
    <div className="flex min-w-0 flex-col overflow-hidden rounded-lg border border-white/10 bg-white/5">
      <Link href={routes.product(product.id)} className="block p-1.5 pb-1">
        <div className="aspect-square w-full overflow-hidden rounded-md border border-white/10 bg-white/[0.04]">
          <img
            src={resolveProductImage(thumbnail)}
            alt={product.name}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
        </div>
        <h3 className="mt-1 line-clamp-2 text-[10px] font-semibold leading-snug text-white sm:text-[11px]">
          <TranslatedText as="span">{product.name}</TranslatedText>
        </h3>
        <p className="mt-0.5 text-[10px] font-bold text-red-500 sm:text-[11px]">
          <Price usd={product.price} />
        </p>
      </Link>
      <div className="mt-auto px-1.5 pb-1.5 pt-0.5 [&_button]:py-1.5 [&_button]:text-[10px] sm:[&_button]:py-2 sm:[&_button]:text-xs">
        <AddToCartButton product={cartProduct} compact />
      </div>
    </div>
  );
}
