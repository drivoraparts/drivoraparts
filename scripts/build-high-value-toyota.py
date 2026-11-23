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
        "In the box (per the manufacturer)", "", *p["includes"], "",
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
            "usageBasis": ("manufacturer catalogue photography of this exact part on a specialist retailer's listing of it ("
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
