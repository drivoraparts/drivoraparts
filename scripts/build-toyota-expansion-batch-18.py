#!/usr/bin/env python3
"""Toyota catalog expansion batch 18 (2026-11-23): Toyota Genuine Remanufactured automatic transmissions.

Owner decision 2026-11-23 (option A): list Toyota remanufactured transmissions at a price that INCLUDES
Toyota's $1,000 core charge, so the customer returns no old unit. Competitor references are therefore the
dealer's sale price plus the $1,000 core charge each dealer page states (what a buyer pays a dealer when
keeping the old unit), and the price is 5% under the lowest of those totals. Photos are Toyota's own
catalog photos of each -84 part number. Condition: remanufactured.

    python3 scripts/build-toyota-expansion-batch-18.py
"""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from toyota_batch_common import A, D, P, R, T, build  # noqa: E402,F401

CORE = 1000.00
SPEC = ("Toyota Genuine Remanufactured automatic transmission, rebuilt by Toyota to its fit and performance "
        "standards. The price includes Toyota's $1,000 core charge, so no old transmission has to be returned.")


def with_core(name, sale, url):
    return (f"{name} (sale ${sale:,.2f} + ${CORE:,.0f} core charge)", round(sale + CORE, 2), url)


# fmt: off
PARTS = [
    P("35010-0C090-84", "transmission_assembly", "Automatic Transmission Assembly", 3137.04 + CORE,
      [with_core("ToyotaPartsDeal", 2659.48, "https://www.toyotapartsdeal.com/oem/toyota~reman~atm~35010-0c090-84.html"),
       with_core("Longo Toyota", 2676.37, "https://parts.longotoyota.com/oem-parts/toyota-transmission-350100c09084"),
       with_core("Lakeland Toyota", 2747.43, "https://toyotaparts.lakelandtoyota.com/oem-parts/toyota-transmission-350100c09084")],
      [A(2007, 2013, "Tundra", "4.0L V6", "vin_dependent",
         [D("Lakeland Toyota (2007-2013 Toyota Tundra Transmission 35010-0C090-84)", "https://toyotaparts.lakelandtoyota.com/oem-parts/toyota-transmission-350100c09084"),
          D("Longo Toyota (35010-0C090-84 Transmission 2007-2013 Toyota Tundra, 4.0L V6)", "https://parts.longotoyota.com/oem-parts/toyota-transmission-350100c09084")],
         restriction="4.0L V6 automatic; replaces 35000-0C090 and 35000-0C360; ToyotaPartsDeal lists 2007-2011 only; drive type and calibration by VIN; confirm by VIN")],
      SPEC, condition="remanufactured"),
    P("35010-60E00-84", "transmission_assembly", "Automatic Transmission Assembly", 3293.89 + CORE,
      [with_core("Olathe Toyota", 2710.71, "https://parts.olathetoyota.com/oem-parts/toyota-transmission-3501060e0084"),
       with_core("ToyotaPartsDeal", 2791.40, "https://www.toyotapartsdeal.com/oem/toyota~reman~atm~35010-60e00-84.html"),
       with_core("American Toyota", 2810.19, "https://parts.americantoyota.com/oem-parts/toyota-automatic-transmission-assembly-3501060e0084")],
      [A(2010, 2023, "4Runner", "4.0L V6", "vin_dependent",
         [D("American Toyota (2010-2023 Toyota 4Runner Transmission 35010-60E00-84)", "https://parts.americantoyota.com/oem-parts/toyota-automatic-transmission-assembly-3501060e0084"),
          D("Longo Toyota (35010-60E00-84, 2010-2024 Toyota 4Runner 4WD)", "https://parts.longotoyota.com/oem-parts/toyota-transmission-3501060e0084")],
         restriction="4.0L V6 automatic, 4WD per Longo Toyota; replaces 35000-0W090 and 35010-60C20-84; ToyotaPartsDeal lists 2012-2016 only; confirm by VIN")],
      SPEC, condition="remanufactured"),
    P("35010-35A40-84", "transmission_assembly", "Automatic Transmission Assembly", 2914.03 + CORE,
      [with_core("Olathe Toyota", 2420.10, "https://parts.olathetoyota.com/oem-parts/toyota-automatic-transmission-assembly-3501035a4084"),
       with_core("Conicelli Toyota of Conshohocken", 2442.10, "https://parts.conicellitoyotaofconshohocken.com/oem-parts/toyota-automatic-transmission-assembly-3501035a4084"),
       with_core("ToyotaPartsDeal", 2471.90, "https://www.toyotapartsdeal.com/oem/toyota~reman~atm~35010-35a40-84.html"),
       with_core("Freeman Toyota", 2622.63, "https://parts.freemantoyota.com/parts/toyota-automatic-transmission-assembly-3501035a4084"),
       with_core("Frontier Toyota", 2750.11, "https://parts.frontiertoyota.com/oem-parts/toyota-automatic-transmission-assembly-3501035a4084")],
      [A(2004, 2009, "4Runner", "", "vin_dependent",
         [D("Olathe Toyota (2004-2009 Toyota 4Runner Automatic Transmission Assembly 35010-35A40-84)", "https://parts.olathetoyota.com/oem-parts/toyota-automatic-transmission-assembly-3501035a4084"),
          D("Frontier Toyota (2004-2009 Toyota 4Runner Automatic Transmission Assembly 35010-35A40-84)", "https://parts.frontiertoyota.com/oem-parts/toyota-automatic-transmission-assembly-3501035a4084")],
         restriction="automatic transmission; dealer listings note 2WD with the 4.7L V8, while ToyotaPartsDeal lists both the 4.0L V6 and 4.7L V8; engine and drive type by VIN; confirm by VIN")],
      SPEC, condition="remanufactured"),
]
# fmt: on

if __name__ == "__main__":
    build(18, PARTS, "Toyota expansion batch 18 (2026-11-23): Toyota Genuine Remanufactured transmissions, core charge included.")
    out = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "docs", "catalog-expansion", "toyota-expansion-batch-18.json")))
    low = [(r["partNumber"], r["pricing"].get("recommendedPrice")) for r in out["records"] if (r["pricing"].get("recommendedPrice") or 0) < 500]
    if low:
        sys.exit(f"batch 18 is $500+ only: {low}")
