#!/usr/bin/env python3
"""Toyota catalog expansion batch 15 (2026-11-22): Land Cruiser 200 genuine parts, $200+.

Parts earlier rejected only by the old $500 Land Cruiser floor, now eligible under the owner's
$200 floor. Photos are Toyota's own catalog photos (epc-images.toyota.com).

    python3 scripts/build-toyota-expansion-batch-15.py
"""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from toyota_batch_common import A, D, P, R, T, build  # noqa: E402,F401

# fmt: off
PARTS = [
    P("16400-50384", "radiator", "Radiator Assembly", 477.03,
      [("OEMGenuineParts.com", 321.20, "https://www.oemgenuineparts.com/oem-parts/toyota-radiator-1640050384"),
       ("ToyotaPartsDeal", 332.68, "https://www.toyotapartsdeal.com/oem/toyota~radiator~assy~16400-50384.html"),
       ("American Toyota", 338.41, "https://parts.americantoyota.com/oem-parts/toyota-radiator-1640050384"),
       ("Camelback Toyota", 341.28, "https://parts.camelbacktoyota.com/oem-parts/toyota-radiator-1640050384"),
       ("Frontier Toyota", 372.83, "https://parts.frontiertoyota.com/oem-parts/toyota-radiator-1640050384")],
      [A(2010, 2021, "Land Cruiser", "5.7L V8", "vin_dependent",
         [D("American Toyota (2010-2021 Toyota Land Cruiser Radiator 16400-50384)", "https://parts.americantoyota.com/oem-parts/toyota-radiator-1640050384"),
          D("Camelback Toyota (2010-2021 Toyota Land Cruiser Radiator 16400-50384)", "https://parts.camelbacktoyota.com/oem-parts/toyota-radiator-1640050384"),
          D("OEMGenuineParts (16400-50384 Radiator, 2010-2021 Toyota Land Cruiser)", "https://www.oemgenuineparts.com/oem-parts/toyota-radiator-1640050384")],
         restriction="200 Series, 5.7L V8; one retailer also lists 2009; confirm by VIN")],
      "Engine cooling radiator assembly for the 200-series Land Cruiser."),
    P("53301-60690", "hood", "Hood Panel", 775.11,
      [("Olathe Toyota", 493.35, "https://parts.olathetoyota.com/v-2016-toyota-land-cruiser--base--5-7l-v8-gas/body--hood-and-components"),
       ("ToyotaPartsDeal (2016 Land Cruiser hood page)", 493.60, "https://www.toyotapartsdeal.com/oem-2016-toyota-land_cruiser-hood.html"),
       ("Ourisman Toyota of Richmond", 512.59, "https://parts.ourismantoyotaofrichmond.com/oem-parts/toyota-hood-5330160690"),
       ("Toyota of El Cajon", 535.89, "https://toyotaparts.toyotaofelcajon.com/oem-parts/toyota-hood-5330160690")],
      [A(2016, 2021, "Land Cruiser", "5.7L V8", "vin_dependent",
         [D("Toyota of El Cajon (Hood Panel - 2016-2021 Toyota Land Cruiser, 53301-60690)", "https://toyotaparts.toyotaofelcajon.com/oem-parts/toyota-hood-5330160690"),
          D("Olathe Toyota (2016 Toyota Land Cruiser hood and components, 53301-60690)", "https://parts.olathetoyota.com/v-2016-toyota-land-cruiser--base--5-7l-v8-gas/body--hood-and-components")],
         restriction="200 Series, 2016-2021 facelift; one retailer also lists 2015; confirm by VIN")],
      "Steel hood panel (hood sub-assembly) for the 2016-2021 200-series Land Cruiser."),
]
# fmt: on

if __name__ == "__main__":
    build(15, PARTS, "Toyota expansion batch 15 (2026-11-22): Land Cruiser 200 genuine parts, $200+ final price.")
    out = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "docs", "catalog-expansion", "toyota-expansion-batch-15.json")))
    low = [(r["partNumber"], r["pricing"].get("recommendedPrice")) for r in out["records"] if (r["pricing"].get("recommendedPrice") or 0) < 200]
    if low:
        sys.exit(f"batch 15 is $200+ only; below the sitewide minimum: {low}")
