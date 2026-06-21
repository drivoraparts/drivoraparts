"use client";

import { useState, type ReactNode } from "react";
import CustomerReviewsSection from "./CustomerReviewsSection";
import { glassCard } from "./styles";

type ProductDetailsSectionsProps = {
  productId: number;
  rating: number;
  descriptionBody: string;
  specifications: string;
  shippingAndWarranty: string;
  reviewCount: number;
};

type SectionProps = {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
};

function CollapsibleSection({
  title,
  defaultOpen = false,
  children,
}: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section style={{ ...glassCard, padding: "14px" }}>
      <button
        type="button"
        className="details-section-toggle"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <span>
          {open ? "▼" : "▶"} {title}
        </span>
      </button>
      {open && <div className="details-section-body">{children}</div>}

      <style jsx>{`
        .details-section-toggle {
          width: 100%;
          padding: 0;
          border: none;
          background: none;
          color: #fff;
          font-size: 16px;
          font-weight: 700;
          text-align: left;
          cursor: pointer;
        }

        .details-section-body {
          margin-top: 12px;
          color: rgba(255, 255, 255, 0.75);
          line-height: 1.6;
          white-space: pre-line;
        }
      `}</style>
    </section>
  );
}

export default function ProductDetailsSections({
  productId,
  rating,
  descriptionBody,
  specifications,
  shippingAndWarranty,
  reviewCount,
}: ProductDetailsSectionsProps) {
  return (
    <div className="product-details-sections">
      <CollapsibleSection title="Description" defaultOpen>
        {descriptionBody}
      </CollapsibleSection>

      {specifications && (
        <CollapsibleSection title="Specifications">
          {specifications}
        </CollapsibleSection>
      )}

      {shippingAndWarranty && (
        <CollapsibleSection title="Shipping & Warranty">
          {shippingAndWarranty}
        </CollapsibleSection>
      )}

      <CustomerReviewsSection
        productId={productId}
        rating={rating}
        reviewCount={reviewCount}
      />

      <style jsx>{`
        .product-details-sections {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 24px;
        }
      `}</style>
    </div>
  );
}
