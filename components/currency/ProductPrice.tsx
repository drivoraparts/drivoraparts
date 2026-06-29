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
          className={`font-medium text-gray-400 line-through decoration-gray-500/80 ${sizes.compare}`}
          aria-label={`Competitor price ${compareAtPrice}`}
        >
          <Price usd={compareAtPrice} />
        </span>
      ) : null}
      <span
        className={`font-bold text-red-500 ${sizes.sale}`}
        aria-label={`Our price ${price}`}
      >
        <Price usd={price} />
      </span>
    </span>
  );
}
