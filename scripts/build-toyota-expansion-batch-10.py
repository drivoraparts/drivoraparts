#!/usr/bin/env python3
"""Toyota catalog expansion batch 10 (2026-11-20): Land Cruiser 100 hydraulic brake booster.

Same record shape and rules as batch 7 (scripts/toyota_batch_common.py); imported
by scripts/import-toyota-genuine-oem.py. Toyota catalog photos checked by eye;
Toyota / dealer-catalog fitment; three or more US prices; $500+ final price.

    python3 scripts/build-toyota-expansion-batch-10.py
"""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from toyota_batch_common import A, D, P, R, T, build  # noqa: E402,F401

TD = "https://www.toyotapartsdeal.com/oem"
LPN = "https://www.lexuspartsnow.com/parts"

# fmt: off
PARTS = [
    P("47050-60010", "booster", "Brake Booster Assembly with Master Cylinder", 1690.18,
      [("ToyotaPartsDeal", 1333.67, f"{TD}/toyota~brake~booster~assy~w~master~cylinder~47050-60010.html"),
       ("Toyota of Nashua", 1341.75, "https://parts.toyotaofnashua.com/oem-parts/toyota-1998-2003-toyota-4-0l-4-7l-master-cylinder-actuator-brake-booster-assembly-land-cruiser-4runner-4705060010"),
       ("LexusPartsNow", 1436.63, f"{LPN}/lexus-brake-booster-assy-w-master-cylinder~47050-60010.html")],
      [A(1998, 2000, "Land Cruiser", "4.7L V8", "vin_dependent",
         [T("Toyota Parts (2000 Toyota Land Cruiser brake booster assembly with master cylinder 47050-60010)", "https://parts.toyota.com/p/Toyota_2000_Land-Cruiser/BRAKE-BOOSTER-ASSEMBLY---WITH-MASTER-CYLINDER/63025998/4705060010.html"),
          R("ToyotaPartsDeal (47050-60010 fits 1998-2000 Land Cruiser)", f"{TD}/toyota~brake~booster~assy~w~master~cylinder~47050-60010.html")],
         restriction="100 Series; hydraulic booster with master cylinder, reservoir and pump; Toyota catalogs split production around 07/1999 and later trucks may take 47050-60041; confirm by VIN")],
      "Hydraulic brake booster assembly with master cylinder, reservoir and booster pump, as one unit."),
]
# fmt: on

if __name__ == "__main__":
    build(10, PARTS, "Toyota expansion batch 10 (2026-11-20): Land Cruiser 100 hydraulic brake booster, $500+ final price.")
    out = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "docs", "catalog-expansion", "toyota-expansion-batch-10.json")))
    low = [(r["partNumber"], r["pricing"].get("recommendedPrice")) for r in out["records"] if (r["pricing"].get("recommendedPrice") or 0) < 500]
    if low:
        sys.exit(f"batch 10 is $500+ only; below minimum: {low}")
