import { getProductById } from "@/lib/inventory";
import { getCart, clearCart } from "./cart";
import { reduceStock } from "./stock";
import { addOrder } from "./orders";
import type { Order } from "./types";

function calculateTotal(items: ReturnType<typeof getCart>): number {
  return items.reduce((sum, item) => {
    const product = getProductById(item.productId);
    return sum + (product?.price ?? 0) * item.quantity;
  }, 0);
}

export const createOrder = (): Order | null => {
  const items = getCart();

  if (!items.length) return null;

  const total = calculateTotal(items);

  const order: Order = {
    id: crypto.randomUUID(),
    items: [...items],
    total,
    status: "pending",
    createdAt: Date.now(),
  };

  addOrder(order);

  items.forEach((i) => reduceStock(i.productId, i.quantity));

  clearCart();

  return order;
};

export { getOrders, getOrderById } from "./orders";
