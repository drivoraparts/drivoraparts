/* =========================================================
   BULL BARS (GENERATED DATA)
   ---------------------------------------------------------
   Loaded from bull-bars.json — produced by
   scripts/import-bull-bars.mjs
========================================================= */

import type { Product } from "./types";
import bullBarCatalog from "./data/bull-bars.json";
import { DEFAULT_PRODUCT_IMAGE } from "./media";

export const bullBarProducts = (bullBarCatalog as Product[]).map((p) => ({
  ...p,
  thumbnail: p.thumbnail || DEFAULT_PRODUCT_IMAGE,
  images: p.images?.length ? p.images : [DEFAULT_PRODUCT_IMAGE],
}));
