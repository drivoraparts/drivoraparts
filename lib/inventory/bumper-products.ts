/* =========================================================
   BUMPERS EXTENSION (GENERATED DATA)
   ---------------------------------------------------------
   Loaded from bumpers-ext.json — produced by
   scripts/import-bumpers.mjs
========================================================= */

import type { Product } from "./types";
import bumperCatalog from "./data/bumpers-ext.json";
import { DEFAULT_PRODUCT_IMAGE } from "./media";

export const bumperProducts = (bumperCatalog as Product[]).map((p) => ({
  ...p,
  thumbnail: p.thumbnail || DEFAULT_PRODUCT_IMAGE,
  images: p.images?.length ? p.images : [DEFAULT_PRODUCT_IMAGE],
}));
