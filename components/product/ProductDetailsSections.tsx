"use client";

import { useState, type ReactNode } from "react";
import CustomerReviewsSection from "./CustomerReviewsSection";
import type { ProductLogistics } from "@/lib/inventory/productEnhancements";
import { hasLogistics } from "@/lib/inventory/productEnhancements";
import { glassCard } from "./styles";

type ProductDetailsSectionsProps = {
  productId: number;
  rating: number;
  descriptionBody: string;
  specifications: string;
  shippingAndWarranty: string;
  reviewCount: number;
  logistics: ProductLogistics;
};

function LogisticsRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: "16px",
        padding: "10px 0",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        fontSize: "14px",
        lineHeight: 1.5,
      }}
    >
      <span style={{ color: "rgba(255,255,255,0.55)", flexShrink: 0 }}>
        {label}
      </span>
      <span style={{ fontWeight: 600, textAlign: "right", color: "#fff" }}>
        {value}
      </span>
    </div>
  );
}

function FitmentLogistics({ logistics }: { logistics: ProductLogistics }) {
  return (
    <div>
      {logistics.fitment && (
        <LogisticsRow label="Fits / Compatibility" value={logistics.fitment} />
      )}
      {logistics.drivetrain && (
        <LogisticsRow label="Drivetrain" value={logistics.drivetrain} />
      )}
      {logistics.partNumber && (
        <LogisticsRow label="Part / Code" value={logistics.partNumber} />
      )}
      {logistics.included && logistics.included.length > 0 && (
        <LogisticsRow
          label="What's Included"
          value={
            <span style={{ display: "block" }}>
              {logistics.included.map((item) => (
                <span key={item} style={{ display: "block" }}>
                  {item}
                </span>
              ))}
            </span>
          }
        />
      )}
      {logistics.coreCharge && (
        <LogisticsRow label="Core Charge" value={logistics.coreCharge} />
      )}
      {logistics.freightNotes && (
        <LogisticsRow label="Freight & Shipping" value={logistics.freightNotes} />
      )}
      {logistics.warrantyTerms && (
        <LogisticsRow label="Warranty Terms" value={logistics.warrantyTerms} />
      )}
    </div>
  );
}

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
  logistics,
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

      {hasLogistics(logistics) && (
        <CollapsibleSection title="Fitment & Logistics" defaultOpen>
          <FitmentLogistics logistics={logistics} />
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
