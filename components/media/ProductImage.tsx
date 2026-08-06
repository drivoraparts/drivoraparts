"use client";

import { useEffect, useRef, useState } from "react";
import {
  DEFAULT_PRODUCT_IMAGE,
  resolveProductImage,
} from "@/lib/inventory/media";
import {
  IMAGE_SIZES,
  nextImageFallback,
  optimizeImageUrl,
  type ImageProfile,
} from "@/lib/media/optimize-image";

type ProductImageProps = {
  src?: string | null;
  alt: string;
  profile?: ImageProfile;
  className?: string;
  loading?: "eager" | "lazy";
  fetchPriority?: "high" | "low" | "auto";
  sizes?: string;
};

export default function ProductImage({
  src,
  alt,
  profile = "card",
  className,
  loading = "lazy",
  fetchPriority,
  sizes,
}: ProductImageProps) {
  const resolved = resolveProductImage(src);
  const optimized = optimizeImageUrl(resolved, profile);
  const [currentSrc, setCurrentSrc] = useState(optimized);
  // Every URL attempted for the current `resolved` image, including the
  // starting one — this is what lets nextImageFallback guarantee it
  // terminates instead of cycling between two failing candidates forever.
  const triedRef = useRef<Set<string>>(new Set([optimized]));

  useEffect(() => {
    const next = optimizeImageUrl(resolved, profile);
    triedRef.current = new Set([next]);
    setCurrentSrc(next);
  }, [resolved, profile]);

  return (
    <img
      src={currentSrc}
      alt={alt}
      draggable={false}
      loading={loading}
      decoding="async"
      fetchPriority={fetchPriority}
      sizes={sizes ?? IMAGE_SIZES[profile]}
      onError={() => {
        const next = nextImageFallback(resolved, triedRef.current, profile);
        if (next) {
          triedRef.current.add(next);
          setCurrentSrc(next);
          return;
        }
        if (!triedRef.current.has(DEFAULT_PRODUCT_IMAGE)) {
          triedRef.current.add(DEFAULT_PRODUCT_IMAGE);
          setCurrentSrc(DEFAULT_PRODUCT_IMAGE);
        }
      }}
      className={className}
    />
  );
}
