#!/usr/bin/env python3
"""Toyota catalog expansion batch 9 (2026-11-20): Land Cruiser / Prado-platform high-value parts.

Prado 150 platform part sold in the US on the 4Runner (2010-2024). Same record
shape and rules as batch 7 (scripts/toyota_batch_common.py); imported by
scripts/import-toyota-genuine-oem.py. Toyota catalog photos checked by eye;
dealer-catalog fitment; three US dealer prices; $500+ final price.

    python3 scripts/build-toyota-expansion-batch-9.py
"""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from toyota_batch_common import A, D, P, R, T, build  # noqa: E402,F401

LON = "https://parts.longotoyota.com/oem-parts"
SPK = "https://www.sparksparts.com/oem-parts"

# fmt: off
PARTS = [
    P("48886-60032", "kdss_cylinder", "KDSS Rear Stabilizer Control Cylinder", 1269.62,
      [("Sparks Toyota", 877.78, f"{SPK}/toyota-2010-2024-toyota-4runner-suspension-stabilizer-bar-link-kit-4888660032"),
       ("Lakeland Toyota", 893.05, "https://parts.lakelandtoyota.com/p/TOYOTA_2013_4RUNNER/Suspension-Stabilizer-Bar-Link-Kit-Rear/14762960/4888660032.html"),
       ("Longo Toyota", 1058.63, f"{LON}/toyota-suspension-stabilizer-bar-link-kit-4888660032")],
      [A(2010, 2024, "4Runner", "4.0L V6", "vin_dependent",
         [D("Longo Toyota (48886-60032 Suspension Stabilizer Bar Link Kit, 2010-2024 Toyota 4Runner)", f"{LON}/toyota-suspension-stabilizer-bar-link-kit-4888660032"),
          D("Lakeland Toyota (2013 Toyota 4Runner rear stabilizer bar link kit 48886-60032)", "https://parts.lakelandtoyota.com/p/TOYOTA_2013_4RUNNER/Suspension-Stabilizer-Bar-Link-Kit-Rear/14762960/4888660032.html"),
          T("Toyota Parts (2021 4Runner, cylinder rear stabilizer control 48886-60032; STABILIZER-KDSS, PACKAGE, TRD)", "https://parts.toyota.com/p/Toyota_2021_4Runner/CYLINDER---REAR-STABILIZER-CONTROL/69089182/4888660032.html")],
         restriction="4WD with KDSS (Kinetic Dynamic Suspension System) only; rear cylinder; supersedes 48886-60030/-60031; one retailer lists 48886-60051 for 2013-2015 Trail models; KDSS bleeding and pressurising need the service tool; confirm by VIN")],
      "Rear KDSS stabilizer control cylinder with fluid; it takes the place of the rear sway bar link on one side."),
]
# fmt: on

if __name__ == "__main__":
    build(9, PARTS, "Toyota expansion batch 9 (2026-11-20): Land Cruiser / Prado-platform high-value genuine parts, $500+ final price.")
    out = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "docs", "catalog-expansion", "toyota-expansion-batch-9.json")))
    low = [(r["partNumber"], r["pricing"].get("recommendedPrice")) for r in out["records"] if (r["pricing"].get("recommendedPrice") or 0) < 500]
    if low:
        sys.exit(f"batch 9 is $500+ only; below minimum: {low}")
