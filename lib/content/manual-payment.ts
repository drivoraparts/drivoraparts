/*
 * Customer-facing copy for the manual payment process, in one place.
 *
 * Checkout and /policies/manual-payment both say the same two things -- how the
 * process works, and how a PayPal payment is made -- and the second is
 * something a customer needs before they place an order. Written twice, the two
 * would drift. Written here, an edit to the wording changes both.
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
 * It is scoped to "manual payment methods" rather than to the whole selector,
 * and that scoping is what keeps it true. The selector also lists
 * cryptocurrency, which is NOT a manual payment: it creates a NOWPayments
 * invoice and sends the customer straight to it, with no review step in
 * between. An unscoped "payment instructions are provided after your order is
 * reviewed" would be false for that one option.
 *
 * This line used to say so out loud ("Cryptocurrency is the exception…"). The
 * owner took it out because putting cryptocurrency in front of every customer
 * made some of them uneasy. The scoping makes the sentence true without it:
 * the select's own "Manual Payment" and "Cryptocurrency" groups already tell
 * the two apart, and choosing cryptocurrency shows its own panel.
 */
export const MANUAL_PAYMENT_CHECKOUT_INTRO =
  "Choose your preferred payment method. For manual payment methods, payment instructions are provided after your order is reviewed.";

/**
 * The question and the link are two pieces on purpose. Only "Learn more" is
 * clickable; the question is plain text, so the target is the one phrase that
 * says what clicking does.
 */
export const MANUAL_PAYMENT_CHECKOUT_QUESTION = "Why do we use manual payment?";
export const MANUAL_PAYMENT_CHECKOUT_LINK = "Learn more";

/**
 * Shown the moment PayPal is selected, so the customer knows how to complete
 * the payment before they submit, rather than after they receive instructions.
 *
 * The owner has confirmed the route: PayPal orders are paid through Friends &
 * Family, so this says so plainly and tells the customer which option to pick.
 * It used to be hedged ("may be requested") and carried a paragraph on purchase
 * protection and dispute coverage; the owner replaced that with this, because
 * the longer text read as a warning against a legitimate payment method.
 *
 * Shared with /policies/manual-payment, which shows the same body.
 */
export const PAYPAL_DISCLOSURE = {
  lead: "Before you choose PayPal",
  body:
    "PayPal payments are handled through Friends & Family. Please make sure you select the Friends & Family option when completing your payment.",
} as const;

/**
 * Shown the moment Venmo is selected -- the same idea as the PayPal notice,
 * kept deliberately separate from it.
 *
 * It says "personal payment" and not "Friends & Family". That is PayPal's name
 * for its personal payments, and nothing here establishes that Venmo uses it.
 * The owner has confirmed Venmo orders are handled as a personal payment, so
 * the wording is explicit rather than "may", and points the customer at the
 * instructions DrivoraParts sends, which is where the details are.
 */
export const VENMO_DISCLOSURE = {
  lead: "Before you choose Venmo",
  body:
    "Venmo payments are handled as a personal payment. Please follow the payment instructions provided by DrivoraParts when completing your payment.",
} as const;
