# High-value parts expansion (120-product brief), persistent progress report

Started 2026-11-23. Targets are 20 live products per category. A product counts only once it is
imported, deployed and confirmed live.

## Rules applied
These are the owner's standing instructions:
- **US-only fitment.** Prado 120/150, Land Cruiser 300 and Hilux parts are listed only where the same part
  fits a US model.
- **Price:** $200 minimum; 5% under the lowest attributed US price.
- **Photos:** only a legitimate photo of the exact product.
- **Core charges:** remanufactured units include the $1,000 core charge in the price (owner decision,
  2026-11-23).
- **No workarounds:** sites that refuse automated requests (403, Incapsula) are not bypassed.

## Progress

| Category | Target | Already live before brief | New: verified | New: imported | New: live |
|---|---|---|---|---|---|
| Turbochargers | 20 | 2 (17201-F4011, 17208-F4011) | 1 | 1 | 1 (5101) |
| Engines & engine assemblies | 20 | 0 genuine | 0 | 0 | 0 |
| Transmissions | 20 | 3 Toyota reman (4489-4491) + 1954 | 3 | 3 | 3 (4492, 4496, 4497) |
| Steering | 20 | racks 4425-4427, 4430, 4471; knuckle 4422 | 3 | 3 | 3 (4493-4495) |
| Seats | 20 | 0 | 0 | 0 | 0 |
| Tires | 20 | 0 visible | 20 | 20 | **20 (5001-5020)** |

## Products imported under this brief

| ID | Category | Part no. | Manufacturer | Fits | Lowest US reference | Our price | Image source | Status |
|---|---|---|---|---|---|---|---|---|
| 4492 | Transmission | 35010-04080-84 | Toyota (Genuine Remanufactured) | Tacoma 2013-2015 4.0L V6 | $3,885.12 + $1,000 core | $4,640.89 | Toyota catalog (epc-images.toyota.com) | live |
| 4493 | Steering | 44310-0C080 power steering pump | Toyota | Tundra 2007-2009 | $381.13 | $362.09 | Toyota catalog | live |
| 4494 | Steering | 44250-08080 EPS rack and pinion | Toyota | Sienna 2021-2025 | $650.19 | $617.69 | Toyota catalog | live |
| 4495 | Steering | 45250-08140 power tilt / telescopic column | Toyota | Sienna 2023-2025 | $1,901.58 | $1,806.59 | Toyota catalog (4 photos) | live |
| 4496 | Transmission | 30510-42320-84 (Toyota Genuine Remanufactured) | Toyota | RAV4 2006-2008 2.4L 4WD | $2,572.18 + $1,000 core | $3,393.59 (core included) | Toyota catalog (3 photos) | live |
| 4497 | Transmission | 30510-48150-84 (Toyota Genuine Remanufactured) | Toyota | Highlander 2004-2007 3.3L AWD | $2,509.50 + $1,000 core | $3,334.09 (core included) | Toyota catalog (3 photos) | live |
| 5101 | Turbocharger | VTT-B58-GC-2 (GC, 2-port) | Vargas Turbo Technologies (aftermarket) | 2020 GR Supra 3.0 | $1,858.99 (no core) | $1,766.04 | VTT studio photo on UroTuning's listing | live |
| 5001-5020 | Tires | 20 Nitto tires (codes in the tire table below) | Nitto | factory sizes of the 2027 4Runner, Tacoma, Tundra, Sequoia and Land Cruiser | 3+ US retailer prices each | $223.25-$386.92 per tire | nittotire.com product photo per line | live |

## Research log

**Toyota catalog photo sweep.** 5,246 part numbers were checked across:
- turbos: 17201/17208 for F4, 25, 18, F0, 0A, WAA;
- remanufactured transmissions: 35010-xxxxx-84;
- engine assemblies: 19000 / 11400 for 31, 38, 0P, F4, 25, 75, 0F;
- steering: 44200, 44250 and 44310 for 0C, 04, 35, 34, 60; columns 45250; gears 44110.

A second sweep checked 1,089 classic turbo numbers: 17201/17208-46 (Supra MK4), 74, 88, 42, 73, 17, 0R,
0L, 30, 51.

| Result | Parts | Reason |
|---|---|---|
| Turbos | 17201-F4020 / 17208-F4020 | Photos exist; no US listing. Rejected. |
| Turbos | Classic turbo numbers | No photos. |
| Turbos | GR Corolla 17201-18030, 2.4T 17201-25010 | Prices known; no photos. |
| Engines | 19000 and 11400 families | No photos for any engine or block number swept. |
| Transmissions | 35010-34130-84 | Photo exists; no US price. Held. |
| Steering racks | 44250-0C070 | Superseded by listed 0C160. |
| Steering racks | 44250-0C110 | Superseded by 0C170, which has no photo. |
| Steering racks | 44250-0C180 | Superseded by 0C200. |
| Steering racks | 44250-0C200 | One US price ($1,357.12). Held. |
| Steering racks | 44250-0C210 | No US price. Held. |
| Steering racks | 44250-35080 (FJ Cruiser, $638-$685) | Toyota's photos are a pallet, a drawing and a label. Rejected. |
| Steering columns | 45250-0C300 / 0C350 (about $1,760-$1,970) | Tilt type and years unclear. Held. |

**Aftermarket photo sources.**
- Pure Turbos (GR Supra Pure800): host allowlisted, but the download was blocked by the session's
  automatic safety check. Not bypassed.
- Falken (Incapsula bot protection) and BFGoodrich (403) refuse automated requests.
- toyotires.com: wrong URL (404); not needed after Nitto.
- Turbo makers: CXRacing refuses automated requests (403); platinumracingproducts.com does not respond from
  this session; Kinugawa, Garrett, Mamba, ATP and Full Race have no reachable product page for a US Toyota
  application. **Turbos, engines and seats are blocked by photographs**: Toyota's catalog has none for the
  remaining part numbers, and the aftermarket makers' sites are unreachable or refuse automated downloads.
- nittotire.com: serves official tire photos and full size, load and speed specs per size, with Nitto
  product codes. This is the tire source in use.

## Tires (IDs 5001-5020)

Generated by `scripts/build-toyota-tires.py`. The full price, spec and source record for each tire is in `toyota-tires-evidence.json`.

Every tire is priced per tire, 5% under the lowest attributed US price. The photo is Nitto's own product photo for the line, and the wheel shown is not included.

| ID | Nitto line | Size | Load / speed | Code | Lowest US | Our price | Factory size on (2027, toyota.com) |
|---|---|---|---|---|---|---|---|
| 5001 | Ridge Grappler | LT265/70R18 | 124/121Q LR E | 217480 | $325.00 | $308.75 | 4Runner, Tacoma, Tundra, Sequoia, Land Cruiser |
| 5002 | Ridge Grappler | 265/70R18 | 116T | 218940 | $283.00 | $268.85 | 4Runner, Tacoma, Tundra, Sequoia, Land Cruiser |
| 5003 | Ridge Grappler | LT285/65R18 | 125/122Q LR E | 217110 | $388.00 | $368.60 | Tundra, Sequoia |
| 5004 | Ridge Grappler | LT265/60R20 | 121/118Q LR E | 217460 | $371.00 | $352.45 | Tundra, Sequoia, Land Cruiser |
| 5005 | Ridge Grappler | 265/60R20 | 112T | 218890 | $331.00 | $314.45 | Tundra, Sequoia, Land Cruiser |
| 5006 | Ridge Grappler | LT265/70R17 | 121/118Q LR E | 217100 | $279.00 | $265.05 | Tacoma |
| 5007 | Ridge Grappler | 265/70R17 | 115T | 217940 | $235.00 | $223.25 | Tacoma |
| 5008 | Terra Grappler G3 | LT265/70R18 | 124/121S LR E | 223950 | $278.00 | $264.10 | 4Runner, Tacoma, Tundra, Sequoia, Land Cruiser |
| 5009 | Terra Grappler G3 | 265/70R18 | 116T | 224210 | $263.02 | $249.86 | 4Runner, Tacoma, Tundra, Sequoia, Land Cruiser |
| 5010 | Terra Grappler G3 | LT285/65R18 | 125/122S LR E | 223910 | $343.00 | $325.85 | Tundra, Sequoia |
| 5011 | Terra Grappler G3 | 285/65R18 | 116T | 224580 | $366.30 | $347.98 | Tundra, Sequoia |
| 5012 | Terra Grappler G3 | LT265/60R20 | 121/118S LR E | 223830 | $333.00 | $316.35 | Tundra, Sequoia, Land Cruiser |
| 5013 | Terra Grappler G3 | LT265/70R17 | 123/120S LR E | 223940 | $263.00 | $249.85 | Tacoma |
| 5014 | Recon Grappler A/T | LT285/65R18 | 125/122R LR E | 218590 | $362.00 | $343.90 | Tundra, Sequoia |
| 5015 | Recon Grappler A/T | LT265/60R20 | 121/118S LR E | 218550 | $335.00 | $318.25 | Tundra, Sequoia, Land Cruiser |
| 5016 | Recon Grappler A/T | LT265/70R17 | 123/120S LR E | 218740 | $293.00 | $278.35 | Tacoma |
| 5017 | Trail Grappler M/T | LT285/65R18 | 125/122Q LR E | 205740 | $407.29 | $386.92 | Tundra, Sequoia |
| 5018 | Trail Grappler M/T | LT265/70R17 | 121/118Q LR E | 205860 | $317.00 | $301.15 | Tacoma |
| 5019 | Exo Grappler AWT | LT265/70R17 | 121/118Q LR E | 206870 | $237.00 | $225.15 | Tacoma |
| 5020 | Dura Grappler | LT265/70R17 | 121/118Q LR E | 205630 | $235.00 | $223.25 | Tacoma |

## Round 3 (2026-11-23): owner's sourcing model and the existing workflow

**How the existing catalog was built.** This was checked in `lib/inventory/data/image-provenance.json` and `scripts/import-*.mjs`.
- Photos come from the manufacturer (bddiesel, sbfilters, ARB, Nitto, Toyota) or from an established specialist retailer's listing
  of the exact part (dieselpowerproducts, shocksurplus, mudify), where the image is the manufacturer's catalogue photography.
- Each image is recorded with a usage basis ("RIGHTS NOT INDEPENDENTLY VERIFIED").
- The same standard is applied here, plus the owner's photo rules: no watermarks, no logo or promotional overlays, and the exact product.

**Sources tried this round**

| Source | Result |
|---|---|
| Summit Racing, JEGS, Vivid Racing | 403 to automated requests. Not bypassed. |
| ATK (atkengines.com) | Allowlisted but does not respond. |
| UroTuning, AMS Performance, pureturbos.com, Cruiser Parts | Reachable. |

**Turbochargers: Pure Turbos, read from the maker's own pages (all US-market GR Supra / GR Corolla)**

| Product | Fits | Maker price | Core | US prices found | Status |
|---|---|---|---|---|---|
| Pure800 (NEW) | GR Supra A90/A91 2020-2026, 3.0L B58 Gen 2 | $3,107 | none | Kies $2,995; Vehicle Virals $2,995 | **Prices OK; photo held** |
| Pure900 (NEW) | GR Supra 2020-2026 | $3,626 | none | ORT $3,870; Vehicle Virals $4,001 | **Prices OK; photo held** |
| Pure600 (NEW) | GR Supra 2020-2026 | $1,095 | none | Vehicle Virals $1,095 | Held: 2 prices |
| Pure650 (NEW) | GR Supra 2020-2026 | $2,695 | none | (AUD only) | Held: 1 US price |
| Pure550 / Pure650 / Pure800 (core units) | GR Corolla / GR Supra | $1,995 / $2,000 / $2,594 | refundable, amount not stated | | Held: core deposit unknown, so the core-inclusive price cannot be set |
| TTE570 (TTE10672) / TTE500 (TTE10423) | GR Corolla G16E-GTS | | | UroTuning $4,500.02 / $4,116.81 only | Held: one US price each |

**Image block for these turbos.**
- Every Pure Turbos product photo carries the Pure "P" logo badge, and some carry text overlays ("T51R MOD", "STANDARD").
- UroTuning's TTE photos carry a large retailer watermark.
- AMS's photo is an engine-bay installation shot that does not identify the unit.

Removing logos or watermarks from someone else's photo is not done. These products need a clean photo from the supplier or the
maker (for example on request to Pure Turbos, info@pureturbos.com).

**Leads the owner supplied**

| Lead | Assessment |
|---|---|
| Grieco / Olathe turbo pages | Same Tundra / Sequoia turbos already live. |
| eBay items, Revline used engines | The sellers' own photos of their own units. No reuse basis. |
| usaautopartsdirect 1HD-FTE turbo | Non-US engine, aftermarket. |
| Toyota Parts Now (Land Cruiser steering gear) | 403. |
| Frontier rack 44250-60370; seat frames 71120-60781 / 71110-60581 | No Toyota photo of the part number. Retailer images not verified. |

**Remaining (counted toward the 120)**
- Live under the brief: tires 20/20, transmissions 1, steering 1.
- Short: turbos 20, engines 20, transmissions 19, steering 19, seats 20.
- The binding constraint is clean, reusable photographs of the exact part. Prices and fitment are found for many candidates
  (see the tables above and in the earlier rounds).

## Round 4 (2026-11-23): pipeline with statuses, audit of existing listings, image-source workstream

### Statuses
The machine-readable list is `pipeline.json` in this folder.
- **PUBLISHED:** live and verified.
- **IMAGE PENDING:** identity, US fitment and three or more US prices are verified; a photo with an established reuse basis is still needed.
- **RESEARCH:** incomplete.

### Counts toward the 120
Existing live listings were audited. They count only with a real photo, a price of at least $200 and a US-market Toyota application.

| Category | Target | Published (live) | Image pending | Research | Still to find |
|---|---|---|---|---|---|
| Turbochargers | 20 | 2 (4445, 4488) | 2 (Pure800 NEW, Pure900 NEW) | 4 lines | 12+ |
| Engines | 20 | 0 | 0 | 7 ATK engines (one price each) | 13+ |
| Transmissions | 20 | 4 (4489-4492) | 0 | 1 | 15 |
| Steering | 20 | 7 (4422, 4425-4427, 4430, 4471, 4493) | 0 | 2 | 11 |
| Seats | 20 | 0 | 0 | 0 | 20 |
| Tires | 20 | **20 (5001-5020)** | 0 | 0 | 0 |
| **Total** | 120 | **33** | 2 | 14 | |

**Not counted**
- 1946, 1952, 1954 show a placeholder.
- 1961's photo carries a LIMIT+1 watermark.
- 88 / 89 (R154, V160) photos have no recorded source.
- 36 / 2115 (1UZ-FE) is a Lexus-only engine in the US.
- Transfer cases 4476 / 4477 are drivetrain, not transmissions.

Five Land Cruiser parts outside the six categories are also IMAGE PENDING (see `phase7/README.md`).

### Image sourcing workstream
These routes give images with an explicit reuse basis. Each needs the owner, because it involves an account or agreement that
I cannot create.
1. **SEMA Data Co-op** (apps.semadata.org, already on the network allowlist). This is the aftermarket industry's licensed product
   data and image feed for resellers, covering Pure Turbos, ATK, Nitto, ARB and most brands. A reseller account gives image
   rights by agreement. This is the strongest single fix for turbos, engines and seats.
2. **Warehouse distributor dealer accounts** (Turn 14, Meyer, Keystone / LKQ, Premier). Their dealer portals include
   manufacturer image libraries licensed for resale listings.
3. **Manufacturer marketing assets on request**, for example:
   - Pure Turbos (info@pureturbos.com, (760) 721-7669): unbranded Pure800 / Pure900 NEW photos;
   - ATK: dealer image files.
4. **The offline supplier's own photos** of genuine Toyota parts (seats, engines, transfer cases, Land Cruiser parts), with
   written permission.

No new permissions were obtained this round. None can be obtained without the owner's action.

### Changes this round
- `docs/catalog-expansion/high-value-120/pipeline.json`: new, 65 products with status, prices, core terms, image source and
  permission.
- This report.
- No catalog or code changes, so no new deployment.

## Round 5 (2026-11-23): first aftermarket turbo, Sienna rack

### Counts toward the 120 (after this round)
| Category | Target | Existing before brief | New under brief (live) | Image pending | Research |
|---|---|---|---|---|---|
| Turbochargers | 20 | 2 (4445, 4488) | **1 (5101)** | 2 (Pure800 / Pure900 NEW) | 6 lines |
| Engines | 20 | 0 | 0 | 0 | 7 ATK engines |
| Transmissions | 20 | 3 (4489-4491) | 1 (4492) | 0 | 1 |
| Steering | 20 | 6 (4422, 4425-4427, 4430, 4471) | **2 (4493, 4494)** | 0 | 6 rack lines |
| Seats | 20 | 0 | 0 | 0 | 0 |
| Tires | 20 | 0 | 20 (5001-5020) | 0 | 0 |
| **Total** | 120 | **11** | **24** | 2 | |

Live total toward the 120: **35** (11 existing + 24 new).

### Imported
- **5101, Vargas Turbo Technologies VTT B58 GC (VTT-B58-GC-2), 2020 GR Supra 3.0, 2-port manifold: $1,766.04.**
  - New-casting aftermarket unit, sold with no core, priced 5% under Turner / ECS at $1,858.99. UroTuning is $1,859.99 and
    Fitment Industries $1,976.24.
  - The listing quotes VTT's own words: "GC is cold side, and bearing housing only, GC+ is a complete unit". It is not
    called complete.
  - The 2021+ 6-port Supra uses VTT-B58-GC-3, and the listing says so.
  - Photo: VTT's studio photo of the unit, from UroTuning's listing. The only lettering is VTT's cast logo and the engraved
    "GC-2" tag. Recorded as manufacturer catalogue photography, RIGHTS NOT INDEPENDENTLY VERIFIED.
  - New loader `lib/inventory/high-value-toyota-products.ts` reads `high-value-toyota.json`, written by
    `scripts/build-high-value-toyota.py`. It follows the tire precedent: one data file, one loader, no new catalog system.
    Brands added: `vargas-turbo-technologies` and `pure-turbos`.
- **4494, Genuine Toyota EPS rack and pinion 44250-08080, Sienna 2021-2025: $617.69** (batch 20).
  - Priced 5% under ToyotaPartsDeal at $650.19, with five dealer prices from $671.97 to $813.77.
  - Toyota's rack photo is used.

### Round 5 Toyota photo sweep (5,846 numbers; in progress at the time of writing)
Rack photos were found for 44250-0E160, 0E220, 0E260, 0E270, 0E360, 08080, 06340, 06550, 06560 and 0R240, and for
45510-0E010 / 0E070. These were rejected:
- the pallet, bag and label photos (06340 #2-3, 0E160 #1-2, 0E360 #1);
- 44250-42140, whose photo is a text graphic.

Held:
- 06340 (Camry 2007-2011) and 0E260 (Highlander 2024-2025): two attributed sellers each.
- The rest: no attributed US price found yet.

### Batch 21 (2026-11-23, after #145)
- **4495, Genuine Toyota power tilt and telescopic steering column 45250-08140, Sienna 2023-2025: $1,806.59.** Priced 5% under
  Lakeland Toyota at $1,901.58. Olathe is $1,902.69, OEMPartsOnline $1,937.60 and American Toyota $1,972.52. It has four of
  Toyota's own photos of this column. Steering wheel, airbag and switches are not included.
- The storefront Steering section now also matches "steering column". No other listing has those words.
- **Held:**
  - 45250-08100 (Sienna manual tilt) and 45250-0E180 (Highlander): Toyota serves the same image file for both part numbers,
    so the photo does not identify either part.
  - 45510-02370 (Corolla 2019-2025): three prices, but only close-ups and a label. Now IMAGE PENDING.
  - 45510-02170: one price, and superseded.
- **Counts:** 25 new under the brief are live, 36 toward the 120 in total.

### Batch 22 (2026-11-23): Toyota Genuine Remanufactured transaxles
These are priced with the $1,000 core included (owner's decision "A"). Every competitor price is compared with its core added.
- **4496, 30510-42320-84, RAV4 2006-2008 2.4L 4WD: $3,393.59.** Priced against Ourisman's $2,572.18 + core. Five more dealers
  are higher, up to Camelback at $2,925.59 + core. Toyota's parts site lists the part for the 2006 RAV4.
- **4497, 30510-48150-84, Highlander 2004-2007 3.3L V6 AWD: $3,334.09.** Priced against Modern Toyota's $2,509.50 + core.
  ToyotaPartsDeal, Lakeland and Frontier are higher.
- The photos are Toyota's own photos of the remanufactured units. The tags visible on them are Toyota's reman tags on the part,
  not overlays.
- **Held:** 30510-48120-84 (one price) and 30510-33140-84 (no current price).
- **Counts:** 27 new under the brief are live, 38 toward the 120 in total.

## Batch 23 (2026-11-23): GReddy JZA80 Supra turbo kits
- **5102: GReddy 11510033 (TD06SH-25G actuator kit), $4,128.93.** Priced 5% under Titan Motorsports and DriftHQ at
  $4,346.25. GReddy's own US store is $4,575.
- **5103: GReddy 11510030 (T78-29D wastegate kit, stainless manifold), $5,092.00.** Priced 5% under JM Auto Racing at
  $5,360. Vivid and MVP are $5,510, and GReddy is $5,800.
- **Fitment:** 1993-1997 Supra Turbo (2JZ-GTE, non-VVT-i). GReddy lists both kits as not for VVT-i engines.
- **Photos:** GReddy's own studio photos of each kit. A watermarked install photo of another kit number was rejected.
- **Scoreboard and next actions:** `STATUS.md`.

## Batch 24 (2026-11-23): HKS GR86 kit and Forced Performance B58 super core
- **5104: HKS GTIII-RS bolt-on turbo kit 11001-KT007, 2022-2025 GR86 (FA24), $4,959.00.**
  - Priced 5% under LIMIT+1 at $5,220. TurboKits is $5,349 and GR Performance Parts $5,800.
  - Kit contents are listed as HKS gives them. The tune, pressure sensor and fuel parts are needed and not included.
- **5105: Forced Performance Green V2 super core 2805050, 2020-2025 GR Supra 3.0 B58, $1,299.14.**
  - Priced 5% under goturbo.net at $1,367.52.
  - Described as a core only (center cartridge with wheels), not a complete turbo. The only photo used shows the core.
- **ARTEC Sport 400 (GR Corolla): IMAGE PENDING.** Its studio photos carry an added logo.
- **Live check of batch 23:** 5102 and 5103 passed on production.

## Batch 25 (2026-11-23): ATK remanufactured Toyota engines (first engines)
- **Pricing:** core included (owner decision A), 5% under the lowest named ATK-number price with its $545 core added.
  - Powertrain Products' prices are shown with "core on invoice". They are not used for our price, because their core
    amount is not published.
- **Shipping:** freight (palletized).
- **Photos:** from Powertrain Products' listing of each ATK engine.

| ID | ATK no. | Engine | Fits | Our price (core included) |
|---|---|---|---|---|
| 5106 | 858B | 4.0L 1GR-FE V6 | Tacoma / Tundra 2006-2010, 2012-2015 | $6,115.14 |
| 5107 | 858 | 4.0L 1GR-FE V6 | 4Runner / Tacoma / Tundra 2005-2011, FJ Cruiser 2007-2011 | $6,140.79 |
| 5108 | 858A | 4.0L 1GR-FE V6 | 4Runner 2003-2004 | $5,270.59 |
| 5109 | 865A | 5.7L 3UR-FE V8 | Tundra / Sequoia 2012-2015 | $8,035.09 |

## Batch 26 (2026-11-23): more ATK engines
Batch 25 is live and verified on production.

| ID | ATK no. | Engine | Fits | Our price (core included) |
|---|---|---|---|---|
| 5110 | 853A | 4.7L 2UZ-FE V8 (VVT-i) | 4Runner / Land Cruiser / Sequoia / Tundra 2005-2009 | $5,011.24 |
| 5111 | 869B | 2.5L 2AR-FE | Camry 2010-2016 | $5,295.29 |
| 5112 | 847E | 3.0L 1MZ-FE | Highlander AWD 2001-2003 | $4,170.49 |

**Held:**
- 847A and 847C: seller year ranges run past the years the models used this engine.
- 860B: approximate prices only.
- 848 and 857: two named prices each.

## Batch 27 (2026-11-23): five more ATK engines
Batch 26 is live and verified on production.

| ID | ATK no. | Engine | Fits | Our price (core included) |
|---|---|---|---|---|
| 5113 | 853 | 4.7L 2UZ-FE (non-VVT-i) | Land Cruiser 1998-2004, Tundra 2000-2004, Sequoia 2001-2004, 4Runner 2003-2004 | $4,701.55 |
| 5114 | 848 | 3.4L 5VZ-FE | Tacoma 1995-2004, 4Runner 1996-2002, T100 1995-1998, Tundra 2000-2004 | $4,272.14 |
| 5115 | 857 | 2.4L 2AZ-FE | Highlander 2001-2007, Camry 2002-2006 | $4,388.99 |
| 5116 | 833 | 3.0L 3VZ-E | 4Runner / Pickup 1988-1989 | $3,906.61 |
| 5117 | 851 | 2.4L 2RZ-FE | Tacoma 1995-1997 | $3,511.91 |

- **865B: rejected.** The retailer's photos are generic files it also uses for 865A.
- **Known issue on 5109 (865A, live):** its two photos are those same shared 3UR-FE crate photos. It stays live, because the
  owner has ruled that existing listings are not to be hidden. A variant-specific photo is wanted.

## Batch 28 (2026-11-23): 869A and 860
Batch 27 is live and verified.
- **5118: ATK 869A, 2.5L 2AR-FE, RAV4 2009-2018, $5,274.39.**
- **5119: ATK 860, 3.3L 3MZ-FE AWD, Sienna AWD 2004-2006, $4,868.74.**
- **Held:**
  - 833C: sellers disagree on the engine code and application.
  - 857D: two prices.
  - Powertrain Products transmissions: generic family photos.

## Batch 29 (2026-11-23): Toyota steering racks
Batch 28 is live and verified.
- **4498: 44250-04041 rack, Tacoma 2016-2023, $616.19.** Priced 5% under Toyota of Laredo at $648.56.
- **4499: 44250-35042 rack, Tacoma 1995-2004 / 4Runner 1996-2002, $494.09.** Priced 5% under Ourisman at $520.00.
- **Held:** 44250-0C131 (Tundra 2014-2021), 44250-04050 (Tacoma 2024) and 44250-35120 (4Runner 2025). None has a Toyota
  photo, and each has one or two prices.

## Batch 30 (2026-11-23)
Batch 29 is live and verified.
- **4500: 44250-0C121 rack, Sequoia 2008-2022, $598.59.** Priced 5% under Ourisman at $630.05.
- **4501: 44310-0C090 power steering pump, Tundra 2007-2021, $270.89.** Priced 5% under Lakeland at $285.12.
- **Held:** 44250-0C200 (2022+ Tundra / Sequoia), which has the same price on two sites.


## Batch 31 (2026-11-23)
Batch 30 is live and verified.
- **5120: ATK 862, 2.7L 2TR-FE, Tacoma 2005-2014, $4,061.59 (core included).** Priced against JEGS at $3,730.36 + $545 core.
- Dead ends this round are in STATUS.md.

## Batch 32 (2026-11-23): Dynamic Autowerx GR Supra turbos
Batch 31 is live and verified.
- **5121: Dynamic Autowerx Flow Max (DAW-G258-2p-FM1), 2020 GR Supra 3.0 (2-port), $2,565.00.** Priced 5% under Studio RSR at $2,700.
- **5122: Dynamic Autowerx Ultra Flow 6466 (DAW_G258_2p_UFR_5), same fitment, $2,992.50.** Priced 5% under $3,150, which Titan, Euro Performance Center and BimmerNetwork all charge.
- Both are complete turbochargers with an integrated stainless manifold.
- **Photos:** the manufacturer's photos from Titan Motorsports' listing. UroTuning's copies are not used, because its terms forbid reuse. The text-overlay photo, the screenshot with a UI artifact and the add-on hose photo are rejected.
- **New:** `TRACKER.md` (master tracker generated from `pipeline.json` by `scripts/build-hv120-tracker.py`).

## Batch 33 (2026-11-23)
Batch 32 is live and verified.
- **5123: Dynamic Autowerx New Gen 6769 (DAW_G258_6769), 2021-2024 GR Supra 3.0 (6-port), $3,277.50.** Priced 5% under Titan Motorsports at $3,450.
- **IMAGE PENDING:**
  - CTS Turbo A90 2-port kit CTS-TR-1059: every photo carries an added CTS logo.
  - Dynamic Autowerx 6-port Flow Max: its photos are shared with the 2-port listing.
- **Known issue:** 5121's turbo photo file is also used on the 6-port Flow Max listing.

## Batch 34 (2026-11-23)
Batch 33 is live and verified.
- **5124: Dynamic Autowerx 6969 (DAW_G2_6969), 2021-2024 GR Supra 3.0 (6-port), $3,419.05.** Priced 5% under Titan Motorsports at $3,599.
- The seats blocker is described in STATUS.md.

## Batch 35 (2026-11-23): five genuine Toyota steering parts
Batch 34 is live and verified.
- **New price source:** the product pages of ToyotaPartsNow and ToyotaPartsDeal, read directly. They give the price, MSRP and exact
  model and trim fitment. Toyota dealer stores found by search supply the remaining prices. ToyotaPartsNow started returning 403
  after a few requests. It was not retried or worked around.
- **4502 44250-0C200:** electric rack for 2022-2025 Tundra and 2023-2025 Sequoia, not TRD Pro, $860.39. Priced 5% under Modern
  Toyota at $905.64.
- **4503 44250-0E260:** electric rack for 2024-2025 Highlander and Highlander Hybrid, $890.59. Priced 5% under ToyotaPartsDeal
  at $937.42.
- **4504 45250-06410:** steering column for 2002-2004 Camry, $850.09. Priced 5% under Olathe Toyota at $894.77.
- **4505 45250-0C300:** power tilt steering column for 2018-2019 Tundra, $1,833.59. Priced 5% under Olathe Toyota at $1,930.05.
- **4506 45510-0T011:** rack and pinion for 2009-2015 Venza, $501.69. Priced 5% under NuCar Toyota at $528.02.
- **Photos:** Toyota catalog photos of the whole part only. Close-ups are not used.
- **Rejected or held:**
  - 44250-06340: its Toyota photo shows an electric rack, but this Camry rack is hydraulic.
  - 44250-0C180: its photos show two different rack designs.
  - 45250-07180: its photo is the same file as 45250-08100's.
  - Pure Turbos 650, 800 and 900 (NEW): complete new turbos, but every photo on Pure's own store carries the Pure logo.

## Batch 36 (2026-11-23): Grand Highlander rack and the first genuine seat
Batch 35 is live and verified (4502-4506).
- **4507 44250-0E220:** electric rack for 2024-2025 Grand Highlander, $824.49. Priced 5% under Conicelli Toyota at $867.79.
- **4508 71200-35A81-B0:** genuine Toyota front driver seat for 2003-2005 4Runner SR5, Stone (trim code 12), with side and curtain
  airbags. $2,232.89, priced 5% under ToyotaPartsDeal at $2,350.40 (ToyotaPartsNow $2,394.70; JoeTLC $3,860.49).
  - Configuration comes from ToyotaPartsDeal's 2004 4Runner seat parts list, whose rows give the airbag option, colour and trim code.
  - The photo is Toyota's catalog photo of this part number.
  - It ships as freight. The new `seat` part kind maps to Interior and is in `FREIGHT_KINDS`.
- **Seat photo source:** Toyota's photo host (`/img/<PN no dashes>/<PN>_n.webp`) has a real photo for about 1-2% of seat numbers.
  For every other number it returns an HTML page with status 200, so a probe must check the file type.

## Batch 37 (2026-11-23): Avalon rack, completing steering
Batch 36 is live and verified (4507, 4508).
- **4509 45510-07010:** rack and pinion for 2013-2018 Avalon and Avalon Hybrid, $517.89. Priced 5% under Modern Toyota at $545.09;
  ToyotaPartsDeal $558.44, Toyota of Fort Worth $596.54, Reliable Toyota $733.76.
- This brings steering to 20 once live.
- **Transmissions:** the photos for Toyota manual transmission 33030-04080 (RC60F, 2024 Tacoma) are annotated label diagrams,
  so it is IMAGE PENDING.

## Batch 38 (2026-11-24): HKS JZA80 setup kit with GTIII-4R turbocharger
Batch 37 is live and verified (4509). Steering is complete at 20.
- **5125 HKS 14020-AT004:** setup kit with GTIII-4R turbocharger for the 1993-1997 Supra Turbo, $6,299.45.
  - Priced 5% under Titan Motorsports at $6,631.00; Vivid Racing, Concept Z Performance and Kamispeed list it at $6,980.
  - The kit includes the turbo, so it qualifies. 14020-AT003, the kit without the turbo, does not.
  - Photos: HKS's studio photos of the turbo and kit, from Titan's listing.
- **Rejected or held:**
  - Pure850: Titan's photos carry a watermark.
  - 17201-WAA03: Titan's image is a parts diagram.
  - GReddy 11510540: its photos are shared with the other kits in the family.
  - Toyota partial engines (19000): Toyota has no photo for any of the numbers checked.
- **Engines:**
  - Summit Racing is behind bot protection and was not worked around.
  - The independent remanufacturers found (Power Engines, JDM Engine Zone, United Engine, Toyota Truck Engine) each sell their own
    units under an engine code, not a shared part number, so no single engine has three comparable prices.

## Batch 39 (2026-11-24): BorgWarner OE replacement turbochargers for GR Supra 3.0
Batch 38 is live and verified (5125).
- **5126 BorgWarner 18559880117 (B03G, 2-port, replaces Toyota 17201-WAA03):** for the 2020 GR Supra 3.0, $956.64.
  - Priced 5% under turbos.com at $1,006.99.
  - Other prices: Turbochargers Direct $1,128.95, Denco Diesel $1,890.91, Titan $2,055.11.
- **5127 BorgWarner 18559880116 (B03G, 6-port, replaces Toyota 17201-WAA08):** for the 2021-2023 GR Supra 3.0, $3,107.44.
  - Priced 5% under turbos.com at $3,270.99.
  - Other prices: Titan and NGP Racing at $6,304.12.
- **Retail price spread:** prices for these units vary widely between US retailers. Each listing is priced from the lowest named price.
- **Photos:** turbos.com's own studio photos of each exact part number, five per unit, with none shared between the two. There is
  no watermark or overlay. turbos.com's store policies contain no reuse restriction, but it gives no explicit licence either.
