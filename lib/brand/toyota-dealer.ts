/* =========================================================
   TOYOTA DEALER IDENTITY
   ---------------------------------------------------------
   Everything on the storefront that says DrivoraParts is an
   AUTHORIZED Toyota dealer reads this one record. While it is
   null the site makes no authorization claim at all: it sells
   Toyota-compatible parts and says only that.

   It is null on purpose. As of 2026-11-17 the business states
   it has been authorized, but no dealer name, dealer code or
   Toyota brand-asset approval has been provided, and the site
   must not publish an authorization it cannot back up -- the
   checkout is crypto-only and irreversible, so a buyer relies
   on what the page says. Fill this in from the authorization
   document, and the dealer badge, the "authorized" wording and
   the "Genuine Toyota Parts" hero line switch on together.

   Toyota logos and the Genuine Toyota Parts mark are NOT in
   this repository and must not be recreated or downloaded from
   elsewhere. Use only the files Toyota supplies with the
   authorization, under its brand guidelines, and only set
   `logoSrc` once those files are in /public/brand/toyota/.
========================================================= */

/**
 * The designation, word for word as the authorization grants it. Each maps to
 * one fixed badge line and footer statement below -- there is no free-text
 * field, so the site can never claim a more senior role than the agreement.
 */
export type ToyotaDesignation = "distributor" | "parts-dealer" | "dealer";

export type ToyotaDealerRecord = {
  designation: ToyotaDesignation;
  /** The legal entity the authorization names, e.g. "BrookstoneUS LLC". */
  authorizedEntity: string;
  /** Toyota dealer / parts-account code from the authorization document. */
  dealerCode: string;
  /** Whether the agreement allows publishing the code on the site. */
  publishCode: boolean;
  /** ISO date the authorization took effect. */
  effectiveDate: string;
  /** Whether the agreement licenses use of Toyota's marks ("used under license"). */
  marksLicensed: boolean;
  /**
   * Toyota-supplied one-colour logo, e.g. "/brand/toyota/toyota-mark.svg".
   * Set only once the file is in public/brand/toyota/ and its use is approved.
   */
  logoSrc: string | null;
};

export const TOYOTA_DEALER: ToyotaDealerRecord | null = null;

function record(): ToyotaDealerRecord | null {
  return TOYOTA_DEALER as ToyotaDealerRecord | null;
}

export function isAuthorizedToyotaDealer(): boolean {
  const r = record();
  return Boolean(r && r.authorizedEntity.trim() && r.dealerCode.trim());
}

const BADGE_TEXT: Record<ToyotaDesignation, string> = {
  distributor: "Authorized Distributor of Genuine Toyota Parts",
  "parts-dealer": "Authorized Genuine Toyota Parts Dealer",
  dealer: "Authorized Toyota Dealer",
};

/** The short line beside the Toyota mark in the trust bar, or null. */
export function toyotaBadgeText(): string | null {
  const r = record();
  return isAuthorizedToyotaDealer() && r ? BADGE_TEXT[r.designation] : null;
}

/** The logo path, only when authorized and the file is approved. */
export function toyotaLogoSrc(): string | null {
  const r = record();
  return isAuthorizedToyotaDealer() && r?.logoSrc ? r.logoSrc : null;
}

/** The footer statement of the authorization, or null. */
export function toyotaFooterStatement(): string | null {
  const r = record();
  if (!isAuthorizedToyotaDealer() || !r) return null;
  const entity = r.authorizedEntity.trim();
  const code = r.publishCode ? r.dealerCode.trim() : "";
  switch (r.designation) {
    case "distributor":
      return `${entity} is an authorized distributor of Genuine Toyota Parts.${code ? ` Account ${code}.` : ""}`;
    case "parts-dealer":
      return `${entity} is an authorized dealer of Genuine Toyota Parts.${code ? ` Dealer code ${code}.` : ""}`;
    case "dealer":
      return `${entity}, an authorized Toyota dealer.${code ? ` Dealer code ${code}.` : ""}`;
  }
}

/** The footer trademark line: "used under license" only when the agreement grants it. */
export function toyotaTrademarkLine(): string {
  const r = record();
  const licensed = isAuthorizedToyotaDealer() && r?.marksLicensed;
  return licensed
    ? "Toyota, the Toyota logo and Genuine Toyota Parts are trademarks of Toyota Motor Corporation, used under license. Aftermarket products on this site are not made or endorsed by Toyota."
    : "Toyota, Toyota model names and Toyota Genuine Parts are trademarks of Toyota Motor Corporation. Aftermarket products on this site are not made or endorsed by Toyota.";
}
