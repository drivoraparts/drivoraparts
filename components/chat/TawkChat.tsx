"use client";

import { useEffect } from "react";
import Script from "next/script";
import {
  TAWK_EMBED_SRC,
  TAWK_PROPERTY_ID,
} from "@/lib/config/tawk";

declare global {
  interface Window {
    Tawk_API?: {
      onLoaded?: () => void;
      showWidget?: () => void;
      hideWidget?: () => void;
      [key: string]: unknown;
    };
    Tawk_LoadStart?: Date;
    __TAWK_CHAT_INSTALLED__?: boolean;
  }
}

export default function TawkChat() {
  useEffect(() => {
    console.log("[Tawk] Component Mounted");
    console.log("[Tawk] Site ID: 6a392868452f781d473b4ceb");
    window.Tawk_API = window.Tawk_API || {};

    let cancelled = false;

    fetch("/api/public/store-config")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data?.tawkEnabled === false && window.Tawk_API?.hideWidget) {
          window.Tawk_API.hideWidget();
          console.log("[Tawk] Widget hidden via admin system settings");
        }
      })
      .catch(() => {
        // Ignore config failures; widget stays visible.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <Script id="tawk-bootstrap" strategy="afterInteractive">
        {`
          window.Tawk_API = window.Tawk_API || {};
          window.Tawk_LoadStart = new Date();
          window.Tawk_API.onLoaded = function () {
            console.log("[Tawk] Widget Loaded");
            console.log("[Tawk] Site ID: ${TAWK_PROPERTY_ID}");
            if (window.Tawk_API && window.Tawk_API.showWidget) {
              window.Tawk_API.showWidget();
            }
          };
        `}
      </Script>
      <Script
        id="tawk-script"
        src={TAWK_EMBED_SRC}
        strategy="afterInteractive"
        charSet="UTF-8"
        onLoad={() => {
          window.__TAWK_CHAT_INSTALLED__ = true;
          console.log("[Tawk] Script loaded successfully");
          console.log("[Tawk] Embed URL:", "${TAWK_EMBED_SRC}");
        }}
        onError={() => {
          console.error("[Tawk] Script failed to load:", "${TAWK_EMBED_SRC}");
        }}
      />
    </>
  );
}
