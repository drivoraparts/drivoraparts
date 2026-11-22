# Catalog image audit (2026-11-22)

Branch `claude/image-audit`. The PR is open for review and is **not merged or deployed**.
The under-$200 removal was a separate change, already approved and live (#128).

## Method
1. **Data check.** I read every listed product's `thumbnail`, `image` and `images` fields (399
   products, 796 image references). I checked that each local file exists and isn't empty, and
   hashed every file to find byte-identical images shared between different products.
2. **Live check.** Every image URL of every listed product on drivoraparts.com returned HTTP 200
   with an image content type, measured before the $200 cut-off (996 images, 524 products).
   Rendered product cards were also checked in a browser: 522 cards on 2026-11-21 and 637 after the
   cut-off. No card had a broken or missing image beyond the placeholders listed below.
3. **Visual check.** I reviewed each product's lead photo by eye on labelled contact sheets (all
   399), plus the full galleries of every shared-image group and every genuine Toyota listing
   flagged below.

## Results

| # | Measure | Count |
|---|---|---|
| 1 | Products scanned (listed) | 399 |
| 2 | Products under $200 removed (#128, live) | 125 |
| 3 | Products with no image or empty image fields | 0 |
| 4 | Products with broken image URLs or missing files | 0 |
| 5 | Products showing a placeholder graphic | 6 |
| 6 | Products with wrong images (another product's photos) | 22 |
| 6b | Genuine Toyota listings with non-product images (label card, text graphic, fragment) | 5 |
| 6c | Products whose photos carry a third-party retailer watermark | 7 (2 also in row 6) |
| 7 | Genuine images newly found | 0 |
| 8 | Images newly downloaded | 0 (the fixes reuse the existing genuine Toyota photos) |
| 9 | Products repaired | 5 (4412, 4413, 4414, 4427, 4438) |
| 10 | Products unresolved | 33 (6 placeholder + 22 wrong image + 5 watermark-only) |
| 11 | Products remaining in the catalog | 399 |
| 12 | Products with their own correct, working photo | 371 of 399 (93.0%); 366 (91.7%) excluding watermarked |

Full per-product list: `image-audit-inventory.csv`.

## Repaired (this branch)
These are image overrides in `scripts/import-toyota-genuine-oem.py`, so they survive re-imports.
No new downloads were needed.

| ID | Part no. | Fix |
|---|---|---|
| 4412 | 16360-F0070 | Leads with the fan assembly; the close-up fragment is dropped |
| 4413 | 16360-F0100 | Keeps only the fan assembly photo; the label card and the "PP-GF25" text graphic are dropped |
| 4414 | 16360-F0150 | The "PP-GF25" text graphic is dropped |
| 4427 | 44250-0C160 | Leads with the rack; the label close-up moves to second |
| 4438 | 81150-08430 | The third, non-headlamp image is dropped |

The five unreferenced image files were removed from `public/product-media/toyota-genuine/`.

## Unresolved, and why

**Placeholders: 1946, 1952, 1953, 1954, 1962, 1963 (Toyota transmissions).** I found no photo of
the exact new part. Sources checked:
- the Toyota catalog image host, for the part numbers and their superseded numbers;
- toyota.com;
- Toyota's parts site, which has the product pages but no image;
- dealer sites (Olathe, LexusPartsNow, oempartsonline), which refuse automated requests with 403;
- other sources, which show only used or remanufactured units, not acceptable for a genuine new
  listing.

**Wrong images (22).** These are byte-identical copies of another product's photos. Each listing
has no manufacturer part number, and its name covers several manufacturer variants, so an exact
photo can't be confirmed. The manufacturer SKU from the supplier or owner fixes each one.

| Listings showing the wrong photos | The photos actually show |
|---|---|
| 1996 ADD, 2003 DV8, 2006 Fab Fours, 2012 Rough Country (Tacoma), 2023 Rocket Bunny (GR86) | Ironman Raid bull bar on a Hilux (correct for 1808) |
| 1993 TJM Outback Prado 150, 2021 Liberty Walk Supra | ARB Summit bull bar (correct for 1804) |
| 2015 Duraflex GT Concept Supra | ARB Summit bull bar Hilux (correct for 1800) |
| 1987 ARB Summit LC300, 1992 TJM Outback LC300 | the 1812 AFN LC300 photos |
| 1837 ARB BASE LC300, 1842 Front Runner LC300 | the 1832 Rhino-Rack photos |
| 1859 Bilstein 6112 Tacoma, 1861 Bilstein B8 8100 4Runner | the 1862 Bilstein B6 Hilux kit |
| 1870 Fox LC300 | the 1866 Fox Tacoma kit |
| 1819, 1825, 1827 snorkels (Prado / Hilux) | the 1815 Safari ARMAX snorkel |
| 1904 Anzo Hilux, 1909 Spyder Hilux | the Tacoma headlights of 1908 / 1911 |
| 1833 Rhino-Rack Prado 150 | the 1830 Hilux platform |
| 1851 OME BP-51 LC300 | the 1845 Hilux kit |

**Retailer watermarks (7).**
- "MORE 4x4" on 1818, 1832, 1835, 1837, 1840 and 1842.
- "LIMIT+1" on 1961, the photos added 2026-11-21 on your instruction. That was the only source
  showing the exact part number.

Also noted, not changed: Toyota's catalog host serves the same photo for some left/right or
sibling part numbers (4432/4438 headlamps; the second image of 4442/4443/4462 tail lamps). These
are Toyota's own photos for those part numbers.

## Needed to finish
Manufacturer SKUs for the 22 wrong-image listings. With a SKU, I can download the manufacturer's
own photo for that exact product. Supplier photos would also work for the 6 transmissions and as
clean replacements for the 7 watermarked listings.
