"use client";

import Link from "next/link";
import ProductPrice from "@/components/currency/ProductPrice";
import TranslatedText from "@/components/i18n/TranslatedText";
import { ProductDiscountBadge } from "@/components/product/DiscountBadge";
import ProductImage from "@/components/media/ProductImage";
import AddToCartButton, {
  type AddToCartProduct,
} from "@/app/components/AddToCartButton";

export type Product = {
  id: number;
  name: string;
  category: string;
  brand?: string;
  price: number;
  compareAtPrice?: number;
  condition: string;
  location: string;
  thumbnail: string;
  description: string;
};

export default function ProductCard({ product }: { product: Product }) {
  const cartProduct: AddToCartProduct = {
    id: product.id,
    name: product.name,
    price: product.price,
    image: product.thumbnail || "/product-media/avatars/default.svg",
    category: product.category,
    brand: product.brand,
  };

  const productHref = `/product/${product.id}`;

  return (
    <div className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 transition-all duration-300 hover:border-red-500/40">
      <Link href={productHref} className="block">
        <div className="relative h-[180px] overflow-hidden">
          <ProductImage
            src={product.thumbnail}
            alt={product.name}
            profile="card"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
      </Link>

      <div className="p-4">
        <Link href={productHref} className="block">
          <h3 className="text-sm font-semibold text-white group-hover:text-red-400">
            <TranslatedText as="span">{product.name}</TranslatedText>
          </h3>

          <p className="mt-1 text-xs text-gray-400">{product.condition}</p>
          <p className="mt-1 text-xs text-gray-500">{product.location}</p>

          <div className="mt-3 flex items-center justify-between gap-2">
            <ProductPrice
              price={product.price}
              compareAtPrice={product.compareAtPrice}
              size="sm"
            />
            <span className="text-[10px] uppercase text-gray-400">
              {product.category}
            </span>
          </div>

          <div className="mt-2">
            <ProductDiscountBadge category={product.category} />
          </div>
        </Link>

        <div className="mt-4">
          <AddToCartButton product={cartProduct} compact />
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,0,0,0.12),transparent_60%)] opacity-0 transition duration-500 group-hover:opacity-100" />
    </div>
  );
}
