"use client";

import { MarketProvider } from "@/components/context/MarketContext";
import { CartProvider } from "@/context/CartContext";
import Toast from "@/components/Toast";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MarketProvider>
      <CartProvider>
        {children}
        <Toast />
      </CartProvider>
    </MarketProvider>
  );
}