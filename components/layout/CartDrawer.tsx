"use client";

import { useEffect, useRef, useState } from "react";
import CartContents from "@/components/cart/CartContents";

/** Keep in step with the duration-300 classes below. */
const TRANSITION_MS = 300;

type CartDrawerProps = {
  open: boolean;
  onClose: () => void;
};

export default function CartDrawer({ open, onClose }: CartDrawerProps) {
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
    // backdrop -- an apparently empty cart the customer can't dismiss.
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

    // Hand focus back to whatever opened the drawer (the cart button).
    lastFocusedRef.current?.focus?.();
  }, [open]);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-[9999]">
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
        aria-label="Shopping cart"
        tabIndex={-1}
        // Stays a drawer on phones rather than becoming a full-screen page:
        // the visible strip of backdrop is what tells the customer the page
        // behind is still there.
        className={`absolute right-0 top-0 flex h-full w-[88%] max-w-[420px] flex-col border-l border-neutral-200 bg-white shadow-xl outline-none transition-transform duration-300 ease-out sm:w-[400px] ${
          visible ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <CartContents variant="drawer" onClose={onClose} />
      </div>
    </div>
  );
}
