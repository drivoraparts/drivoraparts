"use client";

import type { ProductReview } from "@/lib/reviews";
import { VERIFIED_BADGE_GREEN } from "@/lib/reviews/constants";
import { describeAnswers, INSTALLED_BY_OPTIONS } from "@/lib/reviews/questions";
import ReviewAvatar from "./ReviewAvatar";
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

export default function ReviewCard({ review }: ReviewCardProps) {
  // The structured answers the reviewer gave: fit, install, condition.
  const facts = [
    ...(review.vehicle ? [{ label: "Vehicle", value: review.vehicle }] : []),
    ...(review.installedBy
      ? [{
          label: "Installed by",
          value: INSTALLED_BY_OPTIONS.find((o) => o.value === review.installedBy)?.label ?? review.installedBy,
        }]
      : []),
    ...describeAnswers(review.answersSchema, review.answers),
    ...(review.wouldBuyAgain == null
      ? []
      : [{ label: "Would buy again", value: review.wouldBuyAgain ? "Yes" : "No" }]),
  ];

  return (
    <article className="review-card">
      <div className="review-card-header">
        <ReviewAvatar
          name={review.reviewerName}
          src={review.profileImage}
          size="md"
        />
        <div className="review-card-meta">
          <p className="review-card-name">{review.reviewerName}</p>
          <StarRating rating={review.rating} size="sm" />
          {review.verifiedPurchase && (
            <span
              className="review-card-verified"
              title={
                review.verificationMethod === "signed_link"
                  ? "Submitted through a review link emailed to the address on the order after delivery."
                  : "Matched to a completed order."
              }
            >
              ✓ Verified Buyer
            </span>
          )}
          <time className="review-card-date" dateTime={review.createdAt}>
            {formatReviewDate(review.createdAt)}
          </time>
        </div>
      </div>

      <p className="review-card-content">{review.review}</p>

      {facts.length > 0 ? (
        <dl className="review-card-facts">
          {facts.map((fact) => (
            <div key={fact.label} className="review-card-fact">
              <dt>{fact.label}</dt>
              <dd>{fact.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      <style jsx>{`
        .review-card {
          padding: 14px;
          border-radius: 6px;
          background: var(--surface);
          border: 1px solid var(--border-strong);
        }

        .review-card-header {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .review-card-meta {
          min-width: 0;
        }

        .review-card-name {
          margin: 0;
          font-size: 13px;
          font-weight: 600;
          color: var(--foreground);
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
          color: var(--muted);
        }

        .review-card-facts {
          margin: 12px 0 0;
          display: grid;
          gap: 4px;
          font-size: 12px;
        }

        .review-card-fact {
          display: flex;
          flex-wrap: wrap;
          gap: 4px 8px;
        }

        .review-card-fact dt {
          color: var(--muted);
        }

        .review-card-fact dt::after {
          content: ":";
        }

        .review-card-fact dd {
          margin: 0;
          font-weight: 600;
          color: var(--foreground);
        }

        .review-card-content {
          margin: 12px 0 0;
          font-size: 14px;
          line-height: 1.6;
          color: var(--foreground);
        }
      `}</style>
    </article>
  );
}
