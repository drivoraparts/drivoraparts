#!/usr/bin/env python3
"""Toyota catalog expansion batch 14 (2026-11-22): Land Cruiser (250 series) genuine accessory, $200+.

Same rules as batch 13 (owner's $200 floor for Land Cruiser parts). Photo is Toyota's own
accessory photo from toyota.com (see TCOM_SOURCES in scripts/import-toyota-genuine-oem.py).

    python3 scripts/build-toyota-expansion-batch-14.py
"""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from toyota_batch_common import A, D, P, R, T, build  # noqa: E402,F401

TCOM = "https://www.toyota.com/landcruiser/accessories/"

# fmt: off
PARTS = [
    P("PT944-60240", "door_sill", "Illuminated Door Sills", 360.00,
      [("Ourisman Toyota of Richmond", 252.98, "https://toyotaparts.ourismantoyotaofrichmond.com/oem-parts/toyota-24-land-cruiser-illuminated-door-sills-pt94460240"),
       ("Modern Toyota (Wholesale Direct)", 273.60, "https://wholesaledirect.moderntoyota.com/oem-parts/toyota-illuminated-door-sills-pt94460240"),
       ("McGrath Elmhurst Toyota", 273.60, "https://parts.elmhursttoyota.com/oem-parts/toyota-genuine-toyota-2024-land-cruiser-illuminated-stainless-steel-door-sills-pt94460240"),
       ("Lakeland Toyota (Toyota Parts Express)", 278.40, "https://toyotaparts.lakelandtoyota.com/oem-parts/toyota-illuminated-door-sills-pt94460240")],
      [A(2024, 2025, "Land Cruiser", "2.4L Turbo Hybrid", "vin_dependent",
         [T("Toyota.com Land Cruiser accessories (Illuminated Door Sills, PT944-60240)", TCOM),
          D("Lakeland Toyota (2025-2026 Toyota Land Cruiser Illuminated Door Sills PT944-60240)", "https://toyotaparts.lakelandtoyota.com/oem-parts/toyota-illuminated-door-sills-pt94460240")],
         restriction="250-series Land Cruiser (2024+); dealers list 2024-2026; professional installation recommended; confirm by VIN")],
      "Genuine Toyota illuminated door sills for the 250-series Land Cruiser: the Toyota LED logo lights white when the front doors are open, with a durable corrosion-resistant finish and brushed polished accents that help prevent door sill scuffs and scrapes."),
]
# fmt: on

if __name__ == "__main__":
    build(14, PARTS, "Toyota expansion batch 14 (2026-11-22): Land Cruiser genuine accessory, $200+ final price.")
    out = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "docs", "catalog-expansion", "toyota-expansion-batch-14.json")))
    low = [(r["partNumber"], r["pricing"].get("recommendedPrice")) for r in out["records"] if (r["pricing"].get("recommendedPrice") or 0) < 200]
    if low:
        sys.exit(f"batch 14 is $200+ only; below the sitewide minimum: {low}")
