"use client";

import type { ProductReview } from "@/lib/reviews";
import { VERIFIED_BADGE_GREEN } from "@/lib/reviews/constants";
import StarRating from "./StarRating";

type ReviewCardProps = {
  review: ProductReview;
};

function formatReviewDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export default function ReviewCard({ review }: ReviewCardProps) {
  const avatar = review.profileImage;
  const initials = getInitials(review.reviewerName);

  return (
    <article className="review-card">
      <div className="review-card-header">
        {avatar ? (
          <img
            src={avatar}
            alt=""
            aria-hidden
            className="review-card-avatar"
          />
        ) : (
          <div className="review-card-avatar review-card-avatar-fallback" aria-hidden>
            {initials}
          </div>
        )}
        <div className="review-card-meta">
          <p className="review-card-name">{review.reviewerName}</p>
          <StarRating rating={review.rating} size="sm" />
          {review.verifiedPurchase && (
            <span className="review-card-verified">✓ Verified Purchase</span>
          )}
          <time className="review-card-date" dateTime={review.createdAt}>
            {formatReviewDate(review.createdAt)}
          </time>
        </div>
      </div>
      <p className="review-card-content">{review.review}</p>

      <style jsx>{`
        .review-card {
          padding: 14px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .review-card-header {
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }

        .review-card-avatar {
          width: 44px;
          height: 44px;
          border-radius: 999px;
          object-fit: cover;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(255, 255, 255, 0.06);
          flex-shrink: 0;
          pointer-events: none;
          user-select: none;
        }

        .review-card-avatar-fallback {
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 700;
          color: rgba(255, 255, 255, 0.82);
        }

        .review-card-meta {
          min-width: 0;
        }

        .review-card-name {
          margin: 0;
          font-size: 14px;
          font-weight: 700;
          color: #fff;
        }

        .review-card-meta :global(.star-rating) {
          margin-top: 4px;
        }

        .review-card-verified {
          display: inline-block;
          margin-top: 6px;
          padding: 2px 8px;
          border-radius: 999px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.04em;
          color: ${VERIFIED_BADGE_GREEN};
          background: rgba(34, 197, 94, 0.1);
          border: 1px solid rgba(34, 197, 94, 0.25);
        }

        .review-card-date {
          display: block;
          margin-top: 6px;
          font-size: 11px;
          color: rgba(255, 255, 255, 0.45);
        }

        .review-card-content {
          margin: 12px 0 0;
          font-size: 14px;
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.78);
        }
      `}</style>
    </article>
  );
}
