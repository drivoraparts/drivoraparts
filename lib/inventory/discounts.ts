import { CHECKOUT_TEST_PRODUCT_ID } from "./pricing";
import { findCustomerDiscount } from "./customer-discounts";

export const BULK_MIN_QUANTITY = 2;
export const BASE_ORDER_DISCOUNT_PERCENT = 5;

/**
 * The uplift for a second item, on top of the 5% every order already gets.
 * Was 20%, which made the step from one item to two worth four times the
 * standing discount on the whole cart.
 */
export const BULK_ORDER_DISCOUNT_PERCENT = 10;

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
  customerEmail?: string
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

  // A customer-specific discount is scoped to one product line and tops up
  // whatever sitewide discount that line already carries (bulk or
  // order-wide) to its total percent-off — it never stacks past that, and
  // it never touches any other line item. Matched purely by checkout email;
  // no code required.
  let couponDiscount = 0;
  let couponLabel: string | null = null;

  if (customerEmail) {
    const alreadyAppliedPercent =
      bulkDiscount > 0
        ? BULK_ORDER_DISCOUNT_PERCENT
        : orderDiscount > 0
          ? BASE_ORDER_DISCOUNT_PERCENT
          : 0;

    for (const line of items) {
      const matchedDiscount = findCustomerDiscount(customerEmail, line.id);
      if (!matchedDiscount) continue;

      const extraPercent = Math.max(
        0,
        matchedDiscount.totalPercentOff - alreadyAppliedPercent
      );

      if (extraPercent > 0) {
        const lineGross = roundCents(line.price * line.quantity);
        couponDiscount = roundCents(couponDiscount + lineGross * (extraPercent / 100));
      }

      couponLabel = couponLabel ?? matchedDiscount.label;
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
