"use client";

import dynamic from "next/dynamic";
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
            <TawkChat />
            <LiveUserTracker />
          </CartProvider>
        </MarketProvider>
      </CurrencyProvider>
    </LanguageProvider>
  );
}
