"use client";

import { useEffect, useState } from "react";
import { DEFAULT_AVATAR } from "@/lib/reviews/constants-avatar";
import { VERIFIED_BADGE_GREEN } from "@/lib/reviews/constants";
import ReviewAvatar from "./ReviewAvatar";
import StarRating from "./StarRating";

type ProductRatingSummaryProps = {
  productId: number;
  rating: number;
  reviewCount: number;
  theme?: "dark" | "pro";
};

export default function ProductRatingSummary({
  productId,
  rating,
  reviewCount,
  theme = "dark",
}: ProductRatingSummaryProps) {
  const [avatars, setAvatars] = useState<string[]>([]);
  const hasReviews = reviewCount > 0;
  const isPro = theme === "pro";

  useEffect(() => {
    if (!hasReviews) {
      setAvatars([]);
      return;
    }

    // Derived from the API rather than the review store: importing the store
    // into a client component ships a browser-side copy of it, which knows
    // nothing about what the server actually holds.
    let active = true;

    (async () => {
      try {
        const res = await fetch(
          `/api/reviews?product_id=${productId}&limit=20&offset=0`,
          { cache: "no-store" }
        );
        if (!res.ok || !active) return;

        const data = (await res.json()) as {
          reviews?: { verifiedPurchase?: boolean; profileImage?: string }[];
        };
        if (!active) return;

        const seen = new Set<string>();
        const next: string[] = [];
        for (const review of data.reviews ?? []) {
          if (!review.verifiedPurchase) continue;
          const avatar = review.profileImage || DEFAULT_AVATAR;
          if (seen.has(avatar)) continue;
          seen.add(avatar);
          next.push(avatar);
          if (next.length >= 4) break;
        }
        setAvatars(next);
      } catch {
        // No avatars is a fine outcome — the rating itself still renders.
      }
    })();

    return () => {
      active = false;
    };
  }, [productId, hasReviews]);

  if (!hasReviews) {
    return (
      <div className={`product-rating-summary product-rating-summary--empty ${isPro ? "product-rating-summary-pro" : ""}`}>
        <p className="product-rating-empty">No reviews yet</p>
        <p className="product-rating-cta">Be the first to review this product</p>

        <style jsx>{`
          .product-rating-summary {
            margin: 0 0 12px;
            padding: 12px 14px;
            border-radius: 10px;
            background: rgba(255, 255, 255, 0.04);
            border: 1px solid rgba(255, 255, 255, 0.08);
          }

          .product-rating-summary-pro {
            margin: 8px 0 0;
            padding: 0;
            border: none;
            background: transparent;
            border-radius: 0;
          }

          .product-rating-empty {
            margin: 0;
            font-size: 14px;
            font-weight: 700;
            color: rgba(255, 255, 255, 0.82);
          }

          .product-rating-summary-pro .product-rating-empty {
            color: var(--foreground);
            font-size: 13px;
            font-weight: 600;
          }

          .product-rating-cta {
            margin: 6px 0 0;
            font-size: 13px;
            color: rgba(255, 255, 255, 0.55);
          }

          .product-rating-summary-pro .product-rating-cta {
            color: var(--muted-foreground);
            font-size: 12px;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div
      className={`product-rating-summary ${isPro ? "product-rating-summary-pro" : ""}`}
      aria-label={`Rated ${rating} out of 5 from ${reviewCount} reviews`}
    >
      <StarRating rating={rating} showNumeric />
      <p className="product-rating-count">
        {reviewCount.toLocaleString()} Reviews
      </p>

      {avatars.length > 0 && (
        <div className="verified-buyers-strip">
          <div className="verified-buyers-avatars" aria-hidden>
            {avatars.map((avatar, index) => (
              <ReviewAvatar
                key={`${avatar}-${index}`}
                name={`Buyer ${index + 1}`}
                src={avatar}
                size="xs"
                className={index === 0 ? "" : "-ml-2 ring-2 ring-white"}
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

        .product-rating-summary-pro {
          margin: 8px 0 0;
          padding: 0;
          border: none;
          background: transparent;
          border-radius: 0;
        }

        .product-rating-count {
          margin: 8px 0 0;
          font-size: 13px;
          color: rgba(255, 255, 255, 0.82);
          font-weight: 600;
        }

        .product-rating-summary-pro .product-rating-count {
          color: var(--foreground);
        }

        .verified-buyers-strip {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 10px;
          padding-top: 10px;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
        }

        .product-rating-summary-pro .verified-buyers-strip {
          border-top-color: var(--border);
        }

        .verified-buyers-avatars {
          display: flex;
          align-items: center;
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
