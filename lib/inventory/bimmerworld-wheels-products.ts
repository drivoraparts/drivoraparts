/* =========================================================
   BIMMERWORLD WHEELS & TIRES (GENERATED DATA)
   ---------------------------------------------------------
   Loaded from bimmerworld-wheels-tires.json — produced by
   scripts/import-bimmerworld-wheels-tires.mjs
========================================================= */

import type { Product } from "./types";
import bimmerworldCatalog from "./data/bimmerworld-wheels-tires.json";
import { DEFAULT_PRODUCT_IMAGE } from "./media";

export const bimmerworldWheelsProducts = (
  bimmerworldCatalog as Product[]
).map((p) => ({
  ...p,
  thumbnail: p.thumbnail || DEFAULT_PRODUCT_IMAGE,
  images: p.images?.length ? p.images : [DEFAULT_PRODUCT_IMAGE],
}));
