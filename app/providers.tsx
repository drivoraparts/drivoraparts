"use client";

import { MarketProvider } from "@/components/context/MarketContext";
import { CartProvider } from "@/context/CartContext";
import Toast from "@/components/Toast";
import TawkChat from "@/components/chat/TawkChat";
import LiveUserTracker from "@/components/live-users/LiveUserTracker";

export default function StoreProviders({ children }: { children: React.ReactNode }) {
  return (
    <MarketProvider>
      <CartProvider>
        {children}
        <Toast />
        <TawkChat />
        <LiveUserTracker />
      </CartProvider>
    </MarketProvider>
  );
}
