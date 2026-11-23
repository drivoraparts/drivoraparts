#!/usr/bin/env python3
"""Toyota catalog expansion batch 37 (2026-11-23): high-value parts brief (steering).

Prices: Toyota dealer parts stores and ToyotaPartsDeal (read directly). Only Toyota's catalog photo of the
whole rack is used (photo 2 is a two-view composite and is not used).

    python3 scripts/build-toyota-expansion-batch-37.py
"""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from toyota_batch_common import A, D, P, R, T, build  # noqa: E402,F401

# fmt: off
PARTS = [
    P("45510-07010", "steering", "Steering Rack and Pinion Assembly", 833.82,
      [("Modern Toyota", 545.09, "https://wholesaledirect.moderntoyota.com/oem-parts/toyota-steering-gear-4551007010"),
       ("ToyotaPartsDeal", 558.44, "https://www.toyotapartsdeal.com/oem/toyota~gear~assy~steering~45510-07010.html"),
       ("Toyota of Fort Worth", 596.54, "https://parts.toyotaoffortworth.com/p/toyota__Avalon/Rack-and-Pinion-Assembly/48292978/4551007010.html"),
       ("Reliable Toyota", 733.76, "https://parts.reliabletoyotamo.com/oem-parts/toyota-rack-and-pinion-assembly-4551007010")],
      [A(2013, 2018, "Avalon", "", "vin_dependent",
         [D("Modern Toyota (OEM 2013-2018 Toyota Avalon Steering Gear 45510-07010)", "https://wholesaledirect.moderntoyota.com/oem-parts/toyota-steering-gear-4551007010"),
          D("Reliable Toyota (2013-2018 Toyota Avalon Rack And Pinion Assembly 45510-07010)", "https://parts.reliabletoyotamo.com/oem-parts/toyota-rack-and-pinion-assembly-4551007010"),
          T("Toyota Parts (Steering Gear Assembly 45510-07010)", "https://autoparts.toyota.com/products/product/gear-assy-steering-4551007010")],
         restriction="2013-2018 Avalon and Avalon Hybrid (2.5L hybrid, 3.5L V6); confirm by VIN")],
      "Steering rack and pinion (steering gear) assembly. Alignment required after installation."),
]
# fmt: on

if __name__ == "__main__":
    build(37, PARTS, "Toyota expansion batch 37 (2026-11-23): high-value parts brief, $200+ final price.")
    out = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "docs", "catalog-expansion", "toyota-expansion-batch-37.json")))
    low = [(r["partNumber"], r["pricing"].get("recommendedPrice")) for r in out["records"] if (r["pricing"].get("recommendedPrice") or 0) < 200]
    if low:
        sys.exit(f"batch 37 is $200+ only: {low}")
