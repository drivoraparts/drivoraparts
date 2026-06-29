import { create } from "zustand";
import { BASE_CURRENCY } from "@/lib/currency/constants";

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

  initialize: ({ locale }) => {
    set({
      currency: BASE_CURRENCY,
      locale: locale || "en-US",
    });
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
