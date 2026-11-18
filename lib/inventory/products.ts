/* =========================================================
   DRIVORAPARTS — PRODUCTS (DEPLOYED CATALOG)
   ---------------------------------------------------------
   The listings the deployed site carries: the public Toyota
   catalog, read from lib/inventory/data/catalog-snapshot.json,
   which scripts/build-catalog-snapshot.mjs generates from the
   full source catalog (full-catalog.ts) before every build.

   Listings for other makes, and listings whose Toyota fitment
   is unconfirmed, are not in the snapshot at all, so they cost
   the Cloudflare Worker nothing. They are kept in the source
   files for future use, and their ids are listed here so their
   old product URLs still answer "no longer listed" instead of
   a bare 404.
========================================================= */

import type { Product } from "./types";
import snapshot from "./data/catalog-snapshot.json";
import { finalizeCatalog } from "./finalize";

export const products: Product[] = finalizeCatalog(snapshot.records as Product[]);

/** Ids of listings kept only in the source catalog (not deployed). */
export const ARCHIVED_PRODUCT_IDS: ReadonlySet<number> = new Set(snapshot.archivedIds);
