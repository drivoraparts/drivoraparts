"use client";

import { MarketProvider } from "@/components/context/MarketContext";
import { CartProvider } from "@/context/CartContext";
import Toast from "@/components/Toast";
import TawkTo from "@/components/chat/TawkTo";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MarketProvider>
      <CartProvider>
        {children}
        <Toast />
        <TawkTo />
      </CartProvider>
    </MarketProvider>
  );
}