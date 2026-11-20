# Non-US fitment: findings and proposed pathway (design only; nothing implemented)

## How the catalog checks fitment today

`scripts/check-toyota-expansion.mjs` rejects any fitment application whose model is not in
`US_MODELS`. It runs inside `npm run audit:storefront-claims`, so a Hilux, Prado, Land Cruiser 70 or
Land Cruiser 300 application fails the build pipeline. Service kits are checked the same way.
Nothing bypasses this, and this phase changed nothing.

## Findings that shape the answer

1. **Most "non-US" platforms share parts with US-market Lexus and Toyota models.**

   | Non-US platform | US-market twin | Shared heavy parts |
   |---|---|---|
   | Prado 120 (2002-2009) | Lexus GX470; 4th-gen 4Runner | Chassis, air suspension (e.g. 48910-60021, live ID 4473), KDSS, brakes |
   | Prado 150 (2009-2023) | Lexus GX460; 5th-gen 4Runner | Chassis, KDSS, suspension, steering |
   | Land Cruiser 300 (2021+) | Lexus LX600; Tundra/Sequoia V35A | Engine family; turbo 17201-F4011 (live ID 4445) |
   | Prado 250 | US Land Cruiser (2024+) | The same vehicle: already a US model |

   Supporting Lexus GX/LX fitment covers most genuine Prado and LC300 demand **without leaving the
   US market**. It also needs no foreign evidence: Lexus dealer catalogs are US sources.

2. **US demand for genuinely non-US vehicles is limited by import law.** Vehicles not built to US
   standards can be registered here only once they are 25 years old.
   - Eligible today: Land Cruiser 70 series built up to about 2001, 80 series diesels (HDJ80,
     HZJ80), early Hilux and Hilux Surf, Prado 70/90.
   - Not eligible: modern Hilux, Prado 150, LC70 with 1VD-FTV, LC300.

   The US buyers of those modern parts are very few, and the store ships only within the US.

3. **There is no US retail market to price against.**
   - Genuine prices for 1VD-FTV and 1GD-FTV parts appear only from Australian dealers (for example
     Nunawading Toyota, A$670.42 for an injector) and exporters (Partsouq).
   - US listings for those part numbers are aftermarket. The 1GD-FTV turbo 17201-11120, for
     example, sells for $509.99-$760.
   - The commercial rules need three US retail prices, so these items cannot be priced under the
     current rules either.

## Recommendation

**Two separate steps, in this order. Both need your approval before any code change.**

**Step A: Lexus US-market fitment (recommended first).**
- Add a `US_LEXUS_MODELS` set: GX470, GX460, GX550, LX470, LX570, LX600.
- Accept those models only with a Lexus dealer catalog source (`dealer_catalog` evidence from a
  Lexus store), the same as Toyota.
- The storefront already renders free-text fitment, so the listing would read, for example,
  "2003-2009 Lexus GX470".
- Ledger entries ready to use: 36100-60B02 and 88320-6A320 (LX570), 47050-60043 and 49151-60010
  (LX470).
- Risk is low: every application stays US-market and dealer-verified.

**Step B: verified international pathway, only for import-eligible vehicles.**

Design:
- New field `internationalFitmentApplications`, separate from `fitmentApplications`, so US checks
  are untouched.
- Each entry needs:
  - `market` (e.g. Australia, Japan, General);
  - the Toyota **frame code** (e.g. HZJ75, HDJ80, FZJ80, LN106);
  - production date range;
  - an evidence URL from a Toyota EPC for that market.
- Validator rules:
  - model in an `INTL_MODELS` set: Land Cruiser 70, Land Cruiser 80 (non-US engines), Hilux,
    Hilux Surf, Prado 70/90;
  - **build year at least 25 years before the listing date**;
  - the description must say "For vehicles originally built for markets outside the United States;
    confirm by frame code and VIN".
- Storefront:
  - show the frame code next to the model;
  - keep these listings out of Google's US vehicle-compatibility attributes;
  - exclude them from US model filters.
- Pricing: no three-US-price rule can be met. Pricing would need a separate rule based on landed
  cost (exporter price + duty + freight) plus margin, which you would have to set.

**Not recommended:** fitment for modern Hilux, Prado 150 or LC300 as stand-alone international
models. US demand is small, the vehicles cannot be registered here, and no US price exists to
check against.
