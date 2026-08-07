"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProductImage from "@/components/media/ProductImage";
import {
  COMPARE_CHANGE_EVENT,
  clearCompare,
  readCompareList,
  removeFromCompare,
  type CompareProduct,
} from "@/lib/compare";
import { routes } from "@/lib/inventory/routes";

export default function CompareBar() {
  const [items, setItems] = useState<CompareProduct[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setItems(readCompareList());

    const onChange = () => setItems(readCompareList());
    window.addEventListener(COMPARE_CHANGE_EVENT, onChange);
    return () => window.removeEventListener(COMPARE_CHANGE_EVENT, onChange);
  }, []);

  if (!mounted || items.length === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[9997] border-t border-neutral-300 bg-white/95 px-3 py-2.5 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] backdrop-blur-md sm:px-6">
      <div className="mx-auto flex max-w-[1200px] items-center gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto">
          {items.map((item) => (
            <div
              key={item.id}
              className="relative h-11 w-11 shrink-0 overflow-hidden rounded-md border border-neutral-300 bg-neutral-50"
            >
              <ProductImage
                src={item.thumbnail}
                alt={item.name}
                profile="grid"
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                aria-label={`Remove ${item.name} from compare`}
                onClick={() => removeFromCompare(item.id)}
                className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-neutral-900 text-[9px] text-white"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => clearCompare()}
          className="shrink-0 text-xs font-semibold text-neutral-500 transition-colors hover:text-neutral-800"
        >
          Clear
        </button>

        <Link
          href={routes.compare}
          prefetch={false}
          className="shrink-0 touch-manipulation rounded-lg bg-red-600 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white transition-colors hover:bg-red-700"
        >
          Compare ({items.length})
        </Link>
      </div>
    </div>
  );
}
