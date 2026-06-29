"use client";

import { useEffect, useState } from "react";
import { resolveProductImage } from "@/lib/inventory/media";
import {
  IMAGE_SIZES,
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
  const original = resolveProductImage(src);
  const optimized = optimizeImageUrl(original, profile);
  const [currentSrc, setCurrentSrc] = useState(optimized);

  useEffect(() => {
    setCurrentSrc(optimizeImageUrl(original, profile));
  }, [original, profile]);

  return (
    <img
      src={currentSrc}
      alt={alt}
      loading={loading}
      decoding="async"
      fetchPriority={fetchPriority}
      sizes={sizes ?? IMAGE_SIZES[profile]}
      onError={() => {
        if (currentSrc !== original) {
          setCurrentSrc(original);
        }
      }}
      className={className}
    />
  );
}
