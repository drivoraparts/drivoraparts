#!/usr/bin/env python3
"""Toyota catalog expansion batch 40 (2026-11-24): high-value parts brief (genuine seats).

Configuration comes from ToyotaPartsDeal's model-year seat parts lists (Toyota catalog rows: package, colour,
trim code, cab type). Only Toyota catalog photos of this part number showing the whole seat are used.

    python3 scripts/build-toyota-expansion-batch-40.py
"""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from toyota_batch_common import A, D, P, R, T, build  # noqa: E402,F401

# fmt: off
PARTS = [
    P("71200-04310-B2", "seat", "Front Driver Seat Assembly (SR5 Package, Gray)", 3672.02,
      [("ToyotaPartsDeal", 2459.27, "https://www.toyotapartsdeal.com/oem/toyota~seat~assy~front~lh~71200-04310-b2.html"),
       ("ToyotaPartsNow", 2505.63, "https://www.toyotapartsnow.com/oem/toyota~x~71200-04310-B2"),
       ("Lakeland Toyota", 2560.82, "https://parts.lakelandtoyota.com/p/toyota__TACOMA/Seat-Assembly-Left--Front/4230068/7120004310B2.html")],
      [A(2008, 2012, "Tacoma", "SR5", "vin_dependent",
         [R("ToyotaPartsDeal (71200-04310-B2 Seat Assembly, Front Driver Side: 2008-2012 Tacoma, model codes GRN2xx / TRN2xx)", "https://www.toyotapartsdeal.com/oem/toyota~seat~assy~front~lh~71200-04310-b2.html"),
          R("ToyotaPartsDeal 2010 Tacoma seat parts list (SR5 package, gray, trim 1#; Access Cab and Double Cab)", "https://www.toyotapartsdeal.com/parts-list/2010-toyota-tacoma/body/seat_seat_track.html"),
          D("Lakeland Toyota (Seat Assembly, Left Front, driver side, 7120004310B2, Tacoma)", "https://parts.lakelandtoyota.com/p/toyota__TACOMA/Seat-Assembly-Left--Front/4230068/7120004310B2.html")],
         restriction="Access Cab and Double Cab with the SR5 package and gray (trim 1) upholstery; the sand beige version is 71200-04310-E2; match the trim code and confirm by VIN")],
      "Complete new front driver (left-hand) bucket seat assembly, cushion and back, gray (trim code 1)."),
]
# fmt: on

if __name__ == "__main__":
    build(40, PARTS, "Toyota expansion batch 40 (2026-11-24): high-value parts brief, $200+ final price.")
    out = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "docs", "catalog-expansion", "toyota-expansion-batch-40.json")))
    low = [(r["partNumber"], r["pricing"].get("recommendedPrice")) for r in out["records"] if (r["pricing"].get("recommendedPrice") or 0) < 200]
    if low:
        sys.exit(f"batch 40 is $200+ only: {low}")
