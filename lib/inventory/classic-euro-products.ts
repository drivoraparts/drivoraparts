/* =========================================================
   CLASSIC EURO EXTENSION (GENERATED DATA)
   ---------------------------------------------------------
   Loaded from classic-euro-ext.json — produced by
   scripts/import-classic-euro.mjs
========================================================= */

import type { Product } from "./types";
import classicEuroCatalog from "./data/classic-euro-ext.json";
import { DEFAULT_PRODUCT_IMAGE } from "./media";

export const classicEuroProducts = (classicEuroCatalog as Product[]).map((p) => ({
  ...p,
  thumbnail: p.thumbnail || DEFAULT_PRODUCT_IMAGE,
  images: p.images?.length ? p.images : [DEFAULT_PRODUCT_IMAGE],
}));
