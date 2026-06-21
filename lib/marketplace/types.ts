/* =========================================================
   DRIVORAPARTS — MARKETPLACE CORE TYPES
========================================================= */

export type CartItem = {
  productId: number;
  quantity: number;
};

export type OrderItem = {
  productId: number;
  name: string;
  price: number;
  image: string;
  category: string;
  brand?: string;
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
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: number;
};

export type StockItem = {
  productId: number;
  stock: number;
};
