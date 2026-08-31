"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { Product } from "@/data/store";
import { routes } from "@/lib/inventory/routes";
import { trackEvent } from "@/lib/analytics/client";
import type { ProductCatalogMeta } from "@/lib/inventory/productEnhancements";
import type { CatalogProductCardData } from "@/components/catalog/CatalogProductCard";
import AddToCartButton, {
  type AddToCartProduct,
} from "@/app/components/AddToCartButton";
import ImageCarousel from "./ImageCarousel";
import ProTrustBadges from "./ProTrustBadges";
import ConditionBadge from "./ConditionBadge";
import ProductRatingSummary from "./ProductRatingSummary";
import PowerLevelSection, {
  type ProSpecSection,
} from "./PowerLevelSection";
import ProductDetailsSections from "./ProductDetailsSections";
import CompatibilityHighlight from "./CompatibilityHighlight";
import ProductInterest from "./ProductInterest";
import type { ProductInterest as Interest } from "@/lib/analytics/product-interest";
import FitmentAssuranceCallout from "./FitmentAssuranceCallout";
import ProductBreadcrumbs from "./ProductBreadcrumbs";
import StickyPurchaseBar from "./StickyPurchaseBar";
import ProductDiscoverySections from "./ProductDiscoverySections";
import PopularCategoriesSection from "@/components/catalog/PopularCategoriesSection";
import GuidesPreviewSection from "@/components/home/GuidesPreviewSection";
import WishlistButton from "@/components/wishlist/WishlistButton";
import CompareButton from "@/components/compare/CompareButton";
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

const MAX_QUANTITY = 10;

function MetaRow({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "positive" | "neutral";
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-neutral-200 py-2.5 text-sm last:border-b-0">
      <span className="text-neutral-500">{label}</span>
      {tone ? (
        <span
          className={`flex items-center gap-1.5 text-right font-semibold ${
            tone === "positive" ? "text-emerald-700" : "text-neutral-500"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 shrink-0 rounded-full ${
              tone === "positive" ? "bg-emerald-500" : "bg-neutral-400"
            }`}
            aria-hidden
          />
          {value}
        </span>
      ) : (
        <span className="text-right font-semibold text-neutral-900">{value}</span>
      )}
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
  productInterest = null,
}: {
  product: Product;
  catalogMeta: ProductCatalogMeta;
  /** Real view/cart counts, or null when there is too little to be worth showing. */
  productInterest?: Interest | null;
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
      // Labelled "Choose Power Level" even though these pills have no click
      // handler and nothing is selectable. On a listing that also shows a
      // build target, that wording would read as an option to buy a modified
      // engine, so it states what it is instead.
      //
      // Where a build target exists the two are rendered as captioned cards,
      // not matching pills: the factory rating is what ships, the target is
      // what the engine can reach with work, and that difference has to be
      // legible at a glance.
      sections.push(
        product.buildPotential
          ? {
              label: "Power Output",
              values: [],
              options: [
                {
                  caption: "Factory Configuration",
                  title: catalogMeta.horsepower,
                  emphasis: true,
                },
                {
                  caption: "300 HP Build Target",
                  title: product.buildPotential,
                },
              ],
            }
          : {
              label: "Power Output",
              values: [catalogMeta.horsepower],
            }
      );
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
    <div className="storefront-page min-h-screen overflow-x-clip bg-[var(--background)] pb-24">
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

          <CompatibilityHighlight
            fitment={catalogMeta.logistics?.fitment}
            drivetrain={catalogMeta.logistics?.drivetrain}
            label={
              product.swapPackage ? "Swap Compatibility" : "Confirmed Compatibility"
            }
          />

          <ProductInterest interest={productInterest} />

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
                max={MAX_QUANTITY}
                value={quantity}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (!Number.isNaN(val)) {
                    setQuantity(Math.min(MAX_QUANTITY, Math.max(1, val)));
                  }
                }}
                className="h-10 w-16 border border-neutral-300 bg-white text-center text-base text-neutral-900 outline-none focus:border-neutral-800"
              />
              <button
                type="button"
                aria-label="Increase quantity"
                onClick={() => setQuantity((q) => Math.min(MAX_QUANTITY, q + 1))}
                className="flex h-10 w-10 items-center justify-center border border-neutral-300 bg-white text-lg text-neutral-800"
              >
                +
              </button>
            </div>

            <div className="mt-4 border-b border-neutral-200 pb-4">
              <ProductPrice
                price={product.price}
                compareAtPrice={product.compareAtPrice}
                size="md"
              />
            </div>

            <div className="mt-4 space-y-3">
              <AddToCartButton
                product={cartProduct}
                quantity={quantity}
                className="!rounded-none !border-2 !border-accent !bg-white !py-3.5 !text-sm !font-black !uppercase !tracking-[0.12em] !text-neutral-900 hover:!bg-accent-subtle"
              />
            </div>

            <div className="mt-3 flex items-center gap-2">
              <WishlistButton
                product={{
                  id: product.id,
                  name: product.name,
                  price: product.price,
                  compareAtPrice: product.compareAtPrice,
                  thumbnail: primaryImage,
                  category: product.category,
                  brand: product.brand,
                }}
                showLabel
                className="flex-1 px-4 py-2.5"
              />
              <CompareButton
                product={{
                  id: product.id,
                  name: product.name,
                  price: product.price,
                  thumbnail: primaryImage,
                  category: product.category,
                  brand: product.brand,
                }}
                className="flex-1 justify-center px-4 py-2.5"
              />
            </div>

            <FitmentAssuranceCallout
              assurance={
                product.swapPackage
                  ? "Fitment Assistance Available — contact us before ordering."
                  : undefined
              }
            />
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
              tone={inStock ? "positive" : "neutral"}
            />
            <MetaRow label="Brand" value={product.brand} />
          </div>

          <ProductDetailsSections
            productId={product.id}
            rating={catalogMeta.rating}
            descriptionBody={catalogMeta.descriptionBody}
            specifications={catalogMeta.specifications}
            shippingAndWarranty={catalogMeta.shippingAndWarranty}
            reviewCount={catalogMeta.reviewCount}
            logistics={catalogMeta.logistics}
            installResources={catalogMeta.installResources}
            theme="pro"
          />
        </div>
      </div>

      <ProductDiscoverySections
        currentProductId={product.id}
        currentProduct={recentlyViewedEntry}
        relatedProducts={relatedProducts}
      />

      <PopularCategoriesSection />

      <GuidesPreviewSection />

      <section className="border-t border-neutral-200 bg-neutral-950 px-4 py-14 text-center text-white sm:px-6">
        <div className="mx-auto max-w-xl">
          <h2 className="text-2xl font-bold sm:text-3xl">
            Keep building
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-neutral-300">
            1,400+ listings across engines, transmissions, suspension, brakes, and more.
          </p>
          <Link
            href={routes.all}
            prefetch={false}
            className="mt-6 inline-block touch-manipulation rounded-full bg-accent px-9 py-3 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-accent-hover active:bg-accent-active"
          >
            Continue Browsing
          </Link>
        </div>
      </section>

      <StickyPurchaseBar
        ctaRef={ctaRef}
        product={cartProduct}
        quantity={quantity}
        inStock={inStock}
      />
    </div>
  );
}
