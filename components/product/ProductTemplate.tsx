"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Product } from "@/data/store";
import { trackEvent } from "@/lib/analytics/client";
import type { ProductCatalogMeta } from "@/lib/inventory/productEnhancements";
import type { CatalogProductCardData } from "@/components/catalog/CatalogProductCard";
import AddToCartButton, {
  type AddToCartProduct,
} from "@/app/components/AddToCartButton";
import BuyNowButton from "@/app/components/BuyNowButton";
import ImageCarousel from "./ImageCarousel";
import ProTrustBadges from "./ProTrustBadges";
import ConditionBadge from "./ConditionBadge";
import ProductRatingSummary from "./ProductRatingSummary";
import PowerLevelSection, {
  type ProSpecSection,
} from "./PowerLevelSection";
import ProductDetailsSections from "./ProductDetailsSections";
import ProductBreadcrumbs from "./ProductBreadcrumbs";
import MobileStickyAddToCart from "./MobileStickyAddToCart";
import ProductDiscoverySections from "./ProductDiscoverySections";
import ProductPrice from "@/components/currency/ProductPrice";
import TranslatedText from "@/components/i18n/TranslatedText";
import {
  OrderDiscountBadge,
  ProductDiscountBadge,
} from "@/components/product/DiscountBadge";
import { DEFAULT_PRODUCT_IMAGE } from "@/lib/inventory/media";
import {
  formatCategoryLabel,
  formatPlatformLabel,
} from "./styles";

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-neutral-200 py-2.5 text-sm last:border-b-0">
      <span className="text-neutral-500">{label}</span>
      <span className="text-right font-semibold text-neutral-900">{value}</span>
    </div>
  );
}

export default function ProductTemplate({
  product,
  catalogMeta,
  inStock,
  rawCondition,
  categoryName,
  categorySlug,
  relatedProducts,
}: {
  product: Product;
  catalogMeta: ProductCatalogMeta;
  inStock: boolean;
  rawCondition?: string;
  categoryName: string;
  categorySlug: string;
  relatedProducts: CatalogProductCardData[];
}) {
  const [quantity, setQuantity] = useState(1);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    trackEvent("product_view", {
      productId: product.id,
      productName: product.name,
      category: product.category,
      price: product.price,
    });
  }, [product.id, product.name, product.category]);

  const primaryImage =
    product.images?.[0] || product.thumbnail || DEFAULT_PRODUCT_IMAGE;
  const galleryImages =
    product.images && product.images.length > 0
      ? product.images
      : [product.thumbnail || DEFAULT_PRODUCT_IMAGE];

  const platformLabel = formatPlatformLabel(product.platform);
  const categoryLabel = formatCategoryLabel(product.category);

  const cartProduct: AddToCartProduct = {
    id: product.id,
    name: product.name,
    price: product.price,
    image: primaryImage,
    category: product.category,
    brand: product.brand,
  };

  const recentlyViewedEntry = useMemo(
    () => ({
      id: product.id,
      name: product.name,
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      thumbnail: primaryImage,
      category: product.category,
      brand: product.brand,
    }),
    [
      product.id,
      product.name,
      product.price,
      product.compareAtPrice,
      product.category,
      product.brand,
      primaryImage,
    ]
  );

  const specSections = useMemo(() => {
    const sections: ProSpecSection[] = [];

    if (catalogMeta.horsepower) {
      sections.push({
        label: "Choose Power Level",
        values: [catalogMeta.horsepower],
      });
    }

    sections.push(
      { label: "Condition", values: [catalogMeta.conditionLabel] },
      { label: "Mileage", values: [catalogMeta.mileage] },
      { label: "Warranty", values: [catalogMeta.warranty] }
    );

    if (catalogMeta.logistics?.fitment) {
      sections.push({
        label: "Fitment",
        values: [catalogMeta.logistics.fitment],
      });
    }

    return sections;
  }, [catalogMeta]);

  return (
    <div className="storefront-page min-h-screen overflow-x-clip bg-[var(--background)] pb-24 md:pb-0">
      <ProductBreadcrumbs
        categoryName={categoryName}
        categorySlug={categorySlug}
        productName={product.name}
      />

      <div className="mx-auto grid w-full min-w-0 max-w-[1200px] grid-cols-1 items-start gap-0 overflow-x-clip md:grid-cols-[1.15fr_1fr]">
        <div className="min-w-0 border-b border-neutral-300 bg-white p-4 shadow-sm sm:p-6 md:border-b-0 md:border-r">
          <ImageCarousel
            images={galleryImages}
            alt={product.name}
            thumbnail={product.thumbnail}
            surface="light"
          />
        </div>

        <div className="min-w-0 bg-white p-4 text-neutral-900 shadow-sm sm:p-7 lg:p-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
            {categoryLabel}
            {platformLabel ? ` · ${platformLabel}` : ""}
          </p>

          <h1 className="mt-2 text-[clamp(22px,4vw,30px)] font-bold leading-tight text-neutral-900">
            <TranslatedText as="span">{product.name}</TranslatedText>
          </h1>

          <ProductRatingSummary
            productId={product.id}
            rating={catalogMeta.rating}
            reviewCount={catalogMeta.reviewCount}
            theme="pro"
          />

          <div className="mt-3 border-b border-neutral-200 pb-4">
            <ProductPrice
              price={product.price}
              compareAtPrice={product.compareAtPrice}
              size="lg"
              className="[&_span:last-child]:text-neutral-900 [&_span:last-child]:text-3xl [&_span:last-child]:font-black"
            />
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <ProductDiscountBadge category={product.category} />
            <OrderDiscountBadge />
            <ConditionBadge category={product.category} condition={rawCondition} />
          </div>

          <PowerLevelSection sections={specSections} />

          <div ref={ctaRef} className="mt-6 border-t border-neutral-200 pt-5">
            <p className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.16em] text-neutral-500">
              Quantity
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Decrease quantity"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="flex h-10 w-10 items-center justify-center border border-neutral-300 bg-white text-lg text-neutral-800"
              >
                −
              </button>
              <input
                id="product-qty"
                type="number"
                min={1}
                max={99}
                value={quantity}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (!Number.isNaN(val)) {
                    setQuantity(Math.min(99, Math.max(1, val)));
                  }
                }}
                className="h-10 w-16 border border-neutral-300 bg-white text-center text-base text-neutral-900 outline-none focus:border-neutral-800"
              />
              <button
                type="button"
                aria-label="Increase quantity"
                onClick={() => setQuantity((q) => Math.min(99, q + 1))}
                className="flex h-10 w-10 items-center justify-center border border-neutral-300 bg-white text-lg text-neutral-800"
              >
                +
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <AddToCartButton
                product={cartProduct}
                quantity={quantity}
                className="!rounded-none !border-2 !border-red-600 !bg-white !py-3.5 !text-sm !font-black !uppercase !tracking-[0.12em] !text-neutral-900 hover:!bg-red-50"
              />
              <BuyNowButton
                product={cartProduct}
                quantity={quantity}
                className="!mt-0 !rounded-none !border !border-neutral-900 !bg-neutral-900 !py-3.5 !text-sm !font-bold !uppercase !tracking-[0.1em] !text-white hover:!bg-neutral-800"
              />
            </div>
          </div>

          <div className="mt-6 border-t border-neutral-200 pt-5">
            <ProTrustBadges />
          </div>

          <p className="mt-4 text-xs leading-relaxed text-neutral-500">
            Ships from {product.location}. Fast worldwide fulfillment available on
            eligible orders.
          </p>

          <div className="mt-5 rounded-sm border border-neutral-300 bg-neutral-50 px-4 py-3 shadow-sm">
            <MetaRow
              label="Stock Status"
              value={inStock ? "In Stock" : "Out of Stock"}
            />
            <MetaRow label="Brand" value={product.brand} />
            <MetaRow label="Category" value={categoryLabel} />
            {platformLabel ? (
              <MetaRow label="Platform" value={platformLabel} />
            ) : null}
          </div>

          <ProductDetailsSections
            productId={product.id}
            rating={catalogMeta.rating}
            descriptionBody={catalogMeta.descriptionBody}
            specifications={catalogMeta.specifications}
            shippingAndWarranty={catalogMeta.shippingAndWarranty}
            reviewCount={catalogMeta.reviewCount}
            logistics={catalogMeta.logistics}
            theme="pro"
          />
        </div>
      </div>

      <ProductDiscoverySections
        currentProductId={product.id}
        currentProduct={recentlyViewedEntry}
        relatedProducts={relatedProducts}
      />

      <MobileStickyAddToCart
        ctaRef={ctaRef}
        product={cartProduct}
        price={product.price}
        compareAtPrice={product.compareAtPrice}
        quantity={quantity}
        inStock={inStock}
      />
    </div>
  );
}
