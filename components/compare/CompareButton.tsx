"use client";

import { useEffect, useState } from "react";
import {
  COMPARE_CHANGE_EVENT,
  COMPARE_MAX_ITEMS,
  isComparing,
  toggleCompare,
  type CompareProduct,
} from "@/lib/compare";
import { showToast } from "@/lib/store/toastStore";

export default function CompareButton({
  product,
  className = "",
}: {
  product: CompareProduct;
  className?: string;
}) {
  const [active, setActive] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setActive(isComparing(product.id));

    const onChange = () => setActive(isComparing(product.id));
    window.addEventListener(COMPARE_CHANGE_EVENT, onChange);
    return () => window.removeEventListener(COMPARE_CHANGE_EVENT, onChange);
  }, [product.id]);

  return (
    <button
      type="button"
      aria-pressed={mounted ? active : undefined}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        const result = toggleCompare(product);
        if (result.atLimit) {
          showToast(`You can compare up to ${COMPARE_MAX_ITEMS} products at a time.`);
          return;
        }
        setActive(result.added);
      }}
      className={`flex items-center gap-1.5 rounded-md border px-2 py-1 text-[10px] font-bold uppercase tracking-wide transition-colors sm:text-[11px] ${
        mounted && active
          ? "border-red-600 bg-red-600 text-white"
          : "border-neutral-300 bg-white/90 text-neutral-700 hover:border-red-400 hover:text-red-600"
      } ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        className="h-3 w-3 shrink-0"
        aria-hidden
      >
        {mounted && active ? (
          <path d="M20 6L9 17l-5-5" />
        ) : (
          <rect x="3" y="3" width="18" height="18" rx="3" />
        )}
      </svg>
      Compare
    </button>
  );
}
