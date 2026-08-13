"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import GlobalHeader from "./GlobalHeader";
import GlobalDrawer from "./GlobalDrawer";
import CartDrawer from "./CartDrawer";
import GlobalFooter from "./GlobalFooter";
import AnnouncementBar from "@/components/ui/AnnouncementBar";
import CompareBar from "@/components/compare/CompareBar";
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

      {/* ANNOUNCEMENT BAR */}
      <AnnouncementBar />

      {/* MARKET OVERLAY */}
      {marketOpen && (
        <MarketOverlay onClose={() => setMarketOpen(false)} />
      )}

      {/* NAV DRAWER */}
      <GlobalDrawer menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

      {/* CART DRAWER */}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

      {/* PAGE CONTENT */}
      <main className="storefront-page box-border min-h-screen min-h-[100dvh] w-full min-w-0 max-w-full overflow-x-hidden bg-[var(--background)] pt-[106px] sm:pt-[114px]">
        {children}
      </main>

      {/* FOOTER */}
      <GlobalFooter />

      {/* COMPARE BAR */}
      <CompareBar />
    </div>
  );
}