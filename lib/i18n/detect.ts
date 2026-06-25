import { BASE_LANGUAGE } from "./constants";

export function detectLanguageFromLocale(locale: string): string {
  const normalized = locale.trim().replace(/_/g, "-");
  const lang = normalized.split("-")[0]?.toLowerCase();

  if (!lang || !/^[a-z]{2}$/.test(lang)) {
    return BASE_LANGUAGE;
  }

  return lang;
}

export function detectLanguageFromLocales(locales: string[]): string {
  for (const locale of locales) {
    const lang = detectLanguageFromLocale(locale);
    if (lang !== BASE_LANGUAGE) return lang;
  }

  const first = locales[0];
  return first ? detectLanguageFromLocale(first) : BASE_LANGUAGE;
}

export function detectLanguageFromAcceptLanguage(
  header: string | null | undefined
): string {
  if (!header) return BASE_LANGUAGE;

  const locales = header
    .split(",")
    .map((part) => part.split(";")[0]?.trim())
    .filter(Boolean) as string[];

  return detectLanguageFromLocales(locales);
}

export function detectLanguageFromBrowser(): string {
  if (typeof navigator === "undefined") return BASE_LANGUAGE;

  const locales = [
    ...(navigator.languages ?? []),
    navigator.language,
  ].filter(Boolean) as string[];

  return detectLanguageFromLocales(locales);
}
