"use client";

import { useEffect, useState } from "react";
import {
  getCart,
  addToCart,
  removeFromCart,
  clearCart,
  CartItem,
} from "@/lib/cart";

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    setCart(getCart());
  }, []);

  const add = (item: Omit<CartItem, "quantity">) => {
    const updated = addToCart(item);
    setCart([...updated]);
  };

  const remove = (id: number) => {
    const updated = removeFromCart(id);
    setCart([...updated]);
  };

  const clear = () => {
    clearCart();
    setCart([]);
  };

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return { cart, add, remove, clear, total };
}