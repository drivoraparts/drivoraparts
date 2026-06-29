"use client";

import Link from "next/link";
import { useEffect } from "react";
import ProductImage from "@/components/media/ProductImage";
import { routes } from "@/lib/inventory";

const HERO_IMAGE = "/home/pexels-juan-montes-92812630-11456554.jpg";

const sections = [
  {
    title: "Precision Engine Craft",
    text: "Every component engineered for performance, endurance, and speed.",
    image: "/home/pexels-artempodrez-8986047.jpg",
  },
  {
    title: "Suspension Control",
    text: "Built for stability, grip, and unmatched driving confidence.",
    image: "/home/pexels-matreding-9381019.jpg",
  },
  {
    title: "Braking Power",
    text: "Stop with control. Respond with precision under any condition.",
    image: "/home/pexels-garvin-st-villier-719266-14277598.jpg",
  },
  {
    title: "Performance Electronics",
    text: "Smart systems powering modern automotive performance.",
    image: "/home/pexels-stephanlouis-7012890.jpg",
  },
];

export default function Home() {
  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    if (reduceMotion || isMobile) return;

    const handleScroll = () => {
      const hero = document.getElementById("parallaxHero");
      if (!hero) return;

      const offset = window.scrollY;
      hero.style.transform = `translate3d(0, ${offset * 0.15}px, 0)`;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="relative z-0 w-full min-w-0 max-w-full overflow-x-hidden bg-white text-neutral-900">
      <section className="relative flex h-[100dvh] min-h-[480px] w-full min-w-0 items-center justify-center overflow-hidden">
        <div
          id="parallaxHero"
          className="absolute inset-0 z-0 overflow-hidden will-change-transform"
        >
          <ProductImage
            src={HERO_IMAGE}
            alt=""
            profile="hero"
            loading="eager"
            fetchPriority="high"
            className="h-full w-full object-cover"
          />
        </div>

        <div className="pointer-events-none absolute inset-0 z-10 bg-neutral-900/50" />
        <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-b from-neutral-900/30 via-neutral-900/45 to-neutral-900/70" />

        <div className="relative z-20 max-w-4xl px-4 text-center text-white sm:px-6">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-7xl">
            CINEMATIC <span className="text-red-500">PERFORMANCE</span>
          </h1>

          <p className="mt-6 text-base text-neutral-200 md:text-lg">
            Precision-engineered automotive parts for builders who demand control, power, and
            presence.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4">
            <Link
              href="/catalog"
              className="inline-block transform rounded-full bg-red-600 px-8 py-3 font-semibold transition hover:scale-105 hover:bg-red-700"
            >
              ENTER MARKET
            </Link>
            <Link
              href={routes.all}
              className="inline-block transform rounded-full border border-white/40 bg-white/10 px-8 py-3 font-semibold text-white transition hover:scale-105 hover:bg-white/20"
            >
              All Products
            </Link>
          </div>
        </div>
      </section>

      {sections.map((item, i) => (
        <section
          key={item.title}
          className={`flex flex-col items-center gap-10 bg-white px-6 py-32 md:flex-row md:px-20 ${
            i % 2 === 1 ? "md:flex-row-reverse" : ""
          }`}
        >
          <div className="w-full md:w-1/2">
            <ProductImage
              src={item.image}
              alt={item.title}
              profile="detail"
              className="w-full rounded-xl border border-neutral-200 object-cover shadow-lg"
            />
          </div>

          <div className="w-full md:w-1/2">
            <h2 className="mb-4 text-3xl font-bold text-neutral-900 md:text-4xl">{item.title}</h2>
            <p className="leading-relaxed text-neutral-600">{item.text}</p>
          </div>
        </section>
      ))}

      <section className="border-t border-neutral-200 bg-neutral-50 py-32 text-center">
        <h2 className="mb-4 text-4xl font-bold text-neutral-900">Build Your Performance Setup</h2>
        <p className="mb-8 text-neutral-600">
          DrivoraParts — engineered for builders who move with precision.
        </p>
        <div className="flex flex-col items-center gap-4">
          <Link
            href={routes.all}
            className="inline-block transform rounded-full bg-red-600 px-10 py-4 font-semibold text-white transition hover:scale-105 hover:bg-red-700"
          >
            All Products
          </Link>
          <Link
            href="/catalog"
            className="inline-block transform rounded-full border border-neutral-300 bg-white px-10 py-4 font-semibold text-neutral-900 transition hover:scale-105 hover:border-neutral-400 hover:shadow-md"
          >
            ENTER MARKET
          </Link>
        </div>
      </section>
    </div>
  );
}
