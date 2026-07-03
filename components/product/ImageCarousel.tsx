"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DEFAULT_PRODUCT_IMAGE,
  resolveProductGallery,
  resolveProductImage,
} from "@/lib/inventory/media";
import {
  nextImageFallback,
  optimizeImageUrl,
  type ImageProfile,
} from "@/lib/media/optimize-image";

type ManualImageGalleryProps = {
  images: string[];
  alt: string;
  thumbnail?: string;
  variant?: "detail" | "card";
  surface?: "dark" | "light";
};

function GalleryImage({
  src,
  alt,
  loading,
  fetchPriority,
  fallbacks = [],
  profile = "card",
}: {
  src: string;
  alt: string;
  loading?: "eager" | "lazy";
  fetchPriority?: "high" | "low" | "auto";
  fallbacks?: string[];
  profile?: ImageProfile;
}) {
  const candidates = useMemo(
    () =>
      [src, ...fallbacks]
        .map((value) => value?.trim())
        .filter(Boolean) as string[],
    [src, fallbacks]
  );
  const [index, setIndex] = useState(0);
  const [useDefault, setUseDefault] = useState(false);

  useEffect(() => {
    setIndex(0);
    setUseDefault(false);
  }, [src, fallbacks]);

  const resolvedSrc = useDefault
    ? DEFAULT_PRODUCT_IMAGE
    : resolveProductImage(candidates[index] ?? src);
  const optimizedSrc = optimizeImageUrl(resolvedSrc, profile);
  const [currentSrc, setCurrentSrc] = useState(optimizedSrc);

  useEffect(() => {
    setCurrentSrc(optimizeImageUrl(resolvedSrc, profile));
  }, [resolvedSrc, profile]);

  return (
    <img
      src={currentSrc}
      alt={alt}
      draggable={false}
      loading={loading}
      decoding="async"
      fetchPriority={fetchPriority}
      sizes={
        profile === "detail"
          ? "(max-width: 768px) 100vw, 520px"
          : "(max-width: 640px) 50vw, 320px"
      }
      onError={() => {
        const next = nextImageFallback(resolvedSrc, currentSrc, profile);
        if (next) {
          setCurrentSrc(next);
          return;
        }
        if (index < candidates.length - 1) {
          setIndex((current) => current + 1);
          return;
        }
        setUseDefault(true);
      }}
      className="h-full w-full select-none object-cover"
    />
  );
}

export default function ImageCarousel({
  images,
  alt,
  thumbnail,
  variant = "detail",
  surface = "dark",
}: ManualImageGalleryProps) {
  const galleryImages = useMemo(
    () => resolveProductGallery(thumbnail, images),
    [images, thumbnail]
  );
  const total = galleryImages.length;
  const hasMultiple = total > 1;
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [galleryImages]);

  const scrollToIndex = (index: number) => {
    const next = ((index % total) + total) % total;
    setActiveIndex(next);
  };

  const isCard = variant === "card";
  const imageProfile: ImageProfile = isCard ? "grid" : "detail";
  const frameClass = isCard
    ? "relative h-40 w-full overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50"
    : surface === "light"
      ? "relative aspect-square max-h-[520px] w-full overflow-hidden rounded-sm border border-neutral-200 bg-neutral-50"
      : "relative aspect-square max-h-[520px] w-full overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] shadow-[0_4px_24px_rgba(0,0,0,0.25)]";

  const activeSrc = galleryImages[activeIndex] ?? galleryImages[0];

  return (
    <div className="w-full min-w-0 max-w-full touch-pan-y">
      <div className={frameClass}>
        <GalleryImage
          src={activeSrc}
          alt={`${alt} — image ${activeIndex + 1}`}
          loading="eager"
          fetchPriority={!isCard ? "high" : undefined}
          profile={imageProfile}
          fallbacks={galleryImages.filter((_, index) => index !== activeIndex)}
        />

        {hasMultiple && !isCard && (
          <>
            <button
              type="button"
              aria-label="Previous image"
              onClick={() => scrollToIndex(activeIndex - 1)}
              className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-neutral-300 bg-white/90 text-xl text-neutral-900 shadow-sm transition hover:bg-white"
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={() => scrollToIndex(activeIndex + 1)}
              className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-neutral-300 bg-white/90 text-xl text-neutral-900 shadow-sm transition hover:bg-white"
            >
              ›
            </button>
          </>
        )}
      </div>

      {hasMultiple && !isCard && (
        <div className="mt-2 flex justify-center gap-1.5">
          {galleryImages.map((_, index) => (
            <button
              key={index}
              type="button"
              aria-label={`Go to image ${index + 1}`}
              aria-current={index === activeIndex ? "true" : undefined}
              onClick={() => scrollToIndex(index)}
              className={`rounded-full transition ${
                index === activeIndex
                  ? "h-2.5 w-2.5 bg-red-600"
                  : surface === "light"
                    ? "h-2 w-2 bg-neutral-300 hover:bg-neutral-400"
                    : "h-2 w-2 bg-white/35 hover:bg-white/55"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/** Compact gallery for catalog cards — first image only. */
export function CatalogImageGallery({
  images,
  alt,
  thumbnail,
}: Omit<ManualImageGalleryProps, "variant">) {
  return (
    <ImageCarousel
      images={images}
      alt={alt}
      thumbnail={thumbnail}
      variant="card"
    />
  );
}
