/* =========================================================
   ESS CATALOG IMPORT (GENERATED DATA)
   ---------------------------------------------------------
   Loaded from ess-catalog.json — produced by
   scripts/import-ess-full-catalog.mjs
========================================================= */

import type { Product } from "./types";
import essCatalog from "./data/ess-catalog.json";
import { DEFAULT_PRODUCT_IMAGE } from "./media";

export const essCatalogProducts = (essCatalog as Product[]).map((p) => ({
  ...p,
  thumbnail: p.thumbnail || DEFAULT_PRODUCT_IMAGE,
  images: p.images?.length ? p.images : [DEFAULT_PRODUCT_IMAGE],
}));
