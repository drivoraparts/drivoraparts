import type { Product } from "./types";

/**
 * Customer-facing USD list prices tuned for conversion.
 * Catalog MSRP values in products.ts remain the internal baseline;
 * storefront, cart, and checkout use these public prices.
 */
export const PUBLIC_PRICES: Readonly<Record<number, number>> = {
  // Engine — complete units
  1: 2199,
  2: 449,
  33: 2299,
  34: 3499,
  35: 1899,
  36: 1699,
  37: 1999,
  38: 2699,
  39: 3299,
  40: 2799,
  41: 1499,
  42: 1399,
  43: 1449,
  44: 1599,
  45: 1599,
  46: 1799,
  47: 3499,
  48: 2499,
  49: 2199,
  50: 2899,
  51: 2599,
  52: 3299,
  53: 2499,
  54: 1299,
  55: 2999,
  56: 2199,
  57: 2899,
  58: 1199,

  // Engine — turbo / performance parts
  59: 89,
  60: 79,
  61: 899,
  62: 999,
  63: 349,
  64: 199,
  65: 899,
  66: 999,
  67: 799,
  68: 849,
  69: 129,
  70: 399,
  71: 699,
  72: 149,
  73: 119,

  // Brakes
  74: 349,
  75: 1299,
  76: 449,
  77: 279,
  78: 299,
  79: 899,

  // Transmissions
  80: 1899,
  81: 1699,
  82: 1999,
  83: 1599,
  84: 1199,
  85: 1299,
  86: 1499,
  87: 1399,
  88: 1699,
  89: 2299,
  90: 149,
  91: 349,
  92: 1499,
  93: 1399,
  94: 2199,

  // Turbocharger category
  95: 849,
  96: 899,
  97: 949,
  98: 799,
  99: 949,
  100: 399,
  101: 699,
  102: 849,
  103: 699,
  104: 749,
  105: 899,
  106: 599,
};

export function resolvePublicPrice(product: Pick<Product, "id" | "price">): number {
  return PUBLIC_PRICES[product.id] ?? product.price;
}

export function applyPublicPrices(items: Product[]): Product[] {
  return items.map((product) => {
    const price = resolvePublicPrice(product);
    return price === product.price ? product : { ...product, price };
  });
}
