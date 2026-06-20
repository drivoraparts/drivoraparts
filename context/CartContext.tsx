"use client";

import { useCartStore } from "@/lib/store/cartStore";

export type { CartItem } from "@/lib/store/cartStore";

/** Backward-compatible cart hook backed by the Zustand store. */
export const useCart = () => {
  const items = useCartStore((s) => s.items);
  const addToCart = useCartStore((s) => s.addToCart);
  const removeFromCart = useCartStore((s) => s.removeFromCart);
  const increaseQty = useCartStore((s) => s.increaseQuantity);
  const decreaseQty = useCartStore((s) => s.decreaseQuantity);
  const clearCart = useCartStore((s) => s.clearCart);
  const getTotal = useCartStore((s) => s.getTotal);
  const getItemCount = useCartStore((s) => s.getItemCount);

  return {
    cart: items,
    addToCart,
    removeFromCart,
    increaseQty,
    decreaseQty,
    clearCart,
    getTotal,
    getItemCount,
  };
};

/** Zustand persists client-side; provider kept for existing app tree. */
export const CartProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => <>{children}</>;
