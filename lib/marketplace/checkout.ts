import { clearCart } from "./cart";
import { reduceStock } from "./stock";
import { addOrder } from "./orders";
import type { Order, OrderItem } from "./types";

function calculateTotal(items: OrderItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export const createOrder = (items: OrderItem[]): Order | null => {
  if (!items.length) return null;

  const snapshotItems: OrderItem[] = items.map((item) => ({
    productId: item.productId,
    name: item.name,
    price: item.price,
    image: item.image,
    category: item.category,
    brand: item.brand,
    quantity: item.quantity,
  }));

  const total = calculateTotal(snapshotItems);

  const order: Order = {
    id: crypto.randomUUID(),
    items: snapshotItems,
    total,
    status: "pending",
    createdAt: Date.now(),
  };

  addOrder(order);

  snapshotItems.forEach((item) => reduceStock(item.productId, item.quantity));

  clearCart();

  return order;
};

export { getOrders, getOrderById } from "./orders";
