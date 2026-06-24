"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { sendLiveHeartbeat } from "@/lib/live-users/client";

export default function LiveUserTracker() {
  const pathname = usePathname();
  const previousPath = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname) return;

    const previousPage = previousPath.current ?? undefined;
    previousPath.current = pathname;

    let interval: ReturnType<typeof setInterval> | undefined;

    const begin = () => {
      sendLiveHeartbeat(pathname, previousPage);
      interval = setInterval(() => {
        sendLiveHeartbeat(pathname, previousPath.current ?? undefined);
      }, 15_000);
    };

    const w = window as typeof window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };

    let idleId: number | undefined;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    if (typeof w.requestIdleCallback === "function") {
      idleId = w.requestIdleCallback(begin, { timeout: 3000 });
    } else {
      timeoutId = setTimeout(begin, 2000);
    }

    return () => {
      if (interval) clearInterval(interval);
      if (idleId !== undefined) w.cancelIdleCallback?.(idleId);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [pathname]);

  return null;
}
