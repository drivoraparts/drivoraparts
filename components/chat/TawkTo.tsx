"use client";

import Script from "next/script";
import { TAWK_EMBED_SRC } from "@/lib/config/tawk";

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

export default function TawkTo() {
  return (
    <>
      <Script id="tawk-bootstrap" strategy="afterInteractive">
        {`
          window.Tawk_API = window.Tawk_API || {};
          window.Tawk_LoadStart = new Date();
          window.Tawk_API.onLoaded = function () {
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
