"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import GlobalHeader from "./GlobalHeader";
import GlobalDrawer from "./GlobalDrawer";
import GlobalFooter from "./GlobalFooter";
const MarketOverlay = dynamic(() => import("../market/MarketOverlay"), {
  ssr: false,
});

type Props = {
  children: React.ReactNode;
};

export default function LayoutShell({ children }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [marketOpen, setMarketOpen] = useState(false);

  return (
    <div className="site-shell">
      {/* HEADER */}
      <GlobalHeader
        setMenuOpen={setMenuOpen}
        setCartOpen={setCartOpen}
      />

      {/* MARKET OVERLAY */}
      {marketOpen && (
        <MarketOverlay onClose={() => setMarketOpen(false)} />
      )}

      {/* DRAWER */}
      <GlobalDrawer
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        cartOpen={cartOpen}
        setCartOpen={setCartOpen}
      />

      {/* PAGE CONTENT */}
      <main className="storefront-page box-border min-h-screen min-h-[100dvh] w-full min-w-0 max-w-full overflow-x-clip bg-[var(--background)] pt-[72px] sm:pt-[80px]">
        {children}
      </main>

      {/* FOOTER */}
      <GlobalFooter />
    </div>
  );
}