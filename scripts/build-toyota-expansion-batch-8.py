#!/usr/bin/env python3
"""Toyota catalog expansion batch 8 (2026-11-20): genuine Toyota drivetrain assemblies.

First drivetrain batch from the high-value expansion audit (docs/catalog-expansion/
high-value-expansion/): the live catalog had no transfer case, differential, engine
or driveshaft listing at $500+ for any platform. Only part numbers with a Toyota
catalog photo checked by eye, dealer-catalog fitment and three US retail prices
qualify. Same record shape and rules as batch 7 (scripts/toyota_batch_common.py);
imported by scripts/import-toyota-genuine-oem.py.

    python3 scripts/build-toyota-expansion-batch-8.py
"""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from toyota_batch_common import A, D, P, R, T, build  # noqa: E402,F401

OLA = "https://parts.olathetoyota.com/oem-parts"
MOD = "https://wholesaledirect.moderntoyota.com/oem-parts"
TD = "https://www.toyotapartsdeal.com"
TPN = "https://www.toyotapartsnow.com/parts-list"

# fmt: off
PARTS = [
    P("36100-0C020", "transfer", "Transfer Case Assembly", 3199.39,
      [("Olathe Toyota", 2465.24, f"{OLA}/toyota-transfer-case-assembly-361000c020"),
       ("ToyotaPartsDeal", 2519.52, f"{TD}/oem-2020-toyota-tundra-transfer_case.html"),
       ("ToyotaPartsNow", 2401.42, f"{TPN}/2018-toyota-tundra/transmission/transfer-case")],
      [A(2014, 2021, "Tundra", "5.7L V8", "vin_dependent",
         [D("Olathe Toyota (Transfer Case Assembly 36100-0C020 for 2014-2021 Toyota Tundra)", f"{OLA}/toyota-transfer-case-assembly-361000c020"),
          R("ToyotaPartsNow (2018 Tundra transfer case: 36100-0C020 noted Tundra; 5.7L)", f"{TPN}/2018-toyota-tundra/transmission/transfer-case")],
         restriction="4WD only; the 4.6L V8 uses 36100-0C010 and 2022+ Tundra uses 36100-0C030/0C040; confirm by VIN")],
      "Complete part-time 4WD transfer case assembly (transfer assy) for the 5.7L Tundra."),
    P("36100-04010", "transfer", "Transfer Case Assembly", 2808.39,
      [("Olathe Toyota", 2163.97, f"{OLA}/toyota-transfer-case-assembly-3610004010"),
       ("Modern Toyota", 2203.67, f"{MOD}/toyota-transfer-case-assembly-3610004010"),
       ("ToyotaPartsDeal", 2211.61, f"{TD}/oem/toyota~transfer~assy~36100-04010.html")],
      [A(2024, 2025, "Tacoma", "2.4L Turbo", "vin_dependent",
         [D("Modern Toyota (Transfer Case Assembly 36100-04010, 2024+ Tacoma, manual transmission)", f"{MOD}/toyota-transfer-case-assembly-3610004010"),
          D("Olathe Toyota (Transfer Case Assembly 36100-04010 for 2024-2026 Toyota Tacoma)", f"{OLA}/toyota-transfer-case-assembly-3610004010")],
         restriction="4WD with manual transmission; automatic hybrid and TRD Trailhunter trucks use 36100-04030; 36110-04010 is a different part; dealer catalogs also list 2026, outside the model years validated here; confirm by VIN")],
      "Complete part-time 4WD transfer case assembly (transfer assy) for the fourth-generation Tacoma."),
]
# fmt: on

if __name__ == "__main__":
    build(8, PARTS, "Toyota expansion batch 8 (2026-11-20): genuine Toyota drivetrain assemblies, $500+ final price.")
    out = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "docs", "catalog-expansion", "toyota-expansion-batch-8.json")))
    low = [(r["partNumber"], r["pricing"].get("recommendedPrice")) for r in out["records"] if (r["pricing"].get("recommendedPrice") or 0) < 500]
    if low:
        sys.exit(f"batch 8 is $500+ only; below minimum: {low}")
