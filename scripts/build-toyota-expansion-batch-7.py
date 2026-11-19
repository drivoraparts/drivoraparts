#!/usr/bin/env python3
"""Toyota catalog expansion batch 7 (2026-11-19): premium genuine Toyota parts
Land Cruiser / Prado-platform high-value parts with a final advertised price of $500 or more. Same record shape and rules as batch 3
(scripts/toyota_batch_common.py); imported by scripts/import-toyota-genuine-oem.py.

Fitment: Toyota dealer parts catalogs (product titles and per-vehicle pages),
restrictions kept. Prices: attributed US listings for the exact part number.

    python3 scripts/build-toyota-expansion-batch-7.py
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from toyota_batch_common import A, D, P, R, T, build  # noqa: E402,F401

OLA = "https://parts.olathetoyota.com/oem-parts"
LON = "https://parts.longotoyota.com/oem-parts"
MOD = "https://wholesaledirect.moderntoyota.com/oem-parts"
LAK = "https://toyotaparts.lakelandtoyota.com/oem-parts"
APP = "https://www.autopartsprime.com"
TN = "https://www.toyotapartsnow.com/oem"
TD = "https://www.toyotapartsdeal.com/oem"

# fmt: off
PARTS = [
    P("49141-60010", "accumulator", "AHC Suspension Accumulator, Front", 1211.24,
      [("Lakeland Toyota", 844.70, f"{LAK}/toyota-accumulator-4914160010"),
       ("ToyotaPartsDeal", 853.31, f"{TD}/toyota~accumulator~front~suspension~control~49141-60010.html"),
       ("Longo Toyota", 990.12, f"{LON}/toyota-accumulator-4914160010")],
      [A(2006, 2007, "Land Cruiser", "4.7L V8", "vin_dependent",
         [D("Lakeland Toyota (2006-2007 Toyota Land Cruiser Accumulator 49141-60010)", f"{LAK}/toyota-accumulator-4914160010"),
          D("Longo Toyota (49141-60010 Accumulator 2006-2007 Toyota Land Cruiser)", f"{LON}/toyota-accumulator-4914160010")],
         restriction="100 Series with AHC (Active Height Control) hydraulic suspension; front position; priced each, AHC systems use two front accumulators; one retailer lists 2005-2007, dealer catalogs 2006-2007; confirm by VIN")],
      "Front suspension control accumulator (nitrogen sphere) for the AHC height control system."),
    P("49151-60010", "accumulator", "AHC Suspension Accumulator, Rear", 1279.33,
      [("ToyotaPartsDeal", 856.88, f"{TD}/toyota~accumulator~rear~suspension~control~49151-60010.html"),
       ("Lakeland Toyota", 892.19, f"{LAK}/toyota-accumulator-4915160010"),
       ("Longo Lexus", 907.64, "https://parts.longolexus.com/v-2005-lexus-lx470--base--4-7l-v8-gas/suspension--rear-suspension")],
      [A(2006, 2007, "Land Cruiser", "4.7L V8", "vin_dependent",
         [D("Lakeland Toyota (2006-2007 Toyota Land Cruiser Accumulator 49151-60010)", f"{LAK}/toyota-accumulator-4915160010")],
         restriction="100 Series with AHC (Active Height Control) hydraulic suspension; rear position; priced each, AHC systems use two rear accumulators; one retailer lists 2005-2007, dealer catalog 2006-2007; confirm by VIN")],
      "Rear suspension control accumulator (nitrogen sphere) for the AHC height control system."),
    P("44200-60170", "steering", "Power Steering Rack and Pinion Assembly", 1086.99,
      [("Olathe Toyota", 728.28, f"{OLA}/toyota-rack-and-pinion-4420060170?c=az0x"),
       ("Longo Toyota", 730.75, f"{LON}/toyota-rack-and-pinion-4420060170"),
       ("ToyotaPartsDeal", 749.82, f"{TD}/toyota~link~assy~power~steering~44200-60170.html")],
      [A(2008, 2021, "Land Cruiser", "5.7L V8", "vin_dependent",
         [D("Longo Toyota (44200-60170 Rack and Pinion 2008-2021 Toyota Land Cruiser)", f"{LON}/toyota-rack-and-pinion-4420060170"),
          D("Olathe Toyota (2008-2021 Toyota Land Cruiser Rack and Pinion 44200-60170)", f"{OLA}/toyota-rack-and-pinion-4420060170?c=az0x"),
          D("Sparks Toyota (2008-2021 Toyota Land Cruiser Rack and Pinion 44200-60170)", "https://www.sparksparts.com/oem-parts/toyota-2008-2021-toyota-land-cruiser-rack-and-pinion-4420060170")],
         restriction="200 Series; one retailer page also shows 2002-2003, which dealer catalogs do not support; confirm by VIN")],
      "Hydraulic power steering rack and pinion (gear) assembly."),
    P("48910-60021", "air_compressor", "Rear Air Suspension Compressor Assembly", 2686.80,
      [("Olathe Toyota", 1710.50, "https://parts.olathetoyota.com/v-2004-toyota-4runner--sr5--4-7l-v8-gas/suspension--rear-suspension"),
       ("ToyotaPartsDeal", 1799.43, f"{TD}/toyota~compressor~assy~hei~48910-60021.html"),
       ("Lakeland Toyota", 1873.74, "https://toyotaparts.lakelandtoyota.com/v-2004-toyota-4runner--limited--4-7l-v8-gas/suspension--rear-suspension"),
       ("Longo Toyota", 2133.11, "https://parts.longotoyota.com/v-2005-toyota-4runner--sr5--4-0l-v6-gas/suspension--rear-suspension")],
      [A(2003, 2009, "4Runner", "", "vin_dependent",
         [D("Olathe Toyota (Toyota air suspension compressor 48910-60021, 2003-2009 4Runner)", f"{OLA}/toyota-air-suspension-compressor-4891060021"),
          D("Lakeland Toyota (2004 4Runner Limited rear suspension)", "https://toyotaparts.lakelandtoyota.com/v-2004-toyota-4runner--limited--4-7l-v8-gas/suspension--rear-suspension"),
          D("Longo Toyota (2005 4Runner SR5 rear suspension)", "https://parts.longotoyota.com/v-2005-toyota-4runner--sr5--4-0l-v6-gas/suspension--rear-suspension")],
         restriction="only 4Runners with the optional rear height-control air suspension; supersedes 48910-60020; replace leaking rear air springs at the same time; confirm by VIN")],
      "Height control air compressor with motor for the rear air suspension."),
    P("48007-60023", "kdss_cylinder", "KDSS Front Hydraulic Cylinder Assembly", 2694.95,
      [("Olathe Toyota", 1805.62, f"{OLA}/toyota-hydraulic-cylinder-4800760023"),
       ("Lakeland Toyota", 1879.42, f"{LAK}/toyota-hydraulic-cylinder-4800760023"),
       ("Longo Toyota", 2138.65, f"{LON}/toyota-hydraulic-cylinder-4800760023")],
      [A(2010, 2024, "4Runner", "4.0L V6", "vin_dependent",
         [D("Longo Toyota (48007-60023 Hydraulic Cylinder 2010-2024 Toyota 4Runner; 4WD, with dynamic suspension)", f"{LON}/toyota-hydraulic-cylinder-4800760023"),
          D("Lakeland Toyota (2010-2024 Toyota 4Runner Hydraulic Cylinder 48007-60023)", f"{LAK}/toyota-hydraulic-cylinder-4800760023"),
          D("Olathe Toyota (2010-2024 Toyota 4Runner Hydraulic Cylinder 48007-60023)", f"{OLA}/toyota-hydraulic-cylinder-4800760023")],
         restriction="4WD with KDSS (Kinetic Dynamic Suspension System) only; front cylinder; supersedes 48007-60020/-60021/-60022; KDSS bleeding and pressurising need the service tool; confirm by VIN")],
      "Front KDSS hydraulic cylinder sub-assembly with its high-pressure lines."),
]
# fmt: on

if __name__ == "__main__":
    build(7, PARTS, "Toyota expansion batch 7 (2026-11-19): Land Cruiser / Prado-platform high-value genuine parts, $500+ final price.")
    import json
    out = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "docs", "catalog-expansion", "toyota-expansion-batch-7.json")))
    low = [(r["partNumber"], r["pricing"].get("recommendedPrice")) for r in out["records"] if (r["pricing"].get("recommendedPrice") or 0) < 500]
    if low:
        sys.exit(f"batch 7 is $500+ only; below minimum: {low}")
