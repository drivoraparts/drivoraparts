#!/usr/bin/env python3
"""Toyota catalog expansion batch 22 (2026-11-23): high-value parts brief (transmissions).

Toyota Genuine Remanufactured automatic transaxles found by the round 5 photo sweep (30510-xxxxx-84).
Prices follow the owner's decision of 2026-11-23: the $1,000 Toyota core charge is included, so no old
unit has to be returned, and every competitor price is compared with its core added.
Held in the same pass: 30510-48120-84 (one price), 30510-33140-84 (no current price).

    python3 scripts/build-toyota-expansion-batch-22.py
"""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from toyota_batch_common import A, D, P, R, T, build  # noqa: E402,F401

CORE = 1000.00
REMAN_SPEC = ("Toyota Genuine Remanufactured automatic transaxle, rebuilt by Toyota to its fit and performance "
              "standards. The price includes Toyota's $1,000 core charge, so no old transaxle has to be returned.")


def with_core(name, price, url):
    return (f"{name} (${price:,.2f} + ${CORE:,.0f} core charge)", round(price + CORE, 2), url)


# fmt: off
PARTS = [
    P("30510-42320-84", "transmission_assembly", "Automatic Transaxle Assembly", 3099.96 + CORE,
      [with_core("Ourisman Toyota of Richmond", 2572.18, "https://toyotaparts.ourismantoyotaofrichmond.com/oem-parts/toyota-trans-axle-305104232084"),
       with_core("American Toyota", 2597.92, "https://parts.americantoyota.com/oem-parts/toyota-transaxle-305104232084"),
       with_core("Toyota of Colorado Springs", 2621.33, "https://parts.toyotaofcoloradosprings.com/oem-parts/toyota-trans-axle-305104232084"),
       with_core("Toyota South", 2691.54, "https://parts.toyotasouth.com/oem-parts/toyota-trans-axle-305104232084"),
       with_core("Capo Valley Toyota", 2789.96, "https://parts.capovalleytoyota.com/oem-parts/toyota-trans-axle-305104232084"),
       with_core("Camelback Toyota", 2925.59, "https://parts.camelbacktoyota.com/oem-parts/toyota-trans-axle-305104232084")],
      [A(2006, 2008, "RAV4", "2.4L", "vin_dependent",
         [T("Toyota Parts (2006 Toyota RAV4 REMAN ATM 30510-42320-84)", "https://parts.toyota.com/p/Toyota_2006_RAV4/REMAN-ATM/69294663/305104232084.html"),
          D("Ourisman Toyota of Richmond (30510-42320-84 Trans-Axle 2006-2008 Toyota RAV4)", "https://toyotaparts.ourismantoyotaofrichmond.com/oem-parts/toyota-trans-axle-305104232084"),
          D("Camelback Toyota (2006-2008 Toyota RAV4 Trans-Axle 30510-42320-84)", "https://parts.camelbacktoyota.com/oem-parts/toyota-trans-axle-305104232084")],
         restriction="2.4L 4-cylinder, 4WD (dealer note: 2.4L, 4WD); replaces 30500-42220, 30500-42221, 30500-42320 and 30510-42220-84; confirm by VIN")],
      REMAN_SPEC, condition="remanufactured"),
    P("30510-48150-84", "transmission_assembly", "Automatic Transaxle Assembly", 2994.46 + CORE,
      [with_core("Modern Toyota", 2509.50, "https://wholesaledirect.moderntoyota.com/oem-parts/toyota-trans-axle-assembly-auto-305104815084"),
       with_core("ToyotaPartsDeal", 2575.72, "https://www.toyotapartsdeal.com/oem/toyota~reman~atm~30510-48150-84.html"),
       with_core("Lakeland Toyota", 2622.54, "https://toyotaparts.lakelandtoyota.com/oem-parts/toyota-trans-axle-305104815084"),
       with_core("Frontier Toyota", 3119.92, "https://parts.frontiertoyota.com/oem-parts/toyota-trans-axle-305104815084")],
      [A(2004, 2007, "Highlander", "3.3L V6", "vin_dependent",
         [D("Lakeland Toyota (2004-2007 Toyota Highlander Trans-Axle 30510-48150-84)", "https://toyotaparts.lakelandtoyota.com/oem-parts/toyota-trans-axle-305104815084"),
          D("Frontier Toyota (2004-2007 Toyota Highlander Trans-Axle 30510-48150-84)", "https://parts.frontiertoyota.com/oem-parts/toyota-trans-axle-305104815084"),
          D("Modern Toyota (OEM 2004-2007 Toyota Highlander Trans-axle Assembly 30510-48150-84)", "https://wholesaledirect.moderntoyota.com/oem-parts/toyota-trans-axle-assembly-auto-305104815084")],
         restriction="3.3L V6 AWD (gasoline; not the hybrid); confirm drive type by VIN")],
      REMAN_SPEC, condition="remanufactured"),
]
# fmt: on

if __name__ == "__main__":
    build(22, PARTS, "Toyota expansion batch 22 (2026-11-23): high-value parts brief, $200+ final price.")
    out = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "docs", "catalog-expansion", "toyota-expansion-batch-22.json")))
    low = [(r["partNumber"], r["pricing"].get("recommendedPrice")) for r in out["records"] if (r["pricing"].get("recommendedPrice") or 0) < 200]
    if low:
        sys.exit(f"batch 22 is $200+ only: {low}")
