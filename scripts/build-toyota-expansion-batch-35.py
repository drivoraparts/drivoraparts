#!/usr/bin/env python3
"""Toyota catalog expansion batch 35 (2026-11-23): high-value parts brief (steering).

Fitment and prices: ToyotaPartsNow and ToyotaPartsDeal product pages (read directly), plus Toyota dealer
parts stores found by search. Only Toyota catalog photos of the whole part are used.
Not used in this pass: the 44250-06340 Toyota photo (it shows an electric rack; the 2007-2011 Camry rack is
hydraulic), the 45250-0C300 close-up photos 1-2, the 44250-0C200 close-up photo 3, 44250-0C180 (its Toyota
photos show two different rack designs), 44250-0C210 (one price), 45510-07010 (one new price).

    python3 scripts/build-toyota-expansion-batch-35.py
"""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from toyota_batch_common import A, D, P, R, T, build  # noqa: E402,F401

# fmt: off
PARTS = [
    P("44250-0C200", "steering", "Electric Power Steering Rack and Pinion Assembly", 1397.87,
      [("Modern Toyota", 905.64, "https://wholesaledirect.moderntoyota.com/oem-parts/toyota-rack-and-pinion-assembly-442500c200"),
       ("ToyotaPartsDeal", 936.19, "https://www.toyotapartsdeal.com/oem/toyota~gear~assy~electric~44250-0c200.html"),
       ("ToyotaPartsNow", 953.84, "https://www.toyotapartsnow.com/oem/toyota~gear-assy-electric~44250-0c200")],
      [A(2022, 2025, "Tundra", "", "vin_dependent",
         [R("ToyotaPartsNow (44250-0C200: 2022-2025 Tundra 1794 Edition, Capstone, Limited, Platinum, SR, SR5; 3.4L)", "https://www.toyotapartsnow.com/oem/toyota~gear-assy-electric~44250-0c200"),
          D("Modern Toyota (44250-0C200 Rack And Pinion Assembly, 2022-2025, non-TRD Pro)", "https://wholesaledirect.moderntoyota.com/oem-parts/toyota-rack-and-pinion-assembly-442500c200"),
          T("Toyota Parts (Electric Power Steering Gear Assembly 44250-0C200)", "https://autoparts.toyota.com/products/product/gear-assembly-electric-power-steering-442500c200")],
         restriction="electric power steering rack; not TRD Pro (sellers list TRD Pro under 44250-0C210); replaces 44250-0C180; confirm by VIN"),
       A(2023, 2025, "Sequoia", "", "vin_dependent",
         [R("ToyotaPartsNow (44250-0C200: 2023-2025 Sequoia 1794 Edition, Capstone, Limited, Platinum, SR5; 3.4L hybrid)", "https://www.toyotapartsnow.com/oem/toyota~gear-assy-electric~44250-0c200"),
          D("Modern Toyota (44250-0C200 Rack And Pinion Assembly, 2022-2025, non-TRD Pro)", "https://wholesaledirect.moderntoyota.com/oem-parts/toyota-rack-and-pinion-assembly-442500c200")],
         restriction="electric power steering rack; not TRD Pro; confirm by VIN")],
      "Electric power steering rack and pinion assembly (gear assembly, electric). Alignment required after installation."),
    P("44250-0E260", "steering", "Electric Power Steering Rack and Pinion Assembly", 1399.70,
      [("ToyotaPartsDeal", 937.42, "https://www.toyotapartsdeal.com/oem/toyota~gear~assy~electric~44250-0e260.html"),
       ("ToyotaPartsNow", 955.09, "https://www.toyotapartsnow.com/oem/toyota~gear-assy-electric~44250-0e260"),
       ("Longo Toyota", 1110.77, "https://parts.longotoyota.com/oem-parts/toyota-rack-assembly-442500e260")],
      [A(2024, 2025, "Highlander", "", "vin_dependent",
         [R("ToyotaPartsNow (44250-0E260: 2024-2025 Highlander and Highlander Hybrid, 2.4L and 2.5L hybrid)", "https://www.toyotapartsnow.com/oem/toyota~gear-assy-electric~44250-0e260"),
          D("Longo Toyota (Rack Assembly 44250-0E260, 2024-2025 Toyota Highlander)", "https://parts.longotoyota.com/oem-parts/toyota-rack-assembly-442500e260"),
          T("Toyota Parts (Electric Power Steering Gear Assembly 44250-0E260)", "https://autoparts.toyota.com/products/product/gear-assy-electric-power-steering-442500e260")],
         restriction="electric power steering rack; gas and hybrid; Grand Highlander is a different model; confirm by VIN")],
      "Electric power steering rack and pinion assembly (gear assembly, electric). Alignment required after installation."),
    P("45250-0C300", "steering", "Power Tilt Steering Column Assembly", 2972.40,
      [("Olathe Toyota", 1930.05, "https://parts.olathetoyota.com/oem-parts/toyota-steering-column-452500c300"),
       ("ToyotaPartsDeal", 1990.71, "https://www.toyotapartsdeal.com/oem/toyota~column~assy~steerin~45250-0c300.html"),
       ("ToyotaPartsNow", 2028.23, "https://www.toyotapartsnow.com/oem/toyota~column-assembly-steering~45250-0c300")],
      [A(2018, 2019, "Tundra", "", "vin_dependent",
         [D("Olathe Toyota (Steering Column 45250-0C300 for 2018-2019 Toyota Tundra, with power tilt)", "https://parts.olathetoyota.com/oem-parts/toyota-steering-column-452500c300"),
          R("ToyotaPartsNow (45250-0C300: 2018-2019 Tundra 1794 Edition, Limited, Platinum, SR, SR5, TRD Pro)", "https://www.toyotapartsnow.com/oem/toyota~column-assembly-steering~45250-0c300"),
          T("Toyota Parts (Steering Column Assembly 45250-0C300)", "https://autoparts.toyota.com/products/product/column-assy-steerin-452500c300")],
         restriction="trucks with a power tilt column; some sellers list other model years; confirm by VIN")],
      "Power tilt steering column assembly. Steering wheel and airbag are not included."),
    P("45250-06410", "steering", "Steering Column Assembly", 1365.60,
      [("Olathe Toyota", 894.77, "https://parts.olathetoyota.com/oem-parts/toyota-steering-column-4525006410"),
       ("ToyotaPartsDeal", 914.47, "https://www.toyotapartsdeal.com/parts-list/2004-toyota-camry-nap/power_train_chassis/steering_column_shaft.html"),
       ("ToyotaPartsNow", 931.82, "https://www.toyotapartsnow.com/oem/toyota~column-assy-steering~45250-06410")],
      [A(2002, 2004, "Camry", "", "vin_dependent",
         [D("Olathe Toyota (Steering Column 45250-06410 for 2002-2004 Toyota Camry)", "https://parts.olathetoyota.com/oem-parts/toyota-steering-column-4525006410"),
          R("ToyotaPartsNow (45250-06410: 2002-2004 Camry LE, SE, XLE; 2.4L, 3.0L, 3.3L)", "https://www.toyotapartsnow.com/oem/toyota~column-assy-steering~45250-06410"),
          T("Toyota Parts (Steering Column Assembly 45250-06410)", "https://autoparts.toyota.com/products/product/column-assy-steering-4525006410")],
         restriction="Camry sedan (not Camry Solara); confirm by VIN")],
      "Steering column assembly. Steering wheel and airbag are not included."),
    P("45510-0T011", "steering", "Steering Rack and Pinion Assembly", 831.16,
      [("NuCar Toyota", 528.02, "https://toyotaparts.nucar.com/parts/toyota-2009-2015-toyota-venza-steering-gear-455100t011"),
       ("AutoPartsPrime", 547.17, "https://www.autopartsprime.com/p/2015-toyota-venza-steering-gearbox"),
       ("ToyotaPartsDeal", 556.65, "https://www.toyotapartsdeal.com/oem/toyota~gear~assy~steering~45510-0t011.html")],
      [A(2009, 2015, "Venza", "", "vin_dependent",
         [D("NuCar Toyota (2009-2015 Toyota Venza Steering Gear 45510-0T011)", "https://toyotaparts.nucar.com/parts/toyota-2009-2015-toyota-venza-steering-gear-455100t011"),
          R("ToyotaPartsDeal (45510-0T011 Gear Assy, Steering, Venza; replaces 45510-0T010)", "https://www.toyotapartsdeal.com/oem/toyota~gear~assy~steering~45510-0t011.html"),
          T("Toyota Parts (Steering Gear Assembly 45510-0T011)", "https://autoparts.toyota.com/products/product/gear-assy-steering-455100t011")],
         restriction="2009-2015 Venza (the 2021-on Venza is a different vehicle); replaces 45510-0T010; confirm by VIN")],
      "Steering rack and pinion (steering gear) assembly. Alignment required after installation."),
]
# fmt: on

if __name__ == "__main__":
    build(35, PARTS, "Toyota expansion batch 35 (2026-11-23): high-value parts brief, $200+ final price.")
    out = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "docs", "catalog-expansion", "toyota-expansion-batch-35.json")))
    low = [(r["partNumber"], r["pricing"].get("recommendedPrice")) for r in out["records"] if (r["pricing"].get("recommendedPrice") or 0) < 200]
    if low:
        sys.exit(f"batch 35 is $200+ only: {low}")
