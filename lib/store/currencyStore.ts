import { create } from "zustand";
import { BASE_CURRENCY } from "@/lib/currency/constants";

type CurrencyState = {
  /** Currency actually being displayed — only ever one we hold a rate for. */
  currency: string;
  /** Where the visitor is; adopted for display once its rate arrives. */
  preferredCurrency: string;
  locale: string;
  rates: Record<string, number>;
  ready: boolean;
  initialize: (input: { currency: string; locale: string }) => void;
  setRates: (rates: Record<string, number>) => void;
  setReady: (ready: boolean) => void;
};

export const useCurrencyStore = create<CurrencyState>((set, get) => ({
  currency: BASE_CURRENCY,
  preferredCurrency: BASE_CURRENCY,
  locale: "en-US",
  rates: { [BASE_CURRENCY]: 1 },
  ready: false,

  // The visitor's currency is remembered but NOT displayed yet: rates load
  // after hydration, and formatting a USD amount as A$ before its rate lands
  // would quote an Australian buyer roughly a third under the real price.
  // Display stays in USD until setRates can convert honestly.
  initialize: ({ currency, locale }) => {
    set({
      preferredCurrency: currency || BASE_CURRENCY,
      locale: locale || "en-US",
    });
  },

  setRates: (rates) => {
    const { preferredCurrency } = get();
    const nextRates = { ...rates, [BASE_CURRENCY]: 1 };
    const displayable = nextRates[preferredCurrency]
      ? preferredCurrency
      : BASE_CURRENCY;

    set({ currency: displayable, rates: nextRates, ready: true });
  },

  setReady: (ready) => set({ ready }),
}));
