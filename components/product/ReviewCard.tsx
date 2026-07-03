"use client";

import { useState } from "react";
import type { ProductReview } from "@/lib/reviews";
import { VERIFIED_BADGE_GREEN } from "@/lib/reviews/constants";
import { directAssetUrl } from "@/lib/media/optimize-image";
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

function ReviewAvatar({ name, src }: { name: string; src?: string }) {
  const initials = getInitials(name);
  const [failed, setFailed] = useState(false);

  if (src && !failed) {
    return (
      <img
        src={directAssetUrl(src)}
        alt=""
        aria-hidden
        loading="lazy"
        decoding="async"
        className="review-card-avatar"
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <div className="review-card-avatar review-card-avatar-fallback" aria-hidden>
      {initials}
    </div>
  );
}

export default function ReviewCard({ review }: ReviewCardProps) {
  return (
    <article className="review-card">
      <div className="review-card-header">
        <ReviewAvatar name={review.reviewerName} src={review.profileImage} />
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
          border-radius: 6px;
          background: #ffffff;
          border: 1px solid #d1d5db;
        }

        .review-card-header {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .review-card-avatar {
          width: 32px;
          height: 32px;
          border-radius: 999px;
          object-fit: cover;
          border: 1px solid #e5e7eb;
          background: #f3f4f6;
          flex-shrink: 0;
          pointer-events: none;
          user-select: none;
        }

        .review-card-avatar-fallback {
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 700;
          color: #374151;
        }

        .review-card-meta {
          min-width: 0;
        }

        .review-card-name {
          margin: 0;
          font-size: 13px;
          font-weight: 600;
          color: #111827;
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
          background: rgba(34, 197, 94, 0.12);
          border: 1px solid rgba(34, 197, 94, 0.28);
        }

        .review-card-date {
          display: block;
          margin-top: 6px;
          font-size: 11px;
          color: #6b7280;
        }

        .review-card-content {
          margin: 12px 0 0;
          font-size: 14px;
          line-height: 1.6;
          color: #374151;
        }
      `}</style>
    </article>
  );
}
