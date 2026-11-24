#!/usr/bin/env python3
"""Toyota catalog expansion batch 45 (2026-11-24): high-value parts brief (transmissions).

Toyota Genuine Remanufactured automatic transaxle found by the ToyotaPartsDeal transmission parts-list sweep and
Toyota's catalog photo host. As in batches 22 and 43, the $1,000 Toyota core charge is included in the price and
every competitor price is compared with its core added. Toyota's whole-unit photos 1-2 are used (photo 3 has a
strong colour cast).

    python3 scripts/build-toyota-expansion-batch-45.py
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
    P("30510-1A870-84", "transmission_assembly", "Automatic Transaxle Assembly", 2781.58 + CORE,
      [with_core("Olathe Toyota", 2289.11, "https://parts.olathetoyota.com/v-2009-toyota-matrix--s--2-4l-l4-gas/automatic-transmission--automatic-transmission"),
       with_core("OEMPartsOnline", 2331.11, "https://toyota.oempartsonline.com/v-2009-toyota-corolla--xrs--2-4l-l4-gas/automatic-transmission--automatic-transmission"),
       with_core("ToyotaPartsDeal", 2360.51, "https://www.toyotapartsdeal.com/oem/toyota~x~30510-1A870-84.html"),
       with_core("ToyotaPartsNow", 2404.61, "https://www.toyotapartsnow.com/oem/toyota~x~30510-1A870-84"),
       with_core("Tom Wood Toyota", 2781.58, "https://parts.tomwoodtoyota.com/oem-parts/toyota-trans-axle-305101a87084")],
      [A(2009, 2010, "Corolla", "XRS", "vin_dependent",
         [R("ToyotaPartsNow (30510-1A870-84: 2009-2010 Corolla XRS 2.4L; 2009-2013 Matrix S, XRS 2.4L)", "https://www.toyotapartsnow.com/oem/toyota~x~30510-1A870-84"),
          D("OEMPartsOnline (2009 Toyota Corolla XRS 2.4L automatic transmission)", "https://toyota.oempartsonline.com/v-2009-toyota-corolla--xrs--2-4l-l4-gas/automatic-transmission--automatic-transmission"),
          D("Tom Wood Toyota (Trans-Axle 30510-1A870-84, 2009-2013 Toyota)", "https://parts.tomwoodtoyota.com/oem-parts/toyota-trans-axle-305101a87084")],
         restriction="2.4L 2AZ-FE, front-wheel drive; confirm by VIN"),
       A(2009, 2013, "Matrix", "S / XRS", "vin_dependent",
         [R("ToyotaPartsNow (30510-1A870-84: 2009-2013 Matrix S, XRS 2.4L)", "https://www.toyotapartsnow.com/oem/toyota~x~30510-1A870-84"),
          D("Olathe Toyota (2009 Toyota Matrix S 2.4L automatic transmission)", "https://parts.olathetoyota.com/v-2009-toyota-matrix--s--2-4l-l4-gas/automatic-transmission--automatic-transmission")],
         restriction="2.4L 2AZ-FE, front-wheel drive only (not AWD); confirm by VIN")],
      REMAN_SPEC, condition="remanufactured"),
]
# fmt: on

if __name__ == "__main__":
    build(45, PARTS, "Toyota expansion batch 45 (2026-11-24): high-value parts brief, $200+ final price.")
    out = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "docs", "catalog-expansion", "toyota-expansion-batch-45.json")))
    low = [(r["partNumber"], r["pricing"].get("recommendedPrice")) for r in out["records"] if (r["pricing"].get("recommendedPrice") or 0) < 200]
    if low:
        sys.exit(f"batch 45 is $200+ only: {low}")
