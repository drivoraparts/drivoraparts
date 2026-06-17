export type CartItem = {
  id: number;
  name: string;
  price: number;
  thumbnail: string;
  quantity: number;
};

const CART_KEY = "drivora_cart";

/**
 * Get cart
 */
export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
}

/**
 * Save cart
 */
export function saveCart(cart: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

/**
 * Add item
 */
export function addToCart(item: Omit<CartItem, "quantity">) {
  const cart = getCart();
  const existing = cart.find((i) => i.id === item.id);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...item, quantity: 1 });
  }

  saveCart(cart);
  return cart;
}

/**
 * Remove item
 */
export function removeFromCart(id: number) {
  const cart = getCart().filter((i) => i.id !== id);
  saveCart(cart);
  return cart;
}

/**
 * Clear cart
 */
export function clearCart() {
  localStorage.removeItem(CART_KEY);
}