"use client";

import { useCallback, useRef, useState } from "react";

type ImageCarouselProps = {
  images: string[];
  alt: string;
  thumbnail?: string;
};

export default function ImageCarousel({
  images,
  alt,
  thumbnail,
}: ImageCarouselProps) {
  const baseImages = images.length > 0 ? images : ["/engines/engine-1.jpg"];
  const galleryImages = thumbnail
    ? [thumbnail, ...baseImages.filter((img) => img !== thumbnail)]
    : baseImages;

  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const touchStartX = useRef(0);
  const total = galleryImages.length;
  const hasMultiple = total > 1;

  const goTo = useCallback(
    (index: number) => {
      if (isAnimating || total <= 1) return;
      setIsAnimating(true);
      setActiveIndex((index + total) % total);
      window.setTimeout(() => setIsAnimating(false), 300);
    },
    [isAnimating, total]
  );

  const goPrev = () => goTo(activeIndex - 1);
  const goNext = () => goTo(activeIndex + 1);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!hasMultiple) return;
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(diff) < 40) return;
    if (diff < 0) goNext();
    else goPrev();
  };

  return (
    <div
      style={{
        width: "100%",
        minWidth: 0,
        maxWidth: "100%",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "1 / 1",
          maxHeight: "520px",
          borderRadius: "12px",
          overflow: "hidden",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.25)",
          touchAction: "pan-y",
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <img
          key={galleryImages[activeIndex]}
          src={galleryImages[activeIndex]}
          alt={alt}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: isAnimating ? 0.85 : 1,
            transition: "opacity 0.3s ease",
          }}
        />

        {hasMultiple && (
          <>
            <button
              type="button"
              onClick={goPrev}
              aria-label="Previous image"
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                border: "1px solid rgba(255,255,255,0.2)",
                background: "rgba(0,0,0,0.55)",
                color: "#fff",
                cursor: "pointer",
                fontSize: "22px",
                lineHeight: 1,
                zIndex: 2,
              }}
            >
              ‹
            </button>

            <button
              type="button"
              onClick={goNext}
              aria-label="Next image"
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                border: "1px solid rgba(255,255,255,0.2)",
                background: "rgba(0,0,0,0.55)",
                color: "#fff",
                cursor: "pointer",
                fontSize: "22px",
                lineHeight: 1,
                zIndex: 2,
              }}
            >
              ›
            </button>
          </>
        )}
      </div>

      {hasMultiple && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "8px",
            marginTop: "12px",
            flexWrap: "wrap",
          }}
        >
          {galleryImages.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to image ${i + 1}`}
              aria-current={i === activeIndex ? "true" : undefined}
              onClick={() => goTo(i)}
              style={{
                width: i === activeIndex ? "10px" : "8px",
                height: i === activeIndex ? "10px" : "8px",
                borderRadius: "50%",
                border: "none",
                padding: 0,
                cursor: "pointer",
                background:
                  i === activeIndex ? "#e60000" : "rgba(255,255,255,0.35)",
                transition: "background 0.2s ease, transform 0.2s ease",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
