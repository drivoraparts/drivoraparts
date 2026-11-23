#!/usr/bin/env python3
"""Toyota catalog expansion batch 20 (2026-11-23): high-value parts brief (steering).

Found by the round 5 Toyota catalog photo sweep (EPS rack families 44250-0E/06/08/42/0R). Held in the same
pass (see the high-value-120 report): 44250-06340 and 44250-0E260 (two sellers each), 44250-0E160 /
0E220 / 0E270 / 0E360 / 06550 / 06560 (no US price found), 44250-42140 (Toyota's photo is a text graphic).
Toyota's pallet, bag and label photos are dropped; only photos of the rack itself are used.

    python3 scripts/build-toyota-expansion-batch-20.py
"""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from toyota_batch_common import A, D, P, R, T, build  # noqa: E402,F401

# fmt: off
PARTS = [
    P("44250-08080", "steering", "Electric Power Steering Rack and Pinion Assembly", 1025.44,
      [("ToyotaPartsDeal", 650.19, "https://www.toyotapartsdeal.com/oem-2024-toyota-sienna-rack_and_pinion.html"),
       ("Conicelli Toyota of Conshohocken", 671.97, "https://parts.conicellitoyotaofconshohocken.com/oem-parts/toyota-rack-and-pinion-assembly-4425008080"),
       ("Ourisman Toyota of Richmond", 675.06, "https://toyotaparts.ourismantoyotaofrichmond.com/oem-parts/toyota-rack-and-pinion-assembly-4425008080"),
       ("Modern Toyota", 684.30, "https://wholesaledirect.moderntoyota.com/oem-parts/toyota-rack-and-pinion-assembly-4425008080"),
       ("Capo Valley Toyota", 769.08, "https://parts.capovalleytoyota.com/oem-parts/toyota-rack-and-pinion-assembly-4425008080"),
       ("Longo Toyota", 813.77, "https://parts.longotoyota.com/oem-parts/toyota-rack-and-pinion-assembly-4425008080")],
      [A(2021, 2025, "Sienna", "", "vin_dependent",
         [D("Longo Toyota (44250-08080 Rack And Pinion Assembly 2021-2025 Toyota Sienna)", "https://parts.longotoyota.com/oem-parts/toyota-rack-and-pinion-assembly-4425008080"),
          D("Ourisman Toyota of Richmond (44250-08080 for 2021-2025 Toyota Sienna)", "https://toyotaparts.ourismantoyotaofrichmond.com/oem-parts/toyota-rack-and-pinion-assembly-4425008080"),
          D("Modern Toyota (OEM 2021-2025 Toyota Sienna Rack And Pinion Assembly 44250-08080)", "https://wholesaledirect.moderntoyota.com/oem-parts/toyota-rack-and-pinion-assembly-4425008080")],
         restriction="2.5L hybrid (all 2021-2025 Sienna); dealers note FWD / AWD and trim differences, so confirm by VIN")],
      "Electric power steering (EPS) rack and pinion gear assembly; dealer listings note the inner tie rods and boots are included. Alignment required after installation."),
]
# fmt: on

if __name__ == "__main__":
    build(20, PARTS, "Toyota expansion batch 20 (2026-11-23): high-value parts brief, $200+ final price.")
    out = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "docs", "catalog-expansion", "toyota-expansion-batch-20.json")))
    low = [(r["partNumber"], r["pricing"].get("recommendedPrice")) for r in out["records"] if (r["pricing"].get("recommendedPrice") or 0) < 200]
    if low:
        sys.exit(f"batch 20 is $200+ only: {low}")
