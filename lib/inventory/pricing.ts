import type { Product } from "./types";

/**
 * Public list prices sit between full MSRP and the previous discount tier.
 * ~72% of catalog MSRP, rounded to natural price points.
 */
export const PUBLIC_PRICE_RATIO = 0.72;

export function roundListPrice(amount: number): number {
  if (amount <= 0) return 0;

  if (amount < 150) {
    return Math.max(99, Math.round(amount / 5) * 5 - 1);
  }

  if (amount < 500) {
    return Math.round(amount / 10) * 10 - 1;
  }

  if (amount < 2000) {
    return Math.round(amount / 25) * 25 - 1;
  }

  if (amount < 8000) {
    return Math.round(amount / 50) * 50 - 1;
  }

  return Math.round(amount / 100) * 100 - 1;
}

export function resolvePublicPrice(product: Pick<Product, "id" | "price">): number {
  return roundListPrice(product.price * PUBLIC_PRICE_RATIO);
}

export function applyPublicPrices(items: Product[]): Product[] {
  return items.map((product) => {
    const price = resolvePublicPrice(product);
    return price === product.price ? product : { ...product, price };
  });
}
