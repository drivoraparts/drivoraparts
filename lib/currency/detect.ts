import { BASE_CURRENCY } from "./constants";
import { REGION_TO_CURRENCY } from "./region-currency";

export function parseRegionFromLocale(locale: string): string | undefined {
  const normalized = locale.trim().replace(/_/g, "-");
  const parts = normalized.split("-");
  if (parts.length < 2) return undefined;

  const region = parts[parts.length - 1]?.toUpperCase();
  return region && /^[A-Z]{2}$/.test(region) ? region : undefined;
}

/**
 * Currency for an ISO 3166-1 alpha-2 country code — Cloudflare's CF-IPCountry
 * header, which reflects where the customer actually is rather than what
 * language their browser asked for. Returns undefined for the sentinel values
 * Cloudflare uses when it can't place a request ("XX", "T1" for Tor).
 */
export function detectCurrencyFromCountry(
  country: string | null | undefined
): string | undefined {
  const code = country?.trim().toUpperCase();
  if (!code || !/^[A-Z]{2}$/.test(code)) return undefined;
  if (code === "XX" || code === "T1") return undefined;
  return REGION_TO_CURRENCY[code];
}

export function detectCurrencyFromLocale(locale: string): string {
  const region = parseRegionFromLocale(locale);
  if (region && REGION_TO_CURRENCY[region]) {
    return REGION_TO_CURRENCY[region];
  }
  return BASE_CURRENCY;
}

export function detectCurrencyFromLocales(locales: string[]): string {
  for (const locale of locales) {
    const currency = detectCurrencyFromLocale(locale);
    if (currency !== BASE_CURRENCY) return currency;
  }

  const first = locales[0];
  return first ? detectCurrencyFromLocale(first) : BASE_CURRENCY;
}

export function detectCurrencyFromAcceptLanguage(
  header: string | null | undefined
): string {
  if (!header) return BASE_CURRENCY;

  const locales = header
    .split(",")
    .map((part) => part.split(";")[0]?.trim())
    .filter(Boolean) as string[];

  return detectCurrencyFromLocales(locales);
}

export function detectCurrencyFromBrowser(): string {
  if (typeof navigator === "undefined") return BASE_CURRENCY;

  const locales = [
    ...(navigator.languages ?? []),
    navigator.language,
  ].filter(Boolean) as string[];

  return detectCurrencyFromLocales(locales);
}
