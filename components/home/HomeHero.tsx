"use client";

import Link from "next/link";
import { useEffect } from "react";

type Props = {
  productCount: number;
};

export default function HomeHero({ productCount }: Props) {
  useEffect(() => {
    const handleScroll = () => {
      const hero = document.getElementById("parallaxHero");
      if (!hero) return;

      const offset = window.scrollY;
      hero.style.transform = `translate3d(0, ${offset * 0.2}px, 0) scale(1.1)`;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="relative flex h-[min(92vh,820px)] w-full items-center justify-center overflow-hidden">
      <div
        id="parallaxHero"
        className="absolute inset-0 z-0 scale-110 bg-cover bg-center"
        style={{
          backgroundImage: "url('/home/pexels-juan-montes-92812630-11456554.jpg')",
        }}
      />

      <div className="pointer-events-none absolute inset-0 z-10 bg-black/60" />
      <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-b from-black/30 via-black/50 to-black" />

      <div className="relative z-20 max-w-4xl px-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-red-400">
          Automotive performance marketplace
        </p>

        <h1 className="mt-4 text-5xl font-bold tracking-tight md:text-7xl">
          CINEMATIC <span className="text-red-500">PERFORMANCE</span>
        </h1>

        <p className="mt-6 text-base text-gray-300 md:text-lg">
          Precision-engineered automotive parts for builders who demand control, power, and
          presence.
        </p>

        <p className="mt-4 text-sm text-gray-400">
          {productCount}+ in-stock listings · engines, turbos, brakes, transmission &amp; more
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/catalog/all"
            className="inline-block rounded-full bg-red-600 px-8 py-3 font-semibold transition hover:scale-105 hover:bg-red-700"
          >
            Shop all parts
          </Link>
          <Link
            href="/contact"
            className="inline-block rounded-full border border-white/20 px-8 py-3 font-semibold text-gray-200 transition hover:border-red-500/50 hover:text-white"
          >
            Contact support
          </Link>
        </div>
      </div>
    </section>
  );
}
