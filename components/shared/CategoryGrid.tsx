"use client";

import Link from "next/link";
import { useState } from "react";
import { getCategoryList } from "@/data/store";

const categories = getCategoryList();

export default function CategoryGrid() {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

      {categories.map((cat) => (
        <Link
          key={cat.slug}
          href={`/catalog/${cat.slug}`}
          onMouseEnter={() => setHovered(cat.slug)}
          onMouseLeave={() => setHovered(null)}
          className={`
            relative p-5 rounded-xl border overflow-hidden
            transition-all duration-300
            active:scale-95
            ${
              hovered === cat.slug
                ? "border-red-500 bg-white/10 shadow-lg shadow-red-500/10"
                : "border-white/10 bg-white/5"
            }
          `}
        >
          {/* glow effect layer */}
          <div
            className={`
              absolute inset-0 bg-red-500/10 blur-2xl transition-opacity duration-300
              ${hovered === cat.slug ? "opacity-100" : "opacity-0"}
            `}
          />

          {/* text */}
          <span className="relative text-white font-medium capitalize">
            {cat.name}
          </span>

          {/* bottom pulse line */}
          <div
            className={`
              absolute bottom-0 left-0 h-[2px] bg-red-500 transition-all duration-300
              ${hovered === cat.slug ? "w-full" : "w-0"}
            `}
          />
        </Link>
      ))}

    </div>
  );
}