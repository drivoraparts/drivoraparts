"use client";

import { useCallback } from "react";
import { formatUsdAsCurrency } from "@/lib/currency/format";
import { useCurrencyStore } from "@/lib/store/currencyStore";

export function useFormatPrice() {
  const currency = useCurrencyStore((s) => s.currency);
  const rates = useCurrencyStore((s) => s.rates);
  const locale = useCurrencyStore((s) => s.locale);

  return useCallback(
    (usd: number) =>
      formatUsdAsCurrency(usd, currency, rates[currency] ?? 1, locale),
    [currency, rates, locale]
  );
}

export function useCurrencyDisplay() {
  const currency = useCurrencyStore((s) => s.currency);
  const ready = useCurrencyStore((s) => s.ready);
  const formatPrice = useFormatPrice();

  return {
    currency,
    ready,
    formatPrice,
    isBaseCurrency: currency === "USD",
  };
}
