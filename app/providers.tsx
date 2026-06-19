"use client";

import { MarketProvider } from "@/components/context/MarketContext";
import { CartProvider } from "@/context/CartContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MarketProvider>
      <CartProvider>{children}</CartProvider>
    </MarketProvider>
  );
}