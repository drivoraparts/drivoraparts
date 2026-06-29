"use client";

import { useEffect, useState, type RefObject } from "react";
import AddToCartButton, {
  type AddToCartProduct,
} from "@/app/components/AddToCartButton";
import ProductPrice from "@/components/currency/ProductPrice";

type MobileStickyAddToCartProps = {
  ctaRef: RefObject<HTMLElement | null>;
  product: AddToCartProduct;
  price: number;
  compareAtPrice?: number;
  quantity: number;
  inStock: boolean;
};

export default function MobileStickyAddToCart({
  ctaRef,
  product,
  price,
  compareAtPrice,
  quantity,
  inStock,
}: MobileStickyAddToCartProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const target = ctaRef.current;
    if (!target) return;

    const media = window.matchMedia("(max-width: 767px)");

    const updateVisibility = (isIntersecting: boolean) => {
      if (!media.matches) {
        setVisible(false);
        return;
      }
      setVisible(!isIntersecting);
    };

    const observer = new IntersectionObserver(
      ([entry]) => updateVisibility(entry.isIntersecting),
      { threshold: 0, rootMargin: "0px 0px -8px 0px" }
    );

    observer.observe(target);

    const onMediaChange = () => {
      if (!media.matches) setVisible(false);
    };

    media.addEventListener("change", onMediaChange);

    return () => {
      observer.disconnect();
      media.removeEventListener("change", onMediaChange);
    };
  }, [ctaRef]);

  if (!visible || !inStock) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[9998] border-t border-neutral-200 bg-white/95 px-4 py-3 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] backdrop-blur-md md:hidden">
      <div className="mx-auto flex max-w-[1200px] items-center gap-3">
        <div className="min-w-0 flex-1">
          <ProductPrice
            price={price}
            compareAtPrice={compareAtPrice}
            size="sm"
            className="[&_span:last-child]:text-lg [&_span:last-child]:font-black"
          />
        </div>
        <AddToCartButton
          product={product}
          quantity={quantity}
          className="!w-auto !min-w-[148px] !rounded-none !border-2 !border-red-600 !bg-white !px-4 !py-3 !text-xs !font-black !uppercase !tracking-[0.1em] !text-neutral-900 hover:!bg-red-50"
        />
      </div>
    </div>
  );
}
