import { CHECKOUT_TEST_PRODUCT_ID } from "./pricing";
import { findCustomerDiscount } from "./customer-discounts";

export const BULK_MIN_QUANTITY = 2;
export const BASE_ORDER_DISCOUNT_PERCENT = 5;
export const BULK_ORDER_DISCOUNT_PERCENT = 20;

export type DiscountLineInput = {
  id: number;
  price: number;
  quantity: number;
  category?: string;
};

export type CouponContext = {
  code: string;
  email: string;
};

export type CartDiscountBreakdown = {
  grossSubtotal: number;
  bulkDiscount: number;
  orderDiscount: number;
  couponDiscount: number;
  couponLabel: string | null;
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

function roundCents(value: number): number {
  return Math.round(value * 100) / 100;
}

export function calculateCartDiscounts(
  items: DiscountLineInput[],
  shipping = 0,
  coupon?: CouponContext
): CartDiscountBreakdown {
  const isTestCheckoutOnly =
    items.length > 0 &&
    items.every((item) => item.id === CHECKOUT_TEST_PRODUCT_ID);

  let grossSubtotal = 0;

  for (const item of items) {
    grossSubtotal += item.price * item.quantity;
  }
  grossSubtotal = roundCents(grossSubtotal);

  if (isTestCheckoutOnly) {
    const total = roundCents(grossSubtotal + shipping);
    return {
      grossSubtotal,
      bulkDiscount: 0,
      orderDiscount: 0,
      couponDiscount: 0,
      couponLabel: null,
      shipping,
      merchandiseTotal: grossSubtotal,
      total: Math.max(0, total),
    };
  }

  let bulkDiscount = 0;
  let orderDiscount = 0;

  if (cartQualifiesForBulkDiscount(items)) {
    bulkDiscount = roundCents(grossSubtotal * (BULK_ORDER_DISCOUNT_PERCENT / 100));
  } else if (items.length > 0) {
    orderDiscount = roundCents(grossSubtotal * (BASE_ORDER_DISCOUNT_PERCENT / 100));
  }

  // A matched coupon is scoped to one product line and tops up whatever
  // sitewide discount that line already carries (bulk or order-wide) to the
  // coupon's total percent-off — it never stacks past that, and it never
  // touches any other line item.
  let couponDiscount = 0;
  let couponLabel: string | null = null;
  const matchedDiscount = findCustomerDiscount(coupon?.code, coupon?.email);

  if (matchedDiscount) {
    const line = items.find((item) => item.id === matchedDiscount.productId);

    if (line) {
      const alreadyAppliedPercent =
        bulkDiscount > 0
          ? BULK_ORDER_DISCOUNT_PERCENT
          : orderDiscount > 0
            ? BASE_ORDER_DISCOUNT_PERCENT
            : 0;
      const extraPercent = Math.max(
        0,
        matchedDiscount.totalPercentOff - alreadyAppliedPercent
      );

      if (extraPercent > 0) {
        const lineGross = roundCents(line.price * line.quantity);
        couponDiscount = roundCents(lineGross * (extraPercent / 100));
      }

      couponLabel = matchedDiscount.label;
    }
  }

  // Every intermediate figure is already rounded to cents, so
  // merchandiseTotal/total are exact sums of what's actually displayed —
  // no fractional-cent drift between line items and the shown total.
  const merchandiseTotal = roundCents(
    grossSubtotal - bulkDiscount - orderDiscount - couponDiscount
  );
  const total = roundCents(merchandiseTotal + shipping);

  return {
    grossSubtotal,
    bulkDiscount,
    orderDiscount,
    couponDiscount,
    couponLabel,
    shipping,
    merchandiseTotal,
    total: Math.max(0, total),
  };
}
