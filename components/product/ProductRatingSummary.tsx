"use client";

type ProductRatingSummaryProps = {
  rating: number;
  reviewCount: number;
};

function StarRow({ rating }: { rating: number }) {
  return (
    <span className="product-rating-stars" aria-hidden>
      {Array.from({ length: 5 }).map((_, index) => (
        <span
          key={index}
          className={index < Math.round(rating) ? "star-filled" : "star-empty"}
        >
          ★
        </span>
      ))}
    </span>
  );
}

export default function ProductRatingSummary({
  rating,
  reviewCount,
}: ProductRatingSummaryProps) {
  return (
    <div className="product-rating-summary" aria-label={`Rated ${rating} out of 5`}>
      <div className="product-rating-row">
        <StarRow rating={rating} />
        <span className="product-rating-value">{rating.toFixed(1)}</span>
      </div>
      <p className="product-rating-count">
        {reviewCount.toLocaleString()} Reviews
      </p>
      <p className="product-rating-verified">Verified Buyers</p>

      <style jsx>{`
        .product-rating-summary {
          margin: 0 0 12px;
          padding: 12px 14px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .product-rating-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .product-rating-stars {
          display: inline-flex;
          gap: 2px;
          font-size: 15px;
          line-height: 1;
        }

        .product-rating-stars :global(.star-filled) {
          color: #facc15;
        }

        .product-rating-stars :global(.star-empty) {
          color: rgba(255, 255, 255, 0.18);
        }

        .product-rating-value {
          font-size: 15px;
          font-weight: 700;
          color: #fff;
        }

        .product-rating-count {
          margin: 6px 0 0;
          font-size: 13px;
          color: rgba(255, 255, 255, 0.82);
          font-weight: 600;
        }

        .product-rating-verified {
          margin: 4px 0 0;
          font-size: 11px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(74, 222, 128, 0.88);
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}
