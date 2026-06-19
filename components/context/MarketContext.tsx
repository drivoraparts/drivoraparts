"use client";

import { createContext, useContext, useState } from "react";

const MarketContext = createContext<any>(null);

export function MarketProvider({ children }: any) {
  const [marketOpen, setMarketOpen] = useState(false);

  return (
    <MarketContext.Provider value={{ marketOpen, setMarketOpen }}>
      {children}
    </MarketContext.Provider>
  );
}

export function useMarket() {
  return useContext(MarketContext);
}