import { categories } from "@/lib/inventory/categories";
import { brands } from "@/lib/inventory/brands";
import type { Product } from "@/lib/inventory/types";

export type ProductInput = Partial<Product>;

const CATEGORY_SLUGS = new Set(categories.map((c) => c.slug));
const BRAND_SLUGS = new Set(brands.map((b) => b.slug));

/**
 * Validates a create/edit payload before it's ever committed to GitHub.
 * Returns a list of human-readable errors (empty = valid). Applies to
 * both full-create payloads and partial-edit patches — for a patch,
 * only the fields present are checked.
 */
export function validateProductInput(
  input: ProductInput,
  { requireCore = false }: { requireCore?: boolean } = {}
): string[] {
  const errors: string[] = [];

  if (requireCore || input.name !== undefined) {
    if (typeof input.name !== "string" || input.name.trim().length < 3) {
      errors.push("Name is required (min 3 characters).");
    }
  }

  if (requireCore || input.category !== undefined) {
    if (typeof input.category !== "string" || !CATEGORY_SLUGS.has(input.category)) {
      errors.push(
        `Category must be one of: ${[...CATEGORY_SLUGS].join(", ")}.`
      );
    }
  }

  if (requireCore || input.brand !== undefined) {
    if (typeof input.brand !== "string" || !BRAND_SLUGS.has(input.brand)) {
      errors.push("Brand must be a known brand slug (see /admin/products brand list).");
    }
  }

  if (requireCore || input.price !== undefined) {
    if (
      typeof input.price !== "number" ||
      !Number.isFinite(input.price) ||
      input.price <= 0
    ) {
      errors.push("Price must be a positive number.");
    }
  }

  if (input.compareAtPrice !== undefined) {
    if (
      typeof input.compareAtPrice !== "number" ||
      !Number.isFinite(input.compareAtPrice) ||
      input.compareAtPrice < 0
    ) {
      errors.push("Compare-at price must be a non-negative number.");
    }
  }

  if (input.stockQty !== undefined) {
    if (!Number.isInteger(input.stockQty) || (input.stockQty as number) < 0) {
      errors.push("Stock quantity must be a non-negative whole number.");
    }
  }

  if (input.images !== undefined) {
    if (!Array.isArray(input.images) || input.images.some((i) => typeof i !== "string")) {
      errors.push("Images must be an array of strings (paths or URLs).");
    }
  }

  if (input.thumbnail !== undefined && typeof input.thumbnail !== "string") {
    errors.push("Thumbnail must be a string.");
  }

  return errors;
}
