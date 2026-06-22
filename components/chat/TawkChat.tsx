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
    console.log("[Tawk] Widget Loaded");
    console.log("[Tawk] Site ID:", TAWK_SITE_ID);
    window.Tawk_API?.showWidget?.();
  };

  const script = document.createElement("script");
  script.id = "tawk-script";
  script.async = true;
  script.src = TAWK_EMBED_SRC;
  script.charset = "UTF-8";
  script.setAttribute("crossorigin", "*");
  script.onload = () => {
    console.log("[Tawk] Script loaded successfully");
    console.log("[Tawk] Embed URL:", TAWK_EMBED_SRC);
  };
  script.onerror = () => {
    console.error("[Tawk] Script failed to load:", TAWK_EMBED_SRC);
  };

  document.body.appendChild(script);
}

export default function TawkChat() {
  useEffect(() => {
    console.log("[Tawk] Component Mounted");
    console.log("[Tawk] Site ID:", TAWK_SITE_ID);
    installTawkScript();
  }, []);

  return null;
}
