# Phase 7: Land Cruiser accessories, new photo sources, supplier list (2026-11-22)

Branch `claude/lc-batch-12-accessories`. A PR is open but **not merged or deployed** (owner approval required).

## New photo source
Toyota publishes official accessory photos on toyota.com (accessory cards on
https://www.toyota.com/landcruiser/accessories/, image files on media.ads.vapims.tms.aws.toyota.com,
named by the accessory part number). Toyota's parts-catalog image host has no PT (accessory) photos.
The importer now accepts these photos: `TCOM_SOURCES` in `scripts/import-toyota-genuine-oem.py`
maps each local file to its exact toyota.com image URL, and provenance names toyota.com.
Limits: Toyota serves these at 396 x 220 only, and some show items that are not included.

## Results

| Part no. | Product | Fits | US prices | Photo | Status |
|---|---|---|---|---|---|
| PT925-60240 | Predator Drop Steps, Black (genuine Toyota accessory) | Land Cruiser 2024-2025 | OEMGenuineParts $565.60; Toyota of Nashua $570.65; Olathe $578.00; Longo $656.50 | toyota.com, 2 photos of the steps only | **Imported, ID 4481, $537.39 (branch only)** |
| PT970-60241 | Roof Rack (genuine Toyota accessory) | Land Cruiser 2024-2025 | Smithtown $1,083.50; Greensburg $1,093.35; ToyotaPartsDeal $1,113.05; Sparks $1,132.75; Olathe $1,190.00; Reliable $1,232.00 | toyota.com photo shows the rack loaded with an awning and case that are not included; the other image is the cross bars | **Blocked by photo only** |
| PT228-60241 | Rock Rail, right (sold per side) | Land Cruiser 2024+ | ~$378-$382 | toyota.com | Rejected: under $500 |
| PT228-60242 / PT228-35241 / PT228-35245 | Skid plates | Land Cruiser 2024+ | $345 / under $400 | toyota.com | Rejected: under $500 |
| PTR03-60240 + PTR03-60243 | TRD performance exhaust (two pieces) | Land Cruiser 2024+, 4Runner 2025+ | no single priced kit number | n/a | Hold: two part numbers, no verified US prices |
| 43211/43212-60200, -60240 | Steering knuckles | 4Runner / FJ / Prado platform | $380-$420 | Toyota catalog | Rejected: under $500 |
| 44250-60100 | LC100 steering rack | Land Cruiser 100 | $583.29 / $596.36 / $598.10 | Toyota catalog | Hold: fitment years conflict (2002-2003 vs 2003-2007) |
| 47050-60081 | Brake booster | 4Runner 2003-2005 (Prado 120 platform) | $1,315.62 / $1,344.59 | Toyota catalog | Hold: 2 US prices, years conflict |

## Blocked only by photographs (fully verified otherwise)

| Part no. | Product | Fits | Lowest of 3+ US prices |
|---|---|---|---|
| 41110-60B81 | Front differential carrier | Land Cruiser 2008-2015 | $1,429.36 |
| 36100-60B02 | Transfer case | Land Cruiser 2011-2021 | $2,765.10 |
| 47050-60043 | Brake booster with master cylinder | Land Cruiser 2003-2007 | $1,339.76 |
| 88320-6A320 | A/C compressor | Land Cruiser 2008-2020 | $616.48 |
| 87940-6A570 | Outside mirror with camera, left | Land Cruiser 2024-2025 | $1,047.92 |
| PT970-60241 | Roof rack | Land Cruiser 2024-2025 | $1,083.50 |

Photo sources tried for these: Toyota parts-catalog image host (none), toyota.com (none, or not
representative), US dealer parts sites (Modern, Olathe, Lakeland, oempartsonline: automated
requests refused, 403), Land Cruiser specialist retailers (do not stock these assemblies).
**Supplier photographs are the realistic route.**

## Supplier sourcing list (for when the supplier is reachable)
Request a quote, availability and product photographs (with written permission to use them) for:
41110-60B81, 36100-60B02, 47050-60043, 88320-6A320, 87940-6A570, PT970-60241, and the six
transmission listings still showing a placeholder (35000-WAA10, 33030-35A22, 35000-0K130 x2,
35000-0W010, 35000-60D90). Also quote the live Land Cruiser parts 4471-4481 for cost confirmation.

## Counts
- Newly researched this phase: 13 part numbers.
- Fully verified and imported: 1 (PT925-60240, ID 4481, branch only).
- Blocked only by photographs: 6.
- Rejected: 6 (5 under $500, 1 with Lexus-only US fitment declined by the owner).
- Ready for deployment once approved: 1 (ID 4481).

## Batch 13: $200 floor for Land Cruiser parts (2026-11-22)
The owner lowered the Land Cruiser research floor from $500 to the sitewide $200 minimum.
Same rules otherwise: Toyota fitment only, at least three attributed US prices, price 5% under the
lowest, and a Toyota photo of the exact part.

| ID | Part no. | Product | Fits | US prices (lowest first) | Our price | Photo |
|---|---|---|---|---|---|---|
| 4482 | PT228-60241 | Rock rail, right (passenger) side, sold per side | Land Cruiser 2024-2025 (dealers list to 2026) | ToyotaPartsDeal $376.87; Toyota of Nashua $378.55; Lakeland $392.08 (MSRP $480-$485) | $358.09 | toyota.com, right-side rail on the vehicle |
| 4483 | PT228-60242 | Front skid plate | Land Cruiser 2024-2025 (dealers list to 2026) | Ed Martin $313.50; SparksParts $339.25; Frontier $360.25 (also Elmhurst $336.30; MSRP $400-$425) | $297.89 | toyota.com |

Prices come from dealer pages as shown in search results; the dealer sites themselves are outside
this session's network allowlist, so they were not fetched directly. Ed Martin has two pages for this
part ($313.50 and $339.85); the lower one is used.

Held:
- **PT228-60240** (rock rail, left): about $392-$412 at dealers, but Toyota serves the right-side
  photo for this number, so there is no photo of the exact part.
- **PT228-35241** (transmission skid plate): superseded by PT228-35247, and also listed for the Tacoma
  hybrid; only one dealer price found ($256.50).
- **PT970-60240** (roof cross bars): superseded by PT970-60245, which Toyota's own catalog lists for
  the Lexus GX; no Toyota Land Cruiser fitment confirmed.
- **PT228-35245** (rear differential skid plate), **PT944-60240** (illuminated door sills),
  **PT949-08210** (dashcam): no attributable US prices found yet.

## Batch 14 (2026-11-22)
| ID | Part no. | Product | Fits | US prices (lowest first) | Our price | Photo |
|---|---|---|---|---|---|---|
| 4484 | PT944-60240 | Illuminated door sills | Land Cruiser 2024-2025 (dealers list to 2026) | Ourisman Toyota of Richmond $252.98; Modern Toyota $273.60; Elmhurst $273.60; Lakeland $278.40 (MSRP $345-$360) | $240.39 | toyota.com |

Held:
- **PT228-35247** (transmission/transfer case skid plate, replaces PT228-35241): US prices from
  $256.50 to $325 at four dealers, but Toyota's photo is filed under the old number PT228-35241.
- **PT228-35245** (rear differential skid plate): only two US prices (toyota.com $325, one
  unnamed retailer $261), and one owner reports it needs extra parts to mount on the Land Cruiser.
