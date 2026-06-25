"use client";

import { useEffect, useState } from "react";
import type { Product } from "@/data/store";
import { trackEvent } from "@/lib/analytics/client";
import {
  getProductById as getInventoryProduct,
  getProductCatalogMeta,
} from "@/lib/inventory";
import AddToCartButton, {
  type AddToCartProduct,
} from "@/app/components/AddToCartButton";
import BuyNowButton from "@/app/components/BuyNowButton";
import ImageCarousel from "./ImageCarousel";
import TrustBadgeStrip from "./TrustBadgeStrip";
import ConditionBadge from "./ConditionBadge";
import ProductRatingSummary from "./ProductRatingSummary";
import QuickSpecsBar from "./QuickSpecsBar";
import ProductDetailsSections from "./ProductDetailsSections";
import {
  formatCategoryLabel,
  formatPlatformLabel,
  glassCard,
  productPageGrid,
} from "./styles";

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: "12px",
        padding: "8px 0",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        fontSize: "14px",
      }}
    >
      <span style={{ color: "rgba(255,255,255,0.55)" }}>{label}</span>
      <span style={{ fontWeight: 600, textAlign: "right", color: "#fff" }}>
        {value}
      </span>
    </div>
  );
}

export default function ProductTemplate({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    trackEvent("product_view", {
      productId: product.id,
      productName: product.name,
      category: product.category,
    });
  }, [product.id, product.name, product.category]);

  const inventoryProduct = getInventoryProduct(product.id);
  const inStock = inventoryProduct?.stock !== false;
  const rawCondition = inventoryProduct?.condition ?? product.condition;
  const catalogMeta = getProductCatalogMeta(
    inventoryProduct ?? {
      id: product.id,
      name: product.name,
      category: product.category,
      brand: product.brand,
      price: product.price,
      condition: rawCondition,
      description: product.description,
      platform: product.platform,
    }
  );

  const primaryImage = product.images?.[0] || product.thumbnail;
  const galleryImages =
    product.images && product.images.length > 0
      ? product.images
      : [product.thumbnail];

  const platformLabel = formatPlatformLabel(product.platform);
  const categoryLabel = formatCategoryLabel(product.category);

  const cartProduct: AddToCartProduct = {
    id: product.id,
    name: product.name,
    price: product.price,
    image: primaryImage || "/product-media/avatars/default.svg",
    category: product.category,
    brand: product.brand,
  };

  return (
    <div style={productPageGrid} className="product-page-grid">
      <div style={{ minWidth: 0, maxWidth: "100%", position: "relative" }}>
        <ImageCarousel
          images={galleryImages}
          alt={product.name}
          thumbnail={product.thumbnail}
        />
      </div>

      <div style={{ minWidth: 0, maxWidth: "100%", color: "#fff" }}>
        <h1
          style={{
            fontSize: "clamp(22px, 4vw, 28px)",
            marginBottom: "10px",
            lineHeight: 1.25,
          }}
        >
          {product.name}
        </h1>

        <ProductRatingSummary
          productId={product.id}
          rating={catalogMeta.rating}
          reviewCount={catalogMeta.reviewCount}
        />

        <h2 style={{ marginTop: "8px", fontSize: "26px", color: "#e60000" }}>
          ${product.price.toLocaleString()}
        </h2>

        <div style={{ marginTop: "10px" }}>
          <ConditionBadge
            category={product.category}
            condition={rawCondition}
          />
        </div>

        <QuickSpecsBar
          horsepower={catalogMeta.horsepower}
          mileage={catalogMeta.mileage}
          condition={catalogMeta.conditionLabel}
          warranty={catalogMeta.warranty}
        />

        <div style={{ marginTop: "16px", padding: "14px", ...glassCard }}>
          <MetaRow
            label="Stock Status"
            value={inStock ? "In Stock" : "Out of Stock"}
          />
          <MetaRow label="Brand" value={product.brand} />
          <MetaRow label="Category" value={categoryLabel} />
          {platformLabel && (
            <MetaRow label="Platform" value={platformLabel} />
          )}
        </div>

        <div style={{ marginTop: "20px", padding: "15px", ...glassCard }}>
          <label
            htmlFor="product-qty"
            style={{
              display: "block",
              fontSize: "14px",
              fontWeight: 600,
              marginBottom: "8px",
            }}
          >
            Quantity
          </label>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "14px",
            }}
          >
            <button
              type="button"
              aria-label="Decrease quantity"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              style={{
                width: "36px",
                height: "36px",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "6px",
                background: "rgba(255, 255, 255, 0.06)",
                color: "#fff",
                cursor: "pointer",
                fontSize: "18px",
              }}
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
              style={{
                width: "56px",
                height: "36px",
                textAlign: "center",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "6px",
                fontSize: "15px",
                background: "rgba(255, 255, 255, 0.06)",
                color: "#fff",
              }}
            />
            <button
              type="button"
              aria-label="Increase quantity"
              onClick={() => setQuantity((q) => Math.min(99, q + 1))}
              style={{
                width: "36px",
                height: "36px",
                border: "1px solid rgba(255, 255, 255,0.2)",
                borderRadius: "6px",
                background: "rgba(255, 255, 255, 0.06)",
                color: "#fff",
                cursor: "pointer",
                fontSize: "18px",
              }}
            >
              +
            </button>
          </div>

          <AddToCartButton product={cartProduct} quantity={quantity} />
          <BuyNowButton product={cartProduct} quantity={quantity} />
        </div>

        <TrustBadgeStrip />

        <p
          style={{
            marginTop: "12px",
            fontSize: "12px",
            color: "rgba(255,255,255,0.5)",
            lineHeight: 1.5,
          }}
        >
          Ships from {product.location}. Fast worldwide fulfillment available
          on eligible orders.
        </p>

        <ProductDetailsSections
          productId={product.id}
          rating={catalogMeta.rating}
          descriptionBody={catalogMeta.descriptionBody}
          specifications={catalogMeta.specifications}
          shippingAndWarranty={catalogMeta.shippingAndWarranty}
          reviewCount={catalogMeta.reviewCount}
          logistics={catalogMeta.logistics}
        />
      </div>

      <style>{`
        @media (max-width: 768px) {
          .product-page-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
