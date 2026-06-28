"use client";

import Link from "next/link";
import { useEffect } from "react";
import { routes } from "@/lib/inventory";

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
    <div className="relative z-0 w-full min-w-0 max-w-full overflow-x-clip bg-black text-white">
      <section className="relative flex h-screen w-full min-w-0 items-center justify-center overflow-hidden">
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
          <h1 className="text-5xl font-bold tracking-tight md:text-7xl">
            CINEMATIC <span className="text-red-500">PERFORMANCE</span>
          </h1>

          <p className="mt-6 text-base text-gray-300 md:text-lg">
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
              className="inline-block transform rounded-full border border-white/20 bg-white/5 px-8 py-3 font-semibold text-white transition hover:scale-105 hover:border-white/40 hover:bg-white/10"
            >
              All Products
            </Link>
          </div>
        </div>
      </section>

      {sections.map((item, i) => (
        <section
          key={item.title}
          className={`flex flex-col items-center gap-10 px-6 py-32 md:flex-row md:px-20 ${
            i % 2 === 1 ? "md:flex-row-reverse" : ""
          }`}
        >
          <div className="w-full md:w-1/2">
            <img
              src={item.image}
              alt={item.title}
              loading="lazy"
              decoding="async"
              className="w-full rounded-xl object-cover shadow-2xl"
            />
          </div>

          <div className="w-full md:w-1/2">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">{item.title}</h2>
            <p className="leading-relaxed text-gray-400">{item.text}</p>
          </div>
        </section>
      ))}

      <section className="border-t border-white/10 py-32 text-center">
        <h2 className="mb-4 text-4xl font-bold">Build Your Performance Setup</h2>
        <p className="mb-8 text-gray-400">
          DrivoraParts — engineered for builders who move with precision.
        </p>
        <div className="flex flex-col items-center gap-4">
          <Link
            href={routes.all}
            className="inline-block transform rounded-full bg-red-600 px-10 py-4 font-semibold transition hover:scale-105 hover:bg-red-700"
          >
            All Products
          </Link>
          <Link
            href="/catalog"
            className="inline-block transform rounded-full border border-white/20 bg-white/5 px-10 py-4 font-semibold text-white transition hover:scale-105 hover:border-white/40 hover:bg-white/10"
          >
            ENTER MARKET
          </Link>
        </div>
      </section>
    </div>
  );
}
