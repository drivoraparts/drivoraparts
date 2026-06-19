export type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  thumbnail?: string;
};

const CART_KEY = "drivora_cart";

/* ---------------- GET CART ---------------- */
export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];

  const data = localStorage.getItem(CART_KEY);
  return data ? JSON.parse(data) : [];
}

/* ---------------- SAVE CART ---------------- */
function saveCart(cart: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

/* ---------------- ADD TO CART ---------------- */
export function addToCart(item: Omit<CartItem, "quantity">) {
  const cart = getCart();

  const existing = cart.find((p) => p.id === item.id);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...item, quantity: 1 });
  }

  saveCart(cart);
  return cart;
}

/* ---------------- REMOVE ITEM ---------------- */
export function removeFromCart(id: string) {
  const cart = getCart().filter((item) => item.id !== id);

  saveCart(cart);
  return cart;
}

/* ---------------- CLEAR CART ---------------- */
export function clearCart() {
  localStorage.removeItem(CART_KEY);
  return [];
}