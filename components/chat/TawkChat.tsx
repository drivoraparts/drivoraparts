"use client";

import { useEffect } from "react";

const TAWK_SITE_ID = "6a392868452f781d473b4ceb";
const TAWK_EMBED_SRC = `https://embed.tawk.to/${TAWK_SITE_ID}/default`;

declare global {
  interface Window {
    Tawk_API?: {
      onLoaded?: () => void;
      showWidget?: () => void;
      hideWidget?: () => void;
      [key: string]: unknown;
    };
    Tawk_LoadStart?: Date;
  }
}

function installTawkScript(): void {
  if (typeof document === "undefined") return;
  if (document.getElementById("tawk-script")) return;

  window.Tawk_API = window.Tawk_API || {};
  window.Tawk_LoadStart = new Date();
  window.Tawk_API.onLoaded = function () {
    window.Tawk_API?.showWidget?.();
  };

  const script = document.createElement("script");
  script.id = "tawk-script";
  script.async = true;
  script.src = TAWK_EMBED_SRC;
  script.charset = "UTF-8";
  script.setAttribute("crossorigin", "*");

  document.body.appendChild(script);
}

export default function TawkChat() {
  useEffect(() => {
    const w = window as typeof window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };

    if (typeof w.requestIdleCallback === "function") {
      const id = w.requestIdleCallback(installTawkScript, { timeout: 4000 });
      return () => w.cancelIdleCallback?.(id);
    }

    const timer = window.setTimeout(installTawkScript, 3000);
    return () => window.clearTimeout(timer);
  }, []);

  return null;
}
