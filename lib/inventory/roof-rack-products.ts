/* =========================================================
   ROOF RACKS (GENERATED DATA)
   ---------------------------------------------------------
   Loaded from roof-racks.json — produced by
   scripts/import-roof-racks.mjs
========================================================= */

import type { Product } from "./types";
import roofRackCatalog from "./data/roof-racks.json";
import { DEFAULT_PRODUCT_IMAGE } from "./media";

export const roofRackProducts = (roofRackCatalog as Product[]).map((p) => ({
  ...p,
  thumbnail: p.thumbnail || DEFAULT_PRODUCT_IMAGE,
  images: p.images?.length ? p.images : [DEFAULT_PRODUCT_IMAGE],
}));
