"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { MarketProvider } from "@/components/context/MarketContext";
import { CartProvider } from "@/context/CartContext";
import CurrencyProvider from "@/components/currency/CurrencyProvider";
import LanguageProvider from "@/components/i18n/LanguageProvider";
import Toast from "@/components/Toast";

const TawkChat = dynamic(() => import("@/components/chat/TawkChat"), {
  ssr: false,
  loading: () => null,
});

const LiveUserTracker = dynamic(
  () => import("@/components/live-users/LiveUserTracker"),
  { ssr: false, loading: () => null }
);

function DeferredNonCritical({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const w = window as typeof window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };

    if (typeof w.requestIdleCallback === "function") {
      const id = w.requestIdleCallback(() => setReady(true), { timeout: 12000 });
      return () => w.cancelIdleCallback?.(id);
    }

    const timer = window.setTimeout(() => setReady(true), 8000);
    return () => window.clearTimeout(timer);
  }, []);

  return ready ? children : null;
}

export default function StoreProviders({
  children,
  initialCurrency,
  initialLocale,
  initialLanguage,
}: {
  children: React.ReactNode;
  initialCurrency: string;
  initialLocale: string;
  initialLanguage: string;
}) {
  return (
    <LanguageProvider
      initialLanguage={initialLanguage}
      initialLocale={initialLocale}
    >
      <CurrencyProvider
        initialCurrency={initialCurrency}
        initialLocale={initialLocale}
      >
        <MarketProvider>
          <CartProvider>
            {children}
            <Toast />
            <DeferredNonCritical>
              <TawkChat />
              <LiveUserTracker />
            </DeferredNonCritical>
          </CartProvider>
        </MarketProvider>
      </CurrencyProvider>
    </LanguageProvider>
  );
}
