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

### Progress log (2026-11-22)

**Toyota photo host sweep.** Letter-suffix part numbers (A-Z without I/O/Q, digit, ending 0/1) for
41110-60, 36100-60, 44200-60, 52119-60, 81070-60, 81140-60, 81550-60, 81560-60 and 67005-60: 4,140
numbers, plus 48 numbers probed one by one. Results:
- **67005-60B01 and 67005-60E00 (back door panels):** have photos, but neither is listable. 60B01 has
  one sold-out $38.99 eBay page and points to the Land Cruiser 70 (non-US); 60E00 has no price or fitment.
- **37110-60B00 (rear propeller shaft):** has a photo. Rejected: lowest US price $444.77, below $500.
- **48007-60023 (KDSS front cylinder):** has photos, but it is already listed as 4472 (no duplicate made).
- **81110-60P70 (LC70 headlamp):** non-US and about $20. Rejected.

The sweep was stopped after these 9 families: 2 photos in about 4,100 numbers, neither usable. The
remaining families (53811-60, 89661-60, 83800-60, 48810-60, 19000-38) were not scanned.

**Other photo sources tried.**
- ToyotaPartsDeal and ToyotaPartsNow refuse automated requests (403). Not bypassed.
- OEMGenuineParts, Amazon, eBay, PartSouq, Amayama, Megazip and parts.toyota.com are outside the
  network allowlist. Dealer RevolutionParts stores were 403 before.
- Manufacturer sites for the aftermarket listings were added to the allowlist with owner-session
  approval: addictivedesertdesigns.com and bilstein.com.

**Image fixes.**
- **1996 ADD Stealth Fighter front bumper (Tacoma 2016+): FIXED.** Six manufacturer photos of this
  bumper replace the Ironman bull bar photos. Source: addictivedesertdesigns.com, F681202200103.
  Provenance is in `lib/inventory/data/image-provenance.json`.
- **1859 Bilstein 6112 front kit (Tacoma): unresolved.** The kit is 47-309975, but Bilstein's US site
  redirects product URLs to its homepage, so there is no product page to take a photo from.
- **2003 DV8, 2006 Fab Fours, 2012 Rough Country, 1861 Bilstein B8 8100: unresolved.** Each listing
  name covers several SKUs that look different (with or without a guard, winch mount, KDSS or not).
  The exact SKU is needed.
- **2023 Rocket Bunny, 2015 Duraflex GT Concept, 2021 Liberty Walk: unresolved.** The manufacturer
  sites are outside the allowlist, and an exact SKU match is not established.
- **Placeholders 1946, 1952, 1954 (Toyota transmissions): unresolved.** Only used units, or other
  part numbers, have photos online.

**Candidate Land Cruiser parts blocked by photographs alone** (price and fitment known, no legitimate photo):

| Part no. | Part | Fits | US price seen |
|---|---|---|---|
| 41110-60C50 | Front differential carrier | Land Cruiser 2016-2021 | $1,383 |
| 48876-60022 | KDSS front cylinder | Land Cruiser 200 | $895 |
| 67002-60631 | Front door shell, left | Land Cruiser 2008-2011 | $644 |
| 83800-60G50 | Instrument cluster | Land Cruiser 2009 | $1,243 |
| 81140-60N50 | Headlamp, right | Land Cruiser 2020-2021 | $1,284 |
| 67005-60K21 | Back door panel | Land Cruiser 2017-2021 | $648 |
| 41110-60A91 | Rear differential carrier | Land Cruiser 1998-2002 | $2,688 |

Plus the six listed in `phase7/README.md`.

**Sweep completed (2026-11-22, after #135).** The remaining families were checked and none has a
Toyota photo:
- 53811-60 fenders, 89661-60 engine ECUs, 83800-60 instrument clusters and 48810-60 KDSS/stabilizer
  links: 460 letter-suffix numbers each.
- 19000-38000 to 19000-38400: 3UR-FE engine assemblies.

Total swept: about 6,380 part numbers. Two have photos (back door panels 67005-60B01 and 60E00), and
neither is listable. Toyota's own photo host is exhausted as a source for these Land Cruiser
assemblies. Remaining routes: supplier photographs, or a manufacturer or retailer site that serves
exact-part photos and allows automated download.

### Batch 16 (2026-11-22): roof rack photo block cleared
Toyota's accessory image host also serves photos under exact part numbers that the toyota.com
accessory cards do not use. Probing those turned up:

| Part no. | Result |
|---|---|
| **PT970-60241** roof rack | Photo of the rack alone, filed under its own part number. **Imported as 4487, $1,029.39**: 5% under Smithtown $1,083.50, with Greensburg $1,093.35, OEMGenuineParts $1,103.20, ToyotaPartsDeal $1,113.05 and Olathe $1,190.00. |
| PT228-35247 transfer case skid plate | Exact-number photo now exists, but US prices are about $256-$325, below the $500 floor. |
| PTR03-60243 TRD tail pipe | Photo exists; about $419, below $500. |
| PTR03-60240 TRD center pipe | About $700-$775, but no photo under this number (403). Held. |
