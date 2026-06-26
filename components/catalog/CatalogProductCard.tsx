"use client";

import Link from "next/link";
import AddToCartButton, {
  type AddToCartProduct,
} from "@/app/components/AddToCartButton";
import Price from "@/components/currency/Price";
import TranslatedText from "@/components/i18n/TranslatedText";
import { ProductDiscountBadge } from "@/components/product/DiscountBadge";
import { CatalogImageGallery } from "@/components/product/ImageCarousel";
import { getProductThumbnail } from "@/lib/inventory/media";
import { routes } from "@/lib/inventory";

export type CatalogProductCardData = {
  id: number;
  name: string;
  price: number;
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
  const galleryImages =
    product.images && product.images.length > 0
      ? product.images
      : [thumbnail];

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
    <div className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 transition-all duration-300 hover:border-red-500 hover:bg-white/10">
      <div className="pointer-events-none absolute inset-0 bg-red-500/10 blur-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="relative p-4">
        <Link href={productHref} className="block rounded-lg">
          <CatalogImageGallery
            images={galleryImages}
            alt={product.name}
          />

          <div className="mt-3 rounded-lg transition hover:opacity-95">
            <h3 className="font-semibold text-white group-hover:text-red-400">
              <TranslatedText as="span">{product.name}</TranslatedText>
            </h3>
            <p className="text-sm font-bold text-red-500">
              <Price usd={product.price} />
            </p>
            <div className="mt-2">
              <ProductDiscountBadge category={product.category} />
            </div>
          </div>
        </Link>

        <div className="mt-3">
          <AddToCartButton product={cartProduct} compact />
        </div>
      </div>

      <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-red-500 transition-all duration-300 group-hover:w-full" />
    </div>
  );
}
