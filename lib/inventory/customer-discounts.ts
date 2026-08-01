/**
 * One-off, customer-specific discount codes — each entry is locked to a
 * single email + a single product, so redeeming the code for any other
 * account or item never matches. Not a general promo-code system.
 */
export type CustomerDiscount = {
  code: string;
  email: string;
  productId: number;
  /** Total effective % off this line item once redeemed (inclusive of any
   *  sitewide discount that already applies — see calculateCartDiscounts). */
  totalPercentOff: number;
  label: string;
  /** ISO date string. Omit for no expiration. */
  expiresAt?: string;
};

const CUSTOMER_DISCOUNTS: readonly CustomerDiscount[] = [
  {
    code: "VETSILLIMAN10",
    email: "jrsilliman369@gmail.com",
    productId: 1,
    totalPercentOff: 10,
    label: "Veteran discount",
  },
];

function normalizeCode(code: string): string {
  return code.trim().toUpperCase();
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function findCustomerDiscount(
  code: string | undefined | null,
  email: string | undefined | null
): CustomerDiscount | null {
  if (!code?.trim() || !email?.trim()) return null;

  const normCode = normalizeCode(code);
  const normEmail = normalizeEmail(email);

  const discount = CUSTOMER_DISCOUNTS.find(
    (d) => normalizeCode(d.code) === normCode && normalizeEmail(d.email) === normEmail
  );

  if (!discount) return null;
  if (discount.expiresAt && new Date(discount.expiresAt).getTime() < Date.now()) {
    return null;
  }

  return discount;
}
