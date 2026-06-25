import { create } from "zustand";
import { BASE_LANGUAGE } from "@/lib/i18n/constants";
import { detectLanguageFromBrowser } from "@/lib/i18n/detect";
import type { UiKey } from "@/lib/i18n/ui";
import { UI, UI_KEYS } from "@/lib/i18n/ui";

type LanguageState = {
  language: string;
  locale: string;
  ready: boolean;
  ui: Partial<Record<UiKey, string>>;
  cache: Record<string, string>;
  initialize: (input: { language: string; locale: string }) => void;
  loadUiStrings: () => Promise<void>;
  translateTexts: (texts: string[]) => Promise<string[]>;
  translateText: (text: string) => Promise<string>;
};

let pendingBatch: {
  texts: string[];
  resolvers: Array<(value: string[]) => void>;
} | null = null;
let batchTimer: ReturnType<typeof setTimeout> | null = null;

async function fetchTranslations(
  texts: string[],
  language: string
): Promise<string[]> {
  if (language === BASE_LANGUAGE || texts.length === 0) {
    return texts;
  }

  const res = await fetch("/api/translate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ texts, targetLang: language }),
  });

  if (!res.ok) return texts;

  const data = (await res.json()) as { translations?: string[] };
  return data.translations?.length === texts.length
    ? data.translations
    : texts;
}

export const useLanguageStore = create<LanguageState>((set, get) => ({
  language: BASE_LANGUAGE,
  locale: "en-US",
  ready: true,
  ui: {},
  cache: {},

  initialize: ({ language, locale }) => {
    const resolvedLanguage = language || BASE_LANGUAGE;
    const resolvedLocale = locale || "en-US";

    set({
      language: resolvedLanguage,
      locale: resolvedLocale,
      ready: resolvedLanguage === BASE_LANGUAGE,
      ui: {},
    });

    if (typeof window !== "undefined") {
      const browserLanguage = detectLanguageFromBrowser();
      const browserLocale = navigator.language || resolvedLocale;

      if (
        browserLanguage !== resolvedLanguage ||
        browserLocale !== resolvedLocale
      ) {
        set({
          language: browserLanguage,
          locale: browserLocale,
          ready: browserLanguage === BASE_LANGUAGE,
          ui: {},
        });
      }
    }
  },

  loadUiStrings: async () => {
    const { language } = get();
    if (language === BASE_LANGUAGE) {
      set({ ready: true, ui: {} });
      return;
    }

    const sourceTexts = UI_KEYS.map((key) => UI[key]);
    const translations = await fetchTranslations(sourceTexts, language);
    const ui = Object.fromEntries(
      UI_KEYS.map((key, index) => [key, translations[index] ?? UI[key]])
    ) as Partial<Record<UiKey, string>>;

    const cache = { ...get().cache };
    sourceTexts.forEach((text, index) => {
      cache[`${language}:${text}`] = translations[index] ?? text;
    });

    set({ ui, cache, ready: true });
  },

  translateTexts: async (texts: string[]) => {
    const { language, cache } = get();
    if (language === BASE_LANGUAGE) return texts;

    const results = texts.map((text) => cache[`${language}:${text}`] ?? text);
    const missingIndexes: number[] = [];
    const missingTexts: string[] = [];

    texts.forEach((text, index) => {
      if (results[index] === text) {
        missingIndexes.push(index);
        missingTexts.push(text);
      }
    });

    if (missingTexts.length === 0) return results;

    const translated = await fetchTranslations(missingTexts, language);
    const nextCache = { ...cache };

    missingIndexes.forEach((sourceIndex, i) => {
      const value = translated[i] ?? texts[sourceIndex];
      results[sourceIndex] = value;
      nextCache[`${language}:${texts[sourceIndex]}`] = value;
    });

    set({ cache: nextCache });
    return results;
  },

  translateText: async (text: string) => {
    const [result] = await get().translateTexts([text]);
    return result ?? text;
  },
}));

export function queueTranslationBatch(texts: string[]): Promise<string[]> {
  return new Promise((resolve) => {
    if (!pendingBatch) {
      pendingBatch = { texts: [], resolvers: [] };
    }

    const startIndex = pendingBatch.texts.length;
    pendingBatch.texts.push(...texts);
    pendingBatch.resolvers.push((values) => {
      resolve(values.slice(startIndex, startIndex + texts.length));
    });

    if (batchTimer) clearTimeout(batchTimer);
    batchTimer = setTimeout(async () => {
      const batch = pendingBatch;
      pendingBatch = null;
      batchTimer = null;
      if (!batch) return;

      const values = await useLanguageStore
        .getState()
        .translateTexts(batch.texts);

      batch.resolvers.forEach((resolver) => resolver(values));
    }, 40);
  });
}
