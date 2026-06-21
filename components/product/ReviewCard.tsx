"use client";

import type { ProductReview } from "@/lib/reviews";
import { DEFAULT_AVATAR } from "@/lib/reviews";

type ReviewCardProps = {
  review: ProductReview;
};

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="review-card-stars" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <span key={index}>{index < rating ? "★" : "☆"}</span>
      ))}
    </span>
  );
}

function formatReviewDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export default function ReviewCard({ review }: ReviewCardProps) {
  const avatar = review.profileImage || DEFAULT_AVATAR;

  return (
    <article className="review-card">
      <div className="review-card-header">
        <img
          src={avatar}
          alt={`${review.reviewerName} profile`}
          className="review-card-avatar"
        />
        <div className="review-card-meta">
          <p className="review-card-name">{review.reviewerName}</p>
          <StarRating rating={review.rating} />
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

        .review-card-stars {
          display: inline-flex;
          gap: 1px;
          margin-top: 4px;
          color: #facc15;
          font-size: 13px;
        }

        .review-card-verified {
          display: block;
          margin-top: 4px;
          font-size: 11px;
          font-weight: 600;
          color: rgba(74, 222, 128, 0.9);
        }

        .review-card-date {
          display: block;
          margin-top: 4px;
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
