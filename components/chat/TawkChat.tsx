"use client";

import { useEffect } from "react";
import { makeTawkDraggable, teardownTawkDraggable } from "@/lib/chat/draggable-tawk";

const TAWK_SITE_ID = "6a392868452f781d473b4ceb";
const TAWK_WIDGET_ID = "1jrs9hdba";
const TAWK_EMBED_SRC = `https://embed.tawk.to/${TAWK_SITE_ID}/${TAWK_WIDGET_ID}`;

declare global {
  interface Window {
    Tawk_API?: {
      onLoaded?: () => void;
      showWidget?: () => void;
      hideWidget?: () => void;
      maximize?: () => void;
      customStyle?: {
        visibility?: {
          desktop?: { position?: string; xOffset?: number; yOffset?: number };
          mobile?: { position?: string; xOffset?: number; yOffset?: number };
        };
      };
      [key: string]: unknown;
    };
    Tawk_LoadStart?: Date;
  }
}

// Clears the fixed sticky purchase bar on product pages (69px tall on both
// breakpoints) so the launcher bubble never sits underneath its buttons.
const TAWK_Y_OFFSET = 90;

function installTawkScript(): void {
  if (typeof document === "undefined") return;
  if (document.getElementById("tawk-script")) return;

  window.Tawk_API = window.Tawk_API || {};
  window.Tawk_LoadStart = new Date();
  window.Tawk_API.customStyle = {
    visibility: {
      desktop: { position: "br", xOffset: 20, yOffset: TAWK_Y_OFFSET },
      mobile: { position: "br", xOffset: 10, yOffset: TAWK_Y_OFFSET },
    },
  };
  window.Tawk_API.onLoaded = function () {
    window.Tawk_API?.showWidget?.();
  };

  // Polls for the widget on its own, so it does not depend on Tawk's
  // onLoaded callback surviving the script's own initialisation.
  makeTawkDraggable();

  const script = document.createElement("script");
  script.id = "tawk-script";
  script.async = true;
  script.src = TAWK_EMBED_SRC;
  script.charset = "UTF-8";

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
      return () => {
        w.cancelIdleCallback?.(id);
        teardownTawkDraggable();
      };
    }

    const timer = window.setTimeout(installTawkScript, 3000);
    return () => {
      window.clearTimeout(timer);
      teardownTawkDraggable();
    };
  }, []);

  return null;
}
