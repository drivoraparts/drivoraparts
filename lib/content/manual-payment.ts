/*
 * Customer-facing copy for the manual payment process, in one place.
 *
 * Checkout and /policies/manual-payment both say the same two things -- how the
 * process works, and what PayPal does and does not cover -- and the second one
 * is a disclosure a customer relies on before they place an order. Written
 * twice, the two would drift. Written here, an edit to the wording changes both.
 *
 * Only the process the code actually implements is described: an order is
 * placed, a person reviews it, payment instructions (with shipping) are sent,
 * the customer pays and uploads a receipt, and a person verifies the payment
 * before anything ships. See lib/payments/manual-methods.ts for the methods and
 * lib/payments/manual-payment.ts for the state machine. Nothing here makes a
 * claim about a processor, a regulator or a security standard, because none of
 * those is part of this flow.
 */

export const MANUAL_PAYMENT_POLICY_HREF = "/policies/manual-payment";

/**
 * The line under the "Manual Payment" heading at checkout.
 *
 * The second sentence is there because the selector also lists cryptocurrency,
 * which is NOT a manual payment: it creates a NOWPayments invoice and sends the
 * customer straight to it, with no review step in between. Saying "payment
 * instructions are provided after your order is reviewed" about the whole list
 * would be false for that one option.
 */
export const MANUAL_PAYMENT_CHECKOUT_INTRO =
  "Choose your preferred payment method. Payment instructions are provided after your order is reviewed. Cryptocurrency is the exception: it opens a NOWPayments invoice straight away.";

export const MANUAL_PAYMENT_CHECKOUT_LINK = "Why do we use manual payment? Learn more";

/**
 * Shown the moment PayPal is selected, so the customer has it before they
 * submit rather than after they receive instructions.
 *
 * Worded as "may be requested" on purpose. Which PayPal payment type an order
 * is asked to use is decided when an admin writes the instructions, not by this
 * code, so the disclosure cannot truthfully say it always is, or never is,
 * Friends & Family. The protection statement is limited to what PayPal itself
 * distinguishes: eligible Goods & Services payments carry PayPal's purchase
 * protection, and Friends & Family payments do not. Nothing about fees, limits
 * or PayPal's current terms is asserted.
 */
export const PAYPAL_DISCLOSURE = {
  lead: "Before you choose PayPal",
  body:
    "Your payment may be requested through PayPal Friends & Family. Friends & Family payments do not include the purchase protection and dispute coverage PayPal applies to eligible Goods & Services transactions. Choose PayPal only if you understand and accept this; otherwise, select a different payment method.",
} as const;
