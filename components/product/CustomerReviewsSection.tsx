"use client";

import { useEffect, useState } from "react";
import {
  getApprovedReviewsByProductId,
  type ProductReview,
} from "@/lib/reviews";
import ReviewCard from "./ReviewCard";
import ReviewWriteForm from "./ReviewWriteForm";
import StarRating from "./StarRating";
import { glassCard } from "./styles";

type CustomerReviewsSectionProps = {
  productId: number;
  rating: number;
  reviewCount: number;
};

export default function CustomerReviewsSection({
  productId,
  rating,
  reviewCount,
}: CustomerReviewsSectionProps) {
  const [expanded, setExpanded] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [visibleCount, setVisibleCount] = useState(5);
  const [reviews, setReviews] = useState<ProductReview[]>([]);

  useEffect(() => {
    if (!expanded || loaded) return;

    const timer = window.setTimeout(() => {
      setReviews(
        getApprovedReviewsByProductId(productId, { offset: 0, limit: 100 })
      );
      setLoaded(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [expanded, loaded, productId]);

  const visibleReviews = reviews.slice(0, visibleCount);
  const hasMore = visibleCount < reviews.length;

  const handleReviewSubmitted = (review: ProductReview) => {
    setReviews((current) => [review, ...current]);
    setLoaded(true);
  };

  return (
    <section style={{ ...glassCard, padding: "14px" }}>
      <button
        type="button"
        className="reviews-toggle"
        aria-expanded={expanded}
        onClick={() => setExpanded((value) => !value)}
      >
        <span className="reviews-toggle-title">
          {expanded ? "▼" : "▶"} Customer Reviews ({reviewCount.toLocaleString()})
        </span>
        {!expanded && (
          <span className="reviews-toggle-summary">
            <StarRating rating={rating} size="sm" showNumeric />
          </span>
        )}
      </button>

      {expanded && (
        <div className="reviews-panel">
          <div className="reviews-summary">
            <StarRating rating={rating} showNumeric />
            <span className="reviews-summary-count">
              {reviewCount.toLocaleString()} Reviews
            </span>
          </div>

          <ReviewWriteForm
            productId={productId}
            onSubmitted={handleReviewSubmitted}
          />

          {loaded ? (
            visibleReviews.length > 0 ? (
              <div className="review-list">
                {visibleReviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
            ) : (
              <p className="review-empty">No published reviews yet.</p>
            )
          ) : (
            <p className="review-loading">Loading reviews...</p>
          )}

          {loaded && hasMore && (
            <button
              type="button"
              className="review-load-more"
              onClick={() => setVisibleCount((count) => count + 5)}
            >
              Load More Reviews
            </button>
          )}
        </div>
      )}

      <style jsx>{`
        .reviews-toggle {
          width: 100%;
          padding: 0;
          border: none;
          background: none;
          color: #fff;
          text-align: left;
          cursor: pointer;
        }

        .reviews-toggle-title {
          display: block;
          font-size: 16px;
          font-weight: 700;
        }

        .reviews-toggle-summary {
          display: block;
          margin-top: 8px;
        }

        .reviews-panel {
          margin-top: 14px;
        }

        .reviews-summary {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 14px;
          padding-bottom: 12px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .reviews-summary-count {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.72);
          font-weight: 600;
        }

        .review-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .review-empty,
        .review-loading {
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
    </section>
  );
}
