#!/usr/bin/env python3
"""Nitto tires in Toyota factory sizes (high-value brief, 2026-11-23).

Writes lib/inventory/data/toyota-tires.json (loaded by lib/inventory/tire-products.ts alongside the older
tires.json, which scripts/import-tires.mjs regenerates and must not be edited by hand), the tire photos
under public/product-media/tires/, their provenance in lib/inventory/data/image-provenance.json, and the
price / spec evidence in docs/catalog-expansion/high-value-120/toyota-tires-evidence.json.

Sources
- Size, load range, load index / speed rating and Nitto product code: each line's page on nittotire.com
  (spec table, read 2026-11-23).
- Toyota factory sizes: toyota.com /<model>/features/ pages (2027 model year, read 2026-11-23).
- Prices: at least three attributed US retailer prices per tire, sold per tire. Our price is 5% under the
  lowest. Canadian (CAD) listings are excluded.
- Photos: Nitto's own product photo for each tire line (one photo per line, used for every size of
  that line; tread and sidewall are the same across sizes). The wheel shown is not included.

    python3 scripts/build-toyota-tires.py <dir with the downloaded Nitto images>
"""
import hashlib
import json
import math
import os
import sys

from PIL import Image

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
SRC = sys.argv[1]
FIRST_ID = 5001
CHECKED = "2026-11-23"

LINES = {
    "ridge-grappler": ("Ridge Grappler", "hybrid-terrain", "https://www.nittotire.com/light-truck-tires/ridge-grappler-light-truck-tire/",
                       "samlnhu2-ridge_grappler_06.png", "https://www.nittotire.com/media/samlnhu2/ridge_grappler_06.png"),
    "terra-grappler-g3": ("Terra Grappler G3", "all-terrain", "https://www.nittotire.com/light-truck-tires/terra-grappler-g3-all-terrain-light-truck-tire/",
                          "b4vhkvlb-terrag3_cat_tire.png", "https://www.nittotire.com/media/b4vhkvlb/terrag3_cat_tire.png"),
    "recon-grappler-at": ("Recon Grappler A/T", "all-terrain", "https://www.nittotire.com/light-truck-tires/recon-grappler-all-terrain-light-truck-tire/",
                          "jtmfwovs-recongrappler_32.png", "https://www.nittotire.com/media/jtmfwovs/recongrappler_32.png"),
    "trail-grappler-mt": ("Trail Grappler M/T", "mud-terrain", "https://www.nittotire.com/light-truck-tires/trail-grappler-mud-terrain-light-truck-tire/",
                          "pgkje4ak-image_06.png", "https://www.nittotire.com/media/pgkje4ak/image_06.png"),
    "exo-grappler-awt": ("Exo Grappler AWT", "all-weather all-terrain", "https://www.nittotire.com/heavy-duty-tires/exo-grappler-all-weather-traction-light-truck-tire/",
                         "ccvjdhw4-image_06.png", "https://www.nittotire.com/media/ccvjdhw4/image_06.png"),
    "dura-grappler": ("Dura Grappler", "highway-terrain", "https://www.nittotire.com/light-truck-tires/dura-grappler-highway-terrain-light-truck-tire/",
                      "xveo1nvz-image_06.png", "https://www.nittotire.com/media/xveo1nvz/image_06.png"),
}

# Toyota factory sizes, from the toyota.com 2027 feature pages.
FACTORY = {
    "265/70R18": ["4Runner", "Tacoma", "Tundra", "Sequoia", "Land Cruiser"],
    "285/65R18": ["Tundra", "Sequoia"],
    "265/60R20": ["Tundra", "Sequoia", "Land Cruiser"],
    "265/70R17": ["Tacoma"],
}

# (line, size as printed by Nitto, load range or "", load index / speed, Nitto code, [(seller, price, url)])
T = [
    ("ridge-grappler", "LT265/70R18", "E", "124/121Q", "217480", [
        ("Desert Rat", 325.00, "https://www.desertrat.com/i-23432113-lt265-70r18-nitto-ridge-grappler-124q-lr-e.html"),
        ("Big O Tires", 333.00, "https://www.bigotires.com/tires/sku/nitto/ridge-grappler/lt265-70r18-124-121q-e/000000000001105357"),
        ("Priority Tire", 339.86, "https://www.prioritytire.com/by-brand/nitto-tires/ridge-grappler/265-70r18-124-121q-e-10-ply-64676")]),
    ("ridge-grappler", "265/70R18", "", "116T", "218940", [
        ("Desert Rat", 283.00, "https://desertrat.com/i-23432239-265-70r18-nitto-ridge-grappler-116t.html"),
        ("Big O Tires", 286.00, "https://www.bigotires.com/tires/sku/nitto/ridge-grappler/265-70r18-116t/000000000001145754"),
        ("Tires-Easy", 292.95, "https://www.tires-easy.com/265-70-18/nitto-tires/ridge-grappler/tirecode/218940")]),
    ("ridge-grappler", "LT285/65R18", "E", "125/122Q", "217110", [
        ("Tirebuyer", 388.00, "https://tirebuyer.com/tires/nitto/ridge-grappler/p/TV154000693"),
        ("BB Wheels Online", 388.00, "https://bbwheelsonline.com/nitto-ridge-grappler-tires-285-65r18-e-125-122q-10-ply-e-series-217-110"),
        ("Priority Tire", 417.00, "https://www.prioritytire.com/by-brand/nitto-tires/ridge-grappler/285-65r18-125-122q-e-10-ply-64658")]),
    ("ridge-grappler", "LT265/60R20", "E", "121/118Q", "217460", [
        ("American Trucks", 371.00, "https://www.americantrucks.com/nitto-f150-ridge-grappler-at-tire-nito-217460.html"),
        ("Discount Tire", 371.00, "https://www.discounttire.com/buy-tires/nitto-ridge-grappler/p/41799"),
        ("Big O Tires", 380.00, "https://www.bigotires.com/tires/sku/nitto/ridge-grappler/lt265-60r20-121-118q-e/000000000001105363"),
        ("ThreePiece", 380.00, "https://www.threepiece.us/nitto-nit-ridge-grappler-lt265-60r20-10/")]),
    ("ridge-grappler", "265/60R20", "", "112T", "218890", [
        ("American Trucks", 331.00, "https://www.americantrucks.com/nitto-f150-ridge-grappler-a-t-tire-218890.html"),
        ("Priority Tire", 334.00, "https://www.prioritytire.com/by-brand/nitto-tires/ridge-grappler/265-60r20-112t-36185"),
        ("OK4WD", 334.00, "https://ok4wd.com/nitto-ridge-grappler-265-60r20"),
        ("Extreme Terrain", 334.00, "https://www.extremeterrain.com/nitto-tundra-ridge-grappler-a-t-tire-218890.html")]),
    ("ridge-grappler", "LT265/70R17", "E", "121/118Q", "217100", [
        ("Prime Wheels", 279.00, "https://primewheels.com/ridge-grappler"),
        ("American Trucks", 293.00, "https://www.americantrucks.com/nitto-f250-ridge-grappler-all-terrain-tire-217100.html"),
        ("Priority Tire", 316.00, "https://www.prioritytire.com/by-brand/nitto-tires/ridge-grappler/265-70r17-121-118q-e-10-ply-2305")]),
    ("ridge-grappler", "265/70R17", "", "115T", "217940", [
        ("OK4WD", 235.00, "https://ok4wd.com/nitto-ridge-grappler-265-70r17"),
        ("BB Wheels Online", 235.00, "https://bbwheelsonline.com/nitto-ridge-grappler-tire-265-70r17-115t-217940"),
        ("Milky Motorsports", 247.00, "https://milkymotorsports.com/products/nitto-265-70-17-ridge-grappler-217940")]),
    ("terra-grappler-g3", "LT265/70R18", "E", "124/121S", "223950", [
        ("Extreme Terrain", 278.00, "https://www.extremeterrain.com/nitto-tacoma-terra-grappler-g3-tire-223950.html"),
        ("OK4WD", 278.00, "https://ok4wd.com/nitto-terra-grappler-g3-lt265-70r18-load-range-e"),
        ("American Trucks", 291.00, "https://www.americantrucks.com/nitto-f150-terra-grappler-g3-tire-223950.html")]),
    ("terra-grappler-g3", "265/70R18", "", "116T", "224210", [
        ("Walmart", 263.02, "https://www.walmart.com/ip/Tire/15435200839"),
        ("Richline Motorsports", 275.00, "https://richlinemotorsports.com/tire/3092/nitto-tires-terra-grappler-g3"),
        ("OK4WD", 278.00, "https://ok4wd.com/nitto-terra-grappler-g3-265-70r18-load-range-sl/")]),
    ("terra-grappler-g3", "LT285/65R18", "E", "125/122S", "223910", [
        ("Tire Agent", 343.00, "https://snap.tireagent.com/products/nitto-terra-grappler-g3-223910"),
        ("ThreePiece", 367.00, "https://www.threepiece.us/nitto-terra-grappler-g3-lt285-65r18-125-122s-223910/"),
        ("Extreme Terrain", 367.00, "https://www.extremeterrain.com/nitto-tundra-terra-grappler-g3-tire-223910.html"),
        ("OK4WD", 367.00, "https://ok4wd.com/nitto-terra-grappler-g3-lt285-65r18-load-range-e")]),
    ("terra-grappler-g3", "285/65R18", "", "116T", "224580", [
        ("TFS Wheels", 366.30, "https://tfswheels.com/products/nitto-terra-grappler-g3"),
        ("ThreePiece", 370.00, "https://www.threepiece.us/nitto-terra-grappler-g3-285-65r18-116t-224580/"),
        ("Tires-Easy", 370.00, "https://www.tires-easy.com/285-65-18/nitto-tires/terra-grappler-g3/tirecode/224580")]),
    ("terra-grappler-g3", "LT265/60R20", "E", "121/118S", "223830", [
        ("SimpleTire", 333.00, "https://opt.simpletire.com/tire-sizes/lt265-60r20/brands/nitto-tires"),
        ("OK4WD", 340.00, "https://ok4wd.com/nitto-terra-grappler-g3-lt265-60r20-load-range-e"),
        ("Priority Tire", 340.00, "https://www.prioritytire.com/by-brand/nitto-tires/terra-grappler-g3-a-t/265-60r20-121-118s-e-10-ply-170208")]),
    ("terra-grappler-g3", "LT265/70R17", "E", "123/120S", "223940", [
        ("American Trucks", 263.00, "https://www.americantrucks.com/nitto-f150-terra-grappler-g3-tire-223940.html"),
        ("OK4WD", 263.00, "https://ok4wd.com/nitto-terra-grappler-g3-lt265-70r17-load-range-e"),
        ("Ecklers", 274.00, "https://www.ecklers.com/nitto-chevy-truck-terra-grappler-g3-tire-223940.html")]),
    ("recon-grappler-at", "LT285/65R18", "E", "125/122R", "218590", [
        ("Prime Wheels", 362.00, "https://primewheels.com/?p=23889"),
        ("OK4WD", 382.00, "https://ok4wd.com/nitto-recon-grappler-a-t-lt285-65r18-10-load-range-e"),
        ("Extreme Terrain", 382.00, "https://www.extremeterrain.com/nitto-xtr-recon-grappler-at-tire-nito-218590.html")]),
    ("recon-grappler-at", "LT265/60R20", "E", "121/118S", "218550", [
        ("OK4WD", 335.00, "https://ok4wd.com/nitto-recon-grappler-a-t-lt265-60r20-10-load-range-e"),
        ("Priority Tire", 360.00, "https://www.prioritytire.com/by-brand/nitto-tires/recon-grappler-a-t/265-60r20-121-118s-e-10-ply-34412"),
        ("Discounted Wheel Warehouse", 375.14, "https://www.discountedwheelwarehouse.com/tires/brands/nitto/recon-grappler-a-t?partnum=NT-218550")]),
    ("recon-grappler-at", "LT265/70R17", "E", "123/120S", "218740", [
        ("American Trucks", 293.00, "https://www.americantrucks.com/nitto-f150-recon-grappler-a-t-tire-218740.html"),
        ("JEGS", 293.00, "https://www.jegs.com/i/Nitto/726/218740/10002/-1"),
        ("OK4WD", 293.00, "https://ok4wd.com/nitto-recon-grappler-a-t-lt265-70r17-10-load-range-e")]),
    ("trail-grappler-mt", "LT285/65R18", "E", "125/122Q", "205740", [
        ("Katz Tires", 407.29, "https://katztires.com/trail-grappler-m-t-black-sidewall"),
        ("Quadratec", 411.00, "https://oms.quadratec.com/92622-5022-nitto-trail-grappler-m-t-lt285-65r18-205740.html"),
        ("Wheel Warehouse", 411.00, "https://wheelwarehouse.com/products/nitto-lt285-65r18-e-trail-grappler-m-t-tires-205740")]),
    ("trail-grappler-mt", "LT265/70R17", "E", "121/118Q", "205860", [
        ("Extreme Terrain", 317.00, "https://www.extremeterrain.com/nitto-xtr-trail-grappler-mt-mud-terrain-tire-nito-205860.html"),
        ("Quadratec", 317.00, "https://oms.quadratec.com/92622-5011-nitto-trail-grappler-m-t-lt265-70r17-205860.html"),
        ("Milky Motorsports", 317.00, "https://milkymotorsports.com/products/nitto-265-70-17-trail-grappler-205860")]),
    ("exo-grappler-awt", "LT265/70R17", "E", "121/118Q", "206870", [
        ("Tirebuyer", 237.00, "https://tirebuyer.com/tires/nitto/exo-grappler-awt/p/TV154000535"),
        ("Extreme Terrain", 249.00, "https://www.extremeterrain.com/nitto-xtr-exo-grappler-all-terrain-tire-nito-206870.html"),
        ("Quadratec", 254.00, "https://www.quadratec.com/p/nitto/exo-grappler-awt-tire/lt265/70r17-206870")]),
    ("dura-grappler", "LT265/70R17", "E", "121/118Q", "205630", [
        ("Milky Motorsports", 235.00, "https://milkymotorsports.com/products/nitto-265-70-17-dura-grappler-205630"),
        ("Big O Tires", 235.00, "https://www.bigotires.com/tires/sku/nitto/dura-grappler/lt265-70r17-121-118q-e/000000000001098373"),
        ("Priority Tire", 263.86, "https://www.prioritytire.com/by-brand/nitto-tires/dura-grappler-highway-terrain/265-70r17-121-118q-e-10-ply-17510")]),
]


def base_size(size):
    return size[2:] if size.startswith("LT") else size


def media_for(line):
    name, _, page, fname, url = LINES[line]
    rel = f"/product-media/tires/nitto-{line}/1.webp"
    dest = os.path.join(ROOT, "public", rel.lstrip("/"))
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    im = Image.open(os.path.join(SRC, fname)).convert("RGBA")
    bg = Image.new("RGBA", im.size, (255, 255, 255, 255))
    bg.alpha_composite(im)
    bg.convert("RGB").save(dest, "WEBP", quality=90)
    return rel, dest, url, page


records, evidence = [], []
prov_path = os.path.join(ROOT, "lib/inventory/data/image-provenance.json")
prov = json.load(open(prov_path))
seen_lines = {}
for i, (line, size, lr, lisr, code, comps) in enumerate(T):
    pid = FIRST_ID + i
    name_line, kind, page, _, _ = LINES[line]
    models = FACTORY[base_size(size)]
    if len(comps) < 3:
        sys.exit(f"{code}: needs three prices")
    low = min(p for _, p, _ in comps)
    price = math.floor(low * 95) / 100  # 5% under the lowest, rounded down to the cent
    if price < 200:
        sys.exit(f"{code}: ${price} is below the $200 minimum")
    if line not in seen_lines:
        seen_lines[line] = media_for(line)
    rel, dest, img_url, _ = seen_lines[line]
    lt = size.startswith("LT")
    spec = f"{size} {lisr}" + (f", Load Range {lr}" if lr else "")
    name = f"Nitto {name_line} {spec} Tire for Toyota {' / '.join(models)}"
    fit_text = (f"{base_size(size)} is a factory tire size on the 2027 Toyota {', '.join(models)} (per toyota.com); "
                "confirm against the tire placard on your door jamb")
    desc = "\n".join([
        name, "",
        f"Nitto {name_line} {kind} tire, sold per tire (one tire). Wheel not included.", "",
        "Specifications", "",
        f"Size: {size}",
        f"Load index / speed rating: {lisr}",
        *( [f"Load range: {lr} (light-truck construction)"] if lt else ["Construction: passenger (P-metric / SL)"] ),
        f"Nitto product code: {code}",
        "Brand: Nitto", "Condition: New", "",
        "Toyota fitment", "",
        fit_text + ".",
        *( ["LT (light-truck) tires run different inflation pressures and ride firmer than the factory passenger tire; confirm load and pressure for your use."] if lt else [] ),
        "", "Shipping", "Ships within the United States only.",
    ])
    slug = f"nitto-{line}-{size.lower().replace('/', '-')}-{code}"
    records.append({
        "id": pid, "name": name, "category": "wheels-tires", "brand": "nitto", "price": price,
        "competitorPriced": True, "referencePriceVerified": True, "stock": True, "condition": "brand-new",
        "partNumber": code, "freightNotes": "Ships as a single parcel.",
        "fitment": f"{size} ({fit_text})",
        "thumbnail": rel, "image": rel, "images": [rel],
        "description": desc, "sourceSlug": slug, "createdAt": 1795200000000 + pid,
    })
    evidence.append({"id": pid, "code": code, "line": name_line, "size": size, "loadIndexSpeed": lisr, "loadRange": lr or None,
                     "specSource": page, "factorySizeModels": models,
                     "factorySizeSource": [f"https://www.toyota.com/{m.lower().replace(' ', '')}/features/" for m in models],
                     "competitors": [{"name": n, "price": p, "url": u} for n, p, u in comps],
                     "lowest": low, "price": price, "checked": CHECKED, "pricedPer": "tire"})
    prov[f"product-{pid}-nitto-1"] = {
        "productId": pid, "productName": name, "localFile": rel, "sourceUrl": img_url, "sourceName": "nittotire.com",
        "landingPage": page, "creator": "Nitto Tire U.S.A. (manufacturer)", "creatorUrl": "https://www.nittotire.com/",
        "license": None, "licenseRaw": None, "licenseUrl": "", "attributionRequired": False,
        "usageBasis": ("manufacturer product photograph from the manufacturer's own product page for this tire line, used for every size of "
                       "the line (same tread and sidewall); downloaded under the owner's high-value brief (2026-11-23). The wheel shown is not "
                       "included. No machine-readable licence is offered; DrivoraParts claims no ownership. RIGHTS NOT INDEPENDENTLY VERIFIED"),
        "matchedTokens": [name_line, code], "query": f"manufacturer catalogue: Nitto {name_line}",
        "sha256": hashlib.sha256(open(dest, "rb").read()).hexdigest(), "downloadedAt": CHECKED,
    }

json.dump(records, open(os.path.join(ROOT, "lib/inventory/data/toyota-tires.json"), "w"), indent=2, ensure_ascii=False)
open(os.path.join(ROOT, "lib/inventory/data/toyota-tires.json"), "a").write("\n")
json.dump(prov, open(prov_path, "w"), indent=2, ensure_ascii=False)
open(prov_path, "a").write("\n")
ev = os.path.join(ROOT, "docs/catalog-expansion/high-value-120/toyota-tires-evidence.json")
json.dump({"checked": CHECKED, "pricing": "5% under the lowest attributed US per-tire price", "tires": evidence}, open(ev, "w"), indent=2)
print(f"{len(records)} tires written ({records[0]['id']}-{records[-1]['id']}); prices "
      f"${min(r['price'] for r in records):.2f}-${max(r['price'] for r in records):.2f}")
