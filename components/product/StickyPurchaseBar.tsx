"use client";

import { useEffect, useState, type RefObject } from "react";
import AddToCartButton, {
  type AddToCartProduct,
} from "@/app/components/AddToCartButton";
import BuyNowButton from "@/app/components/BuyNowButton";

type StickyPurchaseBarProps = {
  ctaRef: RefObject<HTMLElement | null>;
  product: AddToCartProduct;
  quantity: number;
  inStock: boolean;
};

/**
 * The purchase bar that appears once the main CTA has scrolled away.
 *
 * WHY THIS NO LONGER USES IntersectionObserver
 * It used to start hidden and become visible only when an IntersectionObserver
 * reported the CTA had left the viewport. That made the observer the sole path
 * to the bar -- and this bar is the only place BuyNowButton is rendered on the
 * whole product page, so an observer that never fired meant a customer had no
 * Buy Now at all.
 *
 * It does not fire reliably. IntersectionObserver runs on the same frame clock
 * as requestAnimationFrame and CSS animations, and that clock stops whenever
 * the page is not compositing -- on a page that still reports itself visible.
 * Measured on the live product page: zero observer callbacks, so zero Buy Now.
 * The same root cause had already stopped the homepage hero shuffling and left
 * catalog sections at opacity 0.
 *
 * Scroll and resize events do not depend on that clock. Measuring the CTA's
 * position directly when they fire answers the identical question -- is the
 * CTA off screen -- through a mechanism that keeps working when the compositor
 * has stalled. One source of truth rather than two that can disagree.
 *
 * The reads are throttled to roughly ten a second, with a trailing measurement
 * so the bar settles in the right state when scrolling stops rather than
 * wherever the last sampled frame happened to be.
 */

/** Minimum gap between geometry reads while scrolling, in ms. */
const SAMPLE_MS = 100;
/** How long after the last scroll event to take a final reading. */
const SETTLE_MS = 140;
/**
 * How often to re-measure regardless of events.
 *
 * Scroll events are not guaranteed either. Measured in a real embedding of
 * this site: the scroll position moved from 0 to 1500 while zero scroll
 * events were dispatched, on the same page where the observer never fired.
 * A component that only reacts to events therefore latches whatever it read
 * at mount and never updates -- which is how this bar ended up permanently
 * visible instead of permanently hidden. Neither is correct.
 *
 * A timer is the one mechanism that has kept working everywhere in this
 * project when rAF, IntersectionObserver, CSS animations and scroll events
 * have each stopped. One getBoundingClientRect three times a second costs
 * nothing measurable and makes the bar correct rather than lucky.
 */
const POLL_MS = 300;

/**
 * Distance from the top of the document to an element.
 *
 * Walks offsetTop up the offsetParent chain rather than reading
 * getBoundingClientRect. Both describe the same box, but the rect is
 * expressed relative to the viewport, which means it depends on the current
 * scroll offset -- and that value goes stale on a page that is not
 * compositing, because nothing forces the reflow that would refresh it.
 *
 * That staleness is not theoretical. With rect-based measurement this bar
 * tracked exactly one scroll position behind: correct at the top of the
 * page, then wrong at every subsequent stop, showing while the CTA was on
 * screen and hiding once it had scrolled away.
 *
 * offsetTop and offsetHeight are layout values that do not move when the
 * page scrolls, so they cannot go stale for this purpose, and window.scrollY
 * supplies the scroll position separately and accurately.
 */
function documentTop(element: HTMLElement): number {
  let total = 0;
  let node: HTMLElement | null = element;
  while (node) {
    total += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return total;
}

export default function StickyPurchaseBar({
  ctaRef,
  product,
  quantity,
  inStock,
}: StickyPurchaseBarProps) {
  const [ctaOffScreen, setCtaOffScreen] = useState(false);

  useEffect(() => {
    let lastSample = 0;
    let settle: ReturnType<typeof setTimeout> | undefined;
    let stopped = false;

    const measure = () => {
      if (stopped) return;
      const target = ctaRef.current;
      // The ref can still be empty on the first pass. Returning without
      // latching anything means the next scroll simply tries again, rather
      // than the bar being disabled for the life of the page.
      if (!target) return;

      const viewportHeight =
        window.innerHeight || document.documentElement.clientHeight || 0;
      if (viewportHeight === 0) return; // nothing meaningful to compare against

      let top: number;
      let height: number;
      try {
        top = documentTop(target as HTMLElement);
        height = (target as HTMLElement).offsetHeight;
      } catch {
        return;
      }

      const scrolled =
        window.scrollY ?? document.documentElement.scrollTop ?? 0;

      // Off screen means scrolled past above, or not yet reached below. The
      // 8px margin matches the rootMargin the observer used, so the bar
      // appears at the same point it always did.
      const bottom = top + height;
      setCtaOffScreen(
        bottom <= scrolled + 8 || top >= scrolled + viewportHeight
      );
    };

    const onScroll = () => {
      const now = Date.now();
      if (now - lastSample >= SAMPLE_MS) {
        lastSample = now;
        measure();
      }
      // Trailing read: the throttle above can skip the frame where scrolling
      // actually stopped.
      if (settle) clearTimeout(settle);
      settle = setTimeout(measure, SETTLE_MS);
    };

    measure();

    // The guarantee. See POLL_MS above.
    const poll = setInterval(measure, POLL_MS);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    window.addEventListener("orientationchange", onScroll);

    return () => {
      stopped = true;
      clearInterval(poll);
      if (settle) clearTimeout(settle);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("orientationchange", onScroll);
    };
  }, [ctaRef]);

  if (!ctaOffScreen || !inStock) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[9998] border-t border-neutral-300 bg-white/95 px-4 py-3 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] backdrop-blur-md">
      <div className="mx-auto flex max-w-[1200px] items-center gap-3 md:justify-end">
        <AddToCartButton
          product={product}
          quantity={quantity}
          className="!flex-1 !rounded-none !border-2 !border-accent !bg-white !px-4 !py-3 !text-xs !font-black !uppercase !tracking-[0.1em] !text-neutral-900 hover:!bg-accent-subtle md:!flex-none md:!min-w-[180px]"
        />
        <BuyNowButton
          product={product}
          quantity={quantity}
          className="!mt-0 !flex-1 !rounded-none !border !border-neutral-900 !bg-neutral-900 !px-4 !py-3 !text-xs !font-bold !uppercase !tracking-[0.1em] !text-white hover:!bg-neutral-800 md:!flex-none md:!min-w-[180px]"
        />
      </div>
    </div>
  );
}
