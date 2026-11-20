# High-value Toyota parts expansion: audit, opportunities and batch 8 (2026-11-20)

Branch `claude/tender-babbage-1g5ej7` only. Nothing in this work is merged or deployed. Checkout,
payment, shipping policy and pricing rules were not changed.

Files:
- `coverage-matrix.csv`: every platform against 14 systems, counting listings at $500+ (with IDs).
- `opportunities-ledger.csv`: candidates by priority with prices, fitment, photo, demand, supplier,
  shipping, profit and READY / HOLD / REJECT.

## 1. Platforms investigated

- **In the live catalog:** Land Cruiser 70/80/100/200/300, Prado 120/150, 4Runner, Tacoma, Tundra,
  Sequoia, Hilux, FJ Cruiser, Sienna, RAV4, Camry, Corolla, Highlander, Supra, GR86/86.
- **Also searched:** Land Cruiser 250 and Prado 250. The catalog has no listing for them yet.
- **US-market platforms** (genuine Toyota listings allowed by the validator): 4Runner, Tacoma,
  Tundra, Sequoia, Land Cruiser (through 2021, and 2024+ as the 250), FJ Cruiser, Sienna, RAV4,
  Camry, Corolla, Highlander, Supra, GR86.
- **Non-US platforms:** Hilux, Prado 120/150, Land Cruiser 70 and 300. The catalog lists only
  aftermarket accessories, bumpers and transmissions for them. Genuine Toyota fitment for these
  cannot be added: the validator accepts US-market models only.

## 2. Coverage before this batch (listings at $500+)

| Platform | Engine | Trans. | Transfer case | Diff/axle | Driveshaft | Steering | Suspension | ABS/booster | Cooling/HVAC |
|---|---|---|---|---|---|---|---|---|---|
| Land Cruiser 80/100 | 0 | 0 | 0 | 0 | 0 | 0 | 5 / 11 | 0 | 0 |
| Land Cruiser 200 | 0 | 1 | 0 | 0 | 0 | 1 | 11 | 0 | 0 |
| Land Cruiser 300 / Prado 150 | 0 | 1 / 1 | 0 | 0 | 0 | 0 | 2 / 7 | 0 | 0 |
| 4Runner | 0 | 0 | 0 | 0 | 0 | 0 | 32 | 0 | 0 |
| Tacoma | 0 | 1 | 0 | 0 | 0 | 2 | 34 | 0 | 1 |
| Tundra | 0 | 1 | 0 | 0 | 0 | 1 | 25 | 0 | 0 |
| Sequoia | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| Hilux | 0 | 2 | 0 | 0 | 0 | 0 | 18 | 0 | 0 |
| Sienna / RAV4 / Camry / Highlander / Corolla | 0 | 0 | 0 | 0 | 0 | 0-1 | 0-1 | 0-1 | 1 each |

The four engine listings (2JZ-GTE, 1JZ-GTE, 1UZ-FE and the 1UZ-FE swap package) are JDM-style
performance engines, not replacement engines for a supported US vehicle.

**Gaps:**
- No replacement engine, transfer case, differential, axle or driveshaft on any platform.
- Transmissions are thin.
- Suspension is the one well-covered system, through lift kits and coilovers.

## 3. What the research found, by priority

**P1: complete engines.**
- Toyota sells genuine new partial engines (long blocks). Retail prices:
  - Tacoma 2GR-FKS 19000-0P441: about $15,000
  - 4Runner 1GR-FE 19000-31K81: about $15,600
  - 2004-2006 4Runner 19000-31A20: $21,516
- Buyers replace these engines with used units ($2,900-$3,900) or reman ($4,390). Genuine new costs
  4-5 times as much. Add LTL freight and the commercial case fails, so **REJECT**.
- Genuine short block 3UR-FE (11400-0S011 → 11400-38130): one price ($6,614) and no photo, so
  **HOLD**.
- The real engine opportunity is **used and remanufactured units through LKQ drop ship or JASPER**.
  It needs a partner account and cost file, so **HOLD**.

**P2: transmissions and transfer cases.**
- Toyota Genuine Reman automatic transmissions exist (35010-xxxxx-84), but prices are not public
  and Toyota marks them pickup-only. Used and reman units need LKQ or JASPER, so **HOLD**.
- Transfer cases are the best genuine new opportunity:
  - **36100-0C020** (Tundra 5.7L): qualifies, imported.
  - **36100-04010** (2024+ Tacoma manual): qualifies, imported.
  - **36100-04030** and **36100-0C010**: two prices each, **HOLD**.
  - **36100-6D401** (4Runner), **36100-0C040** and **36100-60B02**: no Toyota photo, **HOLD**.

**P3: differentials and axles.** Carrier assemblies (41110-) are ratio- and locker-specific. No US
price was found for any US-platform number, so **HOLD**.

**P4-P6:**
- Steering racks, AHC/KDSS and ABS/booster candidates are in batch 7 and the earlier ledgers.
- No new candidate met every rule this round.

**P7: off-road.** The catalog already has 75+ bumpers, bull bars, racks and lift kits. Adding more
needs a distributor account (Turn 14, ARB USA) and an image licence, so **HOLD**.

## 4. Batch 8 imported (branch only)

| ID | Part no. | Product | Fits | US prices (3) | Our price |
|---|---|---|---|---|---|
| 4476 | 36100-04010 | Genuine Toyota transfer case assembly | 2024-2026 Tacoma 4WD, manual transmission | Olathe $2,163.97; Modern $2,203.67; ToyotaPartsDeal $2,211.61 | $2,055.79 |
| 4477 | 36100-0C020 | Genuine Toyota transfer case assembly | 2014-2021 Tundra 5.7L 4WD | ToyotaPartsNow $2,401.42; Olathe $2,465.24; ToyotaPartsDeal $2,519.52 | $2,281.39 |

How the two listings were built:
- Price is 5% under the lowest US price (the existing rule).
- Each listing carries a VIN-dependent restriction naming the neighbouring part numbers.
- Toyota catalog photos were checked by eye. For 36100-0C020, Toyota's fourth image path returned
  an **A/C compressor** photo, so the listing is pinned to its two correct views.
- No existing listing uses photos from that path. Before any future use, each image from it must
  be checked by eye. This applies to the 41 "photo found" corrections in Phase 3 too.
- Both are classed as single parcels, so customers pay $100 or $150 by subtotal.

**Classification:** HOLD, not READY. No supplier cost exists.

## 5. Economics (estimates; unverified)

PayPal fee (3.49% + $0.49) and the automatic 5% discount are included. Outbound parcel shipping
for a ~40 kg transfer case is estimated at $90-160.

| Part | Customer pays | Shipping charged | Net receipts | Break-even part cost | Profit if cost is 60% of MSRP |
|---|---|---|---|---|---|
| 36100-0C020 | $2,167.32 | $150 | $2,235.96 | $2,076-2,146 (~66% MSRP) | +$191 (8.8%) |
| 36100-04010 | $1,953.00 | $100 | $1,980.86 | $1,821-1,891 (~66% MSRP) | +$171 (8.7%) |

Dealer discounts in this range are typical of public online pricing (Olathe sells at about 77% of
MSRP). A real wholesale account is needed to beat about 60% of MSRP. Without it these parts do not
make money.

## 6. Supplier status

No supplier account exists, and no wholesale cost was obtained.

What is needed to move items to READY:
- **Toyota dealer wholesale account** (Longo, Modern, Olathe, Fred Haas): EIN, CA seller's permit,
  resale certificate and credit application.
- **LKQ drop ship:** NDA, data agreement, tax forms and credit application.
- **JASPER:** installer or reseller account by phone.

Inquiry letters with part numbers are in `../phase3/supplier-inquiries.md`. The two transfer cases
should be added to them.

## 7. Checks run on batch 8

- Catalog validator and claims audit: passed.
- Shipping test: 520 products, 511 feed rows.
- `tsc`: passed.
- Production build: passed.
- Local mobile test:
  - both product pages render with photo, price, fitment and add-to-cart;
  - cart and checkout total $2,281.39 − $114.07 = $2,167.32, with shipping shown as $150;
  - search by part number finds both;
  - both appear in the Google Merchant feed.
- Stable IDs: 4476 and 4477 are new (max + 1). No duplicate IDs or part numbers.

## 8. Blockers

1. **Supplier accounts.** Nothing can be READY or deployed for profit without a real cost.
2. **Photos:** 36100-6D401, 36100-0C040, 36100-60B02 and the short blocks need supplier photos with
   written permission.
3. **Non-US platforms** (Hilux, Prado, LC70/300) need an owner decision. Either keep them
   aftermarket-only, or extend the validator, which would need approval.
4. **Merge and deploy** of batches 7 and 8 and the parcel shipping fix need the owner's approval.
