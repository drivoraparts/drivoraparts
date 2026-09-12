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
  /**
   * When true, checkout asks a second, required question: which bank/transfer
   * route. "Bank Transfer" alone does not tell the owner which instructions to
   * send back, which is the whole point of capturing it at order time.
   */
  requiresRoute?: boolean;
};

export const MANUAL_METHODS: ManualMethod[] = [
  {
    id: "bank_transfer",
    label: "Bank Transfer",
    blurb: "Choose your transfer route — instructions sent after you order",
    icon: "🏦",
    region: "Worldwide",
    enabled: true,
    requiresRoute: true,
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

/**
 * Bank / transfer routes offered when a customer picks Bank Transfer.
 *
 * "Bank Transfer" on its own does not say which instructions to send back --
 * a US customer and an Australian one need different details entirely. This
 * captures the requested route at order time so the owner knows which
 * instructions to paste without a round trip of emails.
 *
 * These are ROUTE names, not bank names, and they hold no account data: no
 * account numbers, sort codes, routing numbers, IBANs or SWIFT/BIC codes
 * appear here or anywhere else in the repo. The receiving details are still
 * pasted per order from the admin screen.
 *
 * To rename one to an actual bank ("United States — Chase"), edit the label
 * here and nowhere else -- checkout, the order record, the admin screen and
 * the owner's notification email all read from this list. To retire a route
 * without breaking orders that already chose it, set enabled:false: existing
 * orders keep resolving their stored id to this label.
 */
export type BankRoute = {
  id: string;
  label: string;
  /** Grouping shown beside the label; orientation only. */
  region: string;
  enabled: boolean;
};

export const BANK_ROUTES: BankRoute[] = [
  {
    id: "us_domestic",
    label: "United States — Domestic Transfer (ACH)",
    region: "United States",
    enabled: true,
  },
  {
    id: "uk_faster",
    label: "United Kingdom — Faster Payments",
    region: "United Kingdom",
    enabled: true,
  },
  {
    id: "eu_sepa",
    label: "Europe — SEPA Transfer",
    region: "Europe",
    enabled: true,
  },
  {
    id: "au_payid",
    label: "Australia — PayID / Bank Transfer",
    region: "Australia",
    enabled: true,
  },
  {
    id: "intl_swift",
    label: "International — SWIFT Wire",
    region: "International",
    enabled: true,
  },
];

/** Resolve a stored route id to its label. Disabled routes still resolve, so
 *  an order placed before a route was retired still reads correctly. */
export function getBankRoute(id: string | null | undefined): BankRoute | undefined {
  if (!id) return undefined;
  return BANK_ROUTES.find((route) => route.id === id);
}

/** Accepts only routes currently offered -- used to validate what checkout
 *  sends, so a crafted body cannot inject an arbitrary route label. */
export function isBankRouteId(value: unknown): boolean {
  return (
    typeof value === "string" &&
    BANK_ROUTES.some((route) => route.id === value && route.enabled)
  );
}

/** Whether a given method id demands a route before checkout may proceed. */
export function methodRequiresRoute(id: string | null | undefined): boolean {
  if (!id) return false;
  return MANUAL_METHODS.some((m) => m.id === id && m.enabled && m.requiresRoute === true);
}
