"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

/**
 * FIND YOUR VEHICLE — one platform at a time, large.
 *
 * This replaced an eleven-up grid of small cards. The cards were not failing
 * because of their colour treatment: at that size every photograph's
 * background -- show-floor signage, dealer forecourt, car park -- competed
 * with the vehicle, and eleven different backgrounds at once read as clutter.
 * Shown one at a time and large, the vehicle dominates its own frame and the
 * surroundings stop mattering.
 *
 * The data is passed in already flattened. data/vehicles.ts carries fitment
 * regexes and long prose per platform, and none of that should cross to the
 * client just to render a name and a picture.
 *
 * Only the active slide is mounted. Eleven simultaneous <img> elements would
 * cost far more than the fade is worth, and the browser fetches each one the
 * first time it is shown.
 */

export type ShowcaseItem = {
  slug: string;
  name: string;
  tagline: string;
  src: string | null;
  srcSet: string | null;
  width: number | null;
  height: number | null;
};

export default function VehicleShowcase({ items }: { items: ShowcaseItem[] }) {
  const [index, setIndex] = useState(0);
  // Whether the visitor has moved the carousel at all. Before that the section
  // may still be below the fold, so the first slide is worth deferring; after
  // it, the active slide is by definition the thing being looked at and must
  // not wait on an intersection check.
  const [touched, setTouched] = useState(false);
  const [held, setHeld] = useState(false);
  const liveRef = useRef<HTMLDivElement>(null);

  const go = useCallback(
    (next: number) => {
      setTouched(true);
      setIndex(((next % items.length) + items.length) % items.length);
    },
    [items.length]
  );

  // Arrow keys only while the carousel itself has focus, so they do not fight
  // the page's normal scrolling.
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") { e.preventDefault(); go(index - 1); }
    if (e.key === "ArrowRight") { e.preventDefault(); go(index + 1); }
  };

  useEffect(() => {
    if (liveRef.current) liveRef.current.textContent = `${items[index].name}, ${index + 1} of ${items.length}`;
  }, [index, items]);

  /*
   * Advances on its own so the section shows its range without being clicked.
   *
   * `held` covers pointer and keyboard focus: reading a vehicle's copy while
   * the slide changes underneath is the classic carousel failure, and WCAG
   * 2.2.2 wants moving content stoppable. Hover and focus are that mechanism
   * here rather than a visible button.
   *
   * The interval also stops when the tab is hidden -- otherwise a backgrounded
   * page quietly works through eleven image fetches nobody is looking at.
   * `index` is in the dependency list on purpose: every manual move restarts
   * the clock, so a slide never gets cut short right after being chosen.
   */
  useEffect(() => {
    if (held || items.length < 2) return;
    if (typeof document !== "undefined" && document.visibilityState === "hidden") return;
    const id = window.setInterval(() => {
      setTouched(true);
      setIndex((i) => (i + 1) % items.length);
    }, 3000);
    return () => window.clearInterval(id);
  }, [held, items.length, index]);

  // Re-evaluate when the tab is backgrounded or restored.
  useEffect(() => {
    const onVis = () => setHeld((h) => h);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  if (!items.length) return null;
  const active = items[index];

  return (
    <div
      className="mt-12"
      role="group"
      aria-roledescription="carousel"
      aria-label="Vehicle platforms"
      tabIndex={0}
      onKeyDown={onKeyDown}
      onMouseEnter={() => setHeld(true)}
      onMouseLeave={() => setHeld(false)}
      onFocusCapture={() => setHeld(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setHeld(false);
      }}
    >
      <div className="grid items-center gap-8 lg:grid-cols-[1.35fr_1fr] lg:gap-14">
        {/* The picture. Fixed aspect so switching slides never shifts layout. */}
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-surface-muted">
          {active.src ? (
            <img
              key={active.slug}
              src={active.src}
              srcSet={active.srcSet ?? undefined}
              sizes="(min-width: 1024px) 56rem, 100vw"
              width={active.width ?? undefined}
              height={active.height ?? undefined}
              alt={active.name}
              loading={touched ? "eager" : "lazy"}
              decoding="async"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-end bg-background-dark p-6">
              <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-on-dark">
                {active.name}
              </span>
            </div>
          )}
        </div>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-accent">
            Start your build
          </p>
          <h3 className="mt-3 text-[clamp(1.75rem,4vw,2.75rem)] font-bold uppercase leading-[1.02] tracking-[-0.015em] text-foreground">
            {active.name}
          </h3>
          <p className="mt-4 max-w-md text-base leading-relaxed text-muted">
            {active.tagline}
          </p>

          <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <Link
              href={`/vehicles/${active.slug}`}
              prefetch={false}
              className="touch-manipulation inline-flex items-center justify-center bg-foreground px-8 py-4 text-sm font-bold uppercase tracking-[0.12em] text-background transition-colors hover:bg-accent-hover"
            >
              View parts
            </Link>
            <Link
              href="/vehicles"
              prefetch={false}
              className="touch-manipulation inline-flex items-center gap-2 border border-border-strong px-8 py-4 text-sm font-bold uppercase tracking-[0.12em] text-foreground transition-colors hover:border-foreground"
            >
              All vehicles
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Controls. Buttons rather than dots alone: a 6px dot is not a
          reasonable tap target, so the arrows carry the real interaction and
          the dots show position. */}
      <div className="mt-8 flex items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Choose a vehicle">
          {items.map((it, i) => (
            <button
              key={it.slug}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={it.name}
              onClick={() => go(i)}
              className={`h-1.5 w-8 transition-colors ${
                i === index ? "bg-accent" : "bg-border-strong hover:bg-muted"
              }`}
            />
          ))}
        </div>

        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => go(index - 1)}
            aria-label="Previous vehicle"
            className="inline-flex h-11 w-11 items-center justify-center border border-border-strong text-foreground transition-colors hover:border-foreground"
          >
            <span aria-hidden="true">←</span>
          </button>
          <button
            type="button"
            onClick={() => go(index + 1)}
            aria-label="Next vehicle"
            className="inline-flex h-11 w-11 items-center justify-center border border-border-strong text-foreground transition-colors hover:border-foreground"
          >
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>

      <div ref={liveRef} aria-live="polite" className="sr-only" />
    </div>
  );
}
