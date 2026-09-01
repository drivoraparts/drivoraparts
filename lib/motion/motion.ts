/**
 * The motion vocabulary.
 *
 * These numbers are not new. They are the values the site already animates
 * with, pulled into one place so every section reaches for the same duration
 * and the same curve instead of each component inventing its own. Nothing
 * that currently animates changes as a result of this file existing.
 *
 * The mirror of these values lives in app/globals.css as --motion-* custom
 * properties, for the parts of the system that animate in CSS (hover states,
 * filter transitions). Keep the two in step.
 *
 * Rules this system holds itself to:
 *
 * - Only `transform` and `opacity` are animated. Both are compositor
 *   properties, so they do not trigger layout or paint, and a section can
 *   animate while the product grid below it is still being scrolled.
 * - Nothing animates that content depends on to be readable. Motion is added
 *   to something already visible, never used to bring it into existence.
 * - Reduced motion is honoured by not animating at all, not by animating
 *   faster.
 */

export const MOTION = {
  duration: {
    /** Hover and focus feedback. Fast enough to feel like a direct response. */
    fast: 160,
    /** State changes: filters opening, a sort re-ordering. */
    base: 320,
    /** Section entrances. Matches what ScrollReveal has always used. */
    slow: 700,
  },

  ease: {
    /**
     * Decelerating. Starts quickly and settles, which is what makes an
     * entrance read as arriving rather than sliding. The site's existing
     * reveal curve, unchanged.
     */
    entrance: "cubic-bezier(0.16, 1, 0.3, 1)",
    /** Symmetric, for reversible states like hover on and hover off. */
    state: "cubic-bezier(0.4, 0, 0.2, 1)",
  },

  distance: {
    /** Hover nudges: a card lifting, an arrow advancing. */
    sm: 8,
    /** Section entrances. The existing reveal distance. */
    md: 18,
  },

  /** Gap between items in a staggered group. Three or four items at most. */
  stagger: 70,

  /**
   * How long a reveal will wait for IntersectionObserver before showing the
   * content anyway.
   *
   * The hero's shuffle died because it trusted requestAnimationFrame to keep
   * firing, and rAF stopped on a page that reported itself visible. The same
   * caution applies here: an observer that never fires must not be able to
   * keep content off the screen. If this timer wins, the visitor sees the
   * content -- the only thing lost is the animation, which is the correct
   * thing to lose.
   */
  revealFallbackMs: 1200,
} as const;

/**
 * Whether this visitor asked for less motion.
 *
 * Returns false when there is no window or no matchMedia, which is the safe
 * answer: it means "no preference expressed", and the caller's own failure
 * handling decides what to do. Never throws.
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  if (typeof window.matchMedia !== "function") return false;
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}
