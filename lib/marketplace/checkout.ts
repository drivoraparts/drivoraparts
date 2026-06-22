export { processCheckout, markOrderPaid, handlePaidWebhook } from "@/lib/checkout/service";

export const createOrder = (): never => {
  throw new Error("Use processCheckout() from @/lib/checkout/service");
};

export { getOrders, getOrderById, updateOrderStatus } from "./orders";
