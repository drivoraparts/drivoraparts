"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { MOTION, prefersReducedMotion } from "@/lib/motion/motion";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * A number that counts up to its value once, on mount.
 *
 * WHAT IT RENDERS WHEN NOTHING RUNS
 * The final value. Server-rendered, and the first client render matches it, so
 * a dead bundle, a thrown hydration or a browser with no timers all leave the
 * real figure on screen. The animation replaces a correct number with a
 * sequence ending at the same correct number -- it is never the reason the
 * figure is right.
 *
 * WHY IT SOMETIMES DECLINES TO ANIMATE
 * Counting up means starting below the answer. If hydration lands after the
 * browser has already painted -- routine on a slow connection -- starting the
 * count would show 1,890, snap back to 0, and climb again. A number jumping
 * backwards reads as a glitch, and worse, as unreliable data.
 *
 * So it only animates while the page is still young. Past ANIMATE_WITHIN_MS
 * from navigation start the figure has almost certainly been seen, and the
 * animation is skipped rather than played incorrectly. Same rule ScrollReveal
 * follows for content already on screen: motion is declined wherever it could
 * only manifest as a flicker.
 *
 * WHY IT DOES NOT USE requestAnimationFrame
 * rAF stops whenever the page is not compositing, and it can do so on a page
 * that reports itself visible -- which is what left the homepage hero playing
 * one shot instead of shuffling three. A stalled counter would strand a number
 * mid-climb, displaying a figure that is simply wrong. This steps on a timer
 * and reads the clock each tick, so throttling makes it coarser but never
 * stops it landing, and a final timer guarantees the true value regardless.
 */

/** Past this point after navigation start, assume the figure has been seen. */
const ANIMATE_WITHIN_MS = 1200;
/** ~30fps. Fine enough to read as motion, cheap enough to be free. */
const TICK_MS = 33;

export default function CountUp({
  value,
  durationMs = 900,
  className,
}: {
  value: number;
  durationMs?: number;
  className?: string;
}) {
  const [display, setDisplay] = useState(value);
  const startedRef = useRef(false);

  useIsomorphicLayoutEffect(() => {
    // Once per mount. A re-render must never restart the climb.
    if (startedRef.current) return;
    if (prefersReducedMotion()) return;
    if (value <= 0) return;

    // See the note above on animating late.
    const elapsedSinceLoad =
      typeof performance !== "undefined" ? performance.now() : 0;
    if (elapsedSinceLoad > ANIMATE_WITHIN_MS) return;

    startedRef.current = true;
    const startedAt = Date.now();
    setDisplay(0);

    // Decelerating, to match the entrance curve used everywhere else.
    const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

    const tick = window.setInterval(() => {
      // Read the clock rather than counting ticks: a throttled timer then
      // produces a coarser climb instead of a slower, wrong-length one.
      const progress = Math.min(1, (Date.now() - startedAt) / durationMs);
      setDisplay(Math.round(value * easeOut(progress)));
      if (progress >= 1) window.clearInterval(tick);
    }, TICK_MS);

    // The guarantee. Whatever happens to the interval -- throttled, dropped,
    // never scheduled -- the true figure is on screen shortly after.
    const settle = window.setTimeout(() => {
      window.clearInterval(tick);
      setDisplay(value);
    }, durationMs + 400);

    return () => {
      window.clearInterval(tick);
      window.clearTimeout(settle);
      setDisplay(value);
    };
  }, [value, durationMs]);

  return (
    <span className={className} suppressHydrationWarning>
      {display.toLocaleString()}
    </span>
  );
}
