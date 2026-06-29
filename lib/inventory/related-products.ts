import type { Product } from "./types";
import { products } from "./products";
import { CHECKOUT_TEST_PRODUCT_ID } from "./pricing";

function scoreRelated(
  candidate: Product,
  source: Pick<Product, "category" | "brand" | "platform">
): number {
  let score = 0;
  if (candidate.category === source.category) score += 4;
  if (candidate.brand === source.brand) score += 3;
  if (source.platform && candidate.platform === source.platform) score += 2;
  return score;
}

/** Same-category picks ranked by brand/platform match; newest as tiebreaker. */
export function getRelatedProducts(
  source: Pick<Product, "id" | "category" | "brand" | "platform">,
  limit = 8
): Product[] {
  const ranked = products
    .filter(
      (product) =>
        product.id !== source.id && product.id !== CHECKOUT_TEST_PRODUCT_ID
    )
    .map((product) => ({
      product,
      score: scoreRelated(product, source),
    }))
    .filter((row) => row.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        (b.product.createdAt ?? b.product.id) - (a.product.createdAt ?? a.product.id)
    );

  if (ranked.length >= limit) {
    return ranked.slice(0, limit).map((row) => row.product);
  }

  const seen = new Set(ranked.map((row) => row.product.id));
  const fallback = products
    .filter(
      (product) =>
        product.id !== source.id &&
        product.id !== CHECKOUT_TEST_PRODUCT_ID &&
        !seen.has(product.id)
    )
    .sort(
      (a, b) => (b.createdAt ?? b.id) - (a.createdAt ?? a.id)
    );

  return [...ranked.map((row) => row.product), ...fallback].slice(0, limit);
}
