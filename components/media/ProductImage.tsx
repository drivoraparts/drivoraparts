"use client";

import { useEffect, useState } from "react";
import {
  DEFAULT_PRODUCT_IMAGE,
  resolveProductImage,
} from "@/lib/inventory/media";
import {
  encodeAssetPath,
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

  useEffect(() => {
    setCurrentSrc(optimizeImageUrl(resolved, profile));
  }, [resolved, profile]);

  return (
    <img
      src={currentSrc}
      alt={alt}
      loading={loading}
      decoding="async"
      fetchPriority={fetchPriority}
      sizes={sizes ?? IMAGE_SIZES[profile]}
      onError={() => {
        const next = nextImageFallback(resolved, currentSrc, profile);
        if (next) {
          setCurrentSrc(next);
          return;
        }
        if (currentSrc !== DEFAULT_PRODUCT_IMAGE) {
          setCurrentSrc(DEFAULT_PRODUCT_IMAGE);
        }
      }}
      className={className}
    />
  );
}
