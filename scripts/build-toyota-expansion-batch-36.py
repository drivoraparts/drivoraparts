#!/usr/bin/env python3
"""Toyota catalog expansion batch 36 (2026-11-23): high-value parts brief (steering, first genuine seat).

Fitment and configuration: ToyotaPartsDeal product pages and its model-year parts lists (seat rows give the
airbag option, colour and trim code), Toyota dealer stores. Only Toyota catalog photos of the whole part are used.
The seat is a complete new genuine Toyota front seat assembly; Toyota's photo is of this part number.

    python3 scripts/build-toyota-expansion-batch-36.py
"""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from toyota_batch_common import A, D, P, R, T, build  # noqa: E402,F401

# fmt: off
PARTS = [
    P("44250-0E220", "steering", "Electric Power Steering Rack and Pinion Assembly", 1339.48,
      [("Conicelli Toyota of Conshohocken", 867.79, "https://parts.conicellitoyotaofconshohocken.com/oem-parts/toyota-2024-toyota-grand-highlander-gear-assembly-442500e220"),
       ("ToyotaPartsDeal", 897.09, "https://www.toyotapartsdeal.com/oem/toyota~gear~assy~electric~44250-0e220.html"),
       ("ToyotaPartsNow", 914.00, "https://www.toyotapartsnow.com/parts-select/toyota-grand-highlander-rack-and-pinion")],
      [A(2024, 2025, "Grand Highlander", "", "vin_dependent",
         [R("ToyotaPartsDeal (44250-0E220 Gear Assy, Electric: 2024-2025 Toyota Grand Highlander)", "https://www.toyotapartsdeal.com/oem/toyota~gear~assy~electric~44250-0e220.html"),
          D("Conicelli Toyota of Conshohocken (44250-0E220, 2024 Toyota Grand Highlander gear assembly)", "https://parts.conicellitoyotaofconshohocken.com/oem-parts/toyota-2024-toyota-grand-highlander-gear-assembly-442500e220"),
          T("Toyota Parts (Electric Power Steering Gear Assembly 44250-0E220)", "https://autoparts.toyota.com/products/product/gear-assy-electric-power-steering-442500e220")],
         restriction="electric power steering rack; sellers list LE, XLE, Limited, Platinum and Hybrid XLE / Limited / Platinum / Nightshade (Hybrid MAX not listed); confirm by VIN")],
      "Electric power steering rack and pinion assembly (gear assembly, electric) with inner tie rods and boots. Alignment required after installation."),
    P("71200-35A81-B0", "seat", "Front Driver Seat Assembly (Stone)", 3509.47,
      [("ToyotaPartsDeal", 2350.40, "https://www.toyotapartsdeal.com/oem/toyota~seat~assy~fr~lh~71200-35a81-b0.html"),
       ("ToyotaPartsNow", 2394.70, "https://www.toyotapartsnow.com/oem/toyota~seat-assembly-front-lh~71200-35a81-b0"),
       ("JoeTLC", 3860.49, "https://www.joetlc.com/products/front-lh-seat-assembly-for-toyota-4runner-2002-2009-71200-35a81-b0")],
      [A(2003, 2005, "4Runner", "SR5", "vin_dependent",
         [R("ToyotaPartsDeal (71200-35A81-B0 Seat Assembly, Front Driver Side: 2003-2005 4Runner, GRN21# / UZN21#)", "https://www.toyotapartsdeal.com/oem/toyota~seat~assy~fr~lh~71200-35a81-b0.html"),
          R("ToyotaPartsDeal 2004 4Runner seat parts list (replaces 71200-3D780-B4 / -B7, 3D781-B0: SR5, SRS airbags driver, passenger, side and curtain, Stone, trim 12)", "https://www.toyotapartsdeal.com/parts-list/2004-toyota-4runner/body/seat_seat_track.html"),
          T("Toyota Parts (Seat Assembly, Front LH 71200-35A81-B0)", "https://autoparts.toyota.com/products/product/seat-assy-fr-lh-7120035a81b0")],
         restriction="SR5 with Stone (trim code 12) upholstery, on trucks with driver, passenger, side and curtain airbags; other colours and trims use different numbers; match the trim code and confirm by VIN")],
      "Complete new front driver (left-hand) seat assembly, cushion and back, in Stone (trim code 12). Replaces 71200-3D780-B4, 71200-3D780-B7 and 71200-3D781-B0."),
]
# fmt: on

if __name__ == "__main__":
    build(36, PARTS, "Toyota expansion batch 36 (2026-11-23): high-value parts brief, $200+ final price.")
    out = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "docs", "catalog-expansion", "toyota-expansion-batch-36.json")))
    low = [(r["partNumber"], r["pricing"].get("recommendedPrice")) for r in out["records"] if (r["pricing"].get("recommendedPrice") or 0) < 200]
    if low:
        sys.exit(f"batch 36 is $200+ only: {low}")
