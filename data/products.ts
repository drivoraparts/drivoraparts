/* =========================================================
   COMPATIBILITY SHIM
   ---------------------------------------------------------
   The single source of truth is /data/store.ts.
   This file only re-exports a derived, read-only flat view
   so older imports keep working. Do NOT add data here.
========================================================= */

import { getAllProducts, type Product } from "./store";

export type { Product };

export const products: Product[] = getAllProducts();
