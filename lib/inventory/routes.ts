/* =========================================================
   DRIVORAPARTS — ROUTE NORMALIZER
   ---------------------------------------------------------
   Single place that builds every internal route. UI must
   never hardcode catalog/product paths again — always use
   these helpers so slugs stay consistent and links never
   drift out of sync with the inventory.
========================================================= */

export const routes = {
  catalog: "/catalog",
  all: "/catalog/all",
  category: (slug: string) => `/catalog/${slug}`,
  brand: (category: string, brand: string) => `/catalog/${category}/${brand}`,
  product: (id: number) => `/product/${id}`,
};
