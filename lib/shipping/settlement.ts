/* =========================================================
   DRIVORAPARTS — IS AN ORDER'S SHIPPING SETTLED?
   ---------------------------------------------------------
   An order's money has three parts: the products (subtotal),
   the shipping charge, and -- until someone has priced it --
   an OUTSTANDING shipping amount that is not yet known.

   Shipping is settled when either:
     - it was calculated at checkout from a published rate
       table (orders.shipping_basis = "us_price_table"; a 0
       there means free), or

   "us_price_table" is kept as the stored value for the UK and
   Australian tables too: it predates them, and renaming it
   would need a migration. Read it as "published price table".
     - an admin quoted it and sent it in the payment
       instructions (manual payment metadata
       manual_instructions_sent_at).

   Otherwise it is OUTSTANDING: orders.shipping = 0 means
   "not priced yet", and the order must not be marked fully
   paid, because nobody has been paid for its shipping.

   Orders placed before migration 015 have no basis (null).
   They are reported as "unknown", and the paid guards leave
   them alone so the admin workflow for existing orders is
   unchanged.
========================================================= */

export type ShippingSettlement = "settled" | "outstanding" | "unknown";

export function orderShippingSettlement(
  order: { shipping_basis?: string | null },
  manual?: { instructionsSentAt?: string | null } | null
): ShippingSettlement {
  if (order.shipping_basis === "us_price_table") return "settled";
  if (manual?.instructionsSentAt) return "settled";
  if (order.shipping_basis === "manual_quote") return "outstanding";
  return "unknown";
}

/** Error shown when someone tries to mark an order paid before its shipping is priced. */
export const SHIPPING_OUTSTANDING_PAID_ERROR =
  "Shipping on this order has not been quoted yet, so it can't be marked fully paid. " +
  "Enter the shipping charge and send the payment instructions first.";
