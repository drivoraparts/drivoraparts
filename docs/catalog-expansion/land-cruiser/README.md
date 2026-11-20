# Land Cruiser and Prado high-value parts: research batch 1 (2026-11-19)

Ledger: `land-cruiser-ledger.csv` (every candidate, its US retail references with URLs,
fitment, demand evidence, break-even economics, image and supplier status).
Nothing was imported, merged or deployed.

## Market scope

| Generation | Sold in the US? | In scope for DrivoraParts |
|---|---|---|
| Land Cruiser 80 (FJ80/FZJ80) | Yes, 1991-1997 | Yes |
| Land Cruiser 100 | Yes, 1998-2007 | Yes |
| Land Cruiser 200 | Yes, 2008-2021 | Yes |
| Land Cruiser 250 / Prado 250 | Yes, as the 2024+ "Land Cruiser" | Yes, as Land Cruiser 2024+ |
| Land Cruiser 300 | No (Lexus LX600 is the US equivalent) | No |
| Prado 120 / Prado 150 | No (Lexus GX470 / GX460 are the US equivalents) | No |

The store ships to the US only and the catalog validator accepts US-market Toyota models only.
US dealer catalogs do not list Prado 120/150 or Land Cruiser 300 fitment, so their fitment
cannot be verified to our standard. Many of their parts are shared with Lexus GX and 4Runner (for
example, transfer case 36100-6D401 also appears for GX460), but listing Lexus or non-US models
would need your decision to widen the brand and market rules.

## Problems researched and the parts they create demand for

| Generation | Recurring expensive problem | Parts customers need | Qualifies at $500+? |
|---|---|---|---|
| LC 80 | Head gasket (1FZ-FE, early years); radiator tank failures; front axle knuckle/birfield wear; steering box wear and frame cracking at the box | Head gasket set (cheap), radiator ($328-$397), birfield/knuckle parts, steering gear box | Only the steering gear box (44110-60211) |
| LC 100 | AHC (Active Height Control) hydraulic failures; brake booster pump/accumulator (C1256); timing belt and water pump service; radiator cracking | AHC accumulators and pump, brake booster with master cylinder, radiator ($482) | AHC parts and the brake booster assembly |
| LC 200 | Radiator cracking at 80-100k miles; water pump leaks; brake booster pump; secondary air injection pump and valves; valley plate and timing cover leaks (labour-heavy) | Radiator ($333), water pump, brake booster pump, SAI pump ($469), A/C compressor | Brake booster pump, A/C compressor, transfer case |
| LC 250 | Too new for a failure pattern; collision and damage replacement | Headlamps, camera mirrors | Headlamps and mirrors |
| LC 300 / Prado | V35A main-bearing debris recall (engine replacement); 1GD DPF and injector issues | Not US-market | n/a |

## Classification

| Priority | Part no. | Product | Fits | US prices (lowest) | Break-even delivered cost |
|---|---|---|---|---|---|
| HIGH | 47050-60043 | Brake booster assembly with master cylinder | LC 100, 2003-2007, 4.7L | 4 ($1,339.76) | $1,262.95 (62.9% MSRP) |
| MEDIUM | 88320-6A320 | A/C compressor | LC 200, 2008-2020, 5.7L | 5 ($616.48) | $536.47 (58.3%) |
| MEDIUM | 36100-60B02 | Transfer case | LC 200, 2011-2021, 5.7L | 5 ($2,765.10) | $2,599.97 (71.1%) |
| MEDIUM | 87940-6A570 | Mirror, left, with camera | LC 250, 2024-2025 | 3 ($1,047.92) | $912.24 (59.3%) |
| RESEARCH REQUIRED | 47070-60060 | Brake booster pump | LC 200 (sellers conflict on years) | 3 ($701.65) | $610.65 (67.0%) |
| RESEARCH REQUIRED | 49151-60010 | AHC rear accumulator | LC 100, 2005/06-2007 | 2 ($856.88) | $745.86 (58.3%) |
| RESEARCH REQUIRED | 48910-60033 | AHC pump motor | not stated on listing | 1 ($2,886.69) | $2,658.59 (73.1%) |
| RESEARCH REQUIRED | 81185-60S60 | Headlamp, left | LC 250, 2024-2025 | 2 ($1,214.33) | $1,153.70 (63.4%) |
| RESEARCH REQUIRED | 44110-60211 | Steering gear box | LC 80, 1992-1997 | 1 ($1,676.68) | $1,556.42 (62.2%) |

Rejected: radiators for all three older generations, the 200-series secondary air pump, the 2021 A/C
compressor and the LC 250 tail lamp (all under $500), an LC 250 "HV battery" listing priced at
$166-$189 (misleading), and all Prado 120/150 and Land Cruiser 300 parts (not US-market).

Break-even uses today's pricing (5% under the cheapest dealer, 5% checkout discount, PayPal fee,
the store's shipping charge). Gross profit and margin cannot be calculated: no supplier cost exists.

## Why nothing was imported

Every HIGH and MEDIUM product passes on part number, fitment, US price and the $500 floor, but fails
two import requirements:
1. **Genuine product photography.** None of these part numbers has a Toyota catalog photo (checked
   on Toyota's image host). Dealer and retailer photos are not licensed for reuse. The listings can go
   in as soon as a supplier grants image rights (asked for in the supplier letters).
2. **Profitability.** Under your rule only Stage 3 products (confirmed supplier, cost and positive
   expected profit) are commercially ready. These are Stage 1.

When either a licensed image source or a supplier cost arrives, the four HIGH/MEDIUM records are
ready to be built as a batch with the existing importer (stable IDs, existing categories).

---

# Phase 2: Land Cruiser, Prado and Lexus shared parts (2026-11-19)

Batch 7 (`scripts/build-toyota-expansion-batch-7.py`, `docs/catalog-expansion/toyota-expansion-batch-7.json`)
is imported on the working branch only: IDs 4471-4475. **Not merged or deployed.**

## Photo discovery correction

Toyota's image host serves part photos at four paths. The batch 6+ photo probe checked two, and the
fetch script three, so some parts were wrongly recorded as having "no Toyota photo". The fetch script
and importer now also read `img/<PN no dash>/<PN>_<n>.webp` (each image keeps its exact source URL in
`image-provenance.json`). A re-check found photos for 41 part numbers previously rejected or held for
"no photo", including 47201-33470, 42611-08160, 42611-0R260, 42611-AQ040, 87910-04170,
G9040-42010, 87910-08230, 48910-60012, 47050-60010 and 36100-0C020. Those earlier rejections are
void; the parts return to review on their other evidence.

## Imported (batch 7, on branch)

| ID | Part no. | Product | Toyota fitment (dealer catalogs) | US prices (lowest of 3+) | Price | Priority |
|---|---|---|---|---|---|---|
| 4471 | 44200-60170 | Power steering rack | Land Cruiser 2008-2021 5.7L | Olathe $728.28, Longo $730.75, ToyotaPartsDeal $749.82 (also AutoPartsPrime $737.13, Lakeland $758.05) | $691.89 | MEDIUM |
| 4472 | 48007-60023 | KDSS front hydraulic cylinder | 4Runner 2010-2024 4WD with KDSS | Olathe $1,805.62, Lakeland $1,879.42, Longo $2,138.65 | $1,715.39 | MEDIUM |
| 4473 | 48910-60021 | Rear air suspension compressor | 4Runner 2003-2009 with rear air suspension | Olathe $1,710.50, ToyotaPartsDeal $1,799.43, Lakeland $1,873.74, Longo $2,133.11 | $1,624.99 | MEDIUM |
| 4474 | 49141-60010 | AHC accumulator, front | Land Cruiser 2006-2007 with AHC | Lakeland $844.70, ToyotaPartsDeal $853.31, Longo $990.12 | $802.49 | MEDIUM |
| 4475 | 49151-60010 | AHC accumulator, rear | Land Cruiser 2006-2007 with AHC | ToyotaPartsDeal $856.88, Lakeland $892.19, Longo Lexus $907.64 | $814.09 | MEDIUM |

All five: genuine Toyota, new; Toyota catalog photos checked by eye; every fitment VIN-dependent with
its restriction; price 5% under the lowest US price (today's rule); all over $500.

## Lexus shared fitment (recorded here only)

The validator accepts US-market Toyota models only, so Lexus fitment is not in the catalog records.
Confirmed shared numbers (two or more independent sources, including a Lexus dealer or Toyota/Lexus
parts site):

| Part no. | Toyota | Lexus | Evidence |
|---|---|---|---|
| 36100-60B02 transfer case | Land Cruiser 2011-2021 | LX570 (sellers state 2010/2011-2021) | LexusPartsNow, Lexus dealer listing (~$3,078) |
| 88320-6A320 A/C compressor | Land Cruiser 2008-2020 5.7L | LX570 5.7L | LexusPartsNow (2017, 2020 LX570 pages) |
| 47050-60043 brake booster with master cylinder | Land Cruiser 2003-2007 | LX470 2002/2003-2007 | LexusPartsNow, Lexus of Pembroke Pines |
| 49151-60010 rear AHC accumulator | Land Cruiser 2006-2007 | LX470 (Longo Lexus 2005 LX470 page) | Longo Lexus |
| 49141-60010 front AHC accumulator | Land Cruiser 2006-2007 | LX470 (aftermarket and retailer sources only) | not confirmed by a Lexus dealer |
| 48910-60021 air suspension compressor | 4Runner 2003-2009 | GX470 2003-2009 | Arnott cross-reference, GX470 owner forums: not confirmed by a Lexus dealer |
| 48007-60023 KDSS cylinder | 4Runner 2010-2024 | GX460 not confirmed | n/a |

Not interchangeable: LX570 AHC accumulators are 49141-60020 / 49151-60020 (different from LX470).
GX550, LX600 and Land Cruiser 300 (V35A) parts were not researched for import: no US Toyota model
shares them except the Tundra/Sequoia V35A family already covered by 17201-F4011.

## Market comparison (new genuine vs alternatives)

| Part | Our genuine price | Alternatives seen |
|---|---|---|
| 48910-60021 compressor | $1,624.99 | Arnott P-3192 aftermarket $1,140-$1,318 (lifetime warranty) |
| AHC accumulators (each) | $802-$814 | Aftermarket sphere sets ~$800 (four pieces), used genuine sets $550-$650 |
| 36100-6D401 4Runner transfer case | n/a (not imported) | reman ~$1,365, used $835-$1,543 vs genuine $2,796 |

Genuine new wins where buyers want OE parts (dealer-installed repairs, recent vehicles); price-led
buyers choose aftermarket or used. LKQ's used and reman powertrain should be priced once its partner
file is available.

## Economics (verified prices; costs not established)

Break-even = what we keep after the 5% checkout discount, PayPal 3.49% + $0.49 and the $199
multibox charge (these five are classed multibox until the shipping fix is approved). Real delivered
cost (part + outbound freight) must be below this to profit.

| Part | Price | Break-even delivered cost (today) | % of MSRP | At "list at dealer price" (S2) |
|---|---|---|---|---|
| 44200-60170 | $691.89 | $825.91 | 76.0% | $859.29 (79.1%) |
| 48007-60023 | $1,715.39 | $1,764.26 | 65.5% | $1,847.04 (68.5%) |
| 48910-60021 | $1,624.99 | $1,681.41 | 62.6% | $1,759.82 (65.5%) |
| 49141-60010 | $802.49 | $927.31 | 76.6% | $966.03 (79.8%) |
| 49151-60010 | $814.09 | $937.92 | 73.3% | $977.19 (76.4%) |

Supplier cost, gross profit and margin: **not established** (no wholesale account yet). Shipping: all
five fit a single carton; the $199 charge exceeds typical parcel cost, but no carrier quote exists.

## Still research required

| Part no. | Product | What is missing |
|---|---|---|
| 48910-60012 | AHC pump & motor (LC 100 / LX470) | photo now found; only 2 US prices (ToyotaPartsDeal $3,098.02, Modern $2,937.83); fitment years conflict (2005-2007 vs 1998-2007) |
| 47050-60010 | Brake booster with master cylinder (LC 100) | photo now found; 1 price ($1,333.67); fitment years not shown |
| 47050-60043 | Brake booster with master cylinder (LC 100 / LX470) | no Toyota photo; 4 prices; needs supplier image |
| 88320-6A320 | A/C compressor (LC 200 / LX570) | no Toyota photo |
| 36100-60B02 | Transfer case (LC 200 / LX570) | no Toyota photo |
| 87940-6A570 | Camera mirror (LC 250) | no Toyota photo |
| 47070-60060 / -60010 | Brake booster pumps | fitment conflicts; no photo for 60010 (diagrams only) |
| 81185-60S60 / 81145-60S60 | LC 250 headlamps | 2 prices; no photo |
| 44110-60211 | LC 80 steering gear box | 1 price; discontinued per one dealer |
| 41110-60B81 / 41110-60A11 | LC 200 differential carriers | ratio-specific; 1 seller; no photo |
| 44050-35070 | 4Runner 2016-2024 ABS actuator | booster-type conflict between dealers; no photo |

## Phase 3 (2026-11-19)

Supplier sourcing, batch 7 profitability, shipping, discounts and photo corrections: see
`../phase3/README.md`. Added 47050-60041 (LC 1999-2001 booster, LX470-shared) to the ledger as
RESEARCH REQUIRED (two US prices). No batch 8: no new part met every requirement.
