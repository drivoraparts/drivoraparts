"use client";

import { useState } from "react";

export default function ProductGallery({
  product,
}: {
  product: any;
}) {
  const [activeImage, setActiveImage] = useState(0);

  return (
    <div className="flex flex-col gap-3">

      {/* MAIN IMAGE */}
      <div className="h-[350px] bg-black rounded-xl overflow-hidden border border-white/10">
        <img
          src={product.images?.[activeImage]}
          className="w-full h-full object-cover transition-all duration-300"
        />
      </div>

      {/* THUMBNAILS */}
      <div className="flex gap-2 overflow-x-auto">
        {product.images?.map((img: string, i: number) => (
          <img
            key={i}
            src={img}
            loading="lazy"
            decoding="async"
            onClick={() => setActiveImage(i)}
            className={`
              w-[80px] h-[80px] object-cover rounded-lg cursor-pointer border
              transition
              ${activeImage === i
                ? "border-red-500 scale-105"
                : "border-white/10 opacity-70 hover:opacity-100"
              }
            `}
          />
        ))}
      </div>

    </div>
  );
}