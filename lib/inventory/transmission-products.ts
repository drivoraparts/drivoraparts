/* =========================================================
   TRANSMISSIONS EXTENSION (GENERATED DATA)
   ---------------------------------------------------------
   Loaded from transmissions-ext.json — produced by
   scripts/import-transmissions.mjs
========================================================= */

import type { Product } from "./types";
import transmissionCatalog from "./data/transmissions-ext.json";
import { DEFAULT_PRODUCT_IMAGE } from "./media";

export const transmissionProducts = (transmissionCatalog as Product[]).map((p) => ({
  ...p,
  thumbnail: p.thumbnail || DEFAULT_PRODUCT_IMAGE,
  images: p.images?.length ? p.images : [DEFAULT_PRODUCT_IMAGE],
}));
