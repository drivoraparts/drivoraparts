"use client";

import { STAR_EMPTY, STAR_GOLD } from "@/lib/reviews/constants";

type StarRatingProps = {
  rating: number;
  size?: "sm" | "md";
  showNumeric?: boolean;
  className?: string;
};

export default function StarRating({
  rating,
  size = "md",
  showNumeric = false,
  className = "",
}: StarRatingProps) {
  const filledCount = Math.round(Math.min(5, Math.max(0, rating)));

  return (
    <span
      className={`star-rating ${className}`.trim()}
      aria-label={`Rated ${rating.toFixed(1)} out of 5`}
    >
      <span className="star-rating-icons" aria-hidden>
        {Array.from({ length: 5 }).map((_, index) => (
          <span
            key={index}
            className={index < filledCount ? "star-filled" : "star-empty"}
          >
            ★
          </span>
        ))}
      </span>
      {showNumeric && (
        <span className="star-rating-value">{rating.toFixed(1)}</span>
      )}

      <style jsx>{`
        .star-rating {
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .star-rating-icons {
          display: inline-flex;
          gap: 1px;
          line-height: 1;
          font-size: ${size === "sm" ? "13px" : "15px"};
        }

        .star-filled {
          color: ${STAR_GOLD};
        }

        .star-empty {
          color: ${STAR_EMPTY};
        }

        .star-rating-value {
          font-size: ${size === "sm" ? "13px" : "15px"};
          font-weight: 700;
          color: #fff;
        }
      `}</style>
    </span>
  );
}
