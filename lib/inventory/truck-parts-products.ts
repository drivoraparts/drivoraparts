/* =========================================================
   TRUCK PARTS CATALOG (GENERATED DATA)
   ---------------------------------------------------------
   Loaded from edmunds-truck-parts.json — produced by
   scripts/import-edmunds-truck-parts.mjs
========================================================= */

import type { Product } from "./types";
import truckPartsCatalog from "./data/edmunds-truck-parts.json";
import { DEFAULT_PRODUCT_IMAGE } from "./media";

export const truckPartsProducts = (truckPartsCatalog as Product[]).map((p) => ({
  ...p,
  thumbnail: p.thumbnail || DEFAULT_PRODUCT_IMAGE,
  images: p.images?.length ? p.images : [DEFAULT_PRODUCT_IMAGE],
}));
