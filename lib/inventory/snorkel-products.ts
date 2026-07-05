/* =========================================================
   SNORKELS (GENERATED DATA)
   ---------------------------------------------------------
   Loaded from snorkels.json — produced by
   scripts/import-snorkels.mjs
========================================================= */

import type { Product } from "./types";
import snorkelCatalog from "./data/snorkels.json";
import { DEFAULT_PRODUCT_IMAGE } from "./media";

export const snorkelProducts = (snorkelCatalog as Product[]).map((p) => ({
  ...p,
  thumbnail: p.thumbnail || DEFAULT_PRODUCT_IMAGE,
  images: p.images?.length ? p.images : [DEFAULT_PRODUCT_IMAGE],
}));
