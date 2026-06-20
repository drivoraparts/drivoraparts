/* =========================================================
   DRIVORAPARTS — MARKETPLACE CORE TYPES
========================================================= */

export type CartItem = {
  productId: number;
  quantity: number;
};

export type OrderStatus =
  | "pending"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type Order = {
  id: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  createdAt: number;
};

export type StockItem = {
  productId: number;
  stock: number;
};
