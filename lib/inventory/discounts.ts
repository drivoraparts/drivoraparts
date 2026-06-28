import { CHECKOUT_TEST_PRODUCT_ID } from "./pricing";

export const BULK_MIN_QUANTITY = 2;
export const BASE_ORDER_DISCOUNT_PERCENT = 5;
export const BULK_ORDER_DISCOUNT_PERCENT = 20;

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

export function getTotalCartQuantity(items: DiscountLineInput[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export function cartQualifiesForBulkDiscount(items: DiscountLineInput[]): boolean {
  return getTotalCartQuantity(items) >= BULK_MIN_QUANTITY;
}

export function getProductDiscountLabel(_category?: string): string {
  return `Buy 2+ · Save ${BULK_ORDER_DISCOUNT_PERCENT}%`;
}

export function getOrderDiscountLabel(): string {
  return `Every order · Save ${BASE_ORDER_DISCOUNT_PERCENT}%`;
}

export function calculateCartDiscounts(
  items: DiscountLineInput[],
  shipping = 0
): CartDiscountBreakdown {
  const isTestCheckoutOnly =
    items.length > 0 &&
    items.every((item) => item.id === CHECKOUT_TEST_PRODUCT_ID);

  let grossSubtotal = 0;

  for (const item of items) {
    grossSubtotal += item.price * item.quantity;
  }

  if (isTestCheckoutOnly) {
    const total = grossSubtotal + shipping;
    return {
      grossSubtotal,
      bulkDiscount: 0,
      orderDiscount: 0,
      shipping,
      merchandiseTotal: grossSubtotal,
      total: Math.max(0, Math.round(total * 100) / 100),
    };
  }

  let bulkDiscount = 0;
  let orderDiscount = 0;

  if (cartQualifiesForBulkDiscount(items)) {
    bulkDiscount = grossSubtotal * (BULK_ORDER_DISCOUNT_PERCENT / 100);
  } else if (items.length > 0) {
    orderDiscount = grossSubtotal * (BASE_ORDER_DISCOUNT_PERCENT / 100);
  }

  const merchandiseTotal = grossSubtotal - bulkDiscount - orderDiscount;
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
