import { create } from "zustand";

type CartItem = {
  id: number;
  name: string;
  price: number;
  thumbnail: string;
  qty: number;
};

type CartState = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "qty">) => void;
  removeItem: (id: number) => void;
  clearCart: () => void;
};

export const useCart = create<CartState>((set) => ({
  items: [],

  addItem: (item) =>
    set((state) => {
      const exists = state.items.find((i) => i.id === item.id);

      if (exists) {
        return {
          items: state.items.map((i) =>
            i.id === item.id ? { ...i, qty: i.qty + 1 } : i
          ),
        };
      }

      return {
        items: [...state.items, { ...item, qty: 1 }],
      };
    }),

  removeItem: (id) =>
    set((state) => ({
      items: state.items.filter((i) => i.id !== id),
    })),

  clearCart: () => set({ items: [] }),
}));