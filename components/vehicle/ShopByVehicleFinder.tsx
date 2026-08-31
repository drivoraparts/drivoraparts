"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

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
  "w-full rounded-lg border border-neutral-300 bg-white px-3 py-3 text-sm text-neutral-900 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/10";

export default function ShopByVehicleFinder({
  className = "",
}: {
  className?: string;
}) {
  const router = useRouter();
  const [year, setYear] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [engine, setEngine] = useState("");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // Year isn't included: the catalog has no structured year-range data,
    // so a specific model year almost never appears literally in a
    // product's name/fitment text, and folding it into the search terms
    // made nearly every real fitment match fail (e.g. "2020 Toyota Supra
    // 2JZ" matched nothing, even though "Toyota Supra 2JZ" alone matches a
    // real product). Make/Model/Engine are much more likely to appear in
    // fitment text, so those still drive the search.
    const query = [make, model.trim(), engine.trim()].filter(Boolean).join(" ");
    router.push(
      query ? `/catalog/all?q=${encodeURIComponent(query)}` : "/catalog/all"
    );
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`rounded-2xl border border-neutral-200 bg-white p-5 shadow-[0_10px_40px_rgba(0,0,0,0.06)] sm:p-7 ${className}`}
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
            <span className="ml-1 font-medium normal-case text-muted">
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
        className="mt-5 w-full touch-manipulation rounded-lg bg-accent py-3.5 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-accent-active active:bg-red-800 sm:w-auto sm:px-10"
      >
        Find Compatible Parts
      </button>
    </form>
  );
}
