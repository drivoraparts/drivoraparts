"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/** Keep in step with the duration-300 classes below. */
const TRANSITION_MS = 300;

type SideDrawerProps = {
  open: boolean;
  onClose: () => void;
  /** Edge the panel slides in from. */
  side: "left" | "right";
  /** Visible heading, and the dialog's accessible name. */
  title: string;
  /** Accessible label for the close button, e.g. "Close cart". */
  closeLabel: string;
  /** Optional content beside the heading, e.g. a cart item count. */
  headerAside?: ReactNode;
  children: ReactNode;
};

/**
 * Shared slide-over shell for the cart and nav drawers. The mechanics below
 * (mount/unmount around the transition, focus trap, scroll lock) are fiddly
 * enough that keeping two copies in sync would be a liability -- the panels
 * differ only by which edge they enter from and what they contain.
 */
export default function SideDrawer({
  open,
  onClose,
  side,
  title,
  closeLabel,
  headerAside,
  children,
}: SideDrawerProps) {
  // `mounted` keeps the panel in the DOM for the length of the closing slide;
  // `visible` drives the transform. Deliberately NOT rendered unconditionally:
  // the cart store rehydrates from localStorage on the client, so a
  // server-rendered (always empty) cart would mismatch a client render that
  // already has items -- the same hydration trap documented in
  // AllProductsFeed. Mounting only on open keeps this client-only.
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) {
      setVisible(false);
      const timer = window.setTimeout(() => setMounted(false), TRANSITION_MS);
      return () => window.clearTimeout(timer);
    }

    setMounted(true);
    // rAF gives the panel one paint in its off-screen position so the slide
    // actually animates. The timeout is not belt-and-braces: rAF callbacks are
    // suspended outright while the tab isn't compositing, and without a
    // fallback the panel would stay parked off-screen behind a visible
    // backdrop -- an apparently empty drawer the customer can't dismiss.
    const frame = requestAnimationFrame(() => setVisible(true));
    const fallback = window.setTimeout(() => setVisible(true), 50);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(fallback);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      // Simple focus trap: keep Tab cycling inside the drawer while it's open.
      if (event.key !== "Tab" || !panelRef.current) return;

      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && (active === first || active === panelRef.current)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;

    // Lock the page behind the drawer. Setting overflow (rather than
    // position: fixed) holds the scroll position, so closing never jumps the
    // customer somewhere else; padding compensates for the scrollbar the lock
    // removes, so the page underneath doesn't visibly shift.
    const { body, documentElement } = document;
    const previousOverflow = body.style.overflow;
    const previousPaddingRight = body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - documentElement.clientWidth;

    body.style.overflow = "hidden";
    if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;

    return () => {
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPaddingRight;
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      lastFocusedRef.current = document.activeElement as HTMLElement | null;
      const timer = window.setTimeout(() => panelRef.current?.focus(), 0);
      return () => window.clearTimeout(timer);
    }

    // Hand focus back to whatever opened the drawer.
    lastFocusedRef.current?.focus?.();
  }, [open]);

  if (!mounted) return null;

  const isLeft = side === "left";
  const closedPosition = isLeft ? "-translate-x-full" : "translate-x-full";

  return (
    // Above the header (9999) and quick-view (10000), below toasts (10003) so
    // "Removed from cart" stays readable while the drawer is open.
    <div className="fixed inset-0 z-[10001]">
      <div
        className={`absolute inset-0 bg-neutral-900/40 transition-opacity duration-300 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        // Stays a drawer on phones rather than becoming a full-screen page:
        // the visible strip of backdrop is what tells the customer the page
        // behind is still there.
        className={`absolute top-0 ${
          isLeft ? "left-0 border-r" : "right-0 border-l"
        } flex h-full w-[88%] max-w-[420px] flex-col border-neutral-200 bg-white shadow-xl outline-none transition-transform duration-300 ease-out sm:w-[400px] ${
          visible ? "translate-x-0" : closedPosition
        }`}
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-neutral-200 px-6 py-4">
          <h2 className="text-xl font-bold text-neutral-900">{title}</h2>
          <div className="flex items-center gap-2">
            {headerAside}
            <button
              type="button"
              onClick={onClose}
              aria-label={closeLabel}
              // -mr-2 pulls the 44px tap target back to the panel's optical
              // edge without shrinking it below a comfortable thumb size.
              className="-mr-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-2xl leading-none text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            >
              ×
            </button>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      </div>
    </div>
  );
}
