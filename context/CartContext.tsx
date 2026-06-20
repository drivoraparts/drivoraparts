"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { getProductById } from "@/lib/inventory";
import {
  getCart,
  addToCart as marketplaceAdd,
  removeFromCart as marketplaceRemove,
  updateCartQuantity,
  clearCart as marketplaceClear,
  hasStock,
} from "@/lib/marketplace";

type CartItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  thumbnail: string;
};

type CartContextType = {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity">) => void;
  removeFromCart: (id: number) => void;
  increaseQty: (id: number) => void;
  decreaseQty: (id: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextType | null>(null);

function hydrateCart(): CartItem[] {
  return getCart()
    .map((item) => {
      const product = getProductById(item.productId);
      if (!product) return null;

      return {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        thumbnail: product.thumbnail ?? product.image ?? "",
      };
    })
    .filter((item): item is CartItem => item !== null);
}

export const CartProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    setCart(hydrateCart());
  }, []);

  const syncCart = () => setCart(hydrateCart());

  const addToCart = (item: Omit<CartItem, "quantity">) => {
    const currentQty =
      getCart().find((i) => i.productId === item.id)?.quantity ?? 0;

    if (!hasStock(item.id, currentQty + 1)) return;

    marketplaceAdd(item.id, 1);
    syncCart();
  };

  const removeFromCart = (id: number) => {
    marketplaceRemove(id);
    syncCart();
  };

  const increaseQty = (id: number) => {
    const currentQty =
      getCart().find((i) => i.productId === id)?.quantity ?? 0;

    if (!hasStock(id, currentQty + 1)) return;

    updateCartQuantity(id, currentQty + 1);
    syncCart();
  };

  const decreaseQty = (id: number) => {
    const currentQty =
      getCart().find((i) => i.productId === id)?.quantity ?? 0;

    updateCartQuantity(id, currentQty - 1);
    syncCart();
  };

  const clearCart = () => {
    marketplaceClear();
    setCart([]);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        increaseQty,
        decreaseQty,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
};
