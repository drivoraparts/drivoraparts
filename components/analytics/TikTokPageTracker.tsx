"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/** Fires ttq.page() on client navigations (initial PageView is in head snippet). */
export default function TikTokPageTracker() {
  const pathname = usePathname();
  const isFirst = useRef(true);

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }

    const fire = () => {
      window.ttq?.page?.();
    };

    if (typeof window.ttq?.ready === "function") {
      window.ttq.ready(fire);
    } else {
      fire();
    }
  }, [pathname]);

  return null;
}
