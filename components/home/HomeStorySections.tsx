"use client";

import Link from "next/link";

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

export default function HomeStorySections() {
  return (
    <>
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
        <Link
          href="/catalog/all"
          className="inline-block rounded-full bg-red-600 px-10 py-4 font-semibold transition hover:scale-105 hover:bg-red-700"
        >
          Browse full catalog
        </Link>
      </section>
    </>
  );
}
