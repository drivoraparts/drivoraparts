"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export type FinderVehicle = {
  key: string;
  model: string;
  count: number;
  /** Categories with parts for this vehicle, with counts. */
  categories: { slug: string; name: string; count: number }[];
};

/*
 * "Find parts for your Toyota": model, then an optional part category that
 * lists only what exists for that model, then a part-number / name search.
 *
 * There is deliberately no Year field. Listings record years as text ranges
 * ("2005–2015 Tacoma"), so a single-year filter could only guess, and a filter
 * that does not really filter is worse than none. Results go to the USA model
 * view, the same one the "Shop by Vehicle" tiles open.
 */
export default function HeroVehicleFinder({ vehicles }: { vehicles: FinderVehicle[] }) {
  const router = useRouter();
  const [vehicleKey, setVehicleKey] = useState("");
  const [category, setCategory] = useState("");
  const [query, setQuery] = useState("");
  const vehicle = vehicles.find((v) => v.key === vehicleKey);

  const select =
    "h-12 w-full rounded-md border border-border bg-white px-3 text-[15px] text-foreground focus:border-foreground focus:outline-none disabled:bg-surface-muted disabled:text-muted";

  return (
    <div className="rounded-lg border border-border bg-white p-5 shadow-[0_1px_2px_rgba(23,25,28,0.06)] sm:p-6">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-foreground">Find parts for your Toyota</p>
      <form
        className="mt-4 space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (!vehicleKey) return;
          const params = new URLSearchParams({ vehicle: vehicleKey });
          if (category) params.set("category", category);
          router.push(`/catalog/usa?${params.toString()}`);
        }}
      >
        <label className="block">
          <span className="sr-only">Model</span>
          <select
            className={select}
            value={vehicleKey}
            onChange={(e) => {
              setVehicleKey(e.target.value);
              setCategory("");
            }}
          >
            <option value="">Select your model</option>
            {vehicles.map((v) => (
              <option key={v.key} value={v.key}>
                Toyota {v.model} ({v.count} parts)
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="sr-only">Part category</span>
          <select
            className={select}
            value={category}
            disabled={!vehicle}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">{vehicle ? "All part categories" : "Part category (choose a model first)"}</option>
            {vehicle?.categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name} ({c.count})
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          disabled={!vehicleKey}
          className="h-12 w-full rounded-md bg-accent text-sm font-bold uppercase tracking-[0.08em] text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          Show parts
        </button>
      </form>

      <form
        className="mt-4 border-t border-border pt-4"
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          const q = query.trim();
          router.push(q ? `/catalog/all?q=${encodeURIComponent(q)}` : "/catalog/all");
        }}
      >
        <label className="block text-xs font-semibold text-muted" htmlFor="hero-part-search">
          Or search by part number or name
        </label>
        <div className="mt-2 flex gap-2">
          <input
            id="hero-part-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. 2121K or Tacoma bumper"
            className="h-11 min-w-0 flex-1 rounded-md border border-border px-3 text-[15px] focus:border-foreground focus:outline-none"
          />
          <button
            type="submit"
            className="h-11 shrink-0 rounded-md border border-foreground px-4 text-sm font-semibold text-foreground hover:bg-foreground hover:text-white"
          >
            Search
          </button>
        </div>
      </form>
    </div>
  );
}
