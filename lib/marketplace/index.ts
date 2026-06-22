/* =========================================================
   DRIVORAPARTS — MARKETPLACE ENGINE (ORCHESTRATION)
========================================================= */

export * from "./cart";
export { processCheckout, markOrderPaid, handlePaidWebhook } from "./checkout";
export * from "./stock";
export {
  getOrders,
  getOrderById,
  updateOrderStatus,
  type OrderStatus,
  type OrderWithDetails,
} from "./orders";
export type { CartItem, OrderItem, Order, StockItem } from "./types";

/** Sync client cart state with the server API (GET /api/cart). */
export const syncCartWithServer = async () => {
  await fetch("/api/cart");
};

/** @deprecated Use processCheckout via POST /api/checkout */
export const placeOrder = async () => {
  const res = await fetch("/api/checkout", {
    method: "POST",
  });
  return res.json();
};
