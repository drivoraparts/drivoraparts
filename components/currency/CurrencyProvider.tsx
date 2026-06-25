"use client";

import { useEffect } from "react";
import { useCurrencyStore } from "@/lib/store/currencyStore";

type CurrencyProviderProps = {
  children: React.ReactNode;
  initialCurrency: string;
  initialLocale: string;
};

export default function CurrencyProvider({
  children,
  initialCurrency,
  initialLocale,
}: CurrencyProviderProps) {
  const initialize = useCurrencyStore((s) => s.initialize);
  const setRates = useCurrencyStore((s) => s.setRates);
  const setReady = useCurrencyStore((s) => s.setReady);

  useEffect(() => {
    initialize({ currency: initialCurrency, locale: initialLocale });

    let active = true;

    const loadRates = async () => {
      try {
        const res = await fetch("/api/currency/rates", { cache: "no-store" });
        if (!res.ok || !active) return;

        const data = (await res.json()) as { rates?: Record<string, number> };
        if (!active || !data.rates) return;

        setRates(data.rates);
      } catch {
        if (active) setReady(true);
      }
    };

    void loadRates();

    return () => {
      active = false;
    };
  }, [initialCurrency, initialLocale, initialize, setRates, setReady]);

  return children;
}
