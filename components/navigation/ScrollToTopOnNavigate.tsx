"use client";

import { Suspense, useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  clearListScrollState,
  clearPendingListScrollState,
  isCatalogAllPaginatedRestore,
  restoreListScrollWithRetry,
  shouldRestoreListScrollOnPath,
} from "@/lib/catalog/list-scroll-restore";

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
    const attemptRestore = () => {
      const pending = shouldRestoreListScrollOnPath(pathname, search);
      if (pending) {
        if (isCatalogAllPaginatedRestore(pending)) {
          return true;
        }
        restoreListScrollWithRetry(pending);
        clearPendingListScrollState();
        clearListScrollState(pending.listKey);
        return true;
      }
      return false;
    };

    if (skipFirst.current) {
      skipFirst.current = false;
      attemptRestore();
      return;
    }

    if (attemptRestore()) {
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

  useEffect(() => {
    const onPageShow = (event: PageTransitionEvent) => {
      if (!event.persisted) return;
      const pending = shouldRestoreListScrollOnPath(pathname, search);
      if (!pending || isCatalogAllPaginatedRestore(pending)) return;
      restoreListScrollWithRetry(pending);
      clearPendingListScrollState();
      clearListScrollState(pending.listKey);
    };

    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
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
