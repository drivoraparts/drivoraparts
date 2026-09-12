/**
 * Manual / direct payment methods offered at checkout.
 *
 * These are LABELS ONLY. No account numbers, handles, IBANs, routing numbers
 * or SWIFT codes live here or anywhere in the repo -- the actual receiving
 * details are pasted per order by an admin from the order screen and emailed to
 * the customer, so nothing sensitive ships in client code. Selecting one of
 * these creates an ordinary pending order; an admin then sends instructions and
 * later verifies the incoming payment by hand.
 *
 * To add a method, add an entry. To hide one without deleting history, set
 * enabled:false. Order here is the order shown in checkout.
 */
export type ManualMethodId =
  | "bank_transfer"
  | "wire"
  | "zelle"
  | "cash_app"
  | "venmo";

export type ManualMethod = {
  id: ManualMethodId;
  label: string;
  /** One-line hint under the label. Never contains account details. */
  blurb: string;
  /** Emoji used as a lightweight icon; the UI may swap for an SVG later. */
  icon: string;
  /** Rough region, for the customer's orientation only. */
  region: string;
  enabled: boolean;
};

export const MANUAL_METHODS: ManualMethod[] = [
  {
    id: "bank_transfer",
    label: "Bank Transfer",
    blurb: "Domestic or SEPA/UK/AU transfer — instructions sent after you order",
    icon: "🏦",
    region: "Worldwide",
    enabled: true,
  },
  {
    id: "wire",
    label: "International Wire (SWIFT)",
    blurb: "Cross-border wire — SWIFT/BIC details sent after you order",
    icon: "🌎",
    region: "International",
    enabled: true,
  },
  {
    id: "zelle",
    label: "Zelle",
    blurb: "U.S. bank-to-bank — recipient sent after you order",
    icon: "🇺🇸",
    region: "United States",
    enabled: true,
  },
  {
    id: "cash_app",
    label: "Cash App",
    blurb: "U.S. — $Cashtag sent after you order",
    icon: "💵",
    region: "United States",
    enabled: true,
  },
  {
    id: "venmo",
    label: "Venmo",
    blurb: "U.S. — handle sent after you order",
    icon: "💜",
    region: "United States",
    enabled: true,
  },
];

export function getManualMethod(id: string): ManualMethod | undefined {
  return MANUAL_METHODS.find((m) => m.id === id);
}

export function isManualMethodId(value: unknown): value is ManualMethodId {
  return (
    typeof value === "string" &&
    MANUAL_METHODS.some((m) => m.id === value && m.enabled)
  );
}

/** Progression of a manual payment, tracked in the payment row's metadata. */
export type ManualPaymentState =
  | "awaiting_payment" // order placed, no instructions sent yet
  | "instructions_sent" // admin sent bank/recipient details
  | "receipt_submitted" // customer uploaded proof
  | "under_review" // admin is checking
  | "verified" // admin confirmed funds -> order goes paid
  | "verification_failed"; // admin rejected -> customer asked to resubmit

export const MANUAL_STATE_LABELS: Record<ManualPaymentState, string> = {
  awaiting_payment: "Awaiting Payment",
  instructions_sent: "Payment Instructions Sent",
  receipt_submitted: "Receipt Submitted",
  under_review: "Payment Under Review",
  verified: "Payment Verified",
  verification_failed: "Verification Failed",
};
