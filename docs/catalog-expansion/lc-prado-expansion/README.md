# Land Cruiser & Prado catalog expansion: audit and progress (2026-11-22)

This is the owner's "Toyota Land Cruiser & Prado Catalog Expansion" brief. It continues earlier work (batches 7-15,
`docs/catalog-expansion/phase5/`, `phase7/`, `image-audit/`), so nothing restarts from scratch.

## Scope decisions, against standing owner instructions
- **US-only store.** The owner instructed on 2026-11-22 that DrivoraParts sells only in the US, and the
  89 non-US-model listings were hidden (#133). The Prado 120/150 and the Land Cruiser 300 are not US
  models. Prado-platform parts are researched only where Toyota's US catalog fits them to a US model
  (Land Cruiser 100/200, 4Runner, FJ Cruiser), and they are listed with that US fitment only.
  Parts that fit only non-US vehicles are recorded as HOLD.
  - The international fitment pathway (`scripts/check-international-fitment.mjs`) is still an
    untested prototype and is not wired into the pipeline, so it is not used.
- **Prado 250 = US Land Cruiser 250.** Parts for the 2024+ Land Cruiser are covered under the US model name.
- **$500 floor** for every newly researched product in this brief: a final listed price of at least $500.
  Existing listings keep the sitewide $200 minimum.
- **Photo rule:** only Toyota's own catalog or accessory photos of the exact part number are used. Dealer
  parts sites (RevolutionParts) refuse automated requests (403) or are outside the network allowlist. Used
  or dismantler photos are not used for new genuine listings.

## Phase 1: existing catalog audit (visible storefront, 316 products)

### Land Cruiser listings that exist now (85 visible)
| Area | Genuine Toyota | Aftermarket (other brands) |
|---|---|---|
| Steering | 44200-60170 rack, LC200 2008-2021 (4471) | - |
| Suspension, AHC | 49141-60010 / 49151-60010 accumulators, LC100 2006-2007 (4474, 4475) | 56 kits and shocks (OME, ICON, King, Dobinsons, Bilstein...) |
| Brakes | 47050-60010 / 47050-60042 boosters, LC100 1998-2002 (4479, 4480) | - |
| Cooling | 16400-50384 radiator, LC200 2010-2021 (4485) | - |
| Body | 53301-60690 hood, LC200 2016-2021 (4486) | 7 bumpers |
| Transmission | 35000-0W010 AB60F, LC200 2008-2016 (1954, placeholder photo) | - |
| Accessories (LC250) | PT925-60240 drop steps, PT228-60241 rock rail, PT228-60242 skid plate, PT944-60240 door sills (4481-4484) | 8 |
| Engine | - | 2 |

Related US-platform genuine parts that are already listed (not Land Cruiser): KDSS rear cylinder 48886-60032
(4Runner, 4478), steering knuckle 43211-60200 (4Runner/FJ, 4422).

### Missing categories and high-value assemblies (Land Cruiser 80/100/200/250)
- **Missing entirely:** genuine complete engines (1FZ-FE, 2UZ-FE, 3UR-FE, T24A-FTS) and engine assemblies;
  transfer cases; front and rear differential carriers; axle housings; propeller shafts; KDSS
  assemblies for the Land Cruiser; front bumper assemblies; doors and back doors; fenders; seats;
  rear-seat entertainment; instrument clusters; ECUs; harnesses; headlamp and tail lamp assemblies.
- **Researched before and blocked only by photographs:** see `phase7/README.md`
  (41110-60B81 differential, 36100-60B02 transfer case, 47050-60043 booster, 88320-6A320 compressor,
  87940-6A570 camera mirror, PT970-60241 roof rack).

### Products with incorrect categorisation
- Steering racks and knuckles (4422, 4425-4427, 4430, 4471) use the Suspension category, by convention.
  The storefront's Steering section matched only steering boxes, pumps and linkage, so racks and knuckles
  never appeared there. **Fixed in this batch:** the Steering section now also matches "rack and pinion",
  "steering rack" and "steering knuckle".
- No other mismatches were found among the 98 Toyota-brand listings.
  - The 1UZ-FE swap package (2115) is filed under Engine and includes a transmission, which is correct.
  - Sienna door motors (4463/4464) are filed under Electronics, which is correct.

### Products with insufficient or defective photographs (still visible)
- **Placeholder graphic (3):** transmissions 1946 (35000-WAA10, Supra), 1952 (33030-35A22, Tacoma) and
  1954 (35000-0W010, Land Cruiser). Searched again on 2026-11-22: only used units, or other part numbers.
  A supplier photo is needed.
- **Another product's photos (9):** 1996 ADD, 2003 DV8, 2006 Fab Fours, 2012 Rough Country (Tacoma
  bumpers), 2023 Rocket Bunny (GR86), 2015 Duraflex, 2021 Liberty Walk (Supra), 1859 Bilstein 6112
  (Tacoma), 1861 Bilstein B8 8100 (4Runner).
  - These listings name no manufacturer SKU, and each name covers several variants, so the exact
    photo cannot be matched. They need the SKU from the supplier, or the owner's decision to hide them.
  - 13 of the 22 listings flagged in the image audit were hidden with the non-US models (#133), leaving these 9.
- **Retailer watermark (1):** 1961 GR86 transmission (LIMIT+1 photos, used on the owner's instruction).
- **Only one photo (13 Toyota listings):** acceptable where it is Toyota's only photo of the part.

### Incomplete fitment
- Aftermarket listings state fitment in the description only (for example "Toyota Tacoma 2016+"), with no
  structured years, engines or SKUs. Genuine Toyota imports carry structured, sourced fitment.

## Progress log
See the batch sections below, which are added as work proceeds.
