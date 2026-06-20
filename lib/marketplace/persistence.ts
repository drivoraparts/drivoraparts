/* =========================================================
   DRIVORAPARTS — MARKETPLACE PERSISTENCE
   ---------------------------------------------------------
   Edge-safe singleton store shared across API route handlers.
   Survives warm invocations within the same worker instance.
   Cart, orders, and stock are API-owned state — never UI.
========================================================= */

import { products } from "@/lib/inventory/products";
import type { CartItem, Order, StockItem } from "./types";

type MarketplaceStore = {
  cart: CartItem[];
  orders: Order[];
  stock: StockItem[];
  initialized: boolean;
};

const STORE_KEY = "__drivora_marketplace_store__";

function getStore(): MarketplaceStore {
  const g = globalThis as typeof globalThis & {
    [STORE_KEY]?: MarketplaceStore;
  };

  if (!g[STORE_KEY]) {
    g[STORE_KEY] = {
      cart: [],
      orders: [],
      stock: [],
      initialized: false,
    };
  }

  return g[STORE_KEY]!;
}

function seedStock(store: MarketplaceStore): void {
  products.forEach((product) => {
    const amount = product.stock === false ? 0 : 10;
    const existing = store.stock.find((s) => s.productId === product.id);

    if (existing) {
      existing.stock = amount;
    } else {
      store.stock.push({ productId: product.id, stock: amount });
    }
  });
}

function ensureInitialized(): MarketplaceStore {
  const store = getStore();

  if (!store.initialized) {
    seedStock(store);
    store.initialized = true;
  }

  return store;
}

/* ---------- Cart ---------- */

export function loadCart(): CartItem[] {
  return [...ensureInitialized().cart];
}

export function persistCart(cart: CartItem[]): void {
  ensureInitialized().cart = cart;
}

/* ---------- Orders ---------- */

export function loadOrders(): Order[] {
  return [...ensureInitialized().orders];
}

export function persistOrders(orders: Order[]): void {
  ensureInitialized().orders = orders;
}

/* ---------- Stock ---------- */

export function loadStock(): StockItem[] {
  return [...ensureInitialized().stock];
}

export function persistStock(stock: StockItem[]): void {
  ensureInitialized().stock = stock;
}

export function getStockRecord(productId: number): StockItem | undefined {
  return ensureInitialized().stock.find((s) => s.productId === productId);
}

export function upsertStockRecord(productId: number, amount: number): void {
  const store = ensureInitialized();
  const existing = store.stock.find((s) => s.productId === productId);

  if (existing) {
    existing.stock = Math.max(0, amount);
  } else {
    store.stock.push({ productId, stock: Math.max(0, amount) });
  }
}
