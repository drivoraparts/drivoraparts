/* =========================================================
   SUSPENSION LIFT KITS (GENERATED DATA)
   ---------------------------------------------------------
   Loaded from suspension-lift-kits.json — produced by
   scripts/import-suspension.mjs
========================================================= */

import type { Product } from "./types";
import suspensionLiftCatalog from "./data/suspension-lift-kits.json";
import { DEFAULT_PRODUCT_IMAGE } from "./media";

export const suspensionLiftProducts = (suspensionLiftCatalog as Product[]).map((p) => ({
  ...p,
  thumbnail: p.thumbnail || DEFAULT_PRODUCT_IMAGE,
  images: p.images?.length ? p.images : [DEFAULT_PRODUCT_IMAGE],
}));
