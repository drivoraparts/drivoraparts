/* =========================================================
   GENUINE TOYOTA OEM PARTS (GENERATED DATA)
   ---------------------------------------------------------
   Loaded from toyota-genuine-oem.json -- produced by
   scripts/import-toyota-genuine-oem.py from the staged Toyota
   catalog-expansion batches (docs/catalog-expansion/).
   Prices are final (competitorPriced): 3-5% below the lowest
   verified US retailer for the same part number.
========================================================= */

import type { Product } from "./types";
import toyotaGenuineOemCatalog from "./data/toyota-genuine-oem.json";

export const toyotaGenuineOemProducts = toyotaGenuineOemCatalog as Product[];
