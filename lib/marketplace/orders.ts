import { loadOrders, persistOrders } from "./persistence";
import type { Order } from "./types";

export const addOrder = (order: Order): Order => {
  const orders = loadOrders();
  orders.push(order);
  persistOrders(orders);
  return order;
};

export const getOrders = (): Order[] => loadOrders();

export const getOrderById = (id: string): Order | undefined =>
  loadOrders().find((o) => o.id === id);
