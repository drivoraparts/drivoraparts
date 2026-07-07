/* =========================================================
   CANOPIES EXTENSION (GENERATED DATA)
   ---------------------------------------------------------
   Loaded from canopies-ext.json — produced by
   scripts/import-canopies.mjs
========================================================= */

import type { Product } from "./types";
import canopyCatalog from "./data/canopies-ext.json";
import { DEFAULT_PRODUCT_IMAGE } from "./media";

export const canopyProducts = (canopyCatalog as Product[]).map((p) => ({
  ...p,
  thumbnail: p.thumbnail || DEFAULT_PRODUCT_IMAGE,
  images: p.images?.length ? p.images : [DEFAULT_PRODUCT_IMAGE],
}));
