import type { Product } from "./types";

/**
 * The storefront sells at 85% of a listing's reference price -- 15% below it.
 *
 * `price` as authored in the catalog is the REFERENCE, not the shelf price:
 * MSRP where the manufacturer publishes one, otherwise the specialist's
 * listed price. This ratio is what turns that into the figure a customer
 * pays, and it is applied in exactly one place (applyPublicPrices, called
 * once over the whole catalog in products.ts) so the storefront, the cart and
 * the server-authoritative order lines cannot disagree.
 *
 * It was 0.79. Nothing else reduces a base price anywhere in the pipeline.
 *
 * This is NOT the checkout promotion. The 5% every order gets and the 10% for
 * two or more items live in discounts.ts and apply to the cart AFTER this --
 * see calculateCartDiscounts. The two are deliberately separate: this one
 * sets the shelf price, that one is the incentive on top of it.
 */
export const PUBLIC_PRICE_RATIO = 0.85;

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

/**
 * Public prices land on a $5 grid.
 *
 * It was $10, which was too coarse for the ratio to mean what it says. A $10
 * grid moves a price by up to $5 either way, so the further down the catalog
 * you go the more the grid decides the discount instead of the ratio: a $17
 * reference sold at $10, 41% off, while a $30.95 one sold at $30, 3% off.
 * Worse, at 0.85 the rounded figure could land at or above the reference
 * itself on a handful of cheap parts, and those were then sold at full
 * reference price with no discount and no sale badge at all.
 *
 * $5 keeps prices looking like retail prices -- $85, $425, $550, not $84.99
 * or $547 -- while leaving the ratio in charge: mean 15.05% off across the
 * catalog, and 95.8% of listings within 13-17% of their reference.
 */
const PUBLIC_PRICE_ROUNDING = 5;

/**
 * Below this, the price is worked out to the cent instead of onto the grid.
 *
 * A $5 step is a big fraction of a cheap part, so down here the grid decides
 * the discount instead of the ratio. Two $14.95 listings priced at 0.85 came
 * to $12.71, which rounded UP to $15 -- above their own reference -- so they
 * were sold at $14.95 flat with no discount and no sale badge. Others were
 * pulled the other way: a $17 reference sold at $15, and a $21 one at $20.
 *
 * Pricing anything under $20 to the cent keeps the ratio honest exactly where
 * the grid is least able to express it. It moves 21 listings, none of which
 * is now sold at or above its reference, and it lifts the smallest discount
 * in the catalog from 4.8% to 7.2%. Prices like $12.71 read fine on a washer
 * or a valve cap; nothing of any size is affected.
 */
const PUBLIC_PRICE_CENTS_BELOW = 20;

export function resolvePublicPrice(product: Pick<Product, "id" | "price">): number {
  if (product.id === CHECKOUT_TEST_PRODUCT_ID) return product.price;
  if (product.price <= 0) return 0;

  const discounted = product.price * PUBLIC_PRICE_RATIO;

  // Also the floor: a grid-rounded price would collapse the cheapest parts
  // toward zero, so hardware and small accessories never become free here.
  if (discounted < PUBLIC_PRICE_CENTS_BELOW) {
    return Math.max(0.01, Math.round(discounted * 100) / 100);
  }

  return Math.round(discounted / PUBLIC_PRICE_ROUNDING) * PUBLIC_PRICE_ROUNDING;
}

/**
 * The struck-through figure is shown only where the listing's authored price
 * is a confirmed manufacturer MSRP.
 *
 * It used to appear wherever a listing recorded a checkable source, which put
 * a "List price" on 3,617 of 4,044 listings (89%). The authored price is the
 * price on whichever supplier or specialist page it was read from -- MSRP only
 * sometimes -- and the catalog does not record which. Calling a third party's
 * retail price a "list price", then selling 15% under it, made the store read
 * as a permanent sale, and overstated the saving wherever the manufacturer's
 * own price was lower. So it now needs positive confirmation: `msrpConfirmed`
 * on the listing, which no listing carries yet.
 *
 * Selling prices are unchanged. Listings without confirmation render a single
 * price and no ON SALE badge, since isProductOnSale() reads the same field.
 * Nothing here invents a reference price.
 */
function hasConfirmedMsrp(product: Product): boolean {
  return product.msrpConfirmed === true;
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

    if (!hasConfirmedMsrp(product)) {
      // Also drops any compareAtPrice the listing authored by hand.
      const { compareAtPrice: _unconfirmed, ...rest } = product;
      return { ...rest, price: salePrice };
    }

    return {
      ...product,
      compareAtPrice: product.price,
      price: salePrice,
    };
  });
}
