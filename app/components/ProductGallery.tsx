"use client";

import { useCallback, useState } from "react";

type ProductGalleryProps = {
  images: string[];
  alt: string;
};

export default function ProductGallery({ images, alt }: ProductGalleryProps) {
  const galleryImages =
    images.length > 0 ? images : ["/engines/engine-1.jpg"];

  const [activeIndex, setActiveIndex] = useState(0);
  const total = galleryImages.length;
  const showThumbnails = total > 1;

  const goTo = useCallback(
    (index: number) => {
      setActiveIndex((index + total) % total);
    },
    [total]
  );

  const goPrev = () => goTo(activeIndex - 1);
  const goNext = () => goTo(activeIndex + 1);

  return (
    <div style={{ width: "100%", minWidth: 0, maxWidth: "100%" }}>
      <div
        style={{
          position: "relative",
          border: "1px solid #eee",
          borderRadius: "12px",
          overflow: "hidden",
          background: "#fff",
          width: "100%",
          maxWidth: "100%",
        }}
      >
        <img
          src={galleryImages[activeIndex]}
          alt={alt}
          style={{
            display: "block",
            width: "100%",
            maxWidth: "100%",
            height: "400px",
            objectFit: "cover",
          }}
        />

        {showThumbnails && (
          <>
            <button
              type="button"
              onClick={goPrev}
              aria-label="Previous image"
              style={{
                position: "absolute",
                left: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                border: "none",
                background: "rgba(0,0,0,0.55)",
                color: "#fff",
                cursor: "pointer",
                fontSize: "18px",
                lineHeight: 1,
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
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                border: "none",
                background: "rgba(0,0,0,0.55)",
                color: "#fff",
                cursor: "pointer",
                fontSize: "18px",
                lineHeight: 1,
              }}
            >
              ›
            </button>
          </>
        )}
      </div>

      {showThumbnails && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(64px, 1fr))",
            gap: "8px",
            marginTop: "10px",
            maxWidth: "100%",
          }}
        >
          {galleryImages.map((img, i) => (
            <button
              key={`${img}-${i}`}
              type="button"
              onClick={() => setActiveIndex(i)}
              aria-label={`View image ${i + 1}`}
              aria-current={i === activeIndex ? "true" : undefined}
              style={{
                width: "100%",
                padding: 0,
                border:
                  i === activeIndex
                    ? "2px solid #e60000"
                    : "1px solid #ddd",
                borderRadius: "8px",
                overflow: "hidden",
                cursor: "pointer",
                background: "transparent",
                aspectRatio: "1",
              }}
            >
              <img
                src={img}
                alt={`${alt} thumbnail ${i + 1}`}
                style={{
                  display: "block",
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
