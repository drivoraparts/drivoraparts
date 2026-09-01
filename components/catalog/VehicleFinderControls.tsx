"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import ScrollReveal from "@/components/home/ScrollReveal";
import { MOTION } from "@/lib/motion/motion";
import {
  VEHICLE_MAKES,
  fitmentHref,
  fitmentSelectionIsUsable,
  vehicleYears,
} from "@/lib/vehicle/fitment-query";

const YEARS = vehicleYears();

const labelClass =
  "mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-400";

/**
 * Dark-panel fields. Options carry their own colours because a native select
 * on a dark control otherwise renders its dropdown with the page's inherited
 * white-on-white in several browsers.
 */
const fieldClass =
  "w-full rounded-[2px] border border-white/15 bg-white/[0.04] px-3 py-3 text-sm text-white outline-none transition-[border-color,background-color,box-shadow] duration-[var(--motion-duration-fast)] placeholder:text-neutral-500 focus:border-accent-on-dark focus:bg-white/[0.07] focus:ring-2 focus:ring-accent-on-dark/20 [&>option]:bg-neutral-900 [&>option]:text-white";

/**
 * The fitment controls.
 *
 * The query this builds is the one the homepage finder builds -- both call
 * lib/vehicle/fitment-query.ts, so the catalog and the homepage cannot come to
 * different conclusions about what fits. Only the presentation is local.
 *
 * The fields reveal in sequence as the panel scrolls into view rather than on
 * page load, because the point of the movement is to say "you are about to
 * identify your vehicle" at the moment someone arrives at it. Each wrapper is
 * a ScrollReveal, so if any of that fails the fields are simply there.
 */
export default function VehicleFinderControls() {
  const router = useRouter();
  const [year, setYear] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [engine, setEngine] = useState("");

  const selection = { year, make, model, engine };
  const usable = fitmentSelectionIsUsable(selection);
  // Someone who has picked only a year has told us nothing we can search on.
  // Saying so is better than returning the whole catalog and letting them
  // conclude their vehicle has 1,890 compatible parts.
  const yearOnly = Boolean(year) && !usable;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    router.push(fitmentHref(selection));
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <ScrollReveal delayMs={0} distance={MOTION.distance.sm}>
          <label className={labelClass} htmlFor="fitment-year">
            Year
          </label>
          <select
            id="fitment-year"
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
        </ScrollReveal>

        <ScrollReveal delayMs={MOTION.stagger} distance={MOTION.distance.sm}>
          <label className={labelClass} htmlFor="fitment-make">
            Make
          </label>
          <select
            id="fitment-make"
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
        </ScrollReveal>

        <ScrollReveal delayMs={MOTION.stagger * 2} distance={MOTION.distance.sm}>
          <label className={labelClass} htmlFor="fitment-model">
            Model
          </label>
          <input
            id="fitment-model"
            type="text"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder="e.g. Hilux"
            className={fieldClass}
          />
        </ScrollReveal>

        <ScrollReveal delayMs={MOTION.stagger * 3} distance={MOTION.distance.sm}>
          <label className={labelClass} htmlFor="fitment-engine">
            Engine
            <span className="ml-1.5 font-medium normal-case tracking-normal text-neutral-500">
              optional
            </span>
          </label>
          <input
            id="fitment-engine"
            type="text"
            value={engine}
            onChange={(e) => setEngine(e.target.value)}
            placeholder="e.g. 1GD-FTV"
            className={fieldClass}
          />
        </ScrollReveal>
      </div>

      <ScrollReveal delayMs={MOTION.stagger * 4} distance={MOTION.distance.sm}>
        <button
          type="submit"
          className="mt-6 w-full touch-manipulation rounded-[2px] bg-accent px-8 py-3.5 text-xs font-bold uppercase tracking-[0.16em] text-accent-foreground transition-colors duration-[var(--motion-duration-fast)] hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-on-dark sm:w-auto sm:text-[13px]"
        >
          Find Compatible Parts
        </button>

        <p
          className="mt-3 text-xs leading-relaxed text-neutral-500"
          aria-live="polite"
        >
          {yearOnly
            ? "A year on its own doesn’t narrow anything — add a make or model."
            : "Matched against manufacturer fitment text, so make, model and engine give the best results."}
        </p>
      </ScrollReveal>
    </form>
  );
}
