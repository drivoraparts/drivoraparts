/* =========================================================
   TIRES (GENERATED DATA)
   ---------------------------------------------------------
   Loaded from tires.json — produced by
   scripts/import-tires.mjs
========================================================= */

import type { Product } from "./types";
import tireCatalog from "./data/tires.json";
import { DEFAULT_PRODUCT_IMAGE } from "./media";

export const tireProducts = (tireCatalog as Product[]).map((p) => ({
  ...p,
  thumbnail: p.thumbnail || DEFAULT_PRODUCT_IMAGE,
  images: p.images?.length ? p.images : [DEFAULT_PRODUCT_IMAGE],
}));
