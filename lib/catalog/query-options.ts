/**
 * The catalog query's plain constants, kept apart from lib/catalog/query.ts.
 *
 * The All Products feed is a client component and needs these two values.
 * Importing them from query.ts put query.ts itself in the browser's module
 * graph -- and with it everything query.ts imports, which now includes the
 * market definitions and the vehicles dataset. This file imports nothing,
 * so the feed can read the page size and condition filters without pulling
 * server data along. query.ts re-exports both, so server callers are
 * unchanged.
 */

export const CATALOG_DEFAULT_LIMIT = 48;

/** The buckets offered as filter options, in the order they are shown. */
export const CONDITION_FILTERS = [
  { value: "brand-new", label: "Brand New" },
  { value: "used", label: "Used" },
  { value: "refurbished", label: "Refurbished" },
] as const;
