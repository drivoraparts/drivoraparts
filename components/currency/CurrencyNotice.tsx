"use client";

import { useCurrencyDisplay } from "@/hooks/useFormatPrice";
import { useTranslation } from "@/hooks/useTranslation";

type CurrencyNoticeProps = {
  className?: string;
};

export default function CurrencyNotice({ className }: CurrencyNoticeProps) {
  const { currency, isBaseCurrency } = useCurrencyDisplay();
  const { t } = useTranslation();

  if (isBaseCurrency) return null;

  return (
    <p className={className}>
      {t("currencyNotice", { currency })}
    </p>
  );
}
