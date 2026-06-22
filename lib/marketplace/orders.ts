import {
  getOrderById as getOrderByIdDb,
  listOrders as listOrdersDb,
  updateOrderStatus as updateOrderStatusDb,
  type OrderStatus,
  type OrderWithDetails,
} from "@/lib/db/orders";

export type { OrderStatus, OrderWithDetails } from "@/lib/db/orders";

export const getOrders = listOrdersDb;
export const getOrderById = getOrderByIdDb;
export const updateOrderStatus = updateOrderStatusDb;

export const addOrder = async (): Promise<never> => {
  throw new Error("Use processCheckout() — addOrder is deprecated");
};
