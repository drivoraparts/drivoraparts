"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

// Real vehicle makes actually represented in the catalog's fitment data —
// not a generic placeholder list. Model is freeform since there's no
// structured per-make model database yet; the search query below already
// handles free text well.
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

const selectClass =
  "w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2.5 text-sm text-white outline-none backdrop-blur-sm transition focus:border-red-400 focus:bg-white/15 [&>option]:bg-neutral-900 [&>option]:text-white";

export default function VehicleSelectorBar() {
  const router = useRouter();
  const [year, setYear] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const query = [year, make, model.trim()].filter(Boolean).join(" ");
    router.push(
      query ? `/catalog/all?q=${encodeURIComponent(query)}` : "/catalog/all"
    );
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="relative z-20 mx-auto mt-8 w-full max-w-3xl rounded-2xl border border-white/15 bg-black/30 p-4 shadow-2xl backdrop-blur-md sm:p-5"
    >
      <p className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.15em] text-red-400">
        Find Parts For Your Vehicle
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        <select
          value={year}
          onChange={(e) => setYear(e.target.value)}
          aria-label="Year"
          className={selectClass}
        >
          <option value="">Year</option>
          {YEARS.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>

        <select
          value={make}
          onChange={(e) => setMake(e.target.value)}
          aria-label="Make"
          className={selectClass}
        >
          <option value="">Make</option>
          {VEHICLE_MAKES.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>

        <input
          type="text"
          value={model}
          onChange={(e) => setModel(e.target.value)}
          placeholder="Model (e.g. Supra)"
          aria-label="Model"
          className={`${selectClass} placeholder:text-white/50`}
        />

        <button
          type="submit"
          className="touch-manipulation rounded-lg bg-red-600 px-4 py-2.5 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-red-700 active:bg-red-800"
        >
          Search
        </button>
      </div>
    </form>
  );
}
