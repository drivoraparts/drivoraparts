"use client";

import Price from "@/components/currency/Price";

type ProductPriceProps = {
  price: number;
  compareAtPrice?: number | null;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeClasses = {
  sm: {
    compare: "text-[10px] sm:text-[11px]",
    sale: "text-[10px] sm:text-[11px]",
  },
  md: {
    compare: "text-xs sm:text-sm",
    sale: "text-sm sm:text-base",
  },
  lg: {
    compare: "text-base sm:text-lg",
    sale: "text-xl sm:text-2xl",
  },
} as const;

/**
 * The struck-through figure is named, not left bare.
 *
 * It is the list price at the source the listing was read from -- the
 * manufacturer's where they publish one, otherwise the specialist's -- and
 * never a price DrivoraParts itself used to charge. An unlabelled strike
 * through implies the second, so the label says which it is. Listings with
 * no checkable source carry no compareAtPrice at all and render as a single
 * price (see applyPublicPrices).
 *
 * The short form is for cards, where the row shares a line with the price.
 */
export default function ProductPrice({
  price,
  compareAtPrice,
  size = "md",
  className = "",
}: ProductPriceProps) {
  const showCompare =
    compareAtPrice != null && compareAtPrice > price && compareAtPrice > 0;
  const sizes = sizeClasses[size];

  return (
    <span className={`inline-flex flex-wrap items-baseline gap-x-2 gap-y-0.5 ${className}`}>
      {showCompare ? (
        <span
          className={`inline-flex items-baseline gap-1 font-medium text-muted ${sizes.compare}`}
          aria-label={`List price ${compareAtPrice}`}
        >
          <span>{size === "sm" ? "List" : "List price"}</span>
          <span className="line-through decoration-muted/70">
            <Price usd={compareAtPrice} />
          </span>
        </span>
      ) : null}
      <span
        className={`font-bold text-accent ${sizes.sale}`}
        aria-label={`Our price ${price}`}
      >
        <Price usd={price} />
      </span>
    </span>
  );
}
