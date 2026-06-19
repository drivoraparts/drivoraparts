"use client";

import Link from "next/link";

export type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  condition: string;
  location: string;
  thumbnail: string;
  description: string;
};

export default function ProductCard({ product }: { product: Product }) {
  return (
    <div
      className="
        group relative overflow-hidden rounded-xl
        border border-white/10 bg-white/5
        hover:border-red-500/40 transition-all duration-300
      "
    >
      {/* IMAGE */}
      <div className="relative h-[180px] overflow-hidden">
        <img
          src={product.thumbnail}
          alt={product.name}
          className="
            w-full h-full object-cover
            group-hover:scale-105 transition-transform duration-500
          "
        />

        {/* overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      {/* CONTENT */}
      <div className="p-4">
        <h3 className="text-sm font-semibold text-white">
          {product.name}
        </h3>

        <p className="text-xs text-gray-400 mt-1">
          {product.condition}
        </p>

        <p className="text-xs text-gray-500 mt-1">
          {product.location}
        </p>

        {/* PRICE + CATEGORY */}
        <div className="mt-3 flex items-center justify-between">
          <span className="text-red-500 font-bold">
            ${product.price}
          </span>

          <span className="text-[10px] text-gray-400 uppercase">
            {product.category}
          </span>
        </div>

        {/* ACTIONS */}
        <div className="mt-4 flex gap-2">
          <Link
            href={`/product/${product.id}`}
            className="
              flex-1 text-center py-2 text-xs font-semibold
              bg-red-600 hover:bg-red-700
              rounded-lg transition
            "
          >
            View Item
          </Link>

          <button
            className="
              px-3 py-2 text-xs
              bg-white/10 hover:bg-white/20
              rounded-lg transition
            "
          >
            ♥
          </button>
        </div>
      </div>

      {/* GLOW */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 pointer-events-none bg-[radial-gradient(circle_at_top_left,_rgba(255,0,0,0.12),transparent_60%)]" />
    </div>
  );
}