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
   `brandAssetsApproved` once those files are in
   /public/brand/toyota/.
========================================================= */

export type ToyotaDealerRecord = {
  /** Dealership or entity named in the authorization, e.g. "DrivoraParts (BrookstoneUS LLC)". */
  authorizedEntity: string;
  /** Toyota dealer / parts-account code from the authorization document. */
  dealerCode: string;
  /** ISO date the authorization took effect. */
  effectiveDate: string;
  /** True only once Toyota-supplied logo files are in /public/brand/toyota/ and approved for use. */
  brandAssetsApproved: boolean;
};

export const TOYOTA_DEALER: ToyotaDealerRecord | null = null;

export function isAuthorizedToyotaDealer(): boolean {
  const record = TOYOTA_DEALER as ToyotaDealerRecord | null;
  return Boolean(record && record.authorizedEntity.trim() && record.dealerCode.trim());
}
