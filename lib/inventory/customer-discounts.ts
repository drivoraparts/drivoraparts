/**
 * One-off, customer-specific discounts — each entry is locked to a single
 * email + a single product and auto-applies at checkout once that email is
 * entered, no code required. Not a general promo-code system.
 */
export type CustomerDiscount = {
  email: string;
  productId: number;
  /** Total effective % off this line item once applied (inclusive of any
   *  sitewide discount that already applies — see calculateCartDiscounts). */
  totalPercentOff: number;
  label: string;
  /** ISO date string. Omit for no expiration. */
  expiresAt?: string;
};

/*
 * Intentionally empty. This list ships in the client bundle, so any email
 * placed here is readable by every visitor. Do not add customer emails;
 * move the check server-side first.
 */
const CUSTOMER_DISCOUNTS: readonly CustomerDiscount[] = [];

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function findCustomerDiscount(
  email: string | undefined | null,
  productId: number
): CustomerDiscount | null {
  if (!email?.trim()) return null;

  const normEmail = normalizeEmail(email);
  const discount = CUSTOMER_DISCOUNTS.find(
    (d) => normalizeEmail(d.email) === normEmail && d.productId === productId
  );

  if (!discount) return null;
  if (discount.expiresAt && new Date(discount.expiresAt).getTime() < Date.now()) {
    return null;
  }

  return discount;
}
