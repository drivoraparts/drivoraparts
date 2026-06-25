"use client";

import { useCurrencyDisplay } from "@/hooks/useFormatPrice";

export default function CurrencyFooterNote() {
  const { currency, isBaseCurrency } = useCurrencyDisplay();

  if (isBaseCurrency) return null;

  return (
    <p className="text-gray-500 text-xs mt-4">
      Prices auto-converted to {currency}. Checkout is charged in USD.
    </p>
  );
}
