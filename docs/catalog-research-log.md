# Catalog research log

Every package-contents entry that was researched from an outside source is recorded here: the listings it applies to, the source, the date it was checked, what was deliberately left out, and what is still open. Entries live in `lib/inventory/package-contents.ts`; each carries its `sources` so the page shows where the facts came from.

Rules used: manufacturer pages are the primary source; retailer pages are only used to cross-check. A listing is only updated when the source's part number or exact variant matches the listing. Where sources disagree, the disputed detail is left out and noted. Page text was read through a summarizing fetch tool and spot-checked against a second search result; re-verify before relying on any single figure.

## BD Diesel / D&J Heavy Hauler Ready Run engines (checked 2026-10-09)

| Listing | Part | Source |
|---|---|---|
| #3943 | DJPLB100102, 2004-2005 5.9L Cummins | us.bddiesel.com `heavy-hauler-ready-run-engine-dodge-ram-2500-3500-5-9l-cummins-2004-2005` |
| #3944 | DJPLB100101, 2006-2007 5.9L Cummins | `...-5-9l-cummins-2006-2007` |
| #3945 | DJPLB100100, 2007-2012 6.7L Cummins | `...-6-7l-cummins-2007-2012` |
| #3946 | DJPLB100098, 2013-2018 6.7L Cummins | `...-6-7l-cummins-2013-2018` |

Part numbers on each page matched the listing. Variants differ (heads, turbocharger, injectors) and are written out per listing.

Left out on purpose:
- Injector power rating on #3943 and #3944: the manufacturer page says up to 15 HP, a retailer says 30 HP. The manufacturer figure is used where the page states it; #3946's own page says 30 HP.
- Valve cover: each page's description says a new valve cover completes the package, but the component list does not include one. Not claimed. **Open: confirm with BD whether a valve cover ships.**
- Core deposit ($4,200 or $4,700 refundable) and warranty (24 months or 100,000 miles, parts): stated on the pages, not added to the listings because core charge and warranty are handled by the existing core-charge and warranty fields and policies. **Open: reconcile the listings' core charge and warranty fields with the manufacturer's figures.**
- Not for sale on licensed California vehicles (manufacturer wording): added to vehicle requirements.

## ATS Diesel Allison conversions (checked 2026-10-09)

Listings #3177, #3178, #3179, #3180 (Stage 3, 4, 5, 5; part numbers 319-932-2356, 319-943-2392, 319-953-2464, 319-955-2464).

Source: atsdiesel.com "Full Allison Conversion Kit, 2WD Ram Cummins 6.7L 2007.5-2019".

The page does **not** show these part numbers, lists the package contents generally under "Specific Parts Vary Depending On Year And Model", and describes Stages 1-4 only. So the general package list is attached to all four **with that qualifier stated on the page**, Stage 3 and 4 builds use the manufacturer's stage table, and Stage 5 is marked as not itemized. **Open: ask ATS for per-SKU contents for the 319-9xx numbers, especially the 4WD kit's transfer-case items.**

## Not researched yet

Everything else. See `docs/catalog-progress-log.csv` for per-listing status and `docs/supplier-confirmation-worksheet.csv` for the families still needing contents.
