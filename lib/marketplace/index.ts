/* =========================================================
   DRIVORAPARTS — MARKETPLACE ENGINE (ORCHESTRATION)
   ---------------------------------------------------------
   Single entry point for cart, stock, checkout, and orders.
   Phase 2: API-backed persistence via edge-safe store.
========================================================= */

export * from "./cart";
export * from "./checkout";
export * from "./stock";
export * from "./orders";
export * from "./types";

/** Sync client cart state with the server API (GET /api/cart). */
export const syncCartWithServer = async () => {
  await fetch("/api/cart");
};

/** Place an order via the checkout API (POST /api/checkout). */
export const placeOrder = async () => {
  const res = await fetch("/api/checkout", {
    method: "POST",
  });
  return res.json();
};
