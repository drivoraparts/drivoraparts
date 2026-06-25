"use client";

import { useCurrencyDisplay } from "@/hooks/useFormatPrice";
import { useTranslation } from "@/hooks/useTranslation";

export default function CurrencyFooterNote() {
  const { currency, isBaseCurrency } = useCurrencyDisplay();
  const { t } = useTranslation();

  if (isBaseCurrency) return null;

  return (
    <p className="text-gray-500 text-xs mt-4">
      {t("currencyFooter", { currency })}
    </p>
  );
}
