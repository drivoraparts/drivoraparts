/* =========================================================
   HEADLIGHTS (GENERATED DATA)
   ---------------------------------------------------------
   Loaded from headlights.json — produced by
   scripts/import-headlights.mjs
========================================================= */

import type { Product } from "./types";
import headlightCatalog from "./data/headlights.json";
import { DEFAULT_PRODUCT_IMAGE } from "./media";

export const headlightProducts = (headlightCatalog as Product[]).map((p) => ({
  ...p,
  thumbnail: p.thumbnail || DEFAULT_PRODUCT_IMAGE,
  images: p.images?.length ? p.images : [DEFAULT_PRODUCT_IMAGE],
}));
