#!/usr/bin/env python3
"""Toyota catalog expansion batch 43 (2026-11-24): high-value parts brief (transmissions).

Toyota Genuine Remanufactured automatic transaxle found by the ToyotaPartsDeal transmission parts-list sweep and
Toyota's catalog photo host. As in batch 22, the $1,000 Toyota core charge is included in the price and every
competitor price is compared with its core added. Only Toyota's whole-unit photo is used (photo 2 shows the
unit in its shipping tray, photo 3 a component).
Held in the same pass: 30510-33381-84 (photo has a strong colour cast), 30510-48120-84 (two prices),
30500-06050 / 30500-33371 (superseded by reman numbers without photos), 30510-45020-84 (discontinued).

    python3 scripts/build-toyota-expansion-batch-43.py
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
    P("30510-41130-84", "transmission_assembly", "Automatic Transaxle Assembly", 2869.98 + CORE,
      [with_core("Toyota of Nashua", 2426.86, "https://parts.toyotaofnashua.com/oem-parts/toyota-trans-axle-305104113084"),
       with_core("ToyotaPartsDeal", 2434.86, "https://www.toyotapartsdeal.com/oem/toyota~x~30510-41130-84.html"),
       with_core("ToyotaPartsNow", 2480.36, "https://www.toyotapartsnow.com/oem/toyota~x~30510-41130-84"),
       with_core("Longo Toyota", 2816.89, "https://parts.longotoyota.com/oem-parts/toyota-trans-axle-305104113084")],
      [A(2000, 2004, "Avalon", "3.0L V6", "vin_dependent",
         [R("ToyotaPartsNow (30510-41130-84: 2000-2004 Avalon XL, XLS, 3.0L)", "https://www.toyotapartsnow.com/oem/toyota~x~30510-41130-84"),
          D("Longo Toyota (30510-41130-84 Trans-Axle 2000-2004 Toyota Avalon)", "https://parts.longotoyota.com/oem-parts/toyota-trans-axle-305104113084"),
          D("Toyota of Nashua (30510-41130-84 Trans-Axle 2000-2004 Toyota Avalon)", "https://parts.toyotaofnashua.com/oem-parts/toyota-trans-axle-305104113084")],
         restriction="3.0L V6 (1MZ-FE), floor shift; confirm by VIN")],
      REMAN_SPEC, condition="remanufactured"),
]
# fmt: on

if __name__ == "__main__":
    build(43, PARTS, "Toyota expansion batch 43 (2026-11-24): high-value parts brief, $200+ final price.")
    out = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "docs", "catalog-expansion", "toyota-expansion-batch-43.json")))
    low = [(r["partNumber"], r["pricing"].get("recommendedPrice")) for r in out["records"] if (r["pricing"].get("recommendedPrice") or 0) < 200]
    if low:
        sys.exit(f"batch 43 is $200+ only: {low}")
