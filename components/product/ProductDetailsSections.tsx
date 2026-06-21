"use client";

import { useMemo, useState, type ReactNode } from "react";
import { getApprovedReviewsByProductId } from "@/lib/reviews";
import ReviewCard from "./ReviewCard";
import { glassCard } from "./styles";

type ProductDetailsSectionsProps = {
  productId: number;
  descriptionBody: string;
  specifications: string;
  shippingAndWarranty: string;
  reviewCount: number;
};

type SectionProps = {
  title: string;
  countLabel?: string;
  defaultOpen?: boolean;
  children: ReactNode;
};

function CollapsibleSection({
  title,
  countLabel,
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
          {countLabel ? ` (${countLabel})` : ""}
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
  descriptionBody,
  specifications,
  shippingAndWarranty,
  reviewCount,
}: ProductDetailsSectionsProps) {
  const [visibleCount, setVisibleCount] = useState(5);
  const allReviews = useMemo(
    () => getApprovedReviewsByProductId(productId, { offset: 0, limit: 100 }),
    [productId]
  );
  const visibleReviews = allReviews.slice(0, visibleCount);
  const hasMore = visibleCount < allReviews.length;

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

      <CollapsibleSection
        title="Customer Reviews"
        countLabel={reviewCount.toLocaleString()}
        defaultOpen={false}
      >
        {visibleReviews.length > 0 ? (
          <div className="review-list">
            {visibleReviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        ) : (
          <p className="review-empty">No published reviews yet.</p>
        )}

        {hasMore && (
          <button
            type="button"
            className="review-load-more"
            onClick={() => setVisibleCount((count) => count + 5)}
          >
            Load More Reviews
          </button>
        )}
      </CollapsibleSection>

      <style jsx>{`
        .product-details-sections {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 24px;
        }

        .review-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .review-empty {
          margin: 0;
          font-size: 14px;
          color: rgba(255, 255, 255, 0.55);
        }

        .review-load-more {
          margin-top: 12px;
          width: 100%;
          padding: 10px 14px;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.14);
          background: rgba(255, 255, 255, 0.05);
          color: #fff;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
        }

        .review-load-more:hover {
          border-color: rgba(230, 0, 0, 0.35);
          background: rgba(230, 0, 0, 0.08);
        }
      `}</style>
    </div>
  );
}
