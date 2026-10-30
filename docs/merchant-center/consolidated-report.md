# Merchant Center cleanup: consolidated report

> **Update (later on 2026-10-30):** PR #71 (held-listing noindex fix) and PR #72 (structured-data description) were merged by the owner, and PR #73 (Fleece #2897 wording) was merged on request. Where this report says those branches are pushed but not merged, they now are merged. `gmc_73_master.csv` is the current master list; `tracking-report.csv` is superseded by it.

As of 2026-10-30. Evidence is from the live site, the production build of
`fix-held-noindex`, and the repository. Nothing in this report has been checked
inside Merchant Center itself: I could not sign in, and the 73-product export
(`gmc_73_flagged_products.csv`) is not on this machine. Issue names marked "per
notes" come from the Browser Extension Agent's write-ups.

## 1. Changes already live

| PR | What it did | Checked |
|---|---|---|
| #65 | Fixed freight/multibox rates (US $199, UK $395, AU $279); truck bed retitles | Live |
| #66 | Real photos for truck listing 1523; galleries for 1526 and 1539 reduced to one product | Live |
| #67 | Fixed rates for 13 more countries ($45 parcel, free from $250; $450 freight/multibox) | Live: policy page text checked |
| #68 | Shipping Policy "Last Updated" set to October 30, 2026 | Merged and deployed |
| #69 | Real photos for #1977 (Exedy TH08SDX) and #1980 (ACT SB10-HDSS); part number SB10-HDSS on #1980 | Merged and deployed; photos not re-checked on the live site |
| #70 | Feed descriptions drop the old shipping boilerplate; held listings 1945-1986 out of feeds, sitemap and Product structured data | Live feed: 4,002 rows, 0 containing "Worldwide shipping" |

PRs #69 and #70 were merged through the owner's GitHub account before the
requested review. Nothing was reverted.

## 2. Outstanding Merchant Center issues

All 73 findings are not yet investigated individually. See
`tracking-report.csv` for what is known, with evidence and status. Summary:

- Fixed and live, awaiting a Google re-fetch: boilerplate-only descriptions
  (SPAL fans, NRG hub and about 600 others).
- Confirmed on our side, no fix possible without supplier data: #2042, #154, #1817
  (images), #95 (brand), #52 (title).
- Not yet investigated: the other vehicle-flagged body kits, snorkels and the OME
  kit; 19 of the 20 overlay-image products; the guns, alcohol and extra-text items.
- Held-listing crawl discovery: see section 3.

## 3. Held-listing noindex correction

PR #70 removed Product structured data, sitemap entries and feed rows for the 42
held listings (1945-1986, `stock:false`), but its robots check used the
storefront product, which has no `stock` field, so live #1980 still serves
`index, follow`.

Fix: commit `e9775ad6`, branch `fix-held-noindex` (pushed, not merged). One line in
`app/product/[id]/page.tsx`: test the inventory record instead.

Validation, run against a local `next start` of the production build of that
branch (and compared with the live site):

| Check | Result |
|---|---|
| #1980 robots | `noindex, follow` (live: `index, follow`) |
| #1977 robots | `noindex, follow` |
| All 42 listings 1945-1986 | 42 of 42 `noindex, follow` |
| Neighbours #1944, #1987 | `index, follow`, identical to live |
| In-stock products #52, #1415, #1944, #1987 | `index, follow`; canonical and structured data types identical to live |
| Held pages: Product structured data | None (breadcrumb and organization only) |
| Canonical URLs | Unchanged on every page checked |
| Sitemap | None of the held IDs present |
| `next build` | Passed (exit 0) |

Not changed: #1027 (SPAL fan, in stock) is `noindex` on both live and the new
build, because its page description is only the boilerplate line (existing
behaviour). Two catalog items with `stock:false` outside the held range (#289,
#784) stay indexable, as before.

## 4. Image problems that need supplier evidence

- **#2042 Carryboy S6 canopy.** Only image: a whole truck with a readable plate.
  The listing gives no vehicle or variant; the only vehicle-specific S6 photos
  found are on a UK retailer's site (one set on its dev. subdomain). None
  downloaded.
- **#154 Mustang S550 widebody kit.** First image is a bonnet close-up. No brand
  or part number on the listing.
- **#1817 Safari ARMAX snorkel (79 Series).** First image is a full truck.
  Several ARMAX SKUs fit 79 Series trucks, and the listing names none.
- **BMR and Wilwood overlay images.** Confirmed for #1415 (a part-number caption);
  the full list of 20 IDs is needed.

## 5. Shipping consistency

Checked live for products 1027, 825, 52, 2042, 2607, 1415, 1523: the product page
structured data, the feed price and label, and the checkout quote API agree for
the US, Canada and the UK.

Checkout, without creating orders: `scripts/test-checkout-shipping.mjs`
(branch `checkout-shipping-harness`, uncommitted) calls the real
`/api/checkout` handler with the order service and email modules stubbed and the
network blocked. For 10 cart/country cases, the shipping amount handed to order
creation equals the quote shown in the cart; an unlisted country (Japan) is
recorded as `manual_quote` with 0 shipping. This does not test the browser page,
the payment provider or order emails. Those need a staging environment with
separate test credentials; do not run checkout against production services.

Open item: **#1415** ($1,345 Wilwood kit) is labelled parcel by category. The
repo's own `docs/shipping-classification-review.csv` lists it as "unconfirmed"
(priority 4), as it does for 680 priority-4 rows. No weight was found for part
140-9219-D; a related kit is listed by one retailer as "Oversize 3". Reclassify only
with the supplier's weight and box size.

## 6. Remaining work before the next deployment

1. Merge `fix-held-noindex` after review (one line).
2. Provide the Merchant Center export so every flagged product can be recorded.
3. Supplier answers: part numbers or variants for #2042, #154, #1817; the real
   maker of #95; weight and box size for #1415; engine titles for #52.
4. Held products: stock quantities, plus condition, warranty and location for
   #1974, #1979, #1980; the SDD3250-GK description (#1984) needs checking
   against South Bend's own page.
5. Ask Merchant Center to re-fetch the feed after the above, then recheck the
   products.
