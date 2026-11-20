# Phase 5 continued: Land Cruiser and Prado coverage, international fitment, deployment readiness (2026-11-20)

Branch `claude/tender-babbage-1g5ej7`. Nothing was merged, published or deployed. No checkout, payment,
shipping or pricing rule was changed.

New files:
- `lc-prado-status-register.csv`: every Land Cruiser and Prado record, each checked against the nine
  READY FOR IMPORT conditions.
- `../../../scripts/check-international-fitment.mjs` and `../../../scripts/test-international-fitment.mjs`:
  a prototype of the international pathway with tests. Neither is wired into any npm script, the
  importer or the storefront.

## Stage definitions used

| Stage | Meaning |
|---|---|
| RESEARCH | Part number and product identified; at least one condition below is missing |
| VERIFIED | Part number, identity and US dealer-catalog fitment confirmed; at least 3 US prices at $500+ |
| FITMENT VERIFIED | VERIFIED, plus fitment encoded and passed by the validator, plus Toyota photos checked by eye |
| SOURCING VERIFIED | A real supplier quote or account cost exists |
| PROFITABILITY VERIFIED | SOURCING VERIFIED, plus shipping cost known, plus positive margin after fees |
| READY FOR IMPORT | All nine conditions met |
| HOLD | Promising but blocked; the blocker is recorded |
| REJECTED | Below $500, uneconomic, or misleading evidence |

## A. Product coverage report (Land Cruiser and Prado register: 37 records)

| Measure | Count |
|---|---|
| Products researched | 37 records (some group 2-3 part numbers) |
| VERIFIED or better (identity, fitment, 3+ US prices at $500+) | 10 |
| At or above the $500 threshold (lowest US retail) | 27 |
| FITMENT VERIFIED (validator-encoded, photos checked) | 5 (IDs 4471, 4472, 4473, 4474, 4475) |
| SOURCING VERIFIED (supplier cost known) | **0** |
| PROFITABILITY VERIFIED | **0** |
| READY FOR IMPORT | **0** |
| HOLD | 29 |
| REJECTED | 8 |

The ten VERIFIED-or-better records:
- the five batch 7 parts;
- 47050-60043 and 41110-60B81, both missing a Toyota photo;
- 36100-60B02 and 88320-6A320, both missing a Toyota photo;
- 87940-6A570 (Land Cruiser 250 camera mirror), missing a Toyota photo.

New this round:
- **53101-60D30** (LC200 grille): Toyota photo, one US seller. HOLD.
- **53101-60936** (LC200 grille, chrome): two sellers. HOLD.
- **53301-60690** (2016-21 hood): retail $501.59. Our rule price would be $476.51, below the $500
  floor. REJECTED.
- **53301-60591** (hood): below $500. REJECTED.
- **41110-60C40** (LC200 rear differential): no US price. HOLD.
- **81070-60K62 / 81140-60N50** (LC200 headlamps): list price only. HOLD.
- **81110-60P70** (LC70 headlamp): $19.72. REJECTED.

## B. Coverage gap report

| Generation | Qualifying (FITMENT VERIFIED) | Major categories with no qualifying product |
|---|---|---|
| Land Cruiser 80 | none | Everything. Steering box 44110-60211 is discontinued; engines and transmissions only via used/reman |
| Land Cruiser 100 | AHC accumulators (4474, 4475) | Engine, transmission, transfer case, diffs, axles; rack and booster on HOLD (prices/photo) |
| Land Cruiser 200 | Steering rack (4471) | Engine, transmission (reman HOLD: core), transfer case and diffs (no photo), body (grille 1 seller; hood below $500), headlamps |
| Land Cruiser 250 / Prado 250 | none | All. Turbo, transfer case, headlamps and mirror have 1-3 prices and no Toyota photo |
| Land Cruiser 300 | none (turbo 17201-F4011 is LIVE only under its Tundra/Sequoia fitment) | All: non-US model |
| Prado 120 | Air compressor 4473, listed for the US twin (4Runner 2003-09) | Diesel 1KD-FTV parts; Prado fitment itself |
| Prado 150 | KDSS cylinder 4472, listed for the US twin (4Runner 2010-24) | 1GD-FTV turbo and injectors; Prado fitment itself |

Off-road and body equipment:
- Genuine Toyota bull bars, winches and roof racks for these models are sold through Australian
  dealers, not US ones. No US retail price exists for them.
- The 75+ aftermarket bull bars, bumpers, racks and lift kits already live (ARB, TJM, Rhino-Rack,
  Front Runner and others) are the US-sellable off-road range.

## C. International fitment report

**Where non-US vehicles are rejected:**
- `scripts/check-toyota-expansion.mjs` checks the `US_MODELS` set. Any `fitmentApplications`
  entry whose model is not in it fails at lines 83 and 309. Service kits fail the same way.
- `npm run audit:storefront-claims` runs that validator, so the failure blocks every import.

**Prototype pathway** (`scripts/check-international-fitment.mjs`, opt-in, not in the pipeline):
- **Separate field:** `internationalFitmentApplications`, in separate files
  (`toyota-international-batch-N.json`) that the US validator never reads. The US check is
  unchanged.
- **Supported models:** Land Cruiser 70/80/100/200/300, Prado 120/150/250 and Hilux. Each has a
  chassis-code pattern, an engine list and a production span.
- **Cross-market guards:**
  - the chassis code must belong to the model (KDJ150 on a Land Cruiser 70 is rejected);
  - the engine must agree with the chassis prefix (VDJ79 with 1HZ is rejected);
  - the market must be a non-US market;
  - US fitment and international fitment cannot be mixed in one record.
- **Evidence:** every application needs a Toyota EPC source for that same market. Evidence from
  another market is rejected.
- **HOLD rule:** an unverified application is allowed only while the record is
  `research_pending`. Commercial records need every application verified.
- **Description:** must say "built for markets outside the United States" and ask for frame code and
  VIN. Warranty, stock and dealer claims are blocked.

**Tests** (`node scripts/test-international-fitment.mjs`): 19 checks, all passing.
- **US pathway, 5 checks:** current batches pass; Prado is rejected; Hilux is rejected;
  international-only fitment cannot pass as commercial; international files are ignored.
- **International pathway, 14 checks:** a valid fixture passes; 12 broken cases are each rejected;
  an unverified HOLD record is allowed.
- The existing fitment self-test also still passes.

**Not done, needs your approval:**
- wiring the prototype into `audit:storefront-claims`;
- teaching the importer and storefront to show international fitment (frame code display, keeping
  it out of Google's US vehicle attributes);
- a pricing rule for parts with no US retail price.

Recommendation unchanged: approve Lexus GX/LX US fitment first. The international pathway mainly
serves 25-year-old import vehicles and customers abroad. The store currently ships only within
the US, so international customers would also need a shipping-policy decision.

## D. Commercial report

**Verified:**
- Retail prices (3+ US sources) for the 10 VERIFIED records.

**Not verified for any product:**
- Supplier cost: no wholesale account exists.
- Gross profit and margin: they cannot be calculated without a supplier cost, so they are
  **UNKNOWN**.

**Estimates** (from Phase 3 and batch 8, labelled as such):
- Break-even delivered part cost, at today's price and fees:

  | Part | Break-even delivered cost | % of list price |
  |---|---|---|
  | Rack 4471 | $826 | 76% |
  | Accumulators 4474 / 4475 | $927-938 | 73-77% |
  | KDSS cylinder 4472 | $1,764 | 65% |
  | Compressor 4473 | $1,681 | 63% |
  | Transfer cases 4476 / 4477 | $1,821-2,146 | ~66% |

- Parcel shipping: $20-160 by part type. Freight (engines, transmissions, transfer cases, body
  panels): $300-700 by truck.
- Partsouq export prices with 15% US duty and an assumed $60 international shipping imply margins of
  9-50% on the Land Cruiser accumulators and the KDSS and compressor parts. That route has no Toyota
  warranty and 20% restocking on returns, and it is not recommended without your decision.

## E. Deployment report (exact)

| Item | Count | IDs |
|---|---|---|
| Listings deployed on main (live) | 514 | Of these, 167 genuine Toyota (IDs 4304-4470) |
| Genuine Toyota records on the branch | 174 | 4304-4477 |
| Branch-only imported records (not deployed) | 7 | Batch 7: 4471, 4472, 4473, 4474, 4475; batch 8: 4476, 4477 |
| New research records this phase (LC/Prado register) | 37 | No catalog IDs (not imported) |
| Fully validated (FITMENT VERIFIED) | 7 | 4471-4477 (5 Land Cruiser/Prado-platform, 2 Tacoma/Tundra) |
| READY FOR IMPORT | **0** | |
| HOLD | 29 register records + the 7 imported records (commercially on HOLD) | |
| REJECTED | 8 register records | |

**Batch 8 note:** the year range on 36100-04010 (ID 4476) was narrowed to 2024-2025, the Tacoma
2.4L turbo years the validator accepts.
- The earlier 2024-2026 range had made `check-toyota-expansion` fail.
- I misread that failure as a pass when batch 8 was committed. It is fixed now.
- The dealer's 2026 listing is kept in the restriction text.
- The full audit chain, the shipping test, tsc and the production build pass. IDs are unchanged.

**Merge note:** batches 7 and 8 are in the branch's catalog data. Merging the branch would publish
them. Keep the branch unmerged, or split it, until you approve.

## F. Next actions (most promising first)

1. **Supplier account** (owner). One Toyota dealer wholesale quote on these parts would move the
   seven imported records and the five VERIFIED records to SOURCING VERIFIED:
   - imported: 4471-4477;
   - VERIFIED: 41110-60B81, 36100-60B02, 47050-60043, 88320-6A320, 87940-6A570.
2. **Photos.** Request written image permission from the supplier for 41110-60B81, 36100-60B02,
   47050-60043, 88320-6A320 and 87940-6A570. These are the highest-value verified parts held back
   only by photos.
3. **Third prices:**
   - 47050-60041 (LC100 booster)
   - 44250-60100 (LC100 rack, photo found)
   - 48910-60012 (AHC pump)
   - 53101-60936 / 53101-60D30 (LC200 grilles)
   - 36100-35A30 and 17201-F0010 (LC250)
4. **LKQ / JASPER.** Used and remanufactured 1FZ-FE, 2UZ-FE and 3UR-FE engines and AB60F/A750F
   transmissions. This is the largest real demand in this category.
5. **Approvals:**
   - Lexus GX/LX US fitment (largest coverage gain inside US rules);
   - the international pathway (prototype ready);
   - core-charge support (reman transmissions).
