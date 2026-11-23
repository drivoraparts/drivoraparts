# 120-product Toyota expansion: scoreboard and checkpoint

This file is updated after every batch. It is the resume point if a session stops.

## Scoreboard (qualifying LIVE products)
Count rules: live on drivoraparts.com, US-market Toyota application, at least $200, product-specific photo, documented
prices, no duplicates.

| Category | Target | Qualifying live | Remaining | Live IDs |
|---|---|---|---|---|
| Tires | 20 | 20 | 0 | 5001-5020 |
| Transmissions | 20 | 6 | 14 | 4489, 4490, 4491, 4492, 4496, 4497 |
| Steering | 20 | 9 | 11 | 4422, 4425, 4426, 4427, 4430, 4471, 4493, 4494, 4495 |
| Turbochargers | 20 | 7 | 13 | 4445, 4488, 5101, 5102, 5103, 5104, 5105 |
| Engines | 20 | 4 (+3 in batch 26) | 16 (13 after batch 26) | 5106-5109 (+5110-5112 pending live check) |
| Seats | 20 | 0 | 20 | none |
| **Total** | 120 | **46** (49 after batch 26) | **74** (71) | |

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
| 26 | (this PR) | ATK engines 853A, 869B, 847E (5110-5112) | pending |

## Sources: what works and what is blocked
- **Toyota photo host (epc-images.toyota.com):** good for racks, columns and some reman transaxles.
  - No photo exists for most -84 reman numbers or for the GR Corolla, GR Supra and 2.4T turbos.
  - Engine assemblies (19000-xxxxx) and seats (71100/71200) have almost no photos.
- **Prices:** come from search snippets of US Toyota dealer stores and ToyotaPartsDeal. Direct requests to dealer stores
  return 403, and are not retried or worked around.
- **GReddy (greddy.com):** reachable, with manufacturer studio photos and US retail prices from Titan, DriftHQ, Vivid,
  MVP and JM.
- **LIMIT+1 (limitplus1.com):** reachable product data. Sells HKS, Forced Performance and ARTEC turbo products for GR86, GR Corolla and Supra. ARTEC photos carry a logo overlay.
- **Pure Turbos (pureturbos.com):** reachable, but its photos carry logo and text overlays.
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
