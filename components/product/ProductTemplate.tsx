"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Product } from "@/data/store";
import { trackEvent } from "@/lib/analytics/client";
import type { ProductCatalogMeta } from "@/lib/inventory/productEnhancements";
import type { CatalogProductCardData } from "@/components/catalog/CatalogProductCard";
import AddToCartButton, {
  type AddToCartProduct,
} from "@/app/components/AddToCartButton";
import ImageCarousel from "./ImageCarousel";
import ProductRatingSummary from "./ProductRatingSummary";
import ProductDetailsSections, { type SpecRow } from "./ProductDetailsSections";
import ProductInterest from "./ProductInterest";
import type { ProductInterest as Interest } from "@/lib/analytics/product-interest";
import ProductBreadcrumbs from "./ProductBreadcrumbs";
import StickyPurchaseBar from "./StickyPurchaseBar";
import ProductDiscoverySections from "./ProductDiscoverySections";
import PurchaseFacts from "./PurchaseFacts";
import { FitmentSummary, type FitmentApplication } from "./ProductFitment";
import PopularCategoriesSection from "@/components/catalog/PopularCategoriesSection";
import GuidesPreviewSection from "@/components/home/GuidesPreviewSection";
import WishlistButton from "@/components/wishlist/WishlistButton";
import CompareButton from "@/components/compare/CompareButton";
import ProductPrice from "@/components/currency/ProductPrice";
import TranslatedText from "@/components/i18n/TranslatedText";
import {
  BASE_ORDER_DISCOUNT_PERCENT,
  BULK_MIN_QUANTITY,
  BULK_ORDER_DISCOUNT_PERCENT,
} from "@/lib/inventory/discounts";
import {
  getConditionDisplay,
  resolveProductCondition,
} from "@/lib/inventory/condition";
import { DEFAULT_PRODUCT_IMAGE } from "@/lib/inventory/media";
import { CONTACT_HREF } from "@/lib/content/purchase-terms";
import { formatPlatformLabel } from "./styles";

const MAX_QUANTITY = 10;

/*
 * A build target is only ever stated in the listing's own description (the
 * 1UZ-FE package: "300 HP is a build target, not the factory-rated output").
 * The figure is read from there rather than printed as a fixed caption, which
 * is what this page used to do -- a second listing with a build potential
 * would have been labelled "300 HP" whatever its description said.
 */
function buildTargetFigure(description?: string): string | undefined {
  const match = description?.match(/\b(\d{2,4}\+?)\s*HP\s+(?:is\s+a\s+)?(?:build\s+)?target\b/i);
  return match ? `${match[1]} HP` : undefined;
}

function QuantityStepper({
  value,
  onChange,
}: {
  value: number;
  onChange: (next: number) => void;
}) {
  const buttonClass =
    "flex w-10 items-center justify-center text-lg text-neutral-800 transition-colors hover:bg-neutral-50 disabled:text-neutral-300";

  return (
    <div className="flex h-12 shrink-0 items-stretch rounded-[3px] border border-neutral-300 bg-white">
      <button
        type="button"
        aria-label="Decrease quantity"
        disabled={value <= 1}
        onClick={() => onChange(Math.max(1, value - 1))}
        className={buttonClass}
      >
        −
      </button>
      <label htmlFor="product-qty" className="sr-only">
        Quantity
      </label>
      <input
        id="product-qty"
        type="number"
        inputMode="numeric"
        min={1}
        max={MAX_QUANTITY}
        value={value}
        onChange={(e) => {
          const val = parseInt(e.target.value, 10);
          if (!Number.isNaN(val)) {
            onChange(Math.min(MAX_QUANTITY, Math.max(1, val)));
          }
        }}
        className="w-12 border-x border-neutral-300 bg-white text-center text-base font-semibold tabular-nums text-neutral-900 outline-none [appearance:textfield] focus:bg-neutral-50 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <button
        type="button"
        aria-label="Increase quantity"
        disabled={value >= MAX_QUANTITY}
        onClick={() => onChange(Math.min(MAX_QUANTITY, value + 1))}
        className={buttonClass}
      >
        +
      </button>
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
  fitmentApplications = [],
  universalFitment = false,
  fitmentYears,
  fitmentEngine,
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
  /** Every vehicle the listing records, row by row. */
  fitmentApplications?: FitmentApplication[];
  universalFitment?: boolean;
  fitmentYears?: string;
  fitmentEngine?: string;
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
  const logistics = catalogMeta.logistics;
  const partNumber = logistics?.partNumber;

  // The verified condition system: the listing's own condition, resolved by
  // the same helpers the catalog and the spec rows use.
  const conditionTone = getConditionDisplay(
    resolveProductCondition({ category: product.category, condition: rawCondition })
  ).color;

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

  const fitment = useMemo(
    () => ({
      text: logistics?.fitment,
      applications: fitmentApplications,
      years: fitmentYears,
      engine: fitmentEngine,
      drivetrain: logistics?.drivetrain,
      universal: universalFitment,
      swapPackage: Boolean(product.swapPackage),
    }),
    [
      logistics?.fitment,
      logistics?.drivetrain,
      fitmentApplications,
      fitmentYears,
      fitmentEngine,
      universalFitment,
      product.swapPackage,
    ]
  );

  /*
   * Rows for the Specifications tab. Power and mileage lead because on the
   * listings that carry them (engines, gearboxes) they are the first thing a
   * buyer compares; the structured attributes follow.
   */
  const specRows = useMemo(() => {
    const rows: SpecRow[] = [];

    /*
     * Most engine descriptions already state their power as an attribute
     * ("Factory Power: 600 HP"), and those lines are parsed into the rows
     * below. Where one matches, it is moved to the top under its own label
     * rather than printed a second time beside it.
     */
    const normalize = (value: string) =>
      value.toLowerCase().replace(/\s+/g, " ").replace(/[.,;]+$/, "").trim();
    const remaining = [...catalogMeta.specRows];
    const takeRow = (value: string) => {
      const index = remaining.findIndex((row) => normalize(row.value) === normalize(value));
      return index >= 0 ? remaining.splice(index, 1)[0] : undefined;
    };

    if (catalogMeta.horsepower) {
      const stated = takeRow(catalogMeta.horsepower);
      rows.push(
        stated
          ? { label: stated.label, value: <TranslatedText as="span">{stated.value}</TranslatedText> }
          : {
              label: product.buildPotential ? "Factory output" : "Power output",
              value: catalogMeta.horsepower,
            }
      );
      if (product.buildPotential) {
        const figure = buildTargetFigure(product.description);
        rows.push({
          label: figure ? `Build target (${figure})` : "Build potential",
          value: product.buildPotential,
        });
      }
    }

    /*
     * Mileage only where it means something. A brand-new bolt-on part has no
     * odometer, so the row is absent rather than asserting "0 Miles". Where
     * the unit is used and we do not hold the reading, the row links to the
     * one place the question can actually be answered.
     */
    if (catalogMeta.mileage) {
      takeRow(catalogMeta.mileage);
      rows.push({
        label: "Mileage",
        value:
          catalogMeta.mileage === "Inquire for Mileage" ? (
            <a
              href={CONTACT_HREF}
              className="font-semibold text-accent underline-offset-2 hover:text-accent-hover hover:underline"
            >
              Ask us for the reading
            </a>
          ) : (
            catalogMeta.mileage
          ),
      });
    }

    for (const row of remaining) {
      rows.push({
        label: row.label,
        value: <TranslatedText as="span">{row.value}</TranslatedText>,
      });
    }

    return rows;
  }, [catalogMeta, product.buildPotential, product.description]);

  const hasReviews = catalogMeta.reviewCount > 0;

  return (
    <div className="storefront-page min-h-screen overflow-x-clip bg-[var(--background)] pb-24">
      <ProductBreadcrumbs
        categoryName={categoryName}
        categorySlug={categorySlug}
        productName={product.name}
      />

      {/*
        Gallery, purchase column and details on one sheet.

        Phones and tablets read top to bottom: photos, the purchase column,
        then the details. From 1024px the purchase column takes the right and
        the details sit under the photos, so the specifications and the
        fitment list are on screen beside the price instead of below a tall
        blank panel. Between 768 and 1024 the page stays single-column: side
        by side there, the purchase column was left at about 370px.
      */}
      <div className="mx-auto grid w-full min-w-0 max-w-[1200px] grid-cols-1 border-b border-neutral-300 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:grid-rows-[auto_1fr]">
        <div className="min-w-0 border-b border-neutral-300 bg-white p-4 sm:p-6 lg:col-start-1 lg:row-start-1 lg:border-b-0">
          <div className="mx-auto w-full max-w-[560px] lg:max-w-none">
            <ImageCarousel
              images={galleryImages}
              alt={product.name}
              thumbnail={product.thumbnail}
              surface="light"
            />
          </div>
        </div>

        <div className="min-w-0 bg-white px-4 pb-6 pt-5 text-neutral-900 sm:px-7 sm:pb-8 sm:pt-7 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:border-l lg:border-neutral-300 lg:px-9">
          {/* Identity: who makes it, what it is, how it is identified. */}
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
            {product.brand ? (
              <span className="text-neutral-900">{product.brand}</span>
            ) : null}
            {product.brand ? <span aria-hidden="true"> · </span> : null}
            {categoryName}
            {platformLabel ? ` · ${platformLabel}` : ""}
          </p>

          <h1 className="mt-2 text-[clamp(22px,3.4vw,28px)] font-bold leading-[1.2] text-neutral-900">
            <TranslatedText as="span">{product.name}</TranslatedText>
          </h1>

          <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-[13px]">
            {partNumber ? (
              <div className="flex min-w-0 gap-1.5">
                <dt className="shrink-0 text-muted">Part No.</dt>
                <dd className="min-w-0 break-words font-semibold text-neutral-900">{partNumber}</dd>
              </div>
            ) : null}
            <div className="flex items-center gap-1.5">
              <dt className="text-muted">Condition</dt>
              <dd className="flex items-center gap-1.5 font-semibold text-neutral-900">
                <span
                  aria-hidden="true"
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ background: conditionTone }}
                />
                {catalogMeta.conditionLabel}
              </dd>
            </div>
          </dl>

          {hasReviews ? (
            <ProductRatingSummary
              productId={product.id}
              rating={catalogMeta.rating}
              reviewCount={catalogMeta.reviewCount}
              theme="pro"
            />
          ) : null}

          {/* Price and availability. */}
          <div className="mt-5 border-t border-neutral-200 pt-5">
            <ProductPrice
              price={product.price}
              compareAtPrice={product.compareAtPrice}
              size="lg"
              className="flex-row-reverse justify-end [&>span:last-child]:text-[28px] [&>span:last-child]:leading-none [&>span:last-child]:text-neutral-900 sm:[&>span:last-child]:text-[32px]"
            />
            <p className="mt-3 flex items-center gap-2 text-[13px] font-semibold">
              <span
                aria-hidden="true"
                className={`h-2 w-2 shrink-0 rounded-full ${inStock ? "bg-success" : "bg-neutral-400"}`}
              />
              <span className={inStock ? "text-success" : "text-muted"}>
                {inStock ? "In stock" : "Out of stock"}
              </span>
            </p>
            <p className="mt-1.5 text-[12px] leading-relaxed text-muted">
              {BASE_ORDER_DISCOUNT_PERCENT}% off every order, or{" "}
              {BULK_ORDER_DISCOUNT_PERCENT}% when you buy {BULK_MIN_QUANTITY} or
              more items. Applied automatically at checkout.
            </p>
          </div>

          <div className="mt-5 border-t border-neutral-200 pt-5">
            <FitmentSummary fitment={fitment} />
          </div>

          <div ref={ctaRef} className="mt-6 space-y-3">
            <div className="flex items-stretch gap-3">
              <QuantityStepper value={quantity} onChange={setQuantity} />
              <div className="min-w-0 flex-1">
                <AddToCartButton
                  product={cartProduct}
                  quantity={quantity}
                  className="inline-flex h-12 w-full items-center justify-center rounded-[3px] bg-accent px-5 text-sm font-bold uppercase tracking-[0.12em] text-accent-foreground transition-colors hover:bg-accent-hover active:bg-accent-active disabled:opacity-60"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
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
                className="h-10 rounded-[3px] px-3"
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
                className="h-10 justify-center !rounded-[3px] !px-3 !text-xs sm:!text-xs"
              />
            </div>
          </div>

          <div className="mt-6">
            <PurchaseFacts
              location={product.location}
              freightNotes={logistics?.freightNotes}
              warranty={catalogMeta.warranty}
              warrantyTerms={logistics?.warrantyTerms}
              coreCharge={logistics?.coreCharge}
            />
          </div>

          <ProductInterest interest={productInterest} />
        </div>

        <div className="min-w-0 border-t border-neutral-300 bg-[var(--background)] px-4 py-8 sm:px-6 sm:py-10 lg:col-start-1 lg:row-start-2 lg:border-t-0 lg:bg-white lg:px-6 lg:pb-8 lg:pt-2">
        <ProductDetailsSections
          productId={product.id}
          rating={catalogMeta.rating}
          reviewCount={catalogMeta.reviewCount}
          specRows={specRows}
          features={catalogMeta.specifications}
          included={logistics?.included}
          weight={logistics?.weight}
          descriptionBody={catalogMeta.descriptionBody}
          fitment={fitment}
          location={product.location}
          freightNotes={logistics?.freightNotes}
          warranty={catalogMeta.warranty}
          warrantyTerms={logistics?.warrantyTerms}
          coreCharge={logistics?.coreCharge}
          installResources={catalogMeta.installResources}
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

      <StickyPurchaseBar
        ctaRef={ctaRef}
        product={cartProduct}
        quantity={quantity}
        inStock={inStock}
      />
    </div>
  );
}
