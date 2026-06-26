"use client";

import Link from "next/link";
import AddToCartButton, {
  type AddToCartProduct,
} from "@/app/components/AddToCartButton";
import Price from "@/components/currency/Price";
import TranslatedText from "@/components/i18n/TranslatedText";
import { routes } from "@/lib/inventory";

export type CatalogProductCardData = {
  id: number;
  name: string;
  price: number;
  thumbnail: string;
  category: string;
  brand?: string;
};

export default function CatalogProductCard({
  product,
}: {
  product: CatalogProductCardData;
}) {
  const cartProduct: AddToCartProduct = {
    id: product.id,
    name: product.name,
    price: product.price,
    image: product.thumbnail || "/product-media/avatars/default.svg",
    category: product.category,
    brand: product.brand,
  };

  return (
    <div className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 transition-all duration-300 hover:border-red-500 hover:bg-white/10">
      <div className="absolute inset-0 bg-red-500/10 blur-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none" />

      <div className="relative p-4">
        <Link href={routes.product(product.id)} className="block">
          <img
            src={product.thumbnail}
            alt={product.name}
            loading="lazy"
            decoding="async"
            className="h-40 w-full rounded-lg object-cover"
          />
          <h3 className="mt-3 font-semibold">
            <TranslatedText as="span">{product.name}</TranslatedText>
          </h3>
          <p className="text-sm font-bold text-red-500">
            <Price usd={product.price} />
          </p>
        </Link>

        <div className="mt-3 flex gap-2">
          <Link
            href={routes.product(product.id)}
            className="flex-1 rounded-lg border border-white/15 py-2 text-center text-xs font-semibold text-white transition hover:bg-white/10"
          >
            View
          </Link>
          <div className="flex-1 min-w-0">
            <AddToCartButton product={cartProduct} compact />
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-red-500 transition-all duration-300 group-hover:w-full" />
    </div>
  );
}
