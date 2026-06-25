import { BASE_CURRENCY } from "./constants";

const ZERO_DECIMAL_CURRENCIES = new Set([
  "BIF",
  "CLP",
  "DJF",
  "GNF",
  "ISK",
  "JPY",
  "KMF",
  "KRW",
  "PYG",
  "RWF",
  "UGX",
  "VND",
  "VUV",
  "XAF",
  "XOF",
  "XPF",
]);

export function convertFromUsd(usd: number, rate: number): number {
  return usd * rate;
}

export function formatMoney(
  amount: number,
  currency: string,
  locale?: string
): string {
  const fractionDigits = ZERO_DECIMAL_CURRENCIES.has(currency) ? 0 : 2;

  return new Intl.NumberFormat(locale || undefined, {
    style: "currency",
    currency,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(amount);
}

export function formatUsdAsCurrency(
  usd: number,
  currency: string,
  rate: number,
  locale?: string
): string {
  if (currency === BASE_CURRENCY) {
    return formatMoney(usd, BASE_CURRENCY, locale ?? "en-US");
  }

  const converted = convertFromUsd(usd, rate);
  return formatMoney(converted, currency, locale);
}
