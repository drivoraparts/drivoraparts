"use client";

import { Suspense, useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { getMetaPixelId } from "@/lib/analytics/meta-pixel";

function installMetaPixel(pixelId: string, onReady: () => void): void {
  if (typeof document === "undefined" || window.fbq) {
    onReady();
    return;
  }

  const inline = document.createElement("script");
  inline.id = "meta-pixel-inline";
  inline.text = `
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
    n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', '${pixelId}');
  `;
  inline.onload = onReady;
  document.head.appendChild(inline);
}

function MetaPixelTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const pixelId = getMetaPixelId();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!pixelId) return;
    installMetaPixel(pixelId, () => setReady(true));
  }, [pixelId]);

  useEffect(() => {
    if (!ready || !window.fbq) return;
    window.fbq("track", "PageView");
  }, [ready, pathname, searchParams]);

  return null;
}

export default function MetaPixel() {
  const pixelId = getMetaPixelId();
  if (!pixelId) return null;

  return (
    <>
      <Suspense fallback={null}>
        <MetaPixelTracker />
      </Suspense>
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}
