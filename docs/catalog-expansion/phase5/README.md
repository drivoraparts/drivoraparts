# Phase 5: heavy Toyota parts coverage, vehicle by vehicle (2026-11-20)

Branch only. Nothing was merged or deployed. Batch 8 (IDs 4476, 4477) stays unpublished. No pricing,
checkout, payment or shipping change was made.

Files:
- `candidates-ledger.csv`: every heavy-assembly candidate this phase, with prices, photo, core
  charge, status and blocker.
- `international-fitment-pathway.md`: how to support Land Cruiser, Prado and Hilux without weakening
  US validation.
- `../high-value-expansion/coverage-matrix.csv` and `opportunities-ledger.csv`: the earlier audit.

**Status key**
- **LIVE:** listing deployed.
- **BRANCH:** imported on the branch, not deployed.
- **HOLD:** verified enough to list, but blocked (supplier cost, photo, prices, core or hazmat).
- **REJECT:** not viable.
- **MISSING:** nothing researched or found yet.

No product is **READY**: no supplier has given a cost.

## 1. Coverage by vehicle

| Vehicle | Heavy parts available now | Candidates (status) | Still missing | Main blocker |
|---|---|---|---|---|
| **Land Cruiser 80** (US 1991-97) | 5 suspension kits, 2 bumpers (aftermarket) | 41110-60C50 front diff: one finder says 1993-97, Olathe says 2016-21 (HOLD, conflict) | Engine 1FZ-FE, transmission, transfer case, axles | Genuine parts largely discontinued; used/reman via LKQ |
| **Land Cruiser 100** (US 1998-2007) | 11 suspension; BRANCH: AHC accumulators 4474, 4475 | Rack 44250-60100 (photo, 2 prices, HOLD); rack 44250-60050 (no photo); boosters 47050-60043/60041; AHC pump 48910-60012 (all HOLD) | Engine 2UZ-FE, transmission, diffs | Third prices; photos; supplier cost |
| **Land Cruiser 200** (US 2008-21) | 1 transmission listing, 11 suspension; BRANCH: rack 4471 | Front diff 41110-60B81 (3 prices, no photo); reman transmissions 35010-60B80-84 and 35010-60E50-84 (+$1,000 core); transfer case 36100-60B02; A/C compressor 88320-6A320 (all HOLD) | Engine 3UR-FE (short block HOLD), rear axle | Photos; core charges; supplier cost |
| **Land Cruiser 250 / Prado 250** (US 2024+) | none | Turbo 17201-F0010 (1 price); transfer case 36100-35A30 (1 price); headlamps 81185/81145-60S60 (2 prices) (all HOLD) | Hybrid battery, diffs | New model: few prices and low failure volume |
| **Land Cruiser 300** (not US) | 2 suspension, 3 bumpers, 1 transmission; turbo 17201-F4011 is LIVE via Tundra/Sequoia | Shares V35A parts with Tundra, Sequoia and Lexus LX600 | Genuine fitment | Validator (US only). Lexus LX600 route recommended |
| **Land Cruiser 70** (not US) | 7 suspension, 5 bumpers | 1VD-FTV injectors and turbo: genuine prices only in Australia | All genuine assemblies | No US genuine market; only pre-2001 trucks can be imported |
| **Prado 120** (not US) | 3 suspension, 2 bumpers | Shares with GX470 and 4Runner 2003-09 (e.g. air compressor 4473) | Diesel 1KD-FTV parts | Lexus GX470 route recommended |
| **Prado 150** (not US) | 7 suspension, 5 bumpers, 1 transmission | 1GD-FTV turbo 17201-11120: US listings are aftermarket ($510-760) | Genuine assemblies | Lexus GX460 route recommended |
| **Hilux** (not US) | 2 transmissions, 18 suspension, 4 bumpers | none genuine with a US price | Genuine assemblies | Import law; no US price |
| **4Runner** | 32 suspension; BRANCH: KDSS 4472, compressor 4473 | Transfer cases 36100-6D401 (3 prices, no photo) and 36100-71370 (1 price); rack 44200-35094 (HOLD); genuine engine REJECT | Diffs, transmission | Photos; supplier cost |
| **FJ Cruiser** | 6 suspension | Same 1GR-FE engine family as 4Runner (genuine REJECT; used/reman HOLD) | Drivetrain | LKQ account |
| **Tacoma** | 34 suspension, 1 transmission; BRANCH: transfer case 4476 | Transfer case 36100-04030 (2 prices); ABS 44050-04220 (conflict); engine 2GR-FKS REJECT | Diffs | Prices; supplier cost |
| **Tundra** | 25 suspension, 1 transmission, LIVE turbo; BRANCH: transfer case 4477 | Transfer case 36100-0C010 (2 sellers); hybrid battery G9510-34010 (2 prices); short block 3UR (1 price) | Diffs | Hazmat and core (battery); photos |
| **Sequoia** | 1 transmission, LIVE turbo | Hybrid battery G9510-34010 (shared with Tundra); transfer case 36100-0C040 | Diffs, suspension | As Tundra |
| **Sienna** | sliding-door motors, fan module | Hybrid battery G9510-45010 (3 prices) | Transaxle | Hazmat; no photo |
| **RAV4** | fan module, rack | Hybrid battery G9510-33121; reman transaxle 30510-0R010-84 (+$1,000 core); steering column 45250-07180 | | Core; photos |
| **Camry** | fan module | Hybrid battery G9510-33112 (+$1,350 core); inverter G9200-33101 | Transaxle | Core; hazmat |
| **Highlander** | fan module | Hybrid batteries G9510-48090 ($3,932-3,988) and G9510-48060 ($4,205 + $1,350 core) | Transaxle | Core; hazmat; no photo |
| **Corolla** | rotors, pads (low value) | not researched: few parts over $1,000 | | Low value |
| **Supra** | 1 transmission, wheels, bumpers | not researched (BMW-shared drivetrain) | Engine B58 | Supplier route unclear |
| **GR86 / 86** | 2 transmissions, clutch kits | not researched (Subaru-shared drivetrain) | Engine FA24 | Supplier route unclear |

## 2. What decides coverage now (in order of impact)

1. **Supplier access.**
   - Not one wholesale cost exists, so nothing can be READY.
   - A Toyota dealer wholesale account unlocks every genuine candidate above.
   - LKQ and JASPER unlock used and reman engines and transmissions. That is where the real
     engine demand is: used $2,900-$3,900 against $15,000+ for a genuine new long block.
2. **Photography.**
   - Toyota's catalog image host has no photo for any differential, transmission, turbo or hybrid
     battery checked this phase: 39 part numbers probed, 2 hits (racks 44250-60100 and 44200-60170).
   - Heavy assemblies therefore need supplier photos with written permission, or our own photos
     once a part is stocked.
   - Generic photos are not allowed, so these stay HOLD.
3. **Core charges.**
   - Genuine Reman transmissions ($1,000 core) and hybrid batteries ($1,350 core) need a core
     deposit and refund flow. The checkout has none.
   - Adding one is a checkout change and needs your approval.
4. **Hazmat and freight.**
   - Hybrid batteries ship as Class 9 dangerous goods.
   - Engines and transmissions ship by LTL freight, about $350-700 against the $199 we charge.
   - Both need carrier terms from the supplier.
5. **Non-US fitment.** See `international-fitment-pathway.md`. Recommended:
   - first, add Lexus GX/LX fitment, which covers most Prado and LC300 demand inside US rules;
   - only then, a separate frame-code pathway for 25-year-import vehicles.

## 3. Nothing imported this phase

No new candidate met every rule: $500+, three US prices, dealer fitment and a Toyota photo checked by
eye. The closest are:
- **41110-60B81** (three prices, no photo);
- **44250-60100** (photo, two prices).

Importing them would break the photo or price rule.

## 4. Decisions needed

1. Open a Toyota dealer wholesale account and LKQ (and optionally JASPER). The letters are in
   `../phase3/supplier-inquiries.md`.
2. Ask suppliers for written photo permission, or approve our own product photography.
3. Approve, or not, the Lexus GX/LX fitment step (code change to the validator).
4. Decide whether to build core-charge support in checkout (needed for reman and hybrid units).
5. Batch 7 and batch 8 stay unpublished until supplier costs arrive.
