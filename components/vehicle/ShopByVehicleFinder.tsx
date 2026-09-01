"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  VEHICLE_MAKES,
  fitmentHref,
  vehicleYears,
} from "@/lib/vehicle/fitment-query";

// Shared with the catalog's finder panel, so the two cannot disagree about
// what "compatible" means. See lib/vehicle/fitment-query.ts, which also
// records why the year is collected but not searched.
const YEARS = vehicleYears();

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
    router.push(fitmentHref({ year, make, model, engine }));
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
