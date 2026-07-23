"use client";

import { useEffect, useState, type RefObject } from "react";
import AddToCartButton, {
  type AddToCartProduct,
} from "@/app/components/AddToCartButton";
import BuyNowButton from "@/app/components/BuyNowButton";

type StickyPurchaseBarProps = {
  ctaRef: RefObject<HTMLElement | null>;
  product: AddToCartProduct;
  quantity: number;
  inStock: boolean;
};

export default function StickyPurchaseBar({
  ctaRef,
  product,
  quantity,
  inStock,
}: StickyPurchaseBarProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const target = ctaRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0, rootMargin: "0px 0px -8px 0px" }
    );

    observer.observe(target);

    return () => observer.disconnect();
  }, [ctaRef]);

  if (!visible || !inStock) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[9998] border-t border-neutral-300 bg-white/95 px-4 py-3 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] backdrop-blur-md">
      <div className="mx-auto flex max-w-[1200px] items-center gap-3 md:justify-end">
        <AddToCartButton
          product={product}
          quantity={quantity}
          className="!flex-1 !rounded-none !border-2 !border-red-600 !bg-white !px-4 !py-3 !text-xs !font-black !uppercase !tracking-[0.1em] !text-neutral-900 hover:!bg-red-50 md:!flex-none md:!min-w-[180px]"
        />
        <BuyNowButton
          product={product}
          quantity={quantity}
          className="!mt-0 !flex-1 !rounded-none !border !border-neutral-900 !bg-neutral-900 !px-4 !py-3 !text-xs !font-bold !uppercase !tracking-[0.1em] !text-white hover:!bg-neutral-800 md:!flex-none md:!min-w-[180px]"
        />
      </div>
    </div>
  );
}
