export const BULK_MIN_QUANTITY = 2;
export const STANDARD_BULK_PERCENT = 20;
export const PREMIUM_BULK_PERCENT = 30;
export const ORDER_DISCOUNT_PERCENT = 10;

/** Categories that qualify for the higher buy-2 bulk discount. */
export const PREMIUM_BULK_CATEGORIES = new Set([
  "engine",
  "transmission",
  "turbocharger",
]);

export type DiscountLineInput = {
  id: number;
  price: number;
  quantity: number;
  category?: string;
};

export type CartDiscountBreakdown = {
  grossSubtotal: number;
  bulkDiscount: number;
  orderDiscount: number;
  shipping: number;
  merchandiseTotal: number;
  total: number;
};

export function getBulkDiscountPercent(category?: string): number {
  if (category && PREMIUM_BULK_CATEGORIES.has(category)) {
    return PREMIUM_BULK_PERCENT;
  }
  return STANDARD_BULK_PERCENT;
}

export function getProductDiscountLabel(category?: string): string {
  const percent = getBulkDiscountPercent(category);
  return `Buy 2+ · Save ${percent}%`;
}

export function getOrderDiscountLabel(): string {
  return `Order · Save ${ORDER_DISCOUNT_PERCENT}%`;
}

export function calculateCartDiscounts(
  items: DiscountLineInput[],
  shipping = 0
): CartDiscountBreakdown {
  let grossSubtotal = 0;
  let bulkDiscount = 0;

  for (const item of items) {
    const lineGross = item.price * item.quantity;
    grossSubtotal += lineGross;

    if (item.quantity >= BULK_MIN_QUANTITY) {
      const percent = getBulkDiscountPercent(item.category);
      bulkDiscount += lineGross * (percent / 100);
    }
  }

  const afterBulk = grossSubtotal - bulkDiscount;
  const orderDiscount = afterBulk * (ORDER_DISCOUNT_PERCENT / 100);
  const merchandiseTotal = afterBulk - orderDiscount;
  const total = merchandiseTotal + shipping;

  return {
    grossSubtotal,
    bulkDiscount,
    orderDiscount,
    shipping,
    merchandiseTotal,
    total: Math.max(0, Math.round(total * 100) / 100),
  };
}
