#!/usr/bin/env python3
"""Toyota catalog expansion batch 19 (2026-11-23): high-value parts brief (steering, transmissions).

Found by a Toyota catalog photo sweep of 5,246 part numbers. Rejected in the same pass: steering rack
44250-35080 (Toyota's photos show a pallet, a drawing and a label, not the rack), racks superseded by listed
or photo-less numbers, and parts with fewer than three US prices (see the high-value-120 report).
Remanufactured transmissions follow the owner's decision of 2026-11-23: price includes the $1,000 core.

    python3 scripts/build-toyota-expansion-batch-19.py
"""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from toyota_batch_common import A, D, P, R, T, build  # noqa: E402,F401

CORE = 1000.00
REMAN_SPEC = ("Toyota Genuine Remanufactured automatic transmission, rebuilt by Toyota to its fit and performance "
              "standards. The price includes Toyota's $1,000 core charge, so no old transmission has to be returned.")


def with_core(name, price, url):
    return (f"{name} (${price:,.2f} + ${CORE:,.0f} core charge)", round(price + CORE, 2), url)


# fmt: off
PARTS = [
    P("44310-0C080", "ps_pump", "Power Steering Pump Assembly", 568.85,
      [("Olathe Toyota", 381.13, "https://parts.olathetoyota.com/oem-parts/toyota-power-steering-pump-443100c080"),
       ("ToyotaPartsDeal", 381.32, "https://www.toyotapartsdeal.com/oem/toyota~pump~assy~vane~44310-0c080.html"),
       ("American Toyota", 396.71, "https://parts.americantoyota.com/oem-parts/toyota-power-steering-pump-443100c080"),
       ("Longo Toyota", 451.43, "https://parts.longotoyota.com/oem-parts/toyota-power-steering-pump-443100c080")],
      [A(2007, 2009, "Tundra", "", "vin_dependent",
         [D("Olathe Toyota (2007-2009 Toyota Tundra Power Steering Pump 44310-0C080)", "https://parts.olathetoyota.com/oem-parts/toyota-power-steering-pump-443100c080"),
          D("American Toyota (2007-2009 Toyota Tundra Power Steering Pump 44310-0C080)", "https://parts.americantoyota.com/oem-parts/toyota-power-steering-pump-443100c080")],
         restriction="hydraulic vane pump with pulley; engine applications differ by VIN (one listing extends to 2010); confirm by VIN")],
      "Hydraulic power steering (vane) pump assembly with pulley for the 2007-2009 Tundra."),
    P("35010-04080-84", "transmission_assembly", "Automatic Transmission Assembly", 4537.29 + CORE,
      [with_core("AutoPartsPrime", 3885.12, "https://www.autopartsprime.com/toyota/reman-atm/oe-350100408084"),
       with_core("Cobb County Toyota", 4537.29, "https://autoparts.cobbcountytoyota.com/products/product/reman-atm-350100408084"),
       with_core("Jim Norton Toyota", 4537.29, "https://autoparts.jimnortontoyota.com/products/product/reman-atm-350100408084")],
      [A(2013, 2015, "Tacoma", "4.0L V6", "vin_dependent",
         [T("Toyota Parts (2014 Toyota Tacoma automatic transmission 35010-04080-84, $1,000 core charge)", "https://parts.toyota.com/p/Toyota_2014_Tacoma/Automatic-Transmission/69296648/350100408084.html"),
          R("AutoPartsPrime (35010-04080-84, 2013-2015 Toyota Tacoma Base / TRD Pro 4.0L)", "https://www.autopartsprime.com/toyota/reman-atm/oe-350100408084")],
         restriction="4.0L V6 automatic; replaces 35000-04060, 35000-04080 and 35010-04060-84; drive type by VIN; confirm by VIN")],
      REMAN_SPEC, condition="remanufactured"),
]
# fmt: on

if __name__ == "__main__":
    build(19, PARTS, "Toyota expansion batch 19 (2026-11-23): high-value parts brief, $200+ final price.")
    out = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "docs", "catalog-expansion", "toyota-expansion-batch-19.json")))
    low = [(r["partNumber"], r["pricing"].get("recommendedPrice")) for r in out["records"] if (r["pricing"].get("recommendedPrice") or 0) < 200]
    if low:
        sys.exit(f"batch 19 is $200+ only: {low}")
