"use client";

import { useState } from "react";
import AddToCartButton, {
  type AddToCartProduct,
} from "@/app/components/AddToCartButton";
import BuyNowButton from "@/app/components/BuyNowButton";
import TrustBadgeModule from "@/app/components/TrustBadgeModule";

export type ProductDetailsData = {
  id: number;
  name: string;
  price: number;
  condition: string;
  brand: string;
  category: string;
  location: string;
  description: string;
  primaryImage: string;
  inStock: boolean;
  platform?: string;
};

const glassCard: React.CSSProperties = {
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.1)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  borderRadius: "10px",
  boxShadow: "0 4px 24px rgba(0,0,0,0.25)",
};

function CollapsibleDescription({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{ marginTop: "24px", ...glassCard, padding: "14px" }}>
      <h3
        style={{
          fontSize: "18px",
          marginBottom: "10px",
          color: "#fff",
        }}
      >
        Description
      </h3>
      <div
        style={{
          overflow: "hidden",
          maxHeight: expanded ? "4000px" : "6.4em",
          transition: "max-height 0.35s ease",
          color: "rgba(255,255,255,0.75)",
          lineHeight: 1.6,
          whiteSpace: "pre-line",
        }}
      >
        {text}
      </div>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        style={{
          marginTop: "10px",
          padding: 0,
          border: "none",
          background: "none",
          color: "#e60000",
          fontWeight: 600,
          cursor: "pointer",
          fontSize: "14px",
        }}
      >
        {expanded ? "Show Less" : "Read More"}
      </button>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
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
      <span
        style={{
          fontWeight: 600,
          textAlign: "right",
          color: "#fff",
        }}
      >
        {value}
      </span>
    </div>
  );
}

export default function ProductDetailsPanel({
  product,
}: {
  product: ProductDetailsData;
}) {
  const [quantity, setQuantity] = useState(1);
  const isB58 = product.platform === "bmw-b58-twinpower" || product.id === 33;

  const cartProduct: AddToCartProduct = {
    id: product.id,
    name: product.name,
    price: product.price,
    image: product.primaryImage,
    category: product.category,
    brand: product.brand,
  };

  const categoryLabel =
    product.category.charAt(0).toUpperCase() +
    product.category.slice(1).replace(/-/g, " ");

  const sku = isB58 ? "DP-B58-033" : `DP-${String(product.id).padStart(4, "0")}`;

  return (
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

      <h2 style={{ marginTop: "8px", fontSize: "26px", color: "#e60000" }}>
        ${product.price.toLocaleString()}
      </h2>

      <div style={{ marginTop: "16px", padding: "14px", ...glassCard }}>
        <InfoRow label="Condition" value={product.condition} />
        <InfoRow
          label="Stock Status"
          value={product.inStock ? "In Stock" : "Out of Stock"}
        />
        <InfoRow label="SKU" value={sku} />
        <InfoRow label="Brand" value={product.brand} />
        <InfoRow label="Shipping" value={`Ships from ${product.location}`} />
      </div>

      <div style={{ marginTop: "16px", padding: "14px", ...glassCard }}>
        <h3
          style={{
            fontSize: "15px",
            fontWeight: 700,
            marginBottom: "8px",
            color: "#fff",
          }}
        >
          Product Information
        </h3>
        {isB58 ? (
          <>
            <InfoRow label="Brand" value="BMW" />
            <InfoRow label="Engine Family" value="B58" />
            <InfoRow label="Category" value="Engine" />
            <InfoRow label="Fuel Type" value="Gasoline" />
            <InfoRow label="Configuration" value="Inline 6" />
            <InfoRow label="Turbocharged" value="Yes" />
            <InfoRow label="Condition" value="OEM Refurbished / Tested" />
            <InfoRow label="Availability" value="In Stock" />
          </>
        ) : (
          <>
            <InfoRow label="Brand" value={product.brand} />
            <InfoRow label="Category" value={categoryLabel} />
            <InfoRow label="Condition" value={product.condition} />
            <InfoRow
              label="Availability"
              value={product.inStock ? "In Stock" : "Out of Stock"}
            />
          </>
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
              background: "rgba(255,255,255,0.06)",
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
              background: "rgba(255,255,255,0.06)",
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
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: "6px",
              background: "rgba(255,255,255,0.06)",
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

      <TrustBadgeModule />

      <CollapsibleDescription text={product.description} />
    </div>
  );
}
