"use client";

import Link from "next/link";
import { useState } from "react";

const engineCategories = [
  {
    slug: "japanese-legends",
    title: "Japanese Legends",
    engines: [
      "Toyota 2JZ-GTE",
      "Toyota 1JZ-GTE",
      "Toyota 1UZ-FE V8",
      "Nissan RB26DETT",
      "Nissan SR20DET",
      "Honda K20A / K24",
      "Honda B18C Type R",
      "Mazda 13B Rotary",
    ],
  },
  {
    slug: "bmw-engines",
    title: "BMW Engines",
    engines: [
      "BMW N54 Twin Turbo",
      "BMW N55",
      "BMW S55",
      "BMW S58",
      "BMW M57 Diesel",
      "BMW N63 V8",
    ],
  },
  {
    slug: "american-v8",
    title: "American V8",
    engines: [
      "LS3",
      "LS7",
      "LT1 / LT4",
      "Ford Coyote 5.0",
      "Dodge Hellcat 6.2",
    ],
  },
  {
    slug: "euro-performance",
    title: "Euro Performance",
    engines: [
      "Mercedes M113",
      "Mercedes M157 AMG",
      "Audi 2.0 TFSI EA888",
      "Audi 4.0 TFSI V8",
      "VW VR6",
    ],
  },
  {
    slug: "turbo-kits",
    title: "Turbo / Performance Kits",
    engines: [
      "GTX3076R Kit",
      "GTX3582R Kit",
      "BorgWarner EFR",
      "Precision 6266",
      "Intercoolers",
      "Blow-off Valves",
      "Wastegates",
      "Intakes",
      "Exhaust Systems",
    ],
  },
];
export const runtime = "edge";
export default function EnginePage() {
  const [active, setActive] = useState<string | null>(null);

  return (
    <main className="p-6 text-white space-y-10">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-red-500">
          Engine Categories
        </h1>
        <p className="text-gray-400 mt-2">
          Select a performance engine platform
        </p>
      </div>

      {/* SECTIONS */}
      <div className="space-y-10">

        {engineCategories.map((group, i) => (
          <section
            key={group.slug}
            onClick={() => setActive(group.slug)}
            className={`
              relative bg-white/5 border rounded-xl p-5
              transition-all duration-300 cursor-pointer
              hover:border-red-500
              ${
                active && active !== group.slug
                  ? "opacity-40 scale-[0.98]"
                  : "opacity-100 scale-100"
              }
              ${
                active === group.slug
                  ? "border-red-500 shadow-lg shadow-red-500/20"
                  : "border-white/10"
              }
            `}
            style={{
              transitionDelay: `${i * 50}ms`,
            }}
          >

            {/* TITLE */}
            <h2 className="text-xl font-semibold text-red-500 mb-4">
              {group.title}
            </h2>

            {/* GRID */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">

              {group.engines.map((engine) => (
                <Link
                  key={engine}
                  href={`/catalog/engine/${group.slug}/${engine
                    .toLowerCase()
                    .replace(/\s+/g, "-")}`}
                  className="
                    p-3 rounded-lg bg-black/40 border border-white/10
                    hover:bg-white/10 hover:border-red-500
                    transition-all duration-200
                    active:scale-95
                  "
                >
                  {engine}
                </Link>
              ))}

            </div>

          </section>
        ))}

      </div>
    </main>
  );
}