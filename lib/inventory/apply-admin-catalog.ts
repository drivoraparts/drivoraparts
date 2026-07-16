import type { Product } from "./types";
import adminCatalogOverrides from "./data/admin-catalog-overrides.json";
import adminAddedProducts from "./data/admin-added-products.json";

type AdminOverride = Partial<Product> & { _deleted?: boolean };

const overrides = adminCatalogOverrides as Record<string, AdminOverride>;
const addedProducts = adminAddedProducts as Product[];

/**
 * Overlay for dashboard-driven catalog edits (see app/api/admin/catalog/*).
 * Never mutates the ~14 base catalog sources directly — edits/deletes are
 * patches keyed by id, new listings are appended. Mirrors the same
 * overlay approach as apply-media-overrides.ts, generalized to the whole
 * product record.
 */
export function applyAdminCatalog(catalog: Product[]): Product[] {
  const edited = catalog
    .filter((product) => !overrides[String(product.id)]?._deleted)
    .map((product) => {
      const override = overrides[String(product.id)];
      if (!override) return product;
      const { _deleted, ...patch } = override;
      return { ...product, ...patch };
    });

  const newListings = addedProducts.filter(
    (product) => !overrides[String(product.id)]?._deleted
  );

  return [...edited, ...newListings];
}
