#!/usr/bin/env python3
"""Toyota catalog expansion batch 44 (2026-11-24): high-value parts brief (genuine seat).

Found by the front-seat parts-list sweep (models whose seat page is `front_seat_seat_track`) and Toyota's photo host.
Configuration from the Toyota catalog row (airbags, colour, trim code). Only the whole-seat photo is used
(photo 2 is a mechanism close-up).

    python3 scripts/build-toyota-expansion-batch-44.py
"""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from toyota_batch_common import A, D, P, R, T, build  # noqa: E402,F401

# fmt: off
PARTS = [
    P("71100-47260-B2", "seat", "Front Passenger Seat Assembly (Medium Gray Cloth)", 3826.30,
      [("Olathe Toyota", 2507.38, "https://parts.olathetoyota.com/v-2008-toyota-prius--touring--1-5l-l4-electric-gas/body--front-seat-components"),
       ("American Toyota", 2537.18, "https://parts.americantoyota.com/v-2009-toyota-prius--base--1-5l-l4-electric-gas/body--front-seat-components"),
       ("ToyotaPartsDeal", 2562.59, "https://www.toyotapartsdeal.com/oem/toyota~x~71100-47260-B2.html"),
       ("ToyotaPartsNow", 2610.90, "https://www.toyotapartsnow.com/oem/toyota~x~71100-47260-B2")],
      [A(2006, 2009, "Prius", "", "vin_dependent",
         [R("ToyotaPartsNow (71100-47260-B2: 2006-2009 Prius Base, Touring)", "https://www.toyotapartsnow.com/oem/toyota~x~71100-47260-B2"),
          R("ToyotaPartsDeal 2006 Prius front seat parts list (SRS airbags driver, passenger, side and curtain shield; medium gray, trim 1#; NHW20 USA)", "https://www.toyotapartsdeal.com/parts-list/2006-toyota-prius/body/front_seat_seat_track.html"),
          D("American Toyota (2009 Toyota Prius front seat components: seat assembly with side air bag, gray, cloth)", "https://parts.americantoyota.com/v-2009-toyota-prius--base--1-5l-l4-electric-gas/body--front-seat-components")],
         restriction="front passenger (right-hand) seat, medium gray cloth (trim code 1), with side and curtain airbags; confirm trim code and VIN")],
      "Complete new front passenger (right-hand) seat assembly, cushion and back, medium gray cloth (trim code 1)."),
]
# fmt: on

if __name__ == "__main__":
    build(44, PARTS, "Toyota expansion batch 44 (2026-11-24): high-value parts brief, $200+ final price.")
    out = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "docs", "catalog-expansion", "toyota-expansion-batch-44.json")))
    low = [(r["partNumber"], r["pricing"].get("recommendedPrice")) for r in out["records"] if (r["pricing"].get("recommendedPrice") or 0) < 200]
    if low:
        sys.exit(f"batch 44 is $200+ only: {low}")
