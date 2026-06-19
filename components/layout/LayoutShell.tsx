"use client";

import { useState } from "react";
import GlobalHeader from "./GlobalHeader";
import GlobalDrawer from "./GlobalDrawer";
import MarketOverlay from "../market/MarketOverlay";
import GlobalFooter from "./GlobalFooter";

export default function LayoutShell({ children }: any) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [marketOpen, setMarketOpen] = useState(false);

  return (
    <>
      {/* HEADER */}
      <GlobalHeader
        setMenuOpen={setMenuOpen}
        setCartOpen={setCartOpen}
        setMarketOpen={setMarketOpen}
      />

      {/* MARKET OVERLAY (ONLY ONE SOURCE OF TRUTH) */}
      {marketOpen && (
        <MarketOverlay onClose={() => setMarketOpen(false)} />
      )}

      {/* DRAWER (MENU + CART ONLY) */}
      <GlobalDrawer
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        cartOpen={cartOpen}
        setCartOpen={setCartOpen}
      />

      {/* PAGE CONTENT */}
      <main className="pt-[80px]">
        {children}
      </main>

      {/* FOOTER (CONNECTED SYSTEM) */}
      <GlobalFooter />
    </>
  );
}