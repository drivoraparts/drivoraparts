# Phase 3: supplier sourcing, batch 7 profitability, shipping and discounts (2026-11-19)

Nothing in this phase changed the live site. Batch 7 (IDs 4471-4475) is imported on branch
`claude/tender-babbage-1g5ej7` only: not merged, not deployed. No pricing, checkout, payment or
shipping rule was changed. No supplier was contacted: every inquiry below is prepared for the
owner to send.

Each section separates **Confirmed** (published by the source, linked), **Estimate** (my
calculation, assumptions stated) and **Unknown**.

Files:
- `batch7-profitability.csv`: every batch 7 part under today's shipping and the proposed parcel fix,
  single-item 5% and 2+-item 10% discounts, PayPal fee, net receipts and an indicative
  Partsouq-route landed cost.
- `discount-options.csv`: four realistic carts under today's rule and three alternatives.
- `supplier-inquiries.md`: inquiry letters with the exact batch 7 and Land Cruiser part numbers.

## 1. Batch 7 integrity check

Confirmed on the branch: IDs 4471-4475 are unchanged and map to 44200-60170, 48007-60023,
48910-60021, 49141-60010 and 49151-60010. Each has its Toyota catalog photos, VIN-dependent
fitment with a restriction, and a price 5% under the lowest US dealer price. Catalog validation,
claims audit, shipping test (518 products), tsc, production build, local product page, cart,
checkout, search and the Merchant feed all passed when it was imported (commit 08d90469).

## 2. Supplier sourcing

### Confirmed
| Channel | What is published | Account requirements |
|---|---|---|
| Toyota dealer wholesale (Longo, Modern "Wholesale Direct", Olathe, Fred Haas Toyota Country, Lakeland, Heritage Catonsville) | Retail web prices only. Toyota publishes **no** reseller discount; dealers set wholesale pricing themselves. Toyota ordering programs for shops: Toyota Parts Center Online / MyPARTS, RepairLink (Toyota Mechanical Parts Program). PDC Direct Fulfillment lets a *dealer* ship from Toyota's distribution centers | Business account with the dealer: EIN, CA seller's permit + resale certificate, credit application or card on file |
| LKQ drop ship | No setup/monthly fees; flat-rate shipping; 20 US DCs; same-day ship before 3 pm; 6-month parts warranty on recycled engines/transmissions | NDA, data-usage agreement, tax certification, credit application |
| JASPER | Reman Toyota engines/transmissions; core and skid charges; 3 yr / 100,000 mi parts and labor warranty (installation conditions) | Installer/reseller account by phone (800-827-7455) |
| Turn 14 Distribution (aftermarket, e.g. Arnott) | Dropship distributor | Storefront/website, state sales-tax license, EIN, opening "buy-in" order; selective approval. Whether it carries Arnott was not confirmed |
| Partsouq (Dubai exporter of genuine Toyota parts, ships to US) | Public export prices: 49141-60010 $397.65; 49151-60010 $514.46; 48007-60023 $1,061.64; 48910-60021 $987.17-$1,128.24; 48910-60012 $1,358-$1,811. 44200-60170 not listed. Dispatch 1-3 days by FedEx/DHL/TNT; buyer pays duties; 14-day returns with 20% restocking and non-refundable shipping; Partsouq's own 90-day warranty (no Toyota warranty) | Retail checkout, no account terms published |
| US tariff | Japan-origin auto parts: 15% total under the Section 232 Japan arrangement (Federal Register, Sept 2025) | n/a |

### Unknown (must come from the supplier)
Wholesale price or percentage off MSRP, minimum order, drop-ship and blind-ship, handling fee,
freight rates, returns and restocking, warranty pass-through, inventory feed, image rights, and
chargeback responsibility, for **every** channel. No wholesale price was obtained. **Retail prices
and Partsouq's public export prices are not supplier quotes.**

### Prepared (not sent)
`supplier-inquiries.md` updates the earlier letters with exact part numbers: batch 7 parts, the
Land Cruiser candidates (47050-60043, 48910-60012, 88320-6A320, 36100-60B02) and the 4Runner,
Sienna and Camry candidates. Contact routes are in `../profitability/supplier-acquisition-package.md`.
Sending requires the owner's name, phone, email and permit number.

## 3. Batch 7 profitability (UNVERIFIED: no acquisition cost)

Customer pays the list price less 5% (single item). Fee: PayPal 3.49% + $0.49, the dearest
method offered. "Today" uses the $199 multibox charge the storefront applies to these five.
"Parcel fix" uses the parcel table (free under $1,000; $100 for $1,000-1,999).

| ID | Part | Lowest US retail | MSRP | Our price | Customer pays | Net receipts today | Net receipts after parcel fix |
|---|---|---|---|---|---|---|---|
| 4471 | 44200-60170 rack | $728.28 | $1,086.99 | $691.89 | $657.30 | $825.93 | $633.87 |
| 4472 | 48007-60023 KDSS cylinder | $1,805.62 | $2,694.95 | $1,715.39 | $1,629.62 | $1,764.31 | $1,668.77 |
| 4473 | 48910-60021 air compressor | $1,710.50 | $2,686.80 | $1,624.99 | $1,543.74 | $1,681.43 | $1,585.88 |
| 4474 | 49141-60010 front accumulator | $844.70 | $1,211.24 | $802.49 | $762.37 | $927.33 | $735.27 |
| 4475 | 49151-60010 rear accumulator | $856.88 | $1,279.33 | $814.09 | $773.39 | $937.96 | $745.91 |

Net receipts is the most we can spend on the part plus delivery without losing money.

**Dealer route: profit unverified.** Buying at another dealer's public price always loses money,
because our price is below every dealer's.

**Partsouq route: Estimate only, illustration.** Landed cost = public price + 15% duty + $60
assumed international shipping + estimated US outbound shipping (see section 4). Single item, today's
shipping charge:

| Part | Est. landed cost | Est. gross profit | Margin | After parcel fix |
|---|---|---|---|---|
| 48007-60023 | $1,333.39 | $430.92 | 26.4% | $335.38 (20.6%) |
| 48910-60021 | $1,230.25 | $451.18 | 29.2% | $355.63 (23.0%) |
| 49141-60010 | $544.80 | $382.53 | 50.2% | $190.47 (25.0%) |
| 49151-60010 | $679.13 | $258.83 | 33.5% | $66.78 (8.6%) |
| 44200-60170 | not listed | unverified | | |

Caveats, all unresolved:
- Partsouq parts carry no Toyota warranty.
- Returns cost a 20% restock fee plus both shipping legs.
- Ship time is international, so the listings would need to show a longer lead time.
- International shipping cost is assumed, not quoted.

This route is **not recommended** until the owner decides to accept those terms. It is shown only
as evidence that wholesale costs well below US retail exist.

Alternatives in the market:

| Part | Alternatives seen |
|---|---|
| 48910-60021 | Arnott P-3192 aftermarket compressor, $1,140-$1,318 |
| Accumulators | Aftermarket sphere set ~$800 for four; used genuine sets $550-$650 |
| 44200-60170 | No reman price found |
| 48007-60023 | No reman or used price found |

**Decision for the owner:** keep batch 7 unpublished until a supplier cost exists. Accumulators and
the KDSS cylinder show the most headroom; the rack has the least.

## 4. Shipping research

### Confirmed
- **UPS 2026 Additional Handling:** longest side > 48 in, second side > 30 in, length + girth
  > 105 in, or > 10,368 in³. Surcharge roughly $30-40.
- **UPS Large Package:** > 17,280 in³ or > 110 lb, with a 90 lb billable minimum.
- **UPS dimensional weight:** divisor 139 (daily rates).
- **LTL:** auto parts typically ship as class 65. Published guides put the base at about $150-450,
  liftgate at $50-150 and residential delivery at $50-200.

### Estimate: US outbound per part type, parcel, retail rates, no carrier account
| Part type | Example | Est. parcel cost | Note |
|---|---|---|---|
| AHC accumulator, sphere | 49141/49151-60010 | $20-35 | small carton, ~2.5 kg |
| Air compressor | 48910-60021 | $25-45 | ~3.4 kg |
| KDSS cylinder | 48007-60023 | $35-70 | bulky with lines; dimensional weight |
| Steering rack | 44200-60170 / 44200-35094 | $70-110 | > 48 in: Additional Handling |
| Booster with master cylinder | 47050-600xx | $35-60 | dense, mid-size carton |
| Transfer case | 36100-6D401 / 60B02 | $90-160 parcel or $300-650 LTL | ~35-45 kg; Large Package / LTL |
| Transmission or engine | | $350-700 LTL with residential delivery and liftgate | always freight |

### Profit impact
All five batch 7 parts are classed multibox, so customers pay $199. That is more than any parcel
estimate above, so today the charge *adds* margin. The prepared parcel fix
(`../profitability/shipping-label-fix.patch`) would cut net receipts by $96-$192 per order and turn
the rear accumulator nearly break-even on the Partsouq illustration.

Recommendation for approval, not applied: before the fix ships, set a separate "oversize parcel"
treatment for racks (> 48 in) and keep freight only for transfer cases, transmissions and engines.
Any change to Merchant shipping labels needs the owner's sign-off.

## 5. Discount recommendation (no code changed)

Today's rule, confirmed in `lib/inventory/discounts.ts`:
- 5% on every order.
- 10% on the whole subtotal once total quantity reaches 2. Two of the *same* part qualifies.

Quantified on batch 7 carts (`discount-options.csv`):

| Cart | Today | R1: 5% only | R2: +5% for 2+ distinct parts ≥$100, extra capped at $75 | R3: 5% capped at $75 |
|---|---|---|---|---|
| Accumulator pair (4474 + 4475), $1,616.58 | $161.66 | $80.83 | $155.83 | $75.00 |
| Two of the same accumulator, $1,604.98 | $160.50 | $80.25 | $80.25 | $75.00 |
| Compressor + KDSS cylinder, $3,340.38 | $334.04 | $167.02 | $242.02 | $75.00 |
| Rack + $30 add-on, $721.89 | $72.19 | $36.09 | $36.09 | $36.09 |

**Recommended: R2.**
- The "5% off every order" message stays.
- The multi-item reward goes only to genuine multi-part repairs, such as front and rear
  accumulators together, and is capped at $75.
- It stops a $30 add-on, or a duplicate quantity, from unlocking 10% on an expensive part.
- On the compressor + KDSS cart it saves $92 against today.

R1 is the simplest and safest alternative.

**Never** restore the old 15% discount. Implementing any option needs the owner's approval and a
checkout test pass; no checkout code was touched.

## 6. Land Cruiser / Prado discovery this phase

- **47050-60041** brake booster with master cylinder, LC 1999-2001 4.7L (shares LX470).
  - Toyota catalog photo found.
  - Two US prices: AutoPartsPrime $1,370.71 and LexusPartsNow $1,458.23 (unavailable). The
    ToyotaPartsDeal page shows no price.
  - Status: **RESEARCH REQUIRED** (needs a third US price). Not imported.
- **47050-60010** (TPD $1,336.77; Sparks $1,376.77, fitment conflicting) and **47050-60012**
  (Longo $1,568.05; TPD $1,346.81): fitment years conflict between sellers. RESEARCH REQUIRED.
- **48910-60012** AHC pump: still two US prices. RESEARCH REQUIRED.

No new product met every requirement (≥$500, 3+ US prices, Toyota photo, verified US fitment), so
**no batch 8 was built**. Importing anyway would break the "only import qualifying products" rule.

## 7. Lexus compatibility (ledger only)

There is no change from Phase 2 (`../land-cruiser/README.md`). Added this phase:
- 47050-60041 is listed for LX470 1999-2001 by LexusPartsNow (one Lexus source).

Not on the storefront: the validator accepts US Toyota models only. GX550, LX600 and the
Land Cruiser 250 (US 2024+) were checked for shared high-value numbers with US Toyota models. Only
the V35A turbo family (already live as 17201-F4011 for Tundra/Sequoia) is shared, so there is
nothing new to record.

## 8. Photography

- All four Toyota image paths are now in the probe, the fetch script and the importer.
- **Caution (2026-11-20):** the `/img/<ND>/<PN>_n.webp` path returned an A/C compressor photo for
  transfer case 36100-0C020. A "photo found" result from the probe is not a match: check every
  image by eye before import.
- 41 part numbers earlier marked "no photo" do have Toyota photos (`photo-corrections.csv`). Some
  rejections in older reports were therefore wrong.
- Authorized supplier photography: no supplier has granted image rights. The inquiry letters ask
  for them in writing.
- No fabricated or AI images were used.

Correction: `../toyota-expansion-batch-6-status.md` lists 16400-F4010 as rejected for photos, but
it has been live as ID 4314 since batch 3 (annotated there).

## 9. Blockers (owner action)

1. Send the supplier inquiries and open at least one dealer wholesale account. Without a cost,
   nothing can move to "commercially ready".
2. Decide on the discount rule (R2 recommended) and the oversize-parcel shipping treatment.
3. Approve or hold batch 7 publication. It stays unmerged until then.
