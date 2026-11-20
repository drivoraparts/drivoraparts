# Toyota catalog: profitability audit and high-value sourcing plan (2026-11-19)

First deliverable for the "High-Value Toyota Catalog & Profitability Expansion" brief.
Nothing in this folder is imported, merged or deployed.

Files:
- `live-toyota-listings-audit.csv`: every one of the 167 live genuine Toyota listings (IDs 4304-4470)
  with price, lowest US retail reference, MSRP, the storefront's real shipping label (read from
  `classifyProductShipping`), the automatic checkout discount, the payment fee and the most we could
  pay for the part, delivered, without losing money.
- `high-value-candidates-ledger.csv`: researched high-value candidates (transfer cases, steering,
  hybrid batteries, ABS, reman transmissions, engine block, inverter, steering column) with retail
  references, the same break-even maths and their status.

## 1. Bottom line

- **No product can be VERIFIED / READY today.** Not one supplier cost exists, so gross profit cannot
  be calculated for anything, new or already live. Every candidate is SOURCING REQUIRED at best.
- **Buying from other dealer websites to fill orders loses money.** On 130 of the 167 live listings,
  what we keep after the 5% checkout discount and payment fees is below the cheapest public US retail
  price. The other 37 only look positive because the storefront charges a flat $199 freight/multibox
  fee, which real outbound freight would consume.
- **The deciding number is the wholesale cost.** Median break-even for the live catalog is a landed
  cost (part + shipping to the customer) of **59.6% of MSRP**. The cheapest public dealer price is a
  median **67.7% of MSRP**. A product is only profitable if a supplier sells it to us, delivered,
  for well under ~60% of MSRP.
- **The next step is commercial, not research:** open one Toyota dealer wholesale account and the
  LKQ drop-ship partnership (section 4). With real costs, the candidates below can be promoted or
  rejected within a day.

## 2. Profit maths used

```
selling price          = lowest verified US retail x 0.95   (current rule)
customer pays          = selling price x 0.95                (automatic 5% checkout discount; 10% for 2+ items)
shipping charged       = $0 parcel under $1,000; $100-$250 parcel above; $199 flat freight/multibox
payment fee            = 3.49% + $0.49 of (paid + shipping)  (PayPal Checkout, the dearest offered method;
                         Cash App for Business ~2.75%, NOWPayments 0.5%)
net receipts           = customer pays + shipping charged - payment fee
gross profit           = net receipts - supplier cost - outbound shipping - returns/warranty reserve
gross margin           = gross profit / customer pays
max landed cost        = net receipts  (break-even before returns reserve)
```

Payment-fee sources: [PayPal US merchant fees](https://www.paypal.com/us/webapps/mpp/merchant-fees),
[Cash App for Business fees](https://cash.app/help/6521-cash-app-for-business-fees),
[NOWPayments fees](https://nowpayments.io/help/about-nowpayments/about/what-are-your-fees).

The 5%-below-retail rule and the automatic 5% checkout discount **stack**: the customer pays about
9.75% under the lowest dealer price. On a $3,000 part that is ~$300 of margin given away twice over.
Recommendation for owner decision: for high-value parts, price at the lowest verified retail price
(the checkout discount still makes us the cheapest), or exclude items over $1,000 from the checkout
discount. No pricing or checkout code was changed.

## 3. Audit of the 167 live listings

| Price tier | Listings |
|---|---|
| under $200 | 97 (71 under $100) |
| $200-499 | 41 |
| $500-999 | 21 |
| $1,000-2,499 | 7 |
| $2,500+ | 1 (17201-F4011 turbocharger, $2,694.09) |

| Category | Listings |
|---|---|
| brakes | 83 |
| engine (incl. cooling/fuel) | 40 |
| lighting | 19 |
| suspension/steering | 8 |
| wheels-tires | 8 |
| body-parts | 5 |
| electronics | 2 |
| transmission | 1 |
| turbocharger | 1 |

Findings:
1. **58% of the catalog is under $200** (batches 1-4 used a $25 floor). Median net receipts for the
   71 listings under $100 is $62.86 with free shipping: after a supplier cost and a parcel label these
   are unlikely to make money. They are kept as instructed; suggest reviewing them once costs exist.
2. **$199 shipping on cheap parts.** 18 listings priced under $300 pay the flat $199 freight/multibox
   fee. Some are bulky (radiators), but several are small parts the category rule misclassifies:
   4383 thermostat housing ($27.29), 4384 and 4382 thermostat kits ($33.09, $46.19), 4405 tie rod end
   ($54.49), 4381 engine mount ($101.49), 4467/4469 RAV4 mirrors. Customers see $199 shipping on a $30 part.
   Fix (needs approval, it changes Merchant shipping labels): add these part types to the
   small-component list in `lib/shipping/rate-table.ts`. Rates themselves are not touched.
3. **The missing systems are the valuable ones:** transmission (1 listing), electronics (2), steering
   and suspension (8), no hybrid, no ABS, no transfer cases, no engine internals.
4. **Correction to the batch 6 status file:** it lists 16400-F4010 (Tundra radiator) as REJECTED for
   image quality; that part has been live since batch 3 as ID 4314 and is unchanged.

## 4. Supplier findings

| Supplier / channel | What it supplies | Can it fulfil our orders? | What the owner must do |
|---|---|---|---|
| Toyota dealer wholesale / business accounts (Toyota Wholesale Parts site, MyPARTS, TPCO; dealer "wholesale" programs) | All genuine Toyota parts incl. Genuine Reman | Sold to repair shops at dealer-set wholesale pricing; no published discount or reseller/drop-ship terms found | Apply for a business account with resale certificate at 1-2 high-volume online dealers; ask for wholesale price list, drop-ship to end customer, freight terms, returns, and image permission |
| Toyota PDC Direct Fulfillment ([SimplePart FAQ](https://toyotahelp.simplepart.com/help/pdc-direct-fulfillment-faqs)) | Ships dealer orders straight from Toyota parts distribution centers | Only for Toyota dealers under a participation agreement | Ask the wholesale dealer whether it will drop-ship through this program |
| LKQ drop ship ([LKQ drop ship](https://lkqcorp.com/lkq-global_about-us/north-america/drop-ship/)) | Recycled and remanufactured engines, transmissions, transfer cases, axles; aftermarket | Yes: partner program for online stores, no setup/monthly fee, flat-rate shipping, 20 US DCs, same-day ship before 3 pm; 6-month parts warranty on recycled units | Apply as drop-ship partner; get cost file, shipping file, warranty/returns, image rights. Recycled parts must be listed as used, never as new genuine |
| JASPER Engines & Transmissions | Remanufactured Toyota engines and transmissions (e.g. 1GR-FE, A750E/F) | Sells to installers; core and skid charge billed at sale; 3-yr/100,000-mile parts and labor warranty per Jasper | Call 800-827-7455 about a reseller/installer account; Jasper's warranty may require approved installation |
| Cardone, Dorman (via warehouse distributors) | Reman steering racks; reman hybrid batteries (older Camry/Avalon) | Through distributor accounts; terms not public | Optional later: aftermarket range, clearly labelled non-genuine |

No supplier relationship exists, and none is claimed.

## 5. High-value candidates (all SOURCING REQUIRED or REVIEW REQUIRED)

Selling price = lowest retail x 0.95. "Max landed cost" is what we could pay for the part delivered
to the customer and still break even (includes the $199 freight fee as revenue where it applies).

| Status | Part no. | Product | Fits | US retail refs (lowest) | Est. selling price | Max landed cost (% MSRP) |
|---|---|---|---|---|---|---|
| SOURCING REQUIRED | 36100-6D401 | Transfer case | 4Runner 4.0L (years to confirm) | 3 ($2,795.73) | $2,655.94 | $2,626.65 (72.4%) |
| SOURCING REQUIRED | 44200-35094 | Steering rack | 4Runner 2010-2024 | 4 ($742.50) | $705.38 | $646.23 (57.0%) |
| SOURCING REQUIRED | G9510-45010 | Hybrid battery | Sienna 2021-early 2024 | 3 ($3,932.01) | $3,735.41 | $3,616.36 (72.3%) |
| REVIEW REQUIRED | 36100-04010 | Transfer case | Tacoma 2024-2025 | 2 ($2,203.67) | $2,093.49 | $2,110.98 (75.2%) |
| REVIEW REQUIRED | G9510-33121 | Hybrid battery | RAV4 hybrid (years to confirm) | 2 ($2,652.91) | $2,520.26 | $2,502.26 (74.3%) |
| REVIEW REQUIRED | 44050-04220 | ABS actuator | Tacoma 2016-2023 (config.) | 2 ($812.34) | $771.72 | $707.05 (58.7%) |
| REVIEW REQUIRED | G9510-45021 | Hybrid battery | Sienna 2024+ | 2 ($6,355.04) | $6,037.29 | $5,726.83 (55.0%) |
| REVIEW REQUIRED | 30510-0R010-84 | Genuine Reman transaxle | RAV4 2013-2018 | 1 ($3,291.95 + $1,000 core) | $3,127.35 | $3,058.86 (76.3%) |
| REVIEW REQUIRED | 11401-80862 | Cylinder block 2GR-FKS | Tacoma 3.5L | 1 ($3,820.07) | $3,629.07 | $3,518.86 (86.0%) |
| REVIEW REQUIRED | G9200-33101 | Hybrid inverter | Camry hybrid 2007-2013 | 2 ($5,390.88) | $5,121.34 | $4,839.75 |
| REVIEW REQUIRED | 45250-07180 | Steering column (no motor) | RAV4 (build-plant split) | 2 ($915.59) | $869.81 | $796.99 (57.0%) |

Where profit is most likely: freight-class drivetrain and hybrid assemblies leave room up to ~72-76%
of MSRP, i.e. a supplier discount of ~25% off MSRP would already clear break-even before freight.
Parcel-class parts (racks, ABS, columns) need a supplier cost under ~57% of MSRP, the same squeeze as
the existing catalog. Hybrid batteries add Class 9 hazmat freight and core returns; reman units add
core charges ($1,000 on the RAV4 transaxle) that must be passed to the customer.

Images: Toyota publishes catalog photos for only one of these (36100-04010). The rest need supplier
images with written reuse permission, which should be requested with each account.

## 6. Proposed next batch: for owner approval

There is **no VERIFIED / READY batch** to import: publishing any of the above now would list products
whose profit and fulfilment are unknown, which the brief forbids.

Approval requested for:
1. **Owner action:** apply for a Toyota dealer wholesale/business account (ask for drop-ship, freight,
   returns and image rights) and for the LKQ drop-ship partner program. I cannot open accounts or accept
   terms.
2. **Batch 7 (on receipt of costs):** the 3 SOURCING REQUIRED products above, plus any REVIEW item that
   gains a third price, each priced from real cost with the margin shown, imported only after your
   sign-off.
3. **Optional fixes needing your approval:** the shipping-label correction for small parts (section 3) and
   the pricing/discount stacking decision (section 2).
