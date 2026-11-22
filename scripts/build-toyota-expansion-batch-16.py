#!/usr/bin/env python3
"""Toyota catalog expansion batch 16 (2026-11-22): Land Cruiser (250 series) genuine roof rack, $500+.

PT970-60241 was held in phase 7 only because toyota.com's card photo shows the rack loaded with an
awning and case that are not included. toyota.com also serves a photo filed under this exact part
number that shows the rack alone, so the photo block is cleared.

    python3 scripts/build-toyota-expansion-batch-16.py
"""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from toyota_batch_common import A, D, P, R, T, build  # noqa: E402,F401

TCOM = "https://www.toyota.com/landcruiser/accessories/"

# fmt: off
PARTS = [
    P("PT970-60241", "roof_rack", "Roof Rack", 1400.00,
      [("Smithtown Toyota", 1083.50, "https://parts.smithtowntoyota.com/oem-parts/toyota-roof-rack-pt97060241"),
       ("Toyota of Greensburg", 1093.35, "https://parts.toyotaofgreensburg.com/oem-parts/toyota-roof-rack-pt97060241"),
       ("OEMGenuineParts.com", 1103.20, "https://www.oemgenuineparts.com/oem-parts/toyota-roof-rack-pt97060241"),
       ("ToyotaPartsDeal", 1113.05, "https://www.toyotapartsdeal.com/oem/toyota~lndc~roof~rack~pt970-60241.html"),
       ("Olathe Toyota", 1190.00, "https://parts.olathetoyota.com/oem-parts/toyota-roof-rack-pt97060241")],
      [A(2024, 2025, "Land Cruiser", "2.4L Turbo Hybrid", "vin_dependent",
         [T("Toyota.com Land Cruiser accessories (Roof Rack)", TCOM),
          D("Smithtown Toyota (2024-2025 Toyota Land Cruiser Roof Rack PT970-60241)", "https://parts.smithtowntoyota.com/oem-parts/toyota-roof-rack-pt97060241"),
          D("Olathe Toyota (2024-2025 Toyota Land Cruiser Roof Rack PT970-60241)", "https://parts.olathetoyota.com/oem-parts/toyota-roof-rack-pt97060241")],
         restriction="250-series Land Cruiser (2024+) with factory roof side rails; some dealers list 2026; awning, cargo cases and cross bars are not included; professional installation recommended; confirm by VIN")],
      "Genuine Toyota roof rack for the 250-series Land Cruiser: designed to secure cargo with more confidence, with additional secure tie-down points for roof-rack accessories."),
]
# fmt: on

if __name__ == "__main__":
    build(16, PARTS, "Toyota expansion batch 16 (2026-11-22): Land Cruiser genuine roof rack, $500+ final price.")
    out = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "docs", "catalog-expansion", "toyota-expansion-batch-16.json")))
    low = [(r["partNumber"], r["pricing"].get("recommendedPrice")) for r in out["records"] if (r["pricing"].get("recommendedPrice") or 0) < 500]
    if low:
        sys.exit(f"batch 16 is $500+ only: {low}")
