#!/usr/bin/env python3
"""Toyota catalog expansion batch 11 (2026-11-21): Land Cruiser 100 brake booster.

Same record shape and rules as batch 7 (scripts/toyota_batch_common.py); imported
by scripts/import-toyota-genuine-oem.py. Toyota catalog photos checked by eye;
Toyota / dealer-catalog fitment; three US prices; $500+ final price.

    python3 scripts/build-toyota-expansion-batch-11.py
"""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from toyota_batch_common import A, D, P, R, T, build  # noqa: E402,F401

# fmt: off
PARTS = [
    P("47050-60042", "booster", "Brake Booster Assembly with Master Cylinder", 2006.33,
      [("ToyotaPartsDeal", 1343.70, "https://www.toyotapartsdeal.com/oem/toyota~brake~booster~assy~w~master~cylinder~47050-60042.html"),
       ("LexusPartsNow", 1447.43, "https://www.lexuspartsnow.com/parts/lexus-brake-booster-assy-w-master-cylinder~47050-60042.html"),
       ("Park Place Lexus Plano", 1507.74, "https://parts.parkplacelexusplano.com/p/Lexus__LX-470/BRAKE-BOOSTER-ASSEMBLY---WITH-MASTER-CYLINDER/63180880/4705060042.html")],
      [A(2000, 2002, "Land Cruiser", "4.7L V8", "vin_dependent",
         [T("Toyota Parts (Land Cruiser brake booster assembly with master cylinder 47050-60042)", "https://parts.toyota.com/p/Toyota__Land-Cruiser/BRAKE-BOOSTER-ASSEMBLY---WITH-MASTER-CYLINDER/63180880/4705060042.html"),
          R("ToyotaPartsDeal (47050-60042 fits 2000-2003 Land Cruiser)", "https://www.toyotapartsdeal.com/oem/toyota~brake~booster~assy~w~master~cylinder~47050-60042.html")],
         restriction="100 Series with VSC; Toyota catalogs list production 05/2000-08/2002; earlier trucks use 47050-60010, later 2003-2007 trucks 47050-60043; one retailer lists 2000-2003; confirm by VIN")],
      "Hydraulic brake booster assembly with master cylinder, reservoir and booster pump, as one unit."),
]
# fmt: on

if __name__ == "__main__":
    build(11, PARTS, "Toyota expansion batch 11 (2026-11-21): Land Cruiser 100 brake booster, $500+ final price.")
    out = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "docs", "catalog-expansion", "toyota-expansion-batch-11.json")))
    low = [(r["partNumber"], r["pricing"].get("recommendedPrice")) for r in out["records"] if (r["pricing"].get("recommendedPrice") or 0) < 500]
    if low:
        sys.exit(f"batch 11 is $500+ only; below minimum: {low}")
