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
