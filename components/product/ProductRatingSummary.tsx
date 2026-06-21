"use client";

import { useEffect, useState } from "react";
import { DEFAULT_AVATAR, getVerifiedBuyerAvatars } from "@/lib/reviews";
import { VERIFIED_BADGE_GREEN } from "@/lib/reviews/constants";
import StarRating from "./StarRating";

type ProductRatingSummaryProps = {
  productId: number;
  rating: number;
  reviewCount: number;
};

export default function ProductRatingSummary({
  productId,
  rating,
  reviewCount,
}: ProductRatingSummaryProps) {
  const [avatars, setAvatars] = useState<string[]>([]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const buyerAvatars = getVerifiedBuyerAvatars(productId, 4);
      if (buyerAvatars.length > 0) {
        setAvatars(buyerAvatars);
        return;
      }

      if (reviewCount > 0) {
        setAvatars(Array.from({ length: 4 }, () => DEFAULT_AVATAR));
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, [productId, reviewCount]);

  return (
    <div className="product-rating-summary" aria-label={`Rated ${rating} out of 5`}>
      <StarRating rating={rating} showNumeric />
      <p className="product-rating-count">
        {reviewCount.toLocaleString()} Reviews
      </p>

      {avatars.length > 0 && (
        <div className="verified-buyers-strip">
          <div className="verified-buyers-avatars" aria-hidden>
            {avatars.map((avatar, index) => (
              <img
                key={`${avatar}-${index}`}
                src={avatar}
                alt=""
                className="verified-buyer-avatar"
                style={{ marginLeft: index === 0 ? 0 : -8 }}
              />
            ))}
          </div>
          <span className="product-rating-verified">✓ Verified Buyers</span>
        </div>
      )}

      <style jsx>{`
        .product-rating-summary {
          margin: 0 0 12px;
          padding: 12px 14px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .product-rating-count {
          margin: 8px 0 0;
          font-size: 13px;
          color: rgba(255, 255, 255, 0.82);
          font-weight: 600;
        }

        .verified-buyers-strip {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 10px;
          padding-top: 10px;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
        }

        .verified-buyers-avatars {
          display: flex;
          align-items: center;
        }

        .verified-buyer-avatar {
          width: 28px;
          height: 28px;
          border-radius: 999px;
          object-fit: cover;
          border: 2px solid rgba(17, 17, 17, 0.95);
          background: rgba(255, 255, 255, 0.06);
          pointer-events: none;
          user-select: none;
        }

        .product-rating-verified {
          font-size: 11px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: ${VERIFIED_BADGE_GREEN};
          font-weight: 700;
        }
      `}</style>
    </div>
  );
}
