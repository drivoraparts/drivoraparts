"use client";

import Link from "next/link";
import { useState } from "react";
import { getCategories, routes } from "@/lib/inventory";

const categories = getCategories();

export default function CategoryGrid() {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {categories.map((cat) => (
        <Link
          key={cat.slug}
          href={
            cat.slug === "aftermarket"
              ? routes.aftermarket
              : routes.category(cat.slug)
          }
          onMouseEnter={() => setHovered(cat.slug)}
          onMouseLeave={() => setHovered(null)}
          className={`
            relative overflow-hidden rounded-xl border p-5
            transition-all duration-300
            active:scale-95
            ${
              hovered === cat.slug
                ? "border-red-500 bg-red-50 shadow-md"
                : "border-neutral-200 bg-white"
            }
          `}
        >
          <div
            className={`
              absolute inset-0 bg-red-500/5 blur-2xl transition-opacity duration-300
              ${hovered === cat.slug ? "opacity-100" : "opacity-0"}
            `}
          />

          <span className="relative font-medium capitalize text-neutral-900">
            {cat.name}
          </span>

          <div
            className={`
              absolute bottom-0 left-0 h-[2px] bg-red-600 transition-all duration-300
              ${hovered === cat.slug ? "w-full" : "w-0"}
            `}
          />
        </Link>
      ))}

      <Link
        href={routes.all}
        onMouseEnter={() => setHovered("all")}
        onMouseLeave={() => setHovered(null)}
        className={`
          relative overflow-hidden rounded-xl border p-5
          transition-all duration-300
          active:scale-95
          ${
            hovered === "all"
              ? "border-red-500 bg-red-50 shadow-md"
              : "border-neutral-200 bg-white"
          }
        `}
      >
        <div
          className={`
            absolute inset-0 bg-red-500/5 blur-2xl transition-opacity duration-300
            ${hovered === "all" ? "opacity-100" : "opacity-0"}
          `}
        />

        <span className="relative font-medium text-neutral-900">All Products</span>

        <div
          className={`
            absolute bottom-0 left-0 h-[2px] bg-red-600 transition-all duration-300
            ${hovered === "all" ? "w-full" : "w-0"}
          `}
        />
      </Link>
    </div>
  );
}
