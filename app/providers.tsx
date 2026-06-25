"use client";

import { MarketProvider } from "@/components/context/MarketContext";
import { CartProvider } from "@/context/CartContext";
import CurrencyProvider from "@/components/currency/CurrencyProvider";
import Toast from "@/components/Toast";
import TawkChat from "@/components/chat/TawkChat";
import LiveUserTracker from "@/components/live-users/LiveUserTracker";

export default function StoreProviders({
  children,
  initialCurrency,
  initialLocale,
}: {
  children: React.ReactNode;
  initialCurrency: string;
  initialLocale: string;
}) {
  return (
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
  );
}
