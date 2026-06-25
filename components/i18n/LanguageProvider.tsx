"use client";

import { useEffect } from "react";
import { RTL_LANGUAGES } from "@/lib/i18n/constants";
import { useLanguageStore } from "@/lib/store/languageStore";

type LanguageProviderProps = {
  children: React.ReactNode;
  initialLanguage: string;
  initialLocale: string;
};

export default function LanguageProvider({
  children,
  initialLanguage,
  initialLocale,
}: LanguageProviderProps) {
  const initialize = useLanguageStore((s) => s.initialize);
  const loadUiStrings = useLanguageStore((s) => s.loadUiStrings);
  const language = useLanguageStore((s) => s.language);

  useEffect(() => {
    initialize({ language: initialLanguage, locale: initialLocale });
    void loadUiStrings();
  }, [initialLanguage, initialLocale, initialize, loadUiStrings]);

  useEffect(() => {
    const root = document.documentElement;
    root.lang = language;
    root.dir = RTL_LANGUAGES.has(language) ? "rtl" : "ltr";
  }, [language]);

  return children;
}
