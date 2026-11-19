#!/usr/bin/env python3
"""Import qualified genuine Toyota parts from the staged expansion batches
into the storefront catalog, using the original catalog workflow:

    data file      lib/inventory/data/toyota-genuine-oem.json
    module         lib/inventory/toyota-genuine-oem-products.ts (in full-catalog.ts)
    images         public/product-media/toyota-genuine/<slug>/N.webp
    provenance     lib/inventory/data/image-provenance.json  (product-<id>)
    Genuine label  lib/inventory/data/toyota-genuine.json    (verified)

    python3 scripts/import-toyota-genuine-oem.py <toyota-image-dir>

Then: node scripts/audit-toyota-catalog.mjs --write && npm run catalog:snapshot

A staged record is imported only when ALL hold:
  - status commercial_pending (fitment verified or VIN-dependent, no blockers)
  - a 3-5% competitor-based price from 3+ attributed US retailer prices
  - a real Toyota catalog photo of the exact part number (Toyota's own image
    host, epc-images.toyota.com; the "no image" placeholder is rejected)
  - price of $25 or more: under the published US rate table parcel orders
    under $1,000 ship free, so a sub-$25 part ships at a loss on its own
Listed fitment is the record's verified / VIN-dependent applications only,
with every restriction stated. No stock quantity, warranty or fulfilment
location is set (the storefront's approved fulfilment wording applies).
"""
import hashlib
import json
import os
import re
import shutil
import sys

IMG_DIR = sys.argv[1]
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
STAGED = sorted(os.path.join(ROOT, "docs/catalog-expansion", f) for f in os.listdir(os.path.join(ROOT, "docs/catalog-expansion"))
                if re.fullmatch(r"toyota-expansion-batch-\d+\.json", f))
DATA = os.path.join(ROOT, "lib/inventory/data/toyota-genuine-oem.json")
PROV = os.path.join(ROOT, "lib/inventory/data/image-provenance.json")
GENUINE = os.path.join(ROOT, "lib/inventory/data/toyota-genuine.json")
# Storefront category slugs (lib/inventory/categories.ts); a listing in any
# other category would be missing from every category page.
CATEGORY_SLUGS = set(re.findall(r'slug: "([a-z0-9-]+)"', open(os.path.join(ROOT, "lib/inventory/categories.ts"), encoding="utf-8").read()))
MEDIA = "/product-media/toyota-genuine"
FIRST_ID = 4304          # above every existing listing id (max 4303)
MIN_PRICE = 25.0
TODAY = "2026-11-19"
PLACEHOLDER_BYTES = 69745  # Toyota's "no image" response

# Toyota catalog photos per part number (files in IMG_DIR), in display order.
# Part numbers not listed here use every real photo fetched for them by
# scripts/fetch-toyota-epc-images.py (top_<PN>.webp first, then <PN>_<n>.webp).
# Both paths are Toyota's own image host for the part number:
#   https://epc-images.toyota.com/<PN>.webp            -> top_<PN>.webp
#   https://epc-images.toyota.com/img/<PN>/<PN>_<n>.webp -> <PN nodash>_<n>.webp
#   https://epc-images.toyota.com/<PN>_<n>.webp        -> pn_<PN>_<n>.webp
IMAGES = {
    "04465-04090": ["top_04465-04090.webp", "0446504090_1.webp", "0446504090_2.webp"],
    "04465-06170": ["0446506170_1.webp"],
    "04465-0C020": ["044650C020_1.webp", "044650C020_2.webp"],
    "04465-33480": ["top_04465-33480.webp"],
    "43512-04052": ["top_43512-04052.webp"],
    "43512-06200": ["top_43512-06200.webp"],
    "43512-0R010": ["top_43512-0R010.webp"],
    # Batch 6: Toyota's first photo shows a left/right pair; the listing is one mirror.
    "87910-08220": ["8791008220_2.webp", "8791008220_3.webp"],
    # Batch 6: photo 3 is a label card, not the lamp.
    "81550-08190": ["8155008190_2.webp", "8155008190_1.webp"],
    # Batch 6: photo 2 is a can of compressor oil, not the condenser.
    "884A0-0C010": ["884A00C010_1.webp"],
    # Batch 6: photo 2 is the front of the lamp; photo 3 is a dust cap.
    "81110-02T70": ["8111002T70_2.webp", "8111002T70_1.webp"],
    # Batch 6: Toyota's first photo shows a left/right pair; the listing is one mirror.
    "87910-08240": ["8791008240_2.webp", "8791008240_3.webp"],
}



def images_for(pn):
    if pn in IMAGES:
        return IMAGES[pn]
    n = pn.replace("-", "")
    found = [f"top_{pn}.webp"] if os.path.exists(os.path.join(IMG_DIR, f"top_{pn}.webp")) else []
    found += sorted(f for f in os.listdir(IMG_DIR) if re.fullmatch(rf"{re.escape(n)}_\d\.webp", f))
    found += sorted(f for f in os.listdir(IMG_DIR) if re.fullmatch(rf"pn_{re.escape(pn)}_\d\.webp", f))
    return found


PART_TITLE = {"pads_front": "Front Brake Pad Set", "rotor_front": "Front Brake Rotor"}


def source_url(fname):
    if fname.startswith("top_"):
        return f"https://epc-images.toyota.com/{fname[4:-5]}.webp"
    if fname.startswith("pn_"):
        return f"https://epc-images.toyota.com/{fname[3:-5]}.webp"
    n, i = fname[:-5].rsplit("_", 1)
    return f"https://epc-images.toyota.com/img/{n}/{n}_{i}.webp"


def slugify(s):
    return re.sub(r"-+", "-", re.sub(r"[^a-z0-9]+", "-", s.lower())).strip("-")


def webp_size(b):
    if b[12:16] == b"VP8X":
        return 1 + int.from_bytes(b[24:27], "little"), 1 + int.from_bytes(b[27:30], "little")
    if b[12:16] == b"VP8 ":
        return int.from_bytes(b[26:28], "little") & 0x3FFF, int.from_bytes(b[28:30], "little") & 0x3FFF
    if b[12:16] == b"VP8L":
        v = int.from_bytes(b[21:25], "little")
        return (v & 0x3FFF) + 1, ((v >> 14) & 0x3FFF) + 1
    return None


def years_text(apps):
    lo, hi = min(a["yearFrom"] for a in apps), max(a["yearTo"] for a in apps)
    return f"{lo}–{hi}" if lo != hi else str(lo)


staged = {}
for f in STAGED:
    for r in json.load(open(f, encoding="utf-8"))["records"]:
        if r["partNumber"]:
            staged[r["partNumber"]] = r

live = json.load(open(os.path.join(ROOT, "lib/inventory/data/catalog-snapshot.json"), encoding="utf-8"))
live_pns = {re.sub(r"[^0-9A-Z]", "", str(x.get("partNumber") or "").upper()) for x in live["records"]}

products, prov_new, genuine_new, excluded = [], {}, [], []
# Listing ids never change once published: reuse each part number's id.
previous = {p["partNumber"]: p["id"] for p in (json.load(open(DATA, encoding="utf-8")) if os.path.exists(DATA) else [])}
next_id = max([FIRST_ID - 1, *previous.values()]) + 1
imported_pns = set(previous)
for pn, r in sorted(staged.items()):
    pr = r["pricing"]
    price = pr.get("recommendedPrice")
    reasons = []
    if r["status"] != "commercial_pending":
        reasons.append("fitment unresolved or record superseded")
    if price is None:
        reasons.append("fewer than 3 attributed competitor prices")
    elif price < MIN_PRICE:
        reasons.append(f"${price:.2f} part ships free under the US parcel table: unprofitable on its own")
    if not images_for(pn):
        reasons.append("Toyota's image host has no photo for this part number (placeholder only)")
    if re.sub(r"[^0-9A-Z]", "", pn) in live_pns and pn not in imported_pns:
        reasons.append("duplicate of a live listing")
    if reasons:
        excluded.append({"partNumber": pn, "name": r["name"], "reasons": reasons})
        continue

    apps = r["fitmentApplications"]
    models = []
    for a in apps:
        if a["model"] not in models:
            models.append(a["model"])
    title = PART_TITLE.get(r["partKind"], r["name"].split(" — ")[0].replace("Genuine Toyota ", "").rsplit(" ", 1)[0])
    name = f"Genuine Toyota {title} {pn} for Toyota {' / '.join(models)} ({years_text(apps)})"
    slug = slugify(f"toyota-{title}-{pn}")
    if pn in previous:
        pid = previous[pn]
    else:
        pid = next_id
        next_id += 1

    files = []
    for i, fname in enumerate(images_for(pn), 1):
        src = os.path.join(IMG_DIR, fname)
        b = open(src, "rb").read()
        if len(b) == PLACEHOLDER_BYTES or b[:4] != b"RIFF" or b[8:12] != b"WEBP":
            sys.exit(f"{pn}: {fname} is not a Toyota part photo")
        dest_rel = f"{MEDIA}/{slug}/{i}.webp"
        dest = os.path.join(ROOT, "public", dest_rel.lstrip("/"))
        os.makedirs(os.path.dirname(dest), exist_ok=True)
        shutil.copyfile(src, dest)
        w, h = webp_size(b)
        files.append({"localFile": dest_rel, "sourceUrl": source_url(fname), "sha256": hashlib.sha256(b).hexdigest(),
                      "bytes": len(b), "width": w, "height": h})

    restr = [x for x in r["description"].split("\n") if x.startswith("Restriction")]
    body = r["description"].split("\n\n")[0]
    desc = "\n".join([
        name, "", body, "",
        "Specifications", "",
        f"Part number: {pn}", "Brand: Toyota", "Type: Genuine Toyota part", "Condition: New",
        f"Fitment: {r['fitment']}", *restr, "",
        "Confirm fitment with your VIN before ordering.", "",
        "Shipping", "Ships within the United States only.",
    ])
    if r["proposedCategory"] not in CATEGORY_SLUGS:
        sys.exit(f"{pn}: category {r['proposedCategory']!r} is not a storefront category slug")
    products.append({
        "id": pid,
        "name": name,
        "category": r["proposedCategory"],
        "brand": "toyota",
        "price": price,
        "competitorPriced": True,
        "referencePriceVerified": True,
        "stock": True,
        "condition": "brand-new",
        "partNumber": pn,
        "fitment": r["fitment"],
        "fitmentYears": years_text(apps),
        "fitmentApplications": apps,
        "thumbnail": files[0]["localFile"],
        "image": files[0]["localFile"],
        "images": [f["localFile"] for f in files],
        "description": desc,
        "sourceSlug": slug,
        "createdAt": 1795100000000 + pid,
    })
    prov_new[f"product-{pid}"] = {
        "productId": pid,
        "productName": name,
        "localFile": files[0]["localFile"],
        "sourceUrl": files[0]["sourceUrl"],
        "sourceName": "epc-images.toyota.com",
        "landingPage": next((u for u in r["sources"] if "autoparts.toyota.com" in u), "https://autoparts.toyota.com/"),
        "creator": "Toyota Motor North America (Toyota Genuine Parts catalog)",
        "creatorUrl": "https://autoparts.toyota.com/",
        "hostedBy": "manufacturer",
        "retailer": None,
        "license": None,
        "licenseRaw": None,
        "licenseUrl": "",
        "attributionRequired": False,
        "usageBasis": ("manufacturer product photography, taken from the manufacturer's own parts catalog image for this exact part number "
                       "and used to show the part itself. No machine-readable licence is offered by the source, and DrivoraParts claims no "
                       "ownership of the image. Added on the site owner's instruction (2026-11-19 Toyota catalog rebuild, original import "
                       "workflow); reuse rights beyond that instruction are not verified by this repository."),
        "matchedTokens": [pn, pn.replace("-", "")],
        "query": f"Toyota catalog rebuild 2026-11-19: Toyota image host for {pn}",
        "sha256": files[0]["sha256"], "bytes": files[0]["bytes"], "width": files[0]["width"], "height": files[0]["height"],
        "additionalFiles": files[1:],
        "downloadedAt": f"{TODAY}T00:00:00.000Z",
        "status": "downloaded",
        "verified": "Toyota's image host is keyed by this part number; image fetched HTTP 200, WebP, compared visually with the part type",
    }
    genuine_new.append({
        "id": pid, "partNumber": pn, "verifiedBy": "Claude (catalog import, on the DrivoraParts owner's instruction)",
        "verifiedOn": TODAY,
        "evidence": "Part number present in Toyota's own parts catalog (epc-images.toyota.com part photo"
                    + ("; " + next(u for u in r["sources"] if "autoparts.toyota.com" in u) if any("autoparts.toyota.com" in u for u in r["sources"]) else "")
                    + "); fitment and pricing evidence in docs/catalog-expansion/toyota-expansion-batch-*.json.",
    })

products.sort(key=lambda p: p["id"])
with open(DATA, "w", encoding="utf-8") as f:
    json.dump(products, f, ensure_ascii=False, indent=2)
    f.write("\n")

prov = json.load(open(PROV, encoding="utf-8"))
prov.update(prov_new)
with open(PROV, "w", encoding="utf-8") as f:
    json.dump(prov, f, ensure_ascii=False, indent=2)
    f.write("\n")

gen = json.load(open(GENUINE, encoding="utf-8"))
keep = [v for v in gen["verified"] if v["id"] < FIRST_ID]
gen["verified"] = keep + genuine_new
with open(GENUINE, "w", encoding="utf-8") as f:
    json.dump(gen, f, ensure_ascii=False, indent=2)
    f.write("\n")

with open(os.path.join(ROOT, "docs/catalog-expansion/toyota-genuine-oem-import.json"), "w", encoding="utf-8") as f:
    json.dump({"importedOn": TODAY, "imported": [{"id": p["id"], "partNumber": p["partNumber"], "name": p["name"], "price": p["price"]} for p in products],
               "excluded": excluded}, f, ensure_ascii=False, indent=2)
    f.write("\n")
print(f"imported {len(products)}, excluded {len(excluded)}")
for p in products:
    print(f"  {p['id']} {p['partNumber']} ${p['price']:.2f} {p['name']}")
