import { loadCart, persistCart } from "./persistence";
import type { CartItem } from "./types";

export const getCart = (): CartItem[] => loadCart();

export const addToCart = (productId: number, quantity = 1): boolean => {
  const cart = loadCart();
  const existing = cart.find((i) => i.productId === productId);

  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ productId, quantity });
  }

  persistCart(cart);
  return true;
};

export const removeFromCart = (productId: number): void => {
  persistCart(loadCart().filter((i) => i.productId !== productId));
};

export const clearCart = (): void => {
  persistCart([]);
};

export const updateCartQuantity = (
  productId: number,
  quantity: number
): void => {
  const cart = loadCart();

  if (quantity <= 0) {
    persistCart(cart.filter((i) => i.productId !== productId));
    return;
  }

  const existing = cart.find((i) => i.productId === productId);
  if (existing) {
    existing.quantity = quantity;
    persistCart(cart);
  }
};
