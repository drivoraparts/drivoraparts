# Next-steps report: supply chain, pricing and shipping (2026-11-19)

Nothing in this report changes the live site. No pricing, shipping, checkout, payment or catalog
change was made, merged or deployed. Files:

- `supplier-acquisition-package.md`: dealers and LKQ to approach, requirements, questions,
  ready-to-send inquiry letters, reply scorecard.
- `pricing-scenarios.csv`, `pricing-worked-examples.csv`: the pricing maths below.
- `shipping-misclassified.csv`, `shipping-label-fix.patch`: the 40 listings wrongly charged $199
  and a tested fix (not applied).
- `commercial-pipeline.csv`: candidates by stage.

## 1. Commercial pipeline

| Stage | Meaning | Products now |
|---|---|---|
| 3. Commercially ready | Confirmed fulfilment and positive expected profit | **0** |
| 2. Supplier verified | Verified supplier and actual acquisition cost | **0** (no account yet) |
| 1. Fitment + retail verified | Exact part, verified fitment, 3+ US retail prices | 4 new high-value candidates + the 167 live listings |
| 0. Review | Missing a price, fitment conflict or one-seller evidence | 12 |

Stage 1 high-value candidates:

| Part no. | Product | Fits | Lowest of 3+ US prices | Used / reman market |
|---|---|---|---|---|
| 36100-6D401 | Transfer case | 4Runner 2017-2024 4.0L (2010-2016 to confirm) | $2,795.73 | Reman ~$1,365; used $835-$1,543 |
| 44200-35094 | Steering rack | 4Runner 2010-2024 | $742.50 | not checked |
| G9510-45010 | Hybrid battery | Sienna 2021-early 2024 | $3,932.01 | not checked |
| G9510-33112 | Hybrid battery (new this round) | Camry hybrid 2018-2024 | $2,591.58 (+$1,350 core) | Dorman reman covers 2012-2018 only |

Changes this round:
- **36100-04010** is listed by Modern Toyota as the 2024+ Tacoma **manual-transmission** transfer
  case; the automatic 2016-2023 unit is 36110-04030 (one seller, $3,305.51). Kept in review.
- **44050-04220** is configuration-specific: dealer pages give 44050-04240 (2016-17) and
  44050-04280 (2018-23) for the 3.5L 127-inch-wheelbase Tacoma. Kept in review until the dealer
  EPC decodes which trucks take 04220.
- **G9510-33121** belongs mainly to the 2020-2022 RAV4 hybrid; Camry hybrids use G9510-33112.
- New review items: Tundra transfer cases 36100-0C020 (2 prices) and 36100-0C040 (2022+
  non-TRD Pro, 1 price), RAV4 rack 45510-42230 (2006-2016, 2 prices).

Market note: for the 4Runner transfer case, remanufactured and used units sell at roughly half
the genuine new price. Genuine new will sell mainly to buyers who insist on new. LKQ's recycled
and reman powertrain may be the larger profit opportunity for this product type, once its partner
costs are known.

## 2. Pricing scenarios

Customer price relative to the cheapest verified US dealer, and the most we could pay for the
part delivered to the customer (median, % of MSRP) at break-even and at a 20% gross margin.
Includes PayPal's 3.49% + $0.49 (the dearest offered method) and the storefront's real shipping
charge. Live listings plus the researched candidates.

| Tier | Scenario | Customer pays vs cheapest dealer | Break-even cost (% MSRP) | Cost for 20% margin (% MSRP) |
|---|---|---|---|---|
| Under $1,000 (160) | S0 now: 5% under + 5% checkout | -9.75% | 59.6 | 47.2 |
| | S1 5% under, no checkout discount | -5.0% | 62.7 | 49.7 |
| | S2 at dealer price + 5% checkout | -5.0% | 62.7 | 49.7 |
| | S3 3% under, no checkout discount | -3.0% | 64.1 | 50.7 |
| | S4 at dealer price, no discount | 0.0% | 66.0 | 52.3 |
| | S0m now, 2+ items (10% off) | -14.5% | 56.4 | 44.7 |
| $1,000-$2,500 (10) | S0 now | -9.75% | 65.0 | 53.0 |
| | S1 / S2 | -5.0% | 68.1 | 55.4 |
| | S3 | -3.0% | 69.3 | 56.4 |
| | S4 | 0.0% | 71.3 | 58.0 |
| | S0m 2+ items | -14.5% | 62.0 | 50.5 |
| Over $2,500 (7) | S0 now | -9.75% | 72.4 | 58.5 |
| | S1 / S2 | -5.0% | 75.9 | 61.3 |
| | S3 | -3.0% | 77.4 | 62.5 |
| | S4 | 0.0% | 79.7 | 64.2 |
| | S0m 2+ items | -14.5% | 68.9 | 55.7 |

Worked example at a **hypothetical** delivered cost of 55% of MSRP (illustration only; no
supplier cost is known):

| Part | S0 now | S1/S2 | S3 | S4 | S0m 2+ items |
|---|---|---|---|---|---|
| 44200-35094 rack ($742.50 dealer) | +$23 (3.4%) | +$57 (8.1%) | +$71 (9.9%) | +$93 (12.5%) | -$11 (-1.7%) |
| 36100-6D401 transfer case | +$631 (25.0%) | +$759 (28.6%) | +$813 (30.0%) | +$894 (32.0%) | +$503 (21.0%) |
| G9510-45010 Sienna battery | +$865 (24.4%) | +$1,045 (28.0%) | +$1,121 (29.4%) | +$1,235 (31.4%) | +$685 (20.4%) |
| 81110-0R162 RAV4 headlamp (live) | -$35 (-5.1%) | $0 (0.0%) | +$15 (2.0%) | +$37 (4.8%) | -$71 (-10.7%) |

Findings:
1. **S1 and S2 give the customer the same price.** S2 (list at the cheapest dealer price, keep the
   automatic 5%) keeps the "5% off every order" message and still undercuts every dealer by 5%,
   and adds about 3 points of margin over today.
2. **Freight-class assemblies (> $2,500) can carry the 5% customer advantage**: break-even is at
   ~76% of MSRP under S2, so a supplier discount of ~25% off MSRP plus freight leaves a real margin.
3. **Parcel parts under $1,000 are thin under any scenario.** A 20% margin needs a delivered cost
   near 50% of MSRP. These should be sold only where the wholesale quote supports it.
4. **The 10% multi-item discount is not sustainable as built.** It applies to the whole cart once
   total quantity is 2, including two of the same item, and it stacks with our 5%-under list
   price: customers pay 14.5% under the cheapest dealer. A $30 add-on takes an extra $150 off a
   $3,000 part. In the worked example it turns the rack and the headlamp into losses.

Recommended for approval (not applied):
- Adopt **S2** for all tiers: list at the lowest verified US retail price; keep the 5% checkout
  discount.
- Replace the 10% multi-item rule with one of: a dollar cap (e.g. maximum $50 per order); 10% only
  on carts of 2+ *different* parts each over $100; or remove it and keep the flat 5%.
- Review prices tier by tier once wholesale quotes arrive; never price a part below its delivered
  cost plus fees.

## 3. Shipping fix (prepared, not applied)

40 genuine Toyota listings have no freight note, so the storefront infers their shipping class
from the category and charges the **$199** freight/multibox rate: 24 as freight (engine,
transmission, body-parts categories) and 16 as multibox (suspension, wheels). All 40 are single
cartons: thermostats, an engine mount, a tie rod end, fan motors, radiators, mirrors, a throttle
body, an A/C condenser, wheels, racks, a knuckle, a hub and a control arm. Full list:
`shipping-misclassified.csv`.

The fix (`shipping-label-fix.patch`) makes the Toyota importer write a freight note on every
genuine listing: "Ships as a single parcel." (or palletized freight for whole engines, transmissions,
hoods and bumper covers when such parts are added). It changes only that field on those 40
listings; prices, IDs and all other data are unchanged. Tested in a separate copy: shipping test
passes (parcel 383 → 423 products, freight 59 → 35, multibox 71 → 55), claims audit and type check
pass.

Effects once deployed:
- **Product page:** shows "Ships as a parcel" and the parcel rate instead of $199.
- **Checkout:** a cart of these parts pays the parcel table: free under $1,000, then $100 /
  $150 / $250 by subtotal. A cart that also contains a real freight item still pays $199.
- **Google Merchant:** `shipping_label` changes from `freight`/`multibox` to `parcel` for these
  40 rows, so Google applies the parcel delivery policy (free under $1,000). Merchant Center's
  delivery settings do not need to change; the feed refresh carries it.
- **Cost to us:** we pay the carrier. Single-carton oversize parcels (radiators, racks, wheels,
  condensers) cost more to ship than a small box. Get carrier or supplier drop-ship rates before
  deploying, and fold them into the delivered cost above.

Not in the patch, for your review: ARB/Safari/TJM snorkels ($210-$410) and two clutch kits are
charged $199 as multibox/freight but are probably parcel-size. They are not genuine Toyota
listings, so they were left alone.

## 4. Decisions needed from you

1. Send the inquiry letters (start with Longo Toyota for local will-call, Modern Toyota and
   Olathe for price, and LKQ) and return the scorecard figures.
2. Approve or adjust the pricing direction (S2 and a new multi-item rule).
3. Approve the shipping-label fix for deployment, after carrier rates are known.

Once any supplier returns costs, I will move the Stage 1 candidates to Stage 2/3 with real margins
and present them as an import batch for your sign-off.
