"use client";

import { Suspense, useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function scrollDocumentToTop() {
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}

function ScrollToTopOnNavigateInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const skipFirst = useRef(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  useEffect(() => {
    if (skipFirst.current) {
      skipFirst.current = false;
      return;
    }

    scrollDocumentToTop();

    const raf = window.requestAnimationFrame(() => {
      scrollDocumentToTop();
      window.requestAnimationFrame(scrollDocumentToTop);
    });

    const timer = window.setTimeout(scrollDocumentToTop, 120);

    return () => {
      window.cancelAnimationFrame(raf);
      window.clearTimeout(timer);
    };
  }, [pathname, search]);

  return null;
}

export default function ScrollToTopOnNavigate() {
  return (
    <Suspense fallback={null}>
      <ScrollToTopOnNavigateInner />
    </Suspense>
  );
}
