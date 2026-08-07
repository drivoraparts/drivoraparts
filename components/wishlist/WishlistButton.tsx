"use client";

import { useEffect, useState } from "react";
import {
  WISHLIST_CHANGE_EVENT,
  isWishlisted,
  toggleWishlist,
  type WishlistProduct,
} from "@/lib/wishlist";

export default function WishlistButton({
  product,
  size = "md",
  showLabel = false,
  className = "",
}: {
  product: WishlistProduct;
  size?: "sm" | "md";
  showLabel?: boolean;
  className?: string;
}) {
  const [active, setActive] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setActive(isWishlisted(product.id));

    const onChange = () => setActive(isWishlisted(product.id));
    window.addEventListener(WISHLIST_CHANGE_EVENT, onChange);
    return () => window.removeEventListener(WISHLIST_CHANGE_EVENT, onChange);
  }, [product.id]);

  const dims = size === "sm" ? "h-7 w-7" : "h-9 w-9";
  const iconDims = size === "sm" ? "h-3.5 w-3.5" : "h-4.5 w-4.5";

  if (showLabel) {
    return (
      <button
        type="button"
        aria-pressed={mounted ? active : undefined}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setActive(toggleWishlist(product));
        }}
        className={`flex items-center justify-center gap-2 border text-xs font-bold uppercase tracking-wide transition-colors ${
          mounted && active
            ? "border-red-600 bg-red-600 text-white"
            : "border-neutral-300 bg-white text-neutral-700 hover:border-red-400 hover:text-red-600"
        } ${className}`}
      >
        <svg
          viewBox="0 0 24 24"
          fill={mounted && active ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth={1.8}
          className="h-4 w-4 shrink-0"
          aria-hidden
        >
          <path d="M12 21s-7.5-4.6-10-9.2C0.3 8.1 2 4.5 5.6 4.5c2 0 3.5 1.1 4.4 2.6.9-1.5 2.4-2.6 4.4-2.6 3.6 0 5.3 3.6 3.6 7.3-2.5 4.6-10 9.2-10 9.2z" />
        </svg>
        {mounted && active ? "Wishlisted" : "Wishlist"}
      </button>
    );
  }

  return (
    <button
      type="button"
      aria-label={active ? "Remove from wishlist" : "Add to wishlist"}
      aria-pressed={mounted ? active : undefined}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        setActive(toggleWishlist(product));
      }}
      className={`flex ${dims} shrink-0 items-center justify-center rounded-full border transition-colors ${
        mounted && active
          ? "border-red-600 bg-red-600 text-white"
          : "border-neutral-300 bg-white/90 text-neutral-700 hover:border-red-400 hover:text-red-600"
      } ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        fill={mounted && active ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={1.8}
        className={iconDims}
        aria-hidden
      >
        <path d="M12 21s-7.5-4.6-10-9.2C0.3 8.1 2 4.5 5.6 4.5c2 0 3.5 1.1 4.4 2.6.9-1.5 2.4-2.6 4.4-2.6 3.6 0 5.3 3.6 3.6 7.3-2.5 4.6-10 9.2-10 9.2z" />
      </svg>
    </button>
  );
}
