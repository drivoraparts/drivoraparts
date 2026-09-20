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
  if (product.price <= 0) return 0;

  const discounted = product.price * PUBLIC_PRICE_RATIO;

  // Rounding to the nearest $10 collapses anything under ~$6.33 raw to $0 —
  // round to the nearest cent below that point so cheap parts (hardware,
  // small accessories) never become free at checkout.
  if (discounted < 10) {
    return Math.max(0.01, Math.round(discounted * 100) / 100);
  }

  return Math.round(discounted / 10) * 10;
}

/**
 * The struck-through figure is shown only where the listing records where its
 * reference price was read from.
 *
 * A listing's authored `price` is meant to be the reference at the source --
 * MSRP where the manufacturer publishes one, otherwise the specialist's
 * listed price -- and the 2,564 listings carrying a `sourceUrl` are exactly
 * the ones where that can still be checked against the page it came from. An
 * audit on 2026-09-20 spot-checked six of them against the live supplier
 * pages five days after capture and all six matched to the cent.
 *
 * The rest cannot be checked by anyone: 1,219 arrived in a bulk JSON import
 * carrying a price and nothing else, 42 are the owner's own yard parts where
 * the "was" figure is their own asking price, and the remainder state no
 * basis at all. Those listings sell at the same price as before and simply
 * stop claiming a discount -- which also drops their ON SALE badge, since
 * isProductOnSale() reads the same field.
 *
 * Nothing here invents a reference price, and no selling price changes.
 */
function hasVerifiableReferencePrice(product: Product): boolean {
  return Boolean(product.sourceUrl?.trim());
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

    if (!hasVerifiableReferencePrice(product)) {
      return { ...product, price: salePrice };
    }

    return {
      ...product,
      compareAtPrice: product.price,
      price: salePrice,
    };
  });
}
