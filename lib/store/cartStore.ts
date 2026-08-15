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
