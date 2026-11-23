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
