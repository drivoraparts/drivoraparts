"use client";

import { useCurrencyDisplay } from "@/hooks/useFormatPrice";
import { useTranslation } from "@/hooks/useTranslation";

export default function CurrencyFooterNote() {
  const { currency, isBaseCurrency } = useCurrencyDisplay();
  const { t } = useTranslation();

  if (isBaseCurrency) return null;

  return (
    // Inherits the footer's on-dark text colour: gray-500 measured below AA
    // on the charcoal background.
    <p className="mb-1">{t("currencyFooter", { currency })}</p>
  );
}
