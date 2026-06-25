"use client";

import { BASE_LANGUAGE } from "@/lib/i18n/constants";
import type { UiKey } from "@/lib/i18n/ui";
import { UI } from "@/lib/i18n/ui";
import { useLanguageStore } from "@/lib/store/languageStore";

export function useTranslation() {
  const language = useLanguageStore((s) => s.language);
  const ready = useLanguageStore((s) => s.ready);
  const ui = useLanguageStore((s) => s.ui);

  const t = (key: UiKey, vars?: Record<string, string>) => {
    let value =
      language === BASE_LANGUAGE ? UI[key] : ui[key] ?? UI[key];

    if (vars) {
      for (const [name, replacement] of Object.entries(vars)) {
        value = value.replace(`{${name}}`, replacement);
      }
    }

    return value;
  };

  return { language, ready, t, isEnglish: language === BASE_LANGUAGE };
}
