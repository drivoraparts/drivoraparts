"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import GlobalHeader from "./GlobalHeader";
import TrustBar from "@/components/trust/TrustBar";
import GlobalDrawer from "./GlobalDrawer";
import CartDrawer from "./CartDrawer";
import GlobalFooter from "./GlobalFooter";
import CompareBar from "@/components/compare/CompareBar";
const MarketOverlay = dynamic(() => import("../market/MarketOverlay"), {
  ssr: false,
});

type Props = {
  children: React.ReactNode;
  /** Whether the Toyota Genuine section has listings (decided on the server). */
  showGenuine?: boolean;
};

export default function LayoutShell({ children, showGenuine = false }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [marketOpen, setMarketOpen] = useState(false);

  return (
    <div className="site-shell">
      {/* HEADER */}
      <GlobalHeader
        setMenuOpen={setMenuOpen}
        setCartOpen={setCartOpen}
        showGenuine={showGenuine}
      />

      {/* MARKET OVERLAY */}
      {marketOpen && (
        <MarketOverlay onClose={() => setMarketOpen(false)} />
      )}

      {/* NAV DRAWER */}
      <GlobalDrawer menuOpen={menuOpen} setMenuOpen={setMenuOpen} showGenuine={showGenuine} />

      {/* CART DRAWER */}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

      {/* PAGE CONTENT */}
      <main className="storefront-page box-border min-h-screen min-h-[100dvh] w-full min-w-0 max-w-full overflow-x-hidden bg-[var(--background)] pt-[var(--header-h)]">
        <TrustBar />
        {children}
      </main>

      {/* FOOTER */}
      <GlobalFooter />

      {/* COMPARE BAR */}
      <CompareBar />
    </div>
  );
}