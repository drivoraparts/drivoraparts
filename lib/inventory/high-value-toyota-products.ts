/* =========================================================
   HIGH-VALUE TOYOTA (GENERATED DATA)
   ---------------------------------------------------------
   Brand-name, high-value products for US-market Toyota
   applications (turbochargers, engines, transmissions,
   steering, seats) from the high-value brief. Loaded from
   high-value-toyota.json, written by
   scripts/build-high-value-toyota.py. Nitto tires live in
   toyota-tires.json (tire-products.ts).
========================================================= */

import type { Product } from "./types";
import catalog from "./data/high-value-toyota.json";
import { DEFAULT_PRODUCT_IMAGE } from "./media";

export const highValueToyotaProducts = (catalog as Product[]).map((p) => ({
  ...p,
  thumbnail: p.thumbnail || DEFAULT_PRODUCT_IMAGE,
  images: p.images?.length ? p.images : [DEFAULT_PRODUCT_IMAGE],
}));
