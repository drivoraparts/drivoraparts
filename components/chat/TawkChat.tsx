"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

const TAWK_PROPERTY_ID = "6a392868452f781d473b4ceb";
const TAWK_WIDGET_ID = "default";
const TAWK_EMBED_SRC = `https://embed.tawk.to/${TAWK_PROPERTY_ID}/${TAWK_WIDGET_ID}`;

declare global {
  interface Window {
    Tawk_API?: {
      onLoaded?: () => void;
      showWidget?: () => void;
      [key: string]: unknown;
    };
    Tawk_LoadStart?: Date;
  }
}

export default function TawkChat() {
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/public/store-config")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data?.tawkEnabled === false) {
          setEnabled(false);
        }
      })
      .catch(() => {
        // Keep widget enabled when config is unavailable.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!enabled) {
    return null;
  }

  return (
    <>
      <Script id="tawk-bootstrap" strategy="afterInteractive">
        {`
          window.Tawk_API = window.Tawk_API || {};
          window.Tawk_LoadStart = new Date();
          window.Tawk_API.onLoaded = function () {
            console.log('[Tawk] Widget Loaded');
            console.log('[Tawk] Property: ${TAWK_PROPERTY_ID}');
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
        crossOrigin="anonymous"
      />
    </>
  );
}

export { TAWK_EMBED_SRC, TAWK_PROPERTY_ID, TAWK_WIDGET_ID };
