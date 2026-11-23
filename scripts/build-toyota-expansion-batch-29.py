#!/usr/bin/env python3
"""Toyota catalog expansion batch 29 (2026-11-23): high-value parts brief (steering).

Racks with a clean Toyota catalog photo of the rack itself; Toyota's other photos for these numbers (a close-up of a
fitting, a warning label, an end cap) are not used.

    python3 scripts/build-toyota-expansion-batch-29.py
"""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from toyota_batch_common import A, D, P, R, T, build  # noqa: E402,F401

# fmt: off
PARTS = [
    P("44250-04041", "steering", "Power Steering Rack and Pinion Assembly", 971.88,
      [("Toyota of Laredo", 648.56, "https://parts.toyotaoflaredo.com/oem-parts/toyota-steering-gear-4425004041"),
       ("Toyota Parts Express (Lakeland Toyota)", 677.78, "https://toyotaparts.lakelandtoyota.com/oem-parts/toyota-rack-and-pinion-assembly-4425004041"),
       ("Longo Toyota", 771.26, "https://parts.longotoyota.com/oem-parts/toyota-gear-assembly-4425004041")],
      [A(2016, 2023, "Tacoma", "", "vin_dependent",
         [D("Longo Toyota (44250-04041 Rack And Pinion Assembly 2016-2023 Toyota Tacoma)", "https://parts.longotoyota.com/oem-parts/toyota-gear-assembly-4425004041"),
          D("Toyota of Laredo (44250-04041 Rack And Pinion Assembly 2016-2023 Toyota Tacoma)", "https://parts.toyotaoflaredo.com/oem-parts/toyota-steering-gear-4425004041"),
          D("Toyota Carlsbad (2016-2023 Toyota Tacoma Rack And Pinion Assembly 44250-04041)", "https://parts.toyotacarlsbad.com/oem-parts/toyota-rack-and-pinion-assembly-4425004041")],
         restriction="hydraulic power steering rack; drivetrain and trim applications vary; confirm by VIN")],
      "Hydraulic power steering rack and pinion assembly. Alignment required after installation."),
    P("44250-35042", "steering", "Power Steering Rack and Pinion Assembly", 801.89,
      [("Ourisman Toyota of Richmond", 520.00, "https://toyotaparts.ourismantoyotaofrichmond.com/oem-parts/toyota-rack-and-pinion-4425035042"),
       ("Olathe Toyota", 530.30, "https://parts.olathetoyota.com/oem-parts/toyota-rack-and-pinion-4425035042"),
       ("Camelback Toyota", 549.58, "https://parts.camelbacktoyota.com/oem-parts/toyota-rack-and-pinion-4425035042"),
       ("Fred Haas Toyota", 559.22, "https://discountparts.fredhaastoyota.com/oem-parts/toyota-rack-and-pinion-4425035042"),
       ("Capo Valley Toyota", 601.42, "https://parts.capovalleytoyota.com/oem-parts/toyota-rack-and-pinion-4425035042"),
       ("Longo Toyota", 636.36, "https://parts.longotoyota.com/oem-parts/toyota-rack-and-pinion-4425035042")],
      [A(1995, 2004, "Tacoma", "", "vin_dependent",
         [D("Toyota of Nashua (4425035042 1995-2004 Toyota Rack & Pinion Tacoma 4Runner)", "https://parts.toyotaofnashua.com/oem-parts/toyota-rack-and-pinion-4425035042"),
          D("Camelback Toyota (1995-2004 Toyota Rack and Pinion 44250-35042)", "https://parts.camelbacktoyota.com/oem-parts/toyota-rack-and-pinion-4425035042")],
         restriction="replaces 44250-35040 / 44250-35041; drivetrain applications vary; confirm by VIN"),
       A(1996, 2002, "4Runner", "", "vin_dependent",
         [D("Toyota of Nashua (4425035042 1995-2004 Toyota Rack & Pinion Tacoma 4Runner)", "https://parts.toyotaofnashua.com/oem-parts/toyota-rack-and-pinion-4425035042"),
          D("Ourisman Toyota of Richmond (44250-35042 for 1995-2004 Toyota)", "https://toyotaparts.ourismantoyotaofrichmond.com/oem-parts/toyota-rack-and-pinion-4425035042")],
         restriction="rack-and-pinion 4Runner generation (1996-2002) within the dealers' 1995-2004 range; confirm by VIN")],
      "Hydraulic power steering rack and pinion assembly. Alignment required after installation."),
]
# fmt: on

if __name__ == "__main__":
    build(29, PARTS, "Toyota expansion batch 29 (2026-11-23): high-value parts brief, $200+ final price.")
    out = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "docs", "catalog-expansion", "toyota-expansion-batch-29.json")))
    low = [(r["partNumber"], r["pricing"].get("recommendedPrice")) for r in out["records"] if (r["pricing"].get("recommendedPrice") or 0) < 200]
    if low:
        sys.exit(f"batch 29 is $200+ only: {low}")
