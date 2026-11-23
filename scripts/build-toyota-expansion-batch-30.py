#!/usr/bin/env python3
"""Toyota catalog expansion batch 30 (2026-11-23): high-value parts brief (steering).

Only Toyota catalog photos of the whole part are used (the 44250-0C121 bearing and JTEKT label photos are not).
Held in the same pass: 44250-0C200 (2022-on Tundra / Sequoia rack): one price ($905.64) on two sites.

    python3 scripts/build-toyota-expansion-batch-30.py
"""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from toyota_batch_common import A, D, P, R, T, build  # noqa: E402,F401

# fmt: off
PARTS = [
    P("44250-0C121", "steering", "Power Steering Rack and Pinion Assembly", 957.08,
      [("Ourisman Toyota of Richmond", 630.05, "https://toyotaparts.ourismantoyotaofrichmond.com/oem-parts/toyota-rack-and-pinion-assembly-442500c121"),
       ("Grieco Toyota", 630.92, "https://parts.griecotoyota.com/oem-parts/toyota-rack-and-pinion-assembly-442500c121"),
       ("Jim Hudson Toyota", 633.56, "https://parts.jimhudsontoyota.com/oem-parts/toyota-rack-and-pinion-assembly-442500c121"),
       ("Lakeland Toyota", 667.45, "https://toyotaparts.lakelandtoyota.com/oem-parts/toyota-rack-and-pinion-assembly-442500c121"),
       ("Longo Toyota", 759.51, "https://parts.longotoyota.com/oem-parts/toyota-rack-and-pinion-assembly-442500c121")],
      [A(2008, 2022, "Sequoia", "", "vin_dependent",
         [D("Longo Toyota (44250-0C121 Rack And Pinion Assembly 2008-2022 Toyota Sequoia)", "https://parts.longotoyota.com/oem-parts/toyota-rack-and-pinion-assembly-442500c121"),
          D("Grieco Toyota (2008-2022 Toyota Sequoia Rack And Pinion Assembly 44250-0C121)", "https://parts.griecotoyota.com/oem-parts/toyota-rack-and-pinion-assembly-442500c121"),
          D("Lakeland Toyota (2008-2022 Toyota Sequoia Rack And Pinion Assembly 44250-0C121)", "https://toyotaparts.lakelandtoyota.com/oem-parts/toyota-rack-and-pinion-assembly-442500c121")],
         restriction="hydraulic power rack; dealers note a production split (to 09/2017, from 10/2017) and supersession from 44250-0C090 / 0C091 / 0C120; confirm by VIN")],
      "Hydraulic power steering rack and pinion assembly. Alignment required after installation."),
    P("44310-0C090", "ps_pump", "Power Steering Pump Assembly", 417.49,
      [("Lakeland Toyota", 285.12, "https://toyotaparts.lakelandtoyota.com/oem-parts/toyota-power-steering-pump-443100c090"),
       ("American Toyota", 296.17, "https://parts.americantoyota.com/oem-parts/toyota-power-steering-pump-443100c090"),
       ("Capo Valley Toyota", 313.12, "https://parts.capovalleytoyota.com/oem-parts/toyota-power-steering-pump-443100c090")],
      [A(2007, 2021, "Tundra", "", "vin_dependent",
         [D("American Toyota (2007-2021 Toyota Tundra Power Steering Pump 44310-0C090)", "https://parts.americantoyota.com/oem-parts/toyota-power-steering-pump-443100c090"),
          D("Lakeland Toyota (2007-2021 Toyota Tundra Power Steering Pump 44310-0C090)", "https://toyotaparts.lakelandtoyota.com/oem-parts/toyota-power-steering-pump-443100c090")],
         restriction="hydraulic vane pump with pulley; engine applications differ by VIN; confirm by VIN")],
      "Hydraulic power steering (vane) pump assembly with pulley."),
]
# fmt: on

if __name__ == "__main__":
    build(30, PARTS, "Toyota expansion batch 30 (2026-11-23): high-value parts brief, $200+ final price.")
    out = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "docs", "catalog-expansion", "toyota-expansion-batch-30.json")))
    low = [(r["partNumber"], r["pricing"].get("recommendedPrice")) for r in out["records"] if (r["pricing"].get("recommendedPrice") or 0) < 200]
    if low:
        sys.exit(f"batch 30 is $200+ only: {low}")
