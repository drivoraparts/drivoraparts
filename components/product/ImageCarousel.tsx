"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  const triedRef = useRef<Set<string>>(new Set([optimizedSrc]));

  useEffect(() => {
    const next = optimizeImageUrl(resolvedSrc, profile);
    triedRef.current = new Set([next]);
    setCurrentSrc(next);
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
        const next = nextImageFallback(resolvedSrc, triedRef.current, profile);
        if (next) {
          triedRef.current.add(next);
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
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    setActiveIndex(0);
  }, [galleryImages]);

  const scrollToIndex = (index: number) => {
    const next = ((index % total) + total) % total;
    setActiveIndex(next);
  };

  useEffect(() => {
    if (!lightboxOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightboxOpen(false);
      if (event.key === "ArrowLeft") scrollToIndex(activeIndex - 1);
      if (event.key === "ArrowRight") scrollToIndex(activeIndex + 1);
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightboxOpen, activeIndex, total]);

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

        {!isCard && (
          <button
            type="button"
            aria-label="View fullscreen"
            onClick={() => setLightboxOpen(true)}
            className="absolute bottom-3 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-neutral-300 bg-white/90 text-neutral-900 shadow-sm transition hover:bg-white"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
              aria-hidden
            >
              <path d="M8 3H5a2 2 0 00-2 2v3M16 3h3a2 2 0 012 2v3M8 21H5a2 2 0 01-2-2v-3M16 21h3a2 2 0 002-2v-3" />
            </svg>
          </button>
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

      {lightboxOpen && !isCard && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${alt} — fullscreen gallery`}
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/95 p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            type="button"
            aria-label="Close fullscreen view"
            onClick={() => setLightboxOpen(false)}
            className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-2xl text-white transition hover:bg-white/20"
          >
            ✕
          </button>

          <div
            className="relative flex h-full max-h-[85vh] w-full max-w-4xl items-center justify-center"
            onClick={(event) => event.stopPropagation()}
          >
            <img
              src={optimizeImageUrl(
                resolveProductImage(activeSrc),
                "hero"
              )}
              alt={`${alt} — image ${activeIndex + 1}`}
              className="max-h-full max-w-full select-none object-contain"
              draggable={false}
            />

            {hasMultiple && (
              <>
                <button
                  type="button"
                  aria-label="Previous image"
                  onClick={() => scrollToIndex(activeIndex - 1)}
                  className="absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-2xl text-white transition hover:bg-white/20 sm:left-4"
                >
                  ‹
                </button>
                <button
                  type="button"
                  aria-label="Next image"
                  onClick={() => scrollToIndex(activeIndex + 1)}
                  className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-2xl text-white transition hover:bg-white/20 sm:right-4"
                >
                  ›
                </button>
              </>
            )}
          </div>

          {hasMultiple && (
            <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs font-semibold text-white/70">
              {activeIndex + 1} / {total}
            </p>
          )}
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
