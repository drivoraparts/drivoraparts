"use client";

import { useCurrencyDisplay } from "@/hooks/useFormatPrice";

type CurrencyNoticeProps = {
  className?: string;
};

export default function CurrencyNotice({ className }: CurrencyNoticeProps) {
  const { currency, isBaseCurrency } = useCurrencyDisplay();

  if (isBaseCurrency) return null;

  return (
    <p className={className}>
      Prices shown in {currency}. Your order is charged in USD at the current
      exchange rate.
    </p>
  );
}
