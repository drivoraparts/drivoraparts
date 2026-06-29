import type { Product } from "./types";

/**
 * Public list prices sit between full MSRP and the previous discount tier.
 * ~79% of catalog MSRP, rounded to the nearest $10.
 */
export const PUBLIC_PRICE_RATIO = 0.79;

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

/** Fixed list price for checkout/payment testing (bypasses MSRP rounding). */
export const CHECKOUT_TEST_PRODUCT_ID = 9999;

export function resolvePublicPrice(product: Pick<Product, "id" | "price">): number {
  if (product.id === CHECKOUT_TEST_PRODUCT_ID) return product.price;
  const discounted = product.price * PUBLIC_PRICE_RATIO;
  return Math.round(discounted / 10) * 10;
}

export function applyPublicPrices(items: Product[]): Product[] {
  return items.map((product) => {
    const salePrice = resolvePublicPrice(product);

    if (product.id === CHECKOUT_TEST_PRODUCT_ID) {
      return salePrice === product.price ? product : { ...product, price: salePrice };
    }

    if (salePrice >= product.price) {
      return product;
    }

    return {
      ...product,
      compareAtPrice: product.price,
      price: salePrice,
    };
  });
}
