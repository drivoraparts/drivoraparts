/**
 * Order size limits, shared by the cart and the checkout API.
 *
 * These lived only in the server validator, so the cart happily built orders
 * the API would refuse. A customer could add 21 of an item, fill in their name
 * and full shipping address, press Pay Now, and be told "Invalid checkout
 * payload" — at the last step, with no clue which product was at fault.
 *
 * Keeping the numbers here means the cart enforces exactly what the server
 * enforces, and the two cannot drift apart.
 */

export const MAX_QUANTITY_PER_ITEM = 20;
export const MAX_LINE_ITEMS = 50;

export function quantityLimitMessage(productName?: string): string {
  return productName
    ? `You can order up to ${MAX_QUANTITY_PER_ITEM} of ${productName} per order. Contact us for larger quantities.`
    : `You can order up to ${MAX_QUANTITY_PER_ITEM} of any item per order. Contact us for larger quantities.`;
}

export function lineItemLimitMessage(): string {
  return `A single order can hold up to ${MAX_LINE_ITEMS} different products. Please check out and start another order.`;
}
