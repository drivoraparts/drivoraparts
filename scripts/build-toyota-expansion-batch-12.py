#!/usr/bin/env python3
"""Toyota catalog expansion batch 12 (2026-11-22): Land Cruiser (250 series) genuine accessories.

Genuine Toyota accessories sold by US Toyota dealers under PT part numbers. Photos are
Toyota's own accessory photos from toyota.com (see TCOM_SOURCES in
scripts/import-toyota-genuine-oem.py). Same record shape and rules as batch 7.

    python3 scripts/build-toyota-expansion-batch-12.py
"""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from toyota_batch_common import A, D, P, R, T, build  # noqa: E402,F401

# fmt: off
PARTS = [
    P("PT925-60240", "side_step", "Predator Drop Steps, Black", 675.00,
      [("OEMGenuineParts.com", 565.60, "https://www.oemgenuineparts.com/oem-parts/toyota-predator-drop-step-pt92560240"),
       ("Toyota of Nashua", 570.65, "https://parts.toyotaofnashua.com/oem-parts/toyota-predator-drop-step-pt92560240"),
       ("Olathe Toyota", 578.00, "https://parts.olathetoyota.com/oem-parts/toyota-predator-drop-step-pt92560240"),
       ("Longo Toyota", 656.50, "https://parts.longotoyota.com/oem-parts/toyota-predator-drop-step-pt92560240")],
      [A(2024, 2025, "Land Cruiser", "2.4L Turbo Hybrid", "vin_dependent",
         [T("Toyota.com Land Cruiser accessories (Predator Drop Steps, PT925-60240)", "https://www.toyota.com/landcruiser/accessories/"),
          D("Longo Toyota (PT925-60240 Predator Drop Step - Black, 2024-2025 Toyota Land Cruiser)", "https://parts.longotoyota.com/oem-parts/toyota-predator-drop-step-pt92560240"),
          D("Olathe Toyota (2024-2026 Toyota Land Cruiser Predator Drop Step - Black PT925-60240)", "https://parts.olathetoyota.com/oem-parts/toyota-predator-drop-step-pt92560240")],
         restriction="250-series Land Cruiser (2024+); genuine Toyota accessory, professional installation recommended; some dealers list 2026; confirm by VIN")],
      "Genuine Toyota Predator drop steps for the Land Cruiser: black powder-coat finish, drop steps for easier entry, 6061 aluminum construction that resists chips and rust."),
]
# fmt: on

if __name__ == "__main__":
    build(12, PARTS, "Toyota expansion batch 12 (2026-11-22): Land Cruiser genuine accessories, $500+ final price.")
    out = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "docs", "catalog-expansion", "toyota-expansion-batch-12.json")))
    low = [(r["partNumber"], r["pricing"].get("recommendedPrice")) for r in out["records"] if (r["pricing"].get("recommendedPrice") or 0) < 500]
    if low:
        sys.exit(f"batch 12 is $500+ only; below minimum: {low}")
