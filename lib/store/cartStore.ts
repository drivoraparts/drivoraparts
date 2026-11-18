import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { calculateCartDiscounts } from "@/lib/inventory/discounts";
import { MAX_LINE_ITEMS, MAX_QUANTITY_PER_ITEM } from "@/lib/checkout/limits";
import { getSafeLocalStorage } from "@/lib/storage/safe-storage";

export type CartItem = {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  brand?: string;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeFromCart: (id: number) => void;
  increaseQuantity: (id: number) => void;
  decreaseQuantity: (id: number) => void;
  clearCart: () => void;
  replaceCart: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  /**
   * Adds several listings at once (kit bundles), all or nothing: if any line
   * would break the checkout's quantity or line-count limits, the cart is
   * left unchanged and the reason is returned.
   */
  addItems: (
    lines: { item: Omit<CartItem, "quantity">; quantity: number }[]
  ) => { ok: true } | { ok: false; reason: "quantity"; name: string } | { ok: false; reason: "lines" };
  getTotal: () => number;
  getItemCount: () => number;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      /*
       * Clamped to the checkout's own limits. Callers surface the reason to
       * the customer; this is the backstop that keeps every path — buttons,
       * quick-add tiles, restored carts — from building an order the API will
       * reject at the final step.
       */
      addToCart: (item, quantity = 1) => {
        set((state) => {
          const existing = state.items.find((i) => i.id === item.id);

          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === item.id
                  ? {
                      ...i,
                      quantity: Math.min(
                        i.quantity + quantity,
                        MAX_QUANTITY_PER_ITEM
                      ),
                    }
                  : i
              ),
            };
          }

          if (state.items.length >= MAX_LINE_ITEMS) return state;

          return {
            items: [
              ...state.items,
              { ...item, quantity: Math.min(quantity, MAX_QUANTITY_PER_ITEM) },
            ],
          };
        });
      },

      removeFromCart: (id) => {
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        }));
      },

      increaseQuantity: (id) => {
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id
              ? { ...i, quantity: Math.min(i.quantity + 1, MAX_QUANTITY_PER_ITEM) }
              : i
          ),
        }));
      },

      decreaseQuantity: (id) => {
        set((state) => ({
          items: state.items
            .map((i) =>
              i.id === id ? { ...i, quantity: i.quantity - 1 } : i
            )
            .filter((i) => i.quantity > 0),
        }));
      },

      clearCart: () => set({ items: [] }),

      replaceCart: (item, quantity = 1) => {
        set({
          items: [{ ...item, quantity: Math.min(quantity, MAX_QUANTITY_PER_ITEM) }],
        });
      },

      addItems: (lines) => {
        const items = get().items.map((i) => ({ ...i }));
        for (const { item, quantity } of lines) {
          const existing = items.find((i) => i.id === item.id);
          if (existing) {
            existing.quantity += quantity;
            if (existing.quantity > MAX_QUANTITY_PER_ITEM) {
              return { ok: false, reason: "quantity", name: item.name } as const;
            }
          } else {
            if (quantity > MAX_QUANTITY_PER_ITEM) {
              return { ok: false, reason: "quantity", name: item.name } as const;
            }
            items.push({ ...item, quantity });
          }
        }
        if (items.length > MAX_LINE_ITEMS) return { ok: false, reason: "lines" } as const;
        set({ items });
        return { ok: true } as const;
      },

      getTotal: () =>
        calculateCartDiscounts(
          get().items.map((item) => ({
            id: item.id,
            price: item.price,
            quantity: item.quantity,
            category: item.category,
          }))
        ).total,

      getItemCount: () =>
        get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    {
      name: "drivora-cart",
      storage: createJSONStorage(() => getSafeLocalStorage()),
    }
  )
);
