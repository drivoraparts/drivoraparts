#!/usr/bin/env python3
"""Toyota catalog expansion batch 13 (2026-11-22): Land Cruiser (250 series) genuine accessories, $200+.

The owner lowered the Land Cruiser research floor from $500 to the sitewide $200 minimum
(2026-11-22). Same record shape and rules as batch 12; photos are Toyota's own accessory photos
from toyota.com (see TCOM_SOURCES in scripts/import-toyota-genuine-oem.py).

Held, not in this batch: PT228-60240 (rock rail, left side). Toyota serves the right-side photo
for the left part number, so no photo of the exact part exists yet.

    python3 scripts/build-toyota-expansion-batch-13.py
"""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from toyota_batch_common import A, D, P, R, T, build  # noqa: E402,F401

TCOM = "https://www.toyota.com/landcruiser/accessories/"

# fmt: off
PARTS = [
    P("PT228-60241", "rock_rail", "Rock Rail, Right Side (Passenger Side)", 485.00,
      [("ToyotaPartsDeal", 376.87, "https://www.toyotapartsdeal.com/oem/toyota~gx~lndc~rkrl~right~pt228-60241.html"),
       ("Toyota of Nashua", 378.55, "https://parts.toyotaofnashua.com/oem-parts/toyota-rock-rails-right-side-pt22860241"),
       ("Lakeland Toyota (Toyota Parts Express)", 392.08, "https://toyotaparts.lakelandtoyota.com/oem-parts/toyota-rock-rails-right-side-pt22860241")],
      [A(2024, 2025, "Land Cruiser", "2.4L Turbo Hybrid", "vin_dependent",
         [T("Toyota.com Land Cruiser accessories (Rock Rails, PT228-60241)", TCOM),
          D("Lakeland Toyota (2025-2026 Toyota Land Cruiser Rock Rails - Right Side PT228-60241)", "https://toyotaparts.lakelandtoyota.com/oem-parts/toyota-rock-rails-right-side-pt22860241")],
         restriction="250-series Land Cruiser (2024+); right (passenger) side only, the left rail PT228-60240 and hardware kit PT228-60240-HK are separate; dealers list 2024-2026; professional installation recommended; confirm by VIN")],
      "Genuine Toyota rock rail for the right (passenger) side of the 250-series Land Cruiser: durable steel structure with a textured black powder topcoat, fitted to the vehicle frame to help protect the body on rugged trails; bolts to the frame with no drilling. Sold as a single side."),
    P("PT228-60242", "skid_plate", "Front Skid Plate", 425.00,
      [("Ed Martin Toyota", 313.50, "https://parts.edmartintoyota.com/oem-parts/toyota-front-skid-plate-2024-land-cruiser-pt22860242"),
       ("SparksParts", 339.25, "https://www.sparksparts.com/oem-parts/toyota-front-skid-plate-pt22860242"),
       ("Frontier Toyota", 360.25, "https://parts.frontiertoyota.com/oem-parts/toyota-land-cruiser-front-skid-plate-2024-2026-land-cruiser-pt22860242")],
      [A(2024, 2025, "Land Cruiser", "2.4L Turbo Hybrid", "vin_dependent",
         [T("Toyota.com Land Cruiser accessories (Front Skid Plate, PT228-60242)", TCOM),
          D("Frontier Toyota (Toyota Land Cruiser Front Skid Plate 2024-2026, PT228-60242)", "https://parts.frontiertoyota.com/oem-parts/toyota-land-cruiser-front-skid-plate-2024-2026-land-cruiser-pt22860242")],
         restriction="250-series Land Cruiser (2024+); front skid plate only, the transmission and rear differential plates are separate part numbers; dealers list 2024-2026; professional installation recommended; confirm by VIN")],
      "Genuine Toyota front skid plate for the 250-series Land Cruiser: high-strength steel plate with a TOYOTA logo that shields the front underbody from off-road hazards; mounts to the existing Land Cruiser attachment points with no drilling."),
]
# fmt: on

if __name__ == "__main__":
    build(13, PARTS, "Toyota expansion batch 13 (2026-11-22): Land Cruiser genuine accessories, $200+ final price.")
    out = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "docs", "catalog-expansion", "toyota-expansion-batch-13.json")))
    low = [(r["partNumber"], r["pricing"].get("recommendedPrice")) for r in out["records"] if (r["pricing"].get("recommendedPrice") or 0) < 200]
    if low:
        sys.exit(f"batch 13 is $200+ only; below the sitewide minimum: {low}")
