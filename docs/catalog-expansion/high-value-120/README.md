# High-value parts expansion (120-product brief), persistent progress report

Started 2026-11-23. Targets are 20 live products per category. A product counts only once it is
imported, deployed and confirmed live.

## Rules applied
These are the owner's standing instructions:
- **US-only fitment.** Prado 120/150, Land Cruiser 300 and Hilux parts are listed only where the same part
  fits a US model.
- **Price:** $200 minimum; 5% under the lowest attributed US price.
- **Photos:** only a legitimate photo of the exact product.
- **Core charges:** remanufactured units include the $1,000 core charge in the price (owner decision,
  2026-11-23).
- **No workarounds:** sites that refuse automated requests (403, Incapsula) are not bypassed.

## Progress

| Category | Target | Already live before brief | New: verified | New: imported | New: live |
|---|---|---|---|---|---|
| Turbochargers | 20 | 2 (17201-F4011, 17208-F4011) | 0 | 0 | 0 |
| Engines & engine assemblies | 20 | 0 genuine | 0 | 0 | 0 |
| Transmissions | 20 | 3 Toyota reman (4489-4491) + 1954 | 1 | 1 | pending deploy |
| Steering | 20 | racks 4425-4427, 4430, 4471; knuckle 4422 | 1 | 1 | pending deploy |
| Seats | 20 | 0 | 0 | 0 | 0 |
| Tires | 20 | 0 visible | 0 | 0 | 0 |

## Products imported under this brief

| ID | Category | Part no. | Manufacturer | Fits | Lowest US reference | Our price | Image source | Status |
|---|---|---|---|---|---|---|---|---|
| 4492 | Transmission | 35010-04080-84 | Toyota (Genuine Remanufactured) | Tacoma 2013-2015 4.0L V6 | $3,885.12 + $1,000 core | $4,640.89 | Toyota catalog (epc-images.toyota.com) | imported |
| 4493 | Steering | 44310-0C080 power steering pump | Toyota | Tundra 2007-2009 | $381.13 | $362.09 | Toyota catalog | imported |

## Research log

**Toyota catalog photo sweep.** 5,246 part numbers were checked across:
- turbos: 17201/17208 for F4, 25, 18, F0, 0A, WAA;
- remanufactured transmissions: 35010-xxxxx-84;
- engine assemblies: 19000 / 11400 for 31, 38, 0P, F4, 25, 75, 0F;
- steering: 44200, 44250 and 44310 for 0C, 04, 35, 34, 60; columns 45250; gears 44110.

A second sweep checked 1,089 classic turbo numbers: 17201/17208-46 (Supra MK4), 74, 88, 42, 73, 17, 0R,
0L, 30, 51.

| Result | Parts | Reason |
|---|---|---|
| Turbos | 17201-F4020 / 17208-F4020 | Photos exist; no US listing. Rejected. |
| Turbos | Classic turbo numbers | No photos. |
| Turbos | GR Corolla 17201-18030, 2.4T 17201-25010 | Prices known; no photos. |
| Engines | 19000 and 11400 families | No photos for any engine or block number swept. |
| Transmissions | 35010-34130-84 | Photo exists; no US price. Held. |
| Steering racks | 44250-0C070 | Superseded by listed 0C160. |
| Steering racks | 44250-0C110 | Superseded by 0C170, which has no photo. |
| Steering racks | 44250-0C180 | Superseded by 0C200. |
| Steering racks | 44250-0C200 | One US price ($1,357.12). Held. |
| Steering racks | 44250-0C210 | No US price. Held. |
| Steering racks | 44250-35080 (FJ Cruiser, $638-$685) | Toyota's photos are a pallet, a drawing and a label. Rejected. |
| Steering columns | 45250-0C300 / 0C350 (about $1,760-$1,970) | Tilt type and years unclear. Held. |

**Aftermarket photo sources.**
- Pure Turbos (GR Supra Pure800): host allowlisted, but the download was blocked by the session's
  automatic safety check. Not bypassed.
- Falken (Incapsula bot protection) and BFGoodrich (403) refuse automated requests.
- toyotires.com: wrong URL (404); still to check.
- nittotire.com: serves official tire photos and full size, load and speed specs per size, with Nitto
  product codes. This is the tire source in use.
