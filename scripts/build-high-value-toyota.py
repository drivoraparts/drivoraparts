#!/usr/bin/env python3
"""Brand-name, high-value products for US-market Toyota applications (high-value brief, 2026-11-23).

Writes lib/inventory/data/high-value-toyota.json (loaded by lib/inventory/high-value-toyota-products.ts),
the product photos under public/product-media/, their provenance in lib/inventory/data/image-provenance.json,
and the price / spec evidence in docs/catalog-expansion/high-value-120/high-value-toyota-evidence.json.

Genuine Toyota parts keep going through scripts/import-toyota-genuine-oem.py; Nitto tires through
scripts/build-toyota-tires.py. This file is for other manufacturers' products that are built for a
specific US Toyota model (turbochargers, engines, transmissions, steering, seats).

Rules applied here (owner briefs): US-market Toyota application only; at least three attributed US prices
for the same part number and the same configuration (core / no core); price 5% under the lowest, never
below $200; the manufacturer's own description of what is in the box, never "complete" unless the
manufacturer says so; a clean manufacturer photograph with recorded provenance.

    python3 scripts/build-high-value-toyota.py <dir with the downloaded photos>
"""
import hashlib
import json
import math
import os
import sys

from PIL import Image

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
SRC = sys.argv[1]
CHECKED = "2026-11-23"

PRODUCTS = [
    {
        "id": 5101,
        "category": "turbocharger",
        "brand": "vargas-turbo-technologies",
        "maker": "Vargas Turbo Technologies (VTT)",
        "partNumber": "VTT-B58-GC-2",
        "aliases": ["B58TU2GC", "VTTB58GC2port"],
        "name": "Vargas Turbo Technologies VTT B58 GC Turbocharger Upgrade VTT-B58-GC-2 for 2020 Toyota GR Supra 3.0 (2-Port Manifold)",
        "summary": ("VTT \"GC\" turbocharger upgrade for the B58 engine with the 2-port exhaust manifold, made from new castings "
                    "(not a rebuilt factory turbocharger). Aftermarket part; not made or warranted by Toyota."),
        "specs": [
            ("Manufacturer", "Vargas Turbo Technologies (VTT)"),
            ("Manufacturer part number", "VTT-B58-GC-2 (also listed as B58TU2GC)"),
            ("Engine", "B58 3.0L inline-6 turbo, 2-port exhaust manifold"),
            ("Supported power (manufacturer)", "stock to 600 WHP"),
            ("Construction (manufacturer)", "100% new castings; GC is the cold side and bearing housing (the GC+ is the complete unit, sold separately)"),
            ("Turbine wheel", "9-blade Mar-M 246"),
            ("Compressor wheel", "9-blade point-milled"),
            ("Inlet", "3 in. turbocharger inlet"),
            ("Connections", "factory oil, water, downpipe and charge pipe connections"),
            ("Core charge", "none; the unit is sold outright"),
            ("Manufacturer warranty", "12 months, unlimited mileage (per VTT)"),
            ("Condition", "New"),
        ],
        "includes": [
            "1 VTT B58 \"GC\" turbocharger",
            "1 VTT 3 in. to 4 in. silicone inlet elbow with adapters for the factory connections",
            "1 3 in. hose clamp for the inlet elbow",
            "1 optional 4 in. connector for the inlet elbow, for use with the stock airbox",
        ],
        "notes": [
            "Install kit, fuel system upgrades and an engine tune are not included. VTT recommends pairing the upgrade with a tune and supporting parts.",
            "For off-road / competition use; check emissions rules in your state before installing.",
        ],
        "fitText": ("2020 Toyota GR Supra 3.0 (A90, B58 engine with the 2-port exhaust manifold). Does not fit 2021-and-later "
                    "GR Supra 3.0 (6-port manifold), which uses VTT-B58-GC-3; confirm the manifold port count on your engine"),
        "fitmentApplications": [
            {"yearFrom": 2020, "yearTo": 2020, "make": "Toyota", "model": "GR Supra",
             "submodel": "3.0L B58 inline-6 turbo, 2-port exhaust manifold"},
        ],
        "fitmentSources": [
            "https://www.urotuning.com/products/vargas-turbo-technologies-b58-gc-gc-turbocharger-upgrade-vtt-b58-gc-1 (variant \"GC / B58 TU 2020 A90 Supra (B58 2 Port Manifold)\", SKU VTT-B58-GC-2)",
            "https://www.turnermotorsport.com/p-25507162-vtt-gc-turbocharger-upgrade-b58tu-2-port-a90-mk5-supra (B58TU 2-Port, A90 MK5 Supra)",
            "https://www.ecstuning.com/b-vargas-turbo-technologies-parts/vtt-gc-turbocharger-upgrade-b58tu-2-port-a90-mk5-supra/b58tu2gc~vtt/",
        ],
        "fitmentCaveat": ("UroTuning's shared GC/GC+ description still carries an older line saying the unit does not fit the 2020 A90 "
                          "Supra; it predates the A90 2-port variant, which the same page sells as SKU VTT-B58-GC-2. Fitment Industries "
                          "lists the 2-port part for 2020-2024; the 2021-on Supra 3.0 uses the 6-port manifold, so the listing is "
                          "limited to 2020."),
        "competitors": [
            ("Turner Motorsport", 1858.99, "https://www.turnermotorsport.com/p-25507162-vtt-gc-turbocharger-upgrade-b58tu-2-port-a90-mk5-supra"),
            ("ECS Tuning", 1858.99, "https://www.ecstuning.com/b-vargas-turbo-technologies-parts/vtt-gc-turbocharger-upgrade-b58tu-2-port-a90-mk5-supra/b58tu2gc~vtt/"),
            ("UroTuning", 1859.99, "https://www.urotuning.com/products/vargas-turbo-technologies-b58-gc-gc-turbocharger-upgrade-vtt-b58-gc-1"),
            ("Fitment Industries", 1976.24, "https://www.fitmentindustries.com/store/performance/752454/vargas-turbocharger-technologies-vtt-b58-2-port-manifold-gc-turbocharger-upgrade-toyota-supra-a90-2020-2024"),
        ],
        "photos": [
            {"file": "vtt-1-1.jpg", "url": "https://www.urotuning.com/cdn/shop/products/1-1.jpg",
             "landingPage": "https://www.urotuning.com/products/vargas-turbo-technologies-b58-gc-gc-turbocharger-upgrade-vtt-b58-gc-1",
             "sourceName": "urotuning.com", "creator": "Vargas Turbo Technologies (manufacturer)",
             "creatorUrl": "https://www.vargasturbo.com/",
             "note": "studio photo of the VTT B58 GC turbocharger; the only lettering is VTT's own cast-in marking on the housing"},
        ],
        "mediaDir": "turbocharger/vargas-vtt-b58-gc-2",
    },
    {
        "id": 5102,
        "category": "turbocharger",
        "brand": "greddy",
        "maker": "GReddy Performance Products",
        "partNumber": "11510033",
        "aliases": [],
        "name": "GReddy Turbo Kit TD06SH-25G 10cm\u00b2 (Actuator Type) 11510033 for 1993\u20131997 Toyota Supra Turbo (JZA80, 2JZ-GTE)",
        "summary": ("GReddy single-turbo kit for the JZA80 Supra's 2JZ-GTE that replaces the factory twin turbochargers, using the "
                    "factory exhaust manifold through a turbine adapter. Aftermarket part; not made or warranted by Toyota."),
        "specs": [
            ("Manufacturer", "GReddy Performance Products"),
            ("Manufacturer part number", "11510033"),
            ("Turbocharger", "TD06SH-25G, 10 cm\u00b2 turbine housing, GReddy reinforced actuator (internal wastegate)"),
            ("Manifold", "uses the factory exhaust manifold (adapter type)"),
            ("Setting (manufacturer)", "boost 0.85 kg/cm\u00b2 = approx. 370 PS, with the factory intercooler layout and injectors"),
            ("Engine", "2JZ-GTE (non-VVT-i)"),
            ("Condition", "New"),
        ],
        "includes": [
            "Turbocharger body", "Turbine adapter", "Outlet pipe", "Suction pipe", "Airinx M80 air filter",
            "Oil pressure hose", "Short parts set",
        ],
        "notes": [
            "Not compatible with VVT-i 2JZ-GTE engines (the 1998 US Supra Turbo). The factory catalyst can be retained only with the factory exhaust manifold.",
            "Engine management changes and tuning are not included. For off-road / competition use; check emissions rules in your state before installing.",
        ],
        "fitText": ("1993\u20131997 Toyota Supra Turbo (JZA80, 2JZ-GTE twin-turbo, non-VVT-i). GReddy lists the JZA80 2JZ-GTE built "
                    "1993.05\u20131997.08; not for the 1998 VVT-i engine or the non-turbo 2JZ-GE"),
        "fitmentApplications": [
            {"yearFrom": 1993, "yearTo": 1997, "make": "Toyota", "model": "Supra",
             "submodel": "Turbo, 3.0L 2JZ-GTE twin-turbo inline-6 (non-VVT-i)"},
        ],
        "fitmentSources": [
            "https://www.greddy.com/products/turbo-kit-jza80-td06sh-25g-10cm-act-11510033 (Chassis JZA80, Engine 2JZ-GTE, Year 1993.05-1997.08, VVT-i not available)",
            "https://titanmotorsports.com/products/greddy-93-02-toyota-supra-jdm-model-jza80-td06sh-25g-10cm-act-turbo-kit",
        ],
        "fitmentCaveat": "GReddy's catalog lists the JZA80 by production month; the US Supra Turbo used the same 2JZ-GTE twin-turbo engine without VVT-i through 1997.",
        "competitors": [
            ("Titan Motorsports", 4346.25, "https://titanmotorsports.com/products/greddy-93-02-toyota-supra-jdm-model-jza80-td06sh-25g-10cm-act-turbo-kit"),
            ("DriftHQ", 4346.25, "https://drifthq.com/products/greddy-93-02-toyota-supra-jdm-model-jza80-td06sh-25g-10cm-act-turbo-kit"),
            ("GReddy Performance Products (US store)", 4575.00, "https://www.greddy.com/products/turbo-kit-jza80-td06sh-25g-10cm-act-11510033"),
        ],
        "photos": [
            {"file": "greddy-11510033-1.jpg", "url": "https://cdn.shopify.com/s/files/1/1668/8171/files/11510033_JZA80_TD06_WHT.jpg",
             "landingPage": "https://www.greddy.com/products/turbo-kit-jza80-td06sh-25g-10cm-act-11510033",
             "sourceName": "greddy.com", "creator": "GReddy Performance Products (manufacturer)", "creatorUrl": "https://www.greddy.com/",
             "note": "studio photo of the complete 11510033 kit contents on the manufacturer's own product page; no watermark"},
            {"file": "greddy-11510033-2.webp", "url": "https://cdn.shopify.com/s/files/1/1668/8171/files/11510033JZTD06.webp",
             "landingPage": "https://www.greddy.com/products/turbo-kit-jza80-td06sh-25g-10cm-act-11510033",
             "sourceName": "greddy.com", "creator": "GReddy Performance Products (manufacturer)", "creatorUrl": "https://www.greddy.com/",
             "note": "studio photo of the TD06SH turbocharger with adapter and pipes from the 11510033 kit; the only lettering is the manufacturer's own cast and label markings"},
        ],
        "mediaDir": "turbocharger/greddy-11510033",
        "photoBasis": "manufacturer product photography from the manufacturer's own product page for this exact part number",
    },
    {
        "id": 5103,
        "category": "turbocharger",
        "brand": "greddy",
        "maker": "GReddy Performance Products",
        "partNumber": "11510030",
        "aliases": [],
        "name": "GReddy Turbo Upgrade Kit T78-29D 14cm\u00b2 (Wastegate Type, R11) 11510030 for 1993\u20131997 Toyota Supra Turbo (JZA80, 2JZ-GTE)",
        "summary": ("GReddy single-turbo upgrade kit for the JZA80 Supra's 2JZ-GTE with its own stainless exhaust manifold and an external "
                    "wastegate, replacing the factory twin turbochargers. Aftermarket part; not made or warranted by Toyota."),
        "specs": [
            ("Manufacturer", "GReddy Performance Products"),
            ("Manufacturer part number", "11510030"),
            ("Turbocharger", "T78-29D, 14 cm\u00b2 turbine housing"),
            ("Exhaust manifold", "stainless steel (SUS), 42.7 mm"),
            ("Wastegate", "GReddy R11 external wastegate"),
            ("Front pipe", "80 mm"),
            ("Air filter", "Airinx"),
            ("Engine", "2JZ-GTE (non-VVT-i)"),
            ("Condition", "New"),
        ],
        "includesNote": "Kit specification as listed by GReddy",
        "includes": [
            "T78-29D turbocharger (14 cm\u00b2)", "Stainless exhaust manifold (42.7 mm)", "R11 wastegate", "80 mm front pipe",
            "Airinx air filter",
        ],
        "notes": [
            "Not compatible with VVT-i 2JZ-GTE engines (the 1998 US Supra Turbo). The factory front catalyst cannot be installed with this kit.",
            "Fuel system, engine management and tuning are not included. For off-road / competition use; check emissions rules in your state before installing.",
        ],
        "fitText": ("1993\u20131997 Toyota Supra Turbo (JZA80, 2JZ-GTE twin-turbo, non-VVT-i). GReddy lists the JZA80 2JZ-GTE built "
                    "1993.05\u20131997.08; not for the 1998 VVT-i engine or the non-turbo 2JZ-GE"),
        "fitmentApplications": [
            {"yearFrom": 1993, "yearTo": 1997, "make": "Toyota", "model": "Supra",
             "submodel": "Turbo, 3.0L 2JZ-GTE twin-turbo inline-6 (non-VVT-i)"},
        ],
        "fitmentSources": [
            "https://www.greddy.com/products/turbo-kit-jza80-t78-88-t78-29d-14-11510030 (Chassis JZA80, Engine 2JZ-GTE, Year 1993.05-1997.08, VVT-i cannot be installed)",
            "https://www.vividracing.com/greddy-turbo-upgrade-kit-single-t78-29d14cm-toyota-supra-19931997-p-154223070.html (1993-1997 Toyota Supra)",
        ],
        "fitmentCaveat": "GReddy's catalog lists the JZA80 by production month; the US Supra Turbo used the same 2JZ-GTE twin-turbo engine without VVT-i through 1997.",
        "competitors": [
            ("JM Auto Racing", 5360.00, "https://jmautosports.com/products/greddy-t78-29d-turbo-upgrade-kit-11510030"),
            ("Vivid Racing", 5510.00, "https://www.vividracing.com/greddy-turbo-upgrade-kit-single-t78-29d14cm-toyota-supra-19931997-p-154223070.html"),
            ("MVP Motorsports", 5510.00, "https://www.mvpmotorsports.com/greddy/greddy-turbo-kit-upgrade/11510030"),
            ("GReddy Performance Products (US store)", 5800.00, "https://www.greddy.com/products/turbo-kit-jza80-t78-88-t78-29d-14-11510030"),
        ],
        "photos": [
            {"file": "greddy-11510030-1.jpg", "url": "https://cdn.shopify.com/s/files/1/1668/8171/files/SupraT78_WHT.jpg",
             "landingPage": "https://www.greddy.com/products/turbo-kit-jza80-t78-88-t78-29d-14-11510030",
             "sourceName": "greddy.com", "creator": "GReddy Performance Products (manufacturer)", "creatorUrl": "https://www.greddy.com/",
             "note": "studio photo of the JZA80 T78 kit contents on the manufacturer's own product page; no watermark (the page's second photo carries a watermark and shows another kit number, so it is not used)"},
        ],
        "mediaDir": "turbocharger/greddy-11510030",
        "photoBasis": "manufacturer product photography from the manufacturer's own product page for this exact part number",
    },
    {
        "id": 5104,
        "category": "turbocharger",
        "brand": "hks",
        "maker": "HKS",
        "partNumber": "11001-KT007",
        "aliases": [],
        "name": "HKS GTIII-RS Bolt-On Turbo Kit 11001-KT007 for 2022\u20132025 Toyota GR86 (FA24 2.4L)",
        "summary": ("HKS bolt-on turbocharger system built for the FA24 2.4L boxer engine of the 2022-on GR86: turbocharger, "
                    "exhaust manifold, catted downpipe, front-mount intercooler with piping and intake. Aftermarket part; not made or "
                    "warranted by Toyota."),
        "specs": [
            ("Manufacturer", "HKS"),
            ("Manufacturer part number", "11001-KT007"),
            ("Turbocharger", "HKS GTIII-RS, turbine A/R 0.80, 65 kPa internal wastegate"),
            ("Engine", "FA24 2.4L flat-4 (naturally aspirated from the factory)"),
            ("Output (manufacturer)", "approx. 366 hp (273 kW) and 294 lb-ft (398 N\u00b7m), stock approx. 232 hp"),
            ("Emissions", "not CARB legal (no CARB EO)"),
            ("Condition", "New"),
        ],
        "includesNote": "Kit includes (per HKS)",
        "includes": [
            "HKS GTIII-RS turbocharger (A/R 0.80, 65 kPa internal wastegate)",
            "Exhaust manifold",
            "113 mm catted downpipe",
            "Front-mount intercooler with piping",
            "HKS Super Power Flow intake",
        ],
        "notes": [
            "Engine management (ECU tuning), a pressure sensor and reinforced fuel parts such as injectors are not included; HKS states they are required. Higher-output builds may also need an upgraded clutch.",
            "Not CARB legal: for off-road / competition use, and not for registered vehicles in California or other states that follow CARB rules.",
        ],
        "fitText": "2022\u20132025 Toyota GR86 (FA24 2.4L flat-4). Not for the 2017\u20132020 Toyota 86 (FA20 2.0L engine)",
        "fitmentApplications": [
            {"yearFrom": 2022, "yearTo": 2025, "make": "Toyota", "model": "GR86", "submodel": "2.4L FA24 flat-4"},
        ],
        "fitmentSources": [
            "https://limitplus1.com/products/hks-gr86-brz-gtiii-rs-bolt-on-turbo-kit (2022-on Toyota GR86, FA24 2.4L)",
            "https://www.turbokits.com/2022-2024-toyota-gr86-subaru-brz-hks-gtiii-rs-bolt-on-turbo-kit.html",
            "https://www.grperformanceparts.com/hks-bolt-on-turbo-kit-gtiii-rs-kit-for-the-gr86-brz-2022/",
        ],
        "competitors": [
            ("LIMIT+1", 5220.00, "https://limitplus1.com/products/hks-gr86-brz-gtiii-rs-bolt-on-turbo-kit"),
            ("TurboKits.com", 5349.00, "https://www.turbokits.com/2022-2024-toyota-gr86-subaru-brz-hks-gtiii-rs-bolt-on-turbo-kit.html"),
            ("GR Performance Parts", 5800.00, "https://www.grperformanceparts.com/hks-bolt-on-turbo-kit-gtiii-rs-kit-for-the-gr86-brz-2022/"),
        ],
        "photos": [
            {"file": f"hks-gr86-{n}.png", "url": f"https://cdn.shopify.com/s/files/1/0709/2351/8231/files/HKS_GR86___BRZ_GTIII-RS_Bolt_On_Turbo_Kit{n}.png",
             "landingPage": "https://limitplus1.com/products/hks-gr86-brz-gtiii-rs-bolt-on-turbo-kit",
             "sourceName": "limitplus1.com", "creator": "HKS (manufacturer)", "creatorUrl": "https://hksusa.com/",
             "note": note}
            for n, note in [(1, "studio photo of the complete 11001-KT007 kit contents"), (2, "studio photo of the kit contents"),
                            (5, "studio photo of the GTIII-RS turbocharger from the kit"), (6, "studio photo of the kit's front-mount intercooler core")]
        ],
        "mediaDir": "turbocharger/hks-11001-kt007",
    },
    {
        "id": 5105,
        "category": "turbocharger",
        "brand": "forced-performance",
        "maker": "Forced Performance",
        "partNumber": "2805050",
        "aliases": ["FPT2805050"],
        "name": "Forced Performance Green V2 Upgrade Super Core 2805050 (Turbo Core Only) for 2020\u20132025 Toyota GR Supra 3.0 (B58)",
        "summary": ("Drop-in upgrade super core for the GR Supra 3.0's factory B58 turbocharger: the center cartridge (journal-bearing "
                    "CHRA) with an upgraded Xona Rotor compressor wheel and UHF turbine wheel, installed into the factory 2-port or "
                    "6-port turbo manifold housing. It is not a complete turbocharger. Aftermarket part; not made or warranted by Toyota."),
        "specs": [
            ("Manufacturer", "Forced Performance"),
            ("Manufacturer part number", "2805050 (SKU FPT2805050)"),
            ("What it is", "super core: center cartridge with compressor and turbine wheels; fits the factory turbo housing"),
            ("Flow rating (manufacturer)", "57 lb/min, about 20% more flow than the factory turbo"),
            ("Compressor wheel", "Xona Rotor"),
            ("Turbine wheel", "Xona Rotor UHF, factory fitment"),
            ("Bearing", "stock-fitment journal bearing CHRA"),
            ("Compressor cover", "factory style"),
            ("Retains", "factory oil and coolant lines, wastegate and inlet size"),
            ("Core charge", "none (no core required, per the manufacturer)"),
            ("Emissions", "not CARB legal"),
            ("Condition", "New (built to order by Forced Performance)"),
        ],
        "includesNote": "What is included",
        "includes": [
            "1 Forced Performance Green V2 super core (center cartridge with compressor and turbine wheels)",
            "Not included: the factory turbine housing / exhaust manifold (turbofold), which is reused",
        ],
        "notes": [
            "Works with the factory ECU and factory tune file without fault codes, per Forced Performance; more power needs a tune.",
            "Built to order: Forced Performance gives no fixed build time.",
            "Not CARB legal: for off-road / competition use only.",
        ],
        "fitText": "2020\u20132025 Toyota GR Supra 3.0 (B58 3.0L, factory 2-port or 6-port turbo manifold). Not for the GR Supra 2.0",
        "fitmentApplications": [
            {"yearFrom": 2020, "yearTo": 2025, "make": "Toyota", "model": "GR Supra", "submodel": "3.0L B58 inline-6 turbo"},
        ],
        "fitmentSources": [
            "https://limitplus1.com/products/forced-performance-gr-supra-b58-green-v2-upgrade-super-core (Compatibility: 2020+ GR Supra w/B58 3.0L; drops into a stock 2 port or 6 port turbofold)",
            "https://goturbo.net/fpt2805050-forced-performance-toyota-supra-a90-b58-green-v2-upgrade-super-core-2805050",
        ],
        "competitors": [
            ("Armageddon Turbo & Performance (goturbo.net)", 1367.52, "https://goturbo.net/fpt2805050-forced-performance-toyota-supra-a90-b58-green-v2-upgrade-super-core-2805050"),
            ("SMGspeed", 1399.00, "https://smgspeed.com/products/forced-performance-toyota-supra-a90-b58-green-v2-upgrade-super-core"),
            ("Island Racewerks", 1399.00, "https://islandracewerks.com/collections/forced-performance"),
            ("LIMIT+1", 1399.00, "https://limitplus1.com/products/forced-performance-gr-supra-b58-green-v2-upgrade-super-core"),
        ],
        "photos": [
            {"file": "fp-3.png", "url": "https://cdn.shopify.com/s/files/1/0709/2351/8231/files/Forced_Performance_GR_Supra_B58_Green_V2_Upgrade_Super_Core3.png",
             "landingPage": "https://limitplus1.com/products/forced-performance-gr-supra-b58-green-v2-upgrade-super-core",
             "sourceName": "limitplus1.com", "creator": "Forced Performance (manufacturer)", "creatorUrl": "https://www.forcedperformance.shop/",
             "note": "studio photo of the super core itself (center cartridge with wheels), which is what is sold; the listing's other photos show a complete turbo assembly and are not used"},
        ],
        "mediaDir": "turbocharger/forced-performance-2805050",
    },
]


def media(p):
    out = []
    for i, ph in enumerate(p["photos"], 1):
        rel = f"/product-media/{p['mediaDir']}/{i}.webp"
        dest = os.path.join(ROOT, "public", rel.lstrip("/"))
        os.makedirs(os.path.dirname(dest), exist_ok=True)
        Image.open(os.path.join(SRC, ph["file"])).convert("RGB").save(dest, "WEBP", quality=90)
        out.append((rel, dest, ph))
    return out


records, evidence = [], []
prov_path = os.path.join(ROOT, "lib/inventory/data/image-provenance.json")
prov = json.load(open(prov_path))
for p in PRODUCTS:
    comps = p["competitors"]
    if len(comps) < 3:
        sys.exit(f"{p['partNumber']}: needs three prices")
    low = min(x[1] for x in comps)
    price = math.floor(low * 95) / 100
    if price < 200:
        sys.exit(f"{p['partNumber']}: ${price} is below the $200 minimum")
    shots = media(p)
    desc = "\n".join([
        p["name"], "", p["summary"], "",
        "Specifications", "", *[f"{k}: {v}" for k, v in p["specs"]], "",
        p.get("includesNote") or "In the box (per the manufacturer)", "", *p["includes"], "",
        "Toyota fitment", "", p["fitText"] + ".", "",
        "Notes", "", *p["notes"], "",
        "Shipping", "Ships within the United States only.",
    ])
    years = sorted({y for a in p["fitmentApplications"] for y in (a["yearFrom"], a["yearTo"])})
    rels = [r for r, _, _ in shots]
    records.append({
        "id": p["id"], "name": p["name"], "category": p["category"], "brand": p["brand"], "price": price,
        "competitorPriced": True, "referencePriceVerified": True, "stock": True, "condition": "brand-new",
        "partNumber": p["partNumber"], "freightNotes": "Ships as a single parcel.",
        "fitment": p["fitText"],
        "fitmentYears": f"{years[0]}" if years[0] == years[-1] else f"{years[0]}–{years[-1]}",
        "fitmentApplications": p["fitmentApplications"],
        "thumbnail": rels[0], "image": rels[0], "images": rels,
        "description": desc,
        "sourceSlug": f"{p['brand']}-{p['partNumber'].lower()}",
        "createdAt": 1795200000000 + p["id"],
    })
    evidence.append({
        "id": p["id"], "partNumber": p["partNumber"], "aliases": p["aliases"], "maker": p["maker"],
        "fitmentApplications": p["fitmentApplications"], "fitmentSources": p["fitmentSources"],
        "fitmentCaveat": p.get("fitmentCaveat"),
        "competitors": [{"name": n, "price": v, "url": u} for n, v, u in comps],
        "lowest": low, "price": price, "core": "none (sold outright, per the manufacturer)", "checked": CHECKED,
    })
    for i, (rel, dest, ph) in enumerate(shots, 1):
        prov[f"product-{p['id']}-hv-{i}"] = {
            "productId": p["id"], "productName": p["name"], "localFile": rel, "sourceUrl": ph["url"],
            "sourceName": ph["sourceName"], "landingPage": ph["landingPage"], "creator": ph["creator"],
            "creatorUrl": ph["creatorUrl"], "license": None, "licenseRaw": None, "licenseUrl": "",
            "attributionRequired": False,
            "usageBasis": ((p.get("photoBasis") or "manufacturer catalogue photography of this exact part on a specialist retailer's listing of it") + " ("
                           + ph["note"] + "); downloaded under the owner's high-value brief (2026-11-23). No watermark or overlay; "
                           "not cropped or edited. No machine-readable licence is offered; DrivoraParts claims no ownership. "
                           "RIGHTS NOT INDEPENDENTLY VERIFIED"),
            "matchedTokens": [p["partNumber"], *p["aliases"]], "query": f"retailer listing: {p['partNumber']}",
            "sha256": hashlib.sha256(open(dest, "rb").read()).hexdigest(), "downloadedAt": CHECKED,
        }

out = os.path.join(ROOT, "lib/inventory/data/high-value-toyota.json")
json.dump(records, open(out, "w"), indent=2, ensure_ascii=False)
open(out, "a").write("\n")
json.dump(prov, open(prov_path, "w"), indent=2, ensure_ascii=False)
open(prov_path, "a").write("\n")
ev = os.path.join(ROOT, "docs/catalog-expansion/high-value-120/high-value-toyota-evidence.json")
json.dump({"checked": CHECKED, "pricing": "5% under the lowest attributed US price, same configuration", "products": evidence},
          open(ev, "w"), indent=2)
open(ev, "a").write("\n")
for r in records:
    print(r["id"], r["partNumber"], f"${r['price']:.2f}", r["name"])
