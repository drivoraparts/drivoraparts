"use client";

import { useEffect, useState } from "react";
import type { ProductReview } from "@/lib/reviews";
import ReviewCard from "./ReviewCard";
import StarRating from "./StarRating";
import { proSurfaceCard } from "./styles";

type CustomerReviewsSectionProps = {
  productId: number;
  rating: number;
  reviewCount: number;
};

export default function CustomerReviewsSection({
  productId,
  rating: initialRating,
  reviewCount: initialReviewCount,
}: CustomerReviewsSectionProps) {
  const [expanded, setExpanded] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [visibleCount, setVisibleCount] = useState(5);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [reviewCount, setReviewCount] = useState(initialReviewCount);
  const [rating, setRating] = useState(initialRating);
  const hasReviews = reviewCount > 0;

  useEffect(() => {
    setReviewCount(initialReviewCount);
    setRating(initialRating);
  }, [initialReviewCount, initialRating]);

  /*
   * Fetched from the API, not imported from the review store.
   *
   * This component previously called the store directly. Being a client
   * component, that bundled a browser-side copy of it — so it read an empty
   * array that had nothing to do with the server's data, and a submitted
   * review lived only in the tab that submitted it.
   */
  useEffect(() => {
    if (!expanded || loaded) return;

    let active = true;

    (async () => {
      try {
        const res = await fetch(
          `/api/reviews?product_id=${productId}&limit=100&offset=0`,
          { cache: "no-store" }
        );
        if (!res.ok || !active) return;

        const data = (await res.json()) as {
          reviews?: ProductReview[];
          summary?: { average?: number; count?: number };
        };
        if (!active) return;

        setReviews(data.reviews ?? []);
        if (typeof data.summary?.count === "number") {
          setReviewCount(data.summary.count);
        }
        if (typeof data.summary?.average === "number") {
          setRating(data.summary.average);
        }
      } catch {
        // Leave the section on its initial figures rather than blanking it.
      } finally {
        if (active) setLoaded(true);
      }
    })();

    return () => {
      active = false;
    };
  }, [expanded, loaded, productId]);

  const visibleReviews = reviews.slice(0, visibleCount);
  const hasMore = visibleCount < reviews.length;

  const sectionTitle = hasReviews
    ? `Customer Reviews (${reviewCount.toLocaleString()})`
    : "Customer Reviews";

  /*
   * Reviews are display-only for now: there is no way to leave one, so a
   * product with none has nothing to say here and the section is omitted
   * rather than showing a permanent "No reviews yet". The count comes from
   * the server, so this is decided before first paint and does not flicker.
   *
   * This is deliberately a render guard, not a deletion. ReviewWriteForm, the
   * store and the POST handler are all still in the tree so the feature can
   * be switched back on once there is a customer base to write them.
   */
  if (!initialReviewCount) return null;

  return (
    <section style={{ ...proSurfaceCard, padding: "14px" }}>
      <button
        type="button"
        className="reviews-toggle"
        aria-expanded={expanded}
        onClick={() => setExpanded((value) => !value)}
      >
        <span className="reviews-toggle-title">
          {expanded ? "▼" : "▶"} {sectionTitle}
        </span>
        {!expanded && hasReviews && (
          <span className="reviews-toggle-summary">
            <StarRating rating={rating} size="sm" showNumeric />
          </span>
        )}
        {!expanded && !hasReviews && (
          <span className="reviews-toggle-empty">No reviews yet</span>
        )}
      </button>

      {expanded && (
        <div className="reviews-panel">
          {hasReviews ? (
            <div className="reviews-summary">
              <StarRating rating={rating} showNumeric />
              <span className="reviews-summary-count">
                {reviewCount.toLocaleString()} Reviews
              </span>
            </div>
          ) : (
            <p className="review-empty">No reviews yet.</p>
          )}

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
          color: var(--foreground);
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

        .reviews-toggle-empty {
          display: block;
          margin-top: 8px;
          font-size: 13px;
          color: var(--muted);
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
          border-bottom: 1px solid var(--border-strong);
        }

        .reviews-summary-count {
          font-size: 13px;
          color: var(--foreground);
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
          color: var(--muted);
        }

        .review-load-more {
          margin-top: 12px;
          width: 100%;
          padding: 10px 14px;
          border-radius: 6px;
          border: 1px solid var(--border-strong);
          background: var(--surface);
          color: var(--foreground);
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
        }

        .review-load-more:hover {
          border-color: var(--error);
          background: var(--error-subtle);
        }
      `}</style>
    </section>
  );
}
