#!/usr/bin/env python3
"""Toyota catalog expansion batch 17 (2026-11-22): genuine turbocharger, right bank, 3.4L V35A.

Owner request: more genuine turbochargers. The left-bank unit 17201-F4011 is listed already (batch 6);
this adds the right-bank unit 17208-F4011, which supersedes 17208-F4010. Photos are Toyota's own catalog
photos (epc-images.toyota.com) of 17208-F4011, which differ from the left-bank unit's photos.

    python3 scripts/build-toyota-expansion-batch-17.py
"""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from toyota_batch_common import A, D, P, R, T, build  # noqa: E402,F401

# fmt: off
PARTS = [
    P("17208-F4011", "turbo", "Turbocharger, Right", 4211.15,
      [("Ourisman Toyota of Richmond", 2772.23, "https://toyotaparts.ourismantoyotaofrichmond.com/oem-parts/toyota-turbocharger-sub-assembly-17208f4011"),
       ("Toyota OEM Parts Online (2023 Tundra turbocharger page)", 2815.17, "https://toyota.oempartsonline.com/v-2023-toyota-tundra--1794-edition--3-4l-v6-gas/fuel-system--turbo-charger"),
       ("Toyota of Nashua", 2835.53, "https://parts.toyotaofnashua.com/oem-parts/toyota-turbocharger-sub-assembly-17208f4011"),
       ("Fred Haas Toyota", 2911.48, "https://discountparts.fredhaastoyota.com/oem-parts/toyota-turbocharger-sub-assembly-17208f4011"),
       ("Capo Valley Toyota", 3158.36, "https://parts.capovalleytoyota.com/oem-parts/toyota-turbocharger-sub-assembly-17208f4011"),
       ("Longo Toyota", 3341.87, "https://parts.longotoyota.com/oem-parts/toyota-turbocharger-sub-assembly-17208f4011")],
      [A(2022, 2025, "Tundra", "3.4L twin-turbo V6", "vin_dependent",
         [D("Toyota of Anaheim (Turbocharger 17208-F4011, right side, Tundra / Sequoia 3.4L)", "https://parts.toyotaofanaheim.com/oem-parts/toyota-turbocharger-17208f4011"),
          D("Toyota OEM Parts Online (2023 Tundra 1794 Edition 3.4L turbo charger)", "https://toyota.oempartsonline.com/v-2023-toyota-tundra--1794-edition--3-4l-v6-gas/fuel-system--turbo-charger")],
         restriction="right-bank (passenger side) turbocharger, 3.4L V35A twin-turbo V6; i-FORCE and i-FORCE MAX applications; supersedes 17208-F4010; dealers list 2022-2026; confirm by VIN; one-time-use fasteners are sold separately"),
       A(2023, 2025, "Sequoia", "3.4L twin-turbo V6 hybrid", "vin_dependent",
         [D("Toyota of Anaheim (Turbocharger 17208-F4011, right side, Tundra / Sequoia 3.4L)", "https://parts.toyotaofanaheim.com/oem-parts/toyota-turbocharger-17208f4011")],
         restriction="right-bank (passenger side) turbocharger, 3.4L V35A i-FORCE MAX; confirm by VIN; one-time-use fasteners are sold separately")],
      "Right-bank (passenger side) turbocharger for the 3.4L twin-turbo V6. Pairs with the left-bank unit 17201-F4011."),
]
# fmt: on

if __name__ == "__main__":
    build(17, PARTS, "Toyota expansion batch 17 (2026-11-22): genuine turbocharger, $500+ final price.")
    out = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "docs", "catalog-expansion", "toyota-expansion-batch-17.json")))
    low = [(r["partNumber"], r["pricing"].get("recommendedPrice")) for r in out["records"] if (r["pricing"].get("recommendedPrice") or 0) < 500]
    if low:
        sys.exit(f"batch 17 is $500+ only: {low}")
