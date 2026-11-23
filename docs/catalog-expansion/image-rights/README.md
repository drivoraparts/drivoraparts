# Image-rights verification and remediation (2026-11-23)

Owner instruction: a photograph may be published only with verified commercial-use permission. Finding an image on a
manufacturer's or retailer's site is not permission.

## Result
| | Count |
|---|---|
| Listings audited (everything public on 2026-11-23) | 348 |
| Images audited | 588 |
| Images verified as licensed (VERIFIED_LICENSED) | 0 |
| Images verified as authorized (VERIFIED_AUTHORIZED) | 0 |
| Images replaced with an authorized photo | 0 |
| Permissions obtained | 0 |
| Permission requests sent | 0 (no business email account is available to this session; see Blockers) |
| Permissions denied by a rights holder | 0 |
| IMAGE_REPLACEMENT_REQUIRED (the source's terms do not allow our use, or placeholder) | 404 images |
| SOURCE_UNVERIFIED (no licence or permission on record) | 184 images |
| Listings held | 348 |
| Listings restored | 0 |

Every listing stays in the catalog source: IDs, prices, fitment and descriptions are unchanged. Each one is hidden by the
image-rights gate and is restored automatically once all its photos are VERIFIED_* in the registry.

## By source
| Source website | Listings | Images | Status |
|---|---|---|---|
| epc-images.toyota.com | 92 | 213 | IMAGE_REPLACEMENT_REQUIRED |
| no source record | 34 | 144 | SOURCE_UNVERIFIED / placeholder |
| store.arbusa.com | 129 | 129 | IMAGE_REPLACEMENT_REQUIRED |
| shocksurplus.com | 30 | 30 | SOURCE_UNVERIFIED |
| nittotire.com | 20 | 20 | IMAGE_REPLACEMENT_REQUIRED |
| mudify.com | 16 | 16 | IMAGE_REPLACEMENT_REQUIRED |
| sbfilters.com | 16 | 16 | IMAGE_REPLACEMENT_REQUIRED |
| addictivedesertdesigns.com | 1 | 6 | SOURCE_UNVERIFIED |
| toyota.com | 5 | 6 | IMAGE_REPLACEMENT_REQUIRED |
| limitplus1.com | 1 | 4 | SOURCE_UNVERIFIED |
| xclutchusa.com | 1 | 1 | SOURCE_UNVERIFIED |
| exedy-racing-shop.com | 1 | 1 | SOURCE_UNVERIFIED |
| us.bddiesel.com | 1 | 1 | SOURCE_UNVERIFIED |
| urotuning.com | 1 | 1 | SOURCE_UNVERIFIED |

## Evidence (read 2026-11-23)
- **Toyota** (epc-images.toyota.com, toyota.com, the Toyota accessory image host), https://www.toyota.com/support/legal-terms:
  - "These Sites are for your personal, non-commercial use. Any other use of the Sites requires the prior written consent
    of Toyota."
  - The site's Content includes "pictures, ... digital images ... photographs".
  - Toyota's global download agreement limits downloads to editorial or personal non-commercial use.
- **Nitto**, https://www.nittotire.com/terms: "No Content from the Services may be copied, reproduced, republished,
  performed, displayed, downloaded, posted, transmitted, or distributed in any way without written permission of the
  rights owner" (personal, non-commercial home use excepted).
- **ARB / Old Man Emu** (store.arbusa.com), https://arbusa.com/arb-dealer-hub:
  - ARB's image library is offered to dealers "to use across your social media, website, emails, and in-store
    materials".
  - DrivoraParts is not an ARB USA dealer on record.
  - The photos in use came from ARB's retail store, not from the dealer hub.
- **S&B Filters**, https://sbfilters.com/pages/dealertools:
  - "Download Product Data, Images And Logos ... Shopify Export with Fitment Data and Images", offered on a dealer page.
  - No licence text is published, and DrivoraParts is not an S&B dealer on record.
- **Mudify**, https://mudify.com/policies/terms-of-service: "You must not: Republish material from Mudify ... Reproduce,
  duplicate or copy material from Mudify".
- **UroTuning** (VTT turbo photo), https://www.urotuning.com/policies/terms-of-service: "the reproduction, distribution,
  display or transmission of the content of this site is strictly prohibited".
- **ShockSurplus**: no terms page could be found. The photos are the brands' own (ICON, Fabtech, Bilstein, King, Eibach,
  Dobinsons, Camburg), with no brand permission on record.
- **Addictive Desert Designs, LIMIT+1, XClutch, Exedy shop, BD Diesel**: no licence or permission on record.
- **35 listings** have no source record, and 3 of them show a placeholder.
- **SEMA Data** (https://www.semadata.org/faq): product data "is accessible only by resellers that are approved by the
  product data owner (brands and manufacturers)". This is the licensed route for aftermarket brands. It needs a
  DrivoraParts reseller account and each brand's approval, and the image rights still depend on each brand's terms.
- **Licensed replacements searched**: Wikimedia Commons / Openverse (CC licences, on the allowlist). No photo of an exact
  part number was found. A generic photo of the same engine or tire model does not depict the exact product, so none was
  used.

## Blockers (need an external authorization this session cannot obtain)
1. **Sending permission requests.** This session has no business email account, and creating accounts is outside its
   authority. Ready-to-send requests are in `permission-requests.md`, one per rights holder.
2. **Dealer image programs** (ARB dealer hub, S&B Dealer Tools, Nitto dealer resources): DrivoraParts needs dealer
   accounts.
3. **SEMA Data**: a reseller account, plus approval from each brand.
4. **Toyota**: written consent from Toyota Motor North America, or Toyota imagery supplied under a dealer or distributor
   agreement.

## How a listing comes back
Record the licence or written authorization in `lib/inventory/data/image-rights-registry.json`:
- either set the source policy's status, with `evidence` (URL or document plus the exact wording);
- or add image entries with `manual: true`, status VERIFIED_LICENSED or VERIFIED_AUTHORIZED, and evidence.

Then run `node scripts/audit-toyota-catalog.mjs --write && npm run catalog:snapshot`. The check
`scripts/check-image-rights.mjs` (run on every build) refuses any published image without verified permission and
evidence.
