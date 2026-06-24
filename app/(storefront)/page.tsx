"use client";

import Link from "next/link";
import { useEffect } from "react";

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
    <div className="bg-black text-white relative z-0">

      {/* HERO */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">

        {/* BACKGROUND */}
        <div
          id="parallaxHero"
          className="absolute inset-0 bg-cover bg-center scale-110 z-0"
          style={{
            backgroundImage:
              "url('/home/pexels-juan-montes-92812630-11456554.jpg')",
          }}
        />

        {/* OVERLAY (IMPORTANT: DOES NOT BLOCK CLICKS) */}
        <div className="absolute inset-0 bg-black/60 pointer-events-none z-10" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black pointer-events-none z-10" />

        {/* HERO TEXT */}
        <div className="relative z-20 text-center px-6 max-w-4xl">

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            CINEMATIC <span className="text-red-500">PERFORMANCE</span>
          </h1>

          <p className="mt-6 text-gray-300 text-base md:text-lg">
            Precision-engineered automotive parts for builders who demand control, power, and presence.
          </p>

          <Link
            href="/catalog"
            className="inline-block mt-10 px-8 py-3 bg-red-600 hover:bg-red-700 rounded-full font-semibold transition transform hover:scale-105"
          >
            ENTER MARKET
          </Link>

        </div>
      </section>

      {/* SECTIONS */}
      {sections.map((item, i) => (
        <section
          key={i}
          className={`flex flex-col md:flex-row items-center gap-10 px-6 md:px-20 py-32 ${
            i % 2 === 1 ? "md:flex-row-reverse" : ""
          }`}
        >

          <div className="w-full md:w-1/2">
            <img
              src={item.image}
              alt={item.title}
              loading="lazy"
              decoding="async"
              className="rounded-xl w-full object-cover shadow-2xl"
            />
          </div>

          <div className="w-full md:w-1/2">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {item.title}
            </h2>
            <p className="text-gray-400 leading-relaxed">
              {item.text}
            </p>
          </div>

        </section>
      ))}

      {/* CTA */}
      <section className="text-center py-32 border-t border-white/10">

        <h2 className="text-4xl font-bold mb-4">
          Build Your Performance Setup
        </h2>

        <p className="text-gray-400 mb-8">
          DrivoraParts — engineered for builders who move with precision.
        </p>

        <Link
          href="/catalog"
          className="inline-block px-10 py-4 bg-red-600 hover:bg-red-700 rounded-full font-semibold transition transform hover:scale-105"
        >
          ENTER MARKET
        </Link>

      </section>

    </div>
  );
}