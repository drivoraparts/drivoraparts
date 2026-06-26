"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";

type ManualImageGalleryProps = {
  images: string[];
  alt: string;
  thumbnail?: string;
  variant?: "detail" | "card";
};

function buildGallery(images: string[], thumbnail?: string) {
  const base = images.length > 0 ? images : ["/product-media/avatars/default.svg"];
  return thumbnail
    ? [thumbnail, ...base.filter((img) => img !== thumbnail)]
    : base;
}

export default function ImageCarousel({
  images,
  alt,
  thumbnail,
  variant = "detail",
}: ManualImageGalleryProps) {
  const galleryImages = useMemo(
    () => buildGallery(images, thumbnail),
    [images, thumbnail]
  );
  const total = galleryImages.length;
  const hasMultiple = total > 1;

  const scrollerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const dragState = useRef({ active: false, startX: 0, scrollLeft: 0, pointerId: -1 });

  const syncActiveIndex = useCallback(() => {
    const el = scrollerRef.current;
    if (!el || el.clientWidth <= 0) return;
    const index = Math.round(el.scrollLeft / el.clientWidth);
    setActiveIndex(Math.min(Math.max(index, 0), total - 1));
  }, [total]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    el.addEventListener("scroll", syncActiveIndex, { passive: true });
    return () => el.removeEventListener("scroll", syncActiveIndex);
  }, [syncActiveIndex]);

  const scrollToIndex = useCallback(
    (index: number) => {
      const el = scrollerRef.current;
      if (!el) return;
      const next = ((index % total) + total) % total;
      el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
      setActiveIndex(next);
    },
    [total]
  );

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!hasMultiple) return;
    const el = scrollerRef.current;
    if (!el) return;

    dragState.current = {
      active: true,
      startX: event.clientX,
      scrollLeft: el.scrollLeft,
      pointerId: event.pointerId,
    };
    el.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragState.current.active) return;
    const el = scrollerRef.current;
    if (!el) return;

    const delta = event.clientX - dragState.current.startX;
    el.scrollLeft = dragState.current.scrollLeft - delta;
  };

  const endDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragState.current.active) return;
    const el = scrollerRef.current;
    dragState.current.active = false;

    if (el?.hasPointerCapture(event.pointerId)) {
      el.releasePointerCapture(event.pointerId);
    }

    syncActiveIndex();

    if (!el || el.clientWidth <= 0) return;
    const index = Math.round(el.scrollLeft / el.clientWidth);
    el.scrollTo({ left: index * el.clientWidth, behavior: "smooth" });
  };

  const isCard = variant === "card";
  const frameClass = isCard
    ? "relative h-40 w-full overflow-hidden rounded-lg border border-white/10 bg-white/[0.04]"
    : "relative aspect-square max-h-[520px] w-full overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] shadow-[0_4px_24px_rgba(0,0,0,0.25)]";

  return (
    <div className="w-full min-w-0 max-w-full">
      <div className={frameClass}>
        <div
          ref={scrollerRef}
          className="flex h-full w-full cursor-grab overflow-x-auto scroll-smooth snap-x snap-mandatory active:cursor-grabbing [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          style={{ touchAction: "pan-x" }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onPointerLeave={endDrag}
        >
          {galleryImages.map((src, index) => (
            <div
              key={`${src}-${index}`}
              className="h-full w-full shrink-0 snap-center snap-always"
            >
              <img
                src={src}
                alt={`${alt} — image ${index + 1}`}
                draggable={false}
                loading={index === 0 ? "eager" : "lazy"}
                decoding="async"
                className="h-full w-full select-none object-cover"
              />
            </div>
          ))}
        </div>

        {hasMultiple && !isCard && (
          <>
            <button
              type="button"
              aria-label="Previous image"
              onClick={() => scrollToIndex(activeIndex - 1)}
              className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/55 text-xl text-white transition hover:bg-black/75"
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={() => scrollToIndex(activeIndex + 1)}
              className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/55 text-xl text-white transition hover:bg-black/75"
            >
              ›
            </button>
          </>
        )}
      </div>

      {hasMultiple && (
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
                  : "h-2 w-2 bg-white/35 hover:bg-white/55"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/** Compact manual gallery for catalog cards. */
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
