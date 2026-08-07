"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import ScrollReveal from "./ScrollReveal";

// Real vehicle makes represented in the catalog's fitment data.
const VEHICLE_MAKES = [
  "BMW",
  "Toyota",
  "Nissan",
  "Honda",
  "Mazda",
  "Ford",
  "Chevrolet",
  "Dodge",
  "Audi",
  "Mercedes-Benz",
  "Jaguar",
  "Chrysler",
  "GMC",
  "Lexus",
  "Jeep",
  "Volkswagen",
  "Subaru",
  "Isuzu",
  "Mitsubishi",
  "Hino",
] as const;

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: CURRENT_YEAR - 1969 }, (_, i) => CURRENT_YEAR - i);

const fieldClass =
  "w-full rounded-lg border border-neutral-300 bg-white px-3 py-3 text-sm text-neutral-900 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/10";

export default function ShopByVehicleSection() {
  const router = useRouter();
  const [year, setYear] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [engine, setEngine] = useState("");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const query = [year, make, model.trim(), engine.trim()]
      .filter(Boolean)
      .join(" ");
    router.push(
      query ? `/catalog/all?q=${encodeURIComponent(query)}` : "/catalog/all"
    );
  };

  return (
    <section
      className="border-b border-neutral-200 bg-neutral-50 px-4 py-14 sm:px-6 sm:py-20 lg:px-8"
      aria-label="Shop by vehicle"
    >
      <div className="mx-auto max-w-5xl">
        <ScrollReveal className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-red-600">
            Shop by Vehicle
          </p>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl lg:text-[2rem]">
            Tell us what you drive, we&apos;ll find what fits
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-neutral-600 sm:text-base">
            Search our catalog by year, make, model, and engine to narrow in
            on compatible parts fast.
          </p>
        </ScrollReveal>

        <ScrollReveal delayMs={100}>
          <form
            onSubmit={handleSubmit}
            className="mx-auto mt-10 max-w-3xl rounded-2xl border border-neutral-200 bg-white p-5 shadow-[0_10px_40px_rgba(0,0,0,0.06)] sm:p-7"
          >
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div>
                <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-neutral-500">
                  Year
                </label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className={fieldClass}
                >
                  <option value="">Any</option>
                  {YEARS.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-neutral-500">
                  Make
                </label>
                <select
                  value={make}
                  onChange={(e) => setMake(e.target.value)}
                  className={fieldClass}
                >
                  <option value="">Any</option>
                  {VEHICLE_MAKES.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-neutral-500">
                  Model
                </label>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="e.g. Supra"
                  className={fieldClass}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-neutral-500">
                  Engine
                  <span className="ml-1 font-medium normal-case text-neutral-400">
                    (optional)
                  </span>
                </label>
                <input
                  type="text"
                  value={engine}
                  onChange={(e) => setEngine(e.target.value)}
                  placeholder="e.g. 2JZ"
                  className={fieldClass}
                />
              </div>
            </div>

            <button
              type="submit"
              className="mt-5 w-full touch-manipulation rounded-lg bg-red-600 py-3.5 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-red-700 active:bg-red-800 sm:w-auto sm:px-10"
            >
              Find Compatible Parts
            </button>
          </form>
        </ScrollReveal>
      </div>
    </section>
  );
}
