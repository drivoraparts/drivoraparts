"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getCategories, routes, products, getProductThumbnail } from "@/lib/inventory";
import ProductPrice from "@/components/currency/ProductPrice";
import TranslatedText from "@/components/i18n/TranslatedText";

export default function HomePage() {
  const [loaded, setLoaded] = useState(false);
  const [active, setActive] = useState(0);

  useEffect(() => {
    setLoaded(true);

    const interval = setInterval(() => {
      setActive((p) => (p + 1) % 3);
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  return (
    <main className="box-border min-h-screen min-h-[100dvh] w-full min-w-0 max-w-full overflow-x-hidden bg-[#0a0f16] text-white">

      {/* HERO */}
      <section className="relative flex h-[100dvh] min-h-[480px] items-center justify-center px-4 text-center sm:px-6">

        {/* background glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-red-500/10 via-transparent to-black" />

        {/* animated grid */}
        <div className="absolute inset-0 opacity-20">
          <div className="w-full h-full bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:60px_60px]" />
        </div>

        <div
          className={`relative z-10 transition-all duration-1000 ${
            loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <h1 className="text-5xl md:text-7xl font-bold leading-tight">
            DRIVORA <span className="text-red-500">PARTS</span>
          </h1>

          <p className="mt-4 text-gray-300 max-w-xl mx-auto">
            Premium performance parts for engines, turbo systems, suspension & more.
          </p>

          <div className="mt-8 flex gap-4 justify-center">
            <Link
              href={routes.category("engine")}
              className="bg-red-600 px-6 py-3 rounded-lg hover:scale-105 transition"
            >
              Shop Engines
            </Link>

            <Link
              href={routes.category("turbocharger")}
              className="border border-white/20 px-6 py-3 rounded-lg hover:bg-white/10 transition"
            >
              Explore Turbo
            </Link>
          </div>
        </div>
      </section>

      {/* CATEGORY STRIP */}
      <section className="px-6 py-10">
        <h2 className="text-xl font-semibold mb-6">Browse Categories</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {getCategories().map((cat, i) => (
            <Link
              key={cat.slug}
              href={routes.category(cat.slug)}
              className={`p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-red-500/10 hover:border-red-500/40 transition-all duration-300
              ${loaded ? "opacity-100" : "opacity-0 translate-y-6"}`}
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <p className="capitalize font-medium">{cat.name}</p>
              <p className="text-xs text-gray-400 mt-1">
                High performance parts
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURE SLIDER (NO LIBRARY) */}
      <section className="px-6 py-12">
        <h2 className="text-xl font-semibold mb-6">Featured Builds</h2>

        <div className="relative h-64 rounded-xl overflow-hidden border border-white/10 bg-black">

          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`absolute inset-0 transition-opacity duration-700 ${
                active === i ? "opacity-100" : "opacity-0"
              }`}
            >
              <div className="h-full flex items-center justify-center bg-gradient-to-r from-red-500/20 to-black">
                <h3 className="text-2xl font-bold">
                  Performance Build {i + 1}
                </h3>
              </div>
            </div>
          ))}

        </div>
      </section>

      {/* PRODUCTS PREVIEW */}
      <section className="px-6 py-12">
        <h2 className="text-xl font-semibold mb-6">Hot Parts</h2>

        <div className="grid grid-cols-2 gap-4">
          {products.slice(0, 6).map((p, i) => (
            <div
              key={p.id}
              className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:scale-[1.02] transition duration-300"
              style={{
                animationDelay: `${i * 80}ms`,
              }}
            >
              <img
                src={getProductThumbnail(p)}
                alt={p.name}
                loading="lazy"
                decoding="async"
                className="h-40 w-full object-cover bg-black/40"
              />

              <div className="p-3">
                <p className="text-sm font-medium">
                  <TranslatedText as="span">{p.name}</TranslatedText>
                </p>
                <div className="text-xs text-gray-400">
                  <ProductPrice
                    price={p.price}
                    compareAtPrice={p.compareAtPrice}
                    size="sm"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-16 text-center">
        <h2 className="text-3xl font-bold">
          Build Something Fast.
        </h2>

        <p className="text-gray-400 mt-2">
          Drivora Parts marketplace for real performance upgrades.
        </p>

        <Link
          href="/catalog"
          className="inline-block mt-6 bg-red-600 px-8 py-3 rounded-lg hover:scale-105 transition"
        >
          Enter Store
        </Link>
      </section>

    </main>
  );
}