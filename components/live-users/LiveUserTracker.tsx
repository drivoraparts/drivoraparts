"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { sendLiveHeartbeat } from "@/lib/live-users/client";

export default function LiveUserTracker() {
  const pathname = usePathname();
  const previousPath = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname) return;

    sendLiveHeartbeat(pathname, previousPath.current ?? undefined);
    previousPath.current = pathname;

    const interval = setInterval(() => {
      sendLiveHeartbeat(pathname, previousPath.current ?? undefined);
    }, 15_000);

    return () => clearInterval(interval);
  }, [pathname]);

  return null;
}
