# 120-product Toyota expansion: scoreboard and checkpoint

This file is updated after every batch. It is the resume point if a session stops.

## Scoreboard (qualifying LIVE products)
Count rules: live on drivoraparts.com, US-market Toyota application, at least $200, product-specific photo, documented
prices, no duplicates. `TRACKER.md` (generated from `pipeline.json`) is the per-product source of truth.

| Category | Target | Qualifying live | Remaining | Live IDs |
|---|---|---|---|---|
| Tires | 20 | 20 | 0 | 5001-5020 |
| Transmissions | 20 | 6 | 14 | 4489-4492, 4496, 4497 |
| Steering | 20 | 18 (19 after batch 36) | 2 (1) | 4422, 4425-4427, 4430, 4471, 4493-4495, 4498-4506 (+4507) |
| Turbochargers | 20 | 11 | 9 | 4445, 4488, 5101-5105, 5121-5124 |
| Engines | 20 | 15 | 5 | 5106-5120 |
| Seats | 20 | 0 (1 after batch 36) | 20 (19) | (+4508) |
| **Total** | 120 | **70** (72 after batch 36) | **50** (48) | |

Not counted: 1946, 1952 and 1954 (placeholder photos), 1961 (watermark), 88 and 89 (no photo source), 36 and 2115
(Lexus-only engine), transfer cases 4476 and 4477.

## Batch log
| Batch | PR | Products | Live check |
|---|---|---|---|
| 20 | #145 | 4494 Sienna EPS rack; 5101 VTT B58 GC | done |
| 21 | #146 | 4495 Sienna power column | done |
| 22 | #147 | 4496 RAV4 and 4497 Highlander reman transaxles | done |
| 23 | #151 | 5102 GReddy 11510033, 5103 GReddy 11510030 (Supra JZA80 turbo kits) | done |
| 24 | #152 | 5104 HKS GR86 GTIII-RS kit; 5105 Forced Performance B58 super core | done |
| 25 | #153 | ATK remanufactured engines 858B, 858, 858A, 865A (5106-5109) | done |
| 26 | #154 | ATK engines 853A, 869B, 847E (5110-5112) | done |
| 27 | #155 | ATK engines 853, 848, 857, 833, 851 (5113-5117) | done |
| 28 | #156 | ATK engines 869A (RAV4), 860 (Sienna AWD) (5118, 5119) | done |
| 29 | #157 | Toyota racks 44250-04041 (Tacoma 2016-2023), 44250-35042 (Tacoma 1995-2004 / 4Runner 1996-2002) (4498, 4499) | done |
| 30 | #158 | Toyota rack 44250-0C121 (Sequoia 2008-2022), pump 44310-0C090 (Tundra 2007-2021) (4500, 4501) | done |
| 31 | #159 | ATK engine 862 (Tacoma 2005-2014 2TR-FE) (5120) | done |
| 32 | #160 | Dynamic Autowerx Flow Max, Ultra Flow 6466 (5121, 5122) | done |
| 33 | #161 | Dynamic Autowerx New Gen 6769 (5123) | done |
| 34 | #162 | Dynamic Autowerx 6969 (5124) | done |
| 35 | #163 | Toyota racks 44250-0C200, 44250-0E260, 45510-0T011; columns 45250-06410, 45250-0C300 (4502-4506) | done |
| 36 | (this PR) | Toyota rack 44250-0E220 (4507); first seat 71200-35A81-B0 (4508) | pending |

## Sources: what works and what is blocked
- **Toyota photo host (epc-images.toyota.com):** good for racks, columns and some reman transaxles.
  - No photo exists for most -84 reman numbers or for the GR Corolla, GR Supra and 2.4T turbos.
  - Engine assemblies (19000-xxxxx) and seats (71100/71200) have almost no photos.
- **Prices:** come from search snippets of US Toyota dealer stores and ToyotaPartsDeal. Direct requests to dealer stores
  return 403, and are not retried or worked around.
- **GReddy (greddy.com):** reachable, with manufacturer studio photos and US retail prices from Titan, DriftHQ, Vivid,
  MVP and JM.
- **LIMIT+1 (limitplus1.com):** reachable product data. Sells HKS, Forced Performance and ARTEC turbo products for GR86, GR Corolla and Supra. ARTEC photos carry a logo overlay.
- **Pure Turbos (pureturbos.com):** reachable (Shopify `products.json`). The Pure650, 800 and 900 (NEW) are complete new turbos for the 2020-2026 GR Supra, but every photo carries the Pure logo, so they are IMAGE PENDING. The core-exchange units (Pure550 for GR Corolla, Pure650 and 800) need the buyer's own turbo.
- **ToyotaPartsNow / ToyotaPartsDeal:** product pages are reachable at `/oem/toyota~x~<PN>` (redirects) and give price, MSRP and trim-level fitment. ToyotaPartsNow returns 403 after a burst of requests: space requests and do not retry.
- **atkengines.com:** no response. **prpseats.com:** 403.

## Next actions (in order)
1. Turbos:
   - other GReddy Toyota kits;
   - GR86 and FR-S (FA20/FA24) turbo kits from US makers, for example GReddy, Full-Race and EcuTek partners, if they
     have studio photos;
   - 2JZ-GTE kits from Precision and Garrett partners with manufacturer photos;
   - 3.4 V35A and 2.4 T24A upgrade units.
2. Engines:
   - ATK long blocks: find named prices (Summit, JEGS, Engine Factory, Amazon) and photos;
   - Toyota Genuine Remanufactured engines (19000-xxxxx-84);
   - Jasper and other US remanufacturers with Toyota applications.
3. Seats: genuine Toyota complete seat assemblies with Toyota photos (71100/71200/71400 families for 2016+ Tacoma,
   Tundra, 4Runner), and Toyota-specific aftermarket seats only where the seat itself is vehicle-specific.
4. Transmissions: find 2 more named prices for 30510-48120-84 and 30510-48011-84, and photos for 30510-48260-84 / 48250-84 /
   48601-84 / 48720-84.
5. Steering: new photo sweeps of 44250 / 45510 / 45250 for 2014+ Highlander, RAV4, Camry and Tacoma, with prices.

## Round log (2026-11-23, after batch 24)
- **Turbos.** LIMIT+1's turbo range is used up. The ARTEC Sport 400 is IMAGE PENDING because every photo carries a logo overlay.
  - **AMS Alpha 6 / Alpha 8 (GR Supra 2020):** REJECTED. AMS sells them only for race-only vehicles, after the buyer
    completes an AMS race waiver form, which a reseller cannot reproduce.
  - **Not yet checked:** ETS 1993-1998 Supra kit (Induction Performance $4,795-$7,545); Precision 6266 2JZ kits (Titan
    $4,999, FTSpeed $5,008); SupraStore ProSeries.
- **Engines.**
  - **ATK 858B (4.0 1GR-FE, Tacoma/Tundra 2006-2015):** two ATK prices + $545 core (JEGS $5,891.99, AutoZone $6,102.99).
    The VEGE (Summit $5,935.99) and Power Torque (O'Reilly $6,225.99) versions are other brands. No photo source:
    atkengines.com does not respond.
  - **Powertrain Products** (powertrainproducts.net, now on the allowlist): its own photos and prices, for example
    1GR-FE 40759 at $6,049. RESEARCH: vehicle fitment is on a script-loaded tab, the core terms and contents are not
    stated, and it is the only seller.
  - **Other remanufacturer prices for 1GR-FE:** JDM Engine Zone $4,199, AAA Engine $3,950, Advance Auto (long block)
    $5,811.99.
- **Seats:** no qualifying candidate yet.

## Engine source found (batch 25)
ATK North America remanufactured engines are sold under the same ATK number by JEGS, AutoZone ("NuTech by ATK"), Powertrain
Company and ATK Sales, each with a stated core (usually $545). Powertrain Products (powertrainproducts.net) sells them with
studio photos, and its WooCommerce Store API (`/wp-json/wc/store/v1/products?search=toyota`) lists about 60 priced Toyota
engines with their ATK numbers. Next engines to clear: 853A, 865B, 858C, 862, 861A, 860B, 869B, 848A, 857A, 863A.

## Transmissions: Powertrain Products (checked 2026-11-23)
Powertrain Products has about 80 remanufactured Toyota automatics (A750E/F, A340E/F, U140, U151, U241, U250, A541E), each
titled with the exact application. They are IMAGE PENDING: each photo is a generic shot of the transmission family, shared by
up to 32 listings, and the A340E photos are also used on A340F (4WD) units. Each listing still needs 3 named prices.

## Dead ends (2026-11-23, after batch 30)
- No Toyota photo exists on epc-images for:
  - 19 more remanufactured transmissions (35010-35A60/35A50/3G470/04030/04010/0C170/0C030/35B10/0C270-84;
    30510-33211/33670/52490/0R010/12C10/33620/0E040/48720/0R060/48601-84);
  - seat assemblies 71100-0CF31-E0, 0CF20-B1, 0CF30-B1, 0C740-B5, WB055, 06N71-E0 and 71200-0C740-C5 / 0C360-E5;
  - pumps 44310-04150 and 44310-60542, and rack 44250-0C030.
- atksales.com loads its prices client-side, so ATK Sales prices come from search snippets.
- 858C: the model years for the dual-VVT 1GR are unclear between sellers. 849: two prices. 863: Lexus-only.

## Seats blocker (2026-11-23)
- **Genuine Toyota seat assemblies:** sold by part number by JoeTLC (Tundra, 4Runner, Sequoia; $3,055-$7,228), ToyotaPartsDeal
  and dealer sites. No seller shows a photo of the seat. JoeTLC's listings have no images at all, and Toyota's photo host
  has none for the 71100 / 71200 numbers checked.
- **Complete vehicle-specific aftermarket seats:** none found. Recaro, Sparco and Bride are universal seats with separate
  brackets, which the owner has excluded.
- **Route that would work:** photographs of the actual units from the offline supplier, with the supplier's permission,
  combined with the part-number pricing already found.
