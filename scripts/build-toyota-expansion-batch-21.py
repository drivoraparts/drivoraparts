#!/usr/bin/env python3
"""Toyota catalog expansion batch 21 (2026-11-23): high-value parts brief (steering).

Found by the round 5 Toyota catalog photo sweep (steering column family 45250). Held in the same pass
(see the high-value-120 report): 45250-08100 and 45250-0E180, whose Toyota photos are the same file
(byte-identical), so the photo does not identify either part; 45510-02370 (only close-ups and a label);
45510-02170 (one price, superseded by 45510-02171).

    python3 scripts/build-toyota-expansion-batch-21.py
"""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from toyota_batch_common import A, D, P, R, T, build  # noqa: E402,F401

# fmt: off
PARTS = [
    P("45250-08140", "steering", "Power Tilt and Telescopic Steering Column Assembly", 2903.54,
      [("Lakeland Toyota", 1901.58, "https://toyotaparts.lakelandtoyota.com/oem-parts/toyota-steering-column-4525008140"),
       ("Olathe Toyota", 1902.69, "https://parts.olathetoyota.com/v-2024-toyota-sienna--limited--2-5l-l4-electric-gas/steering--steering-wheel"),
       ("OEMPartsOnline", 1937.60, "https://toyota.oempartsonline.com/v-2025-toyota-sienna--limited--2-5l-l4-electric-gas/steering--steering-wheel"),
       ("American Toyota", 1972.52, "https://parts.americantoyota.com/v-2024-toyota-sienna--le--2-5l-l4-electric-gas/steering--steering-column-assembly")],
      [A(2023, 2025, "Sienna", "", "vin_dependent",
         [D("Lakeland Toyota (2023-2024 Toyota Sienna Steering Column 45250-08140, power adjust)", "https://toyotaparts.lakelandtoyota.com/oem-parts/toyota-steering-column-4525008140"),
          D("American Toyota (2024 Toyota Sienna steering column assembly)", "https://parts.americantoyota.com/v-2024-toyota-sienna--le--2-5l-l4-electric-gas/steering--steering-column-assembly"),
          D("OEMPartsOnline (2025 Toyota Sienna Limited steering)", "https://toyota.oempartsonline.com/v-2025-toyota-sienna--limited--2-5l-l4-electric-gas/steering--steering-wheel"),
          T("Toyota Parts (Steering Column Assembly 45250-08140)", "https://autoparts.toyota.com/products/product/column-assy-steering-4525008140")],
         restriction="power tilt and telescopic column (trims with power steering-wheel adjustment, such as Limited and Platinum; dealers note production from 9/2022); manual-tilt vans use 45250-08100; confirm by VIN")],
      "Electric power tilt and telescopic steering column assembly with its adjustment motors. Steering wheel, airbag, switches and covers are not included."),
]
# fmt: on

if __name__ == "__main__":
    build(21, PARTS, "Toyota expansion batch 21 (2026-11-23): high-value parts brief, $200+ final price.")
    out = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "docs", "catalog-expansion", "toyota-expansion-batch-21.json")))
    low = [(r["partNumber"], r["pricing"].get("recommendedPrice")) for r in out["records"] if (r["pricing"].get("recommendedPrice") or 0) < 200]
    if low:
        sys.exit(f"batch 21 is $200+ only: {low}")
