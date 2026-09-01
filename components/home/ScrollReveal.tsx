"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

import { MOTION, prefersReducedMotion } from "@/lib/motion/motion";

/**
 * Fade/rise-in wrapper, triggered once when the section enters view.
 *
 * WHY THIS RENDERS VISIBLE AND THEN HIDES, RATHER THAN THE REVERSE
 * This used to render `opacity: 0` from the server and wait for an
 * IntersectionObserver callback to raise it. That makes the animation load
 * bearing: the content only exists on screen if a client-side observer runs.
 * If the bundle fails, if hydration throws, if IntersectionObserver is
 * missing or simply never fires, the section stays at zero opacity forever --
 * present in the DOM, readable to a crawler, and invisible to the customer,
 * with nothing in the console to say so.
 *
 * That is the same shape of failure that stopped the homepage hero shuffling:
 * behaviour hung off a callback that was assumed to always fire. So the
 * default is inverted here. The server, and the first client render, emit the
 * finished state -- no opacity, no transform. Every path where JavaScript does
 * not complete now ends with the content on screen. The animation is added
 * afterwards, by JavaScript, to something that was already visible.
 *
 * WHY ONLY OFF-SCREEN SECTIONS ANIMATE
 * Hiding happens in a layout effect, before the browser paints, so there is no
 * flash -- but only if that effect runs before the first paint. Hydration can
 * land well after it on a slow connection, and hiding content the visitor is
 * already reading would be a visible flicker.
 *
 * So an element that is on screen when this mounts is left alone: no hiding,
 * no animation, it simply stays where it is. Only elements below the fold are
 * hidden and revealed, and those cannot flicker, because nobody can see them
 * do it. The animation therefore appears exactly where it is legible -- as you
 * scroll to a section -- and is skipped where it would only ever have been a
 * flash on load.
 *
 * WHY THERE IS A TIMER
 * An observer that never fires must not be able to hold content off screen.
 * If MOTION.revealFallbackMs elapses without an intersection, the content is
 * revealed regardless. The animation is forfeited; the content is not.
 */

// useLayoutEffect has no meaning on the server and React warns when it is
// called there. The behaviour we need -- run before paint -- only exists in
// the browser, so fall back to useEffect where there is no browser.
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

type Phase =
  /** The finished state. What the server renders, and where every failure ends up. */
  | "static"
  /** Below the fold and waiting. Applied before paint, never seen. */
  | "hidden"
  /** Animating to the finished state. */
  | "revealed";

export default function ScrollReveal({
  children,
  className,
  delayMs = 0,
  distance = MOTION.distance.md,
}: {
  children: ReactNode;
  className?: string;
  /** Stagger offset within a group. Keep groups small -- three or four items. */
  delayMs?: number;
  /** How far the element rises, in px. */
  distance?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<Phase>("static");

  useIsomorphicLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;

    // Asked for less motion: the finished state is already on screen, so
    // there is nothing to do. Not "animate faster" -- do not animate.
    if (prefersReducedMotion()) return;

    // No observer means no way to know when this scrolls into view. Leaving
    // it visible is the only acceptable answer.
    if (typeof IntersectionObserver === "undefined") return;

    // Already on screen -- see the note above about flicker.
    let box: DOMRect;
    try {
      box = node.getBoundingClientRect();
    } catch {
      return; // Cannot measure; stay visible.
    }
    const viewportHeight = window.innerHeight || 0;
    if (box.top < viewportHeight && box.bottom > 0) return;

    setPhase("hidden");

    let net: ReturnType<typeof setTimeout> | undefined;
    let observer: IntersectionObserver | undefined;
    let done = false;

    const reveal = () => {
      if (done) return;
      done = true;
      if (net) clearTimeout(net);
      observer?.disconnect();
      setPhase("revealed");
    };

    observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) reveal();
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" }
    );
    observer.observe(node);

    // The net. See the note above.
    net = setTimeout(reveal, MOTION.revealFallbackMs);

    return () => {
      done = true;
      if (net) clearTimeout(net);
      observer?.disconnect();
    };
  }, []);

  // `static` deliberately carries no inline style at all, so the finished
  // state is the element's natural one and cannot be left half-applied.
  let style: CSSProperties | undefined;
  if (phase === "hidden") {
    style = {
      opacity: 0,
      transform: `translateY(${distance}px)`,
      // No transition on the way in to `hidden`: this is a setup step, not an
      // animation, and transitioning it would play the entrance backwards.
      transition: "none",
    };
  } else if (phase === "revealed") {
    style = {
      opacity: 1,
      transform: "translateY(0)",
      transitionProperty: "opacity, transform",
      transitionDuration: `${MOTION.duration.slow}ms`,
      transitionTimingFunction: MOTION.ease.entrance,
      transitionDelay: `${delayMs}ms`,
      // Hint the compositor for the duration of the entrance only.
      willChange: "opacity, transform",
    };
  }

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
}
