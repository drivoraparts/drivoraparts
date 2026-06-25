import { create } from "zustand";
import { BASE_CURRENCY } from "@/lib/currency/constants";
import { detectCurrencyFromBrowser } from "@/lib/currency/detect";

type CurrencyState = {
  currency: string;
  locale: string;
  rates: Record<string, number>;
  ready: boolean;
  initialize: (input: { currency: string; locale: string }) => void;
  setRates: (rates: Record<string, number>) => void;
  setReady: (ready: boolean) => void;
};

export const useCurrencyStore = create<CurrencyState>((set, get) => ({
  currency: BASE_CURRENCY,
  locale: "en-US",
  rates: { [BASE_CURRENCY]: 1 },
  ready: false,

  initialize: ({ currency, locale }) => {
    const resolvedCurrency = currency || BASE_CURRENCY;
    const resolvedLocale = locale || "en-US";

    set({
      currency: resolvedCurrency,
      locale: resolvedLocale,
    });

    if (typeof window !== "undefined") {
      const browserCurrency = detectCurrencyFromBrowser();
      const browserLocale = navigator.language || resolvedLocale;

      if (browserCurrency !== resolvedCurrency || browserLocale !== resolvedLocale) {
        set({
          currency: browserCurrency,
          locale: browserLocale,
        });
      }
    }
  },

  setRates: (rates) => {
    const currency = get().currency;
    const nextRates = { ...rates, [BASE_CURRENCY]: 1 };

    if (!nextRates[currency]) {
      set({ currency: BASE_CURRENCY, rates: nextRates, ready: true });
      return;
    }

    set({ rates: nextRates, ready: true });
  },

  setReady: (ready) => set({ ready }),
}));
