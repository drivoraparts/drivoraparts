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
# Shipping class. Without a freight note the storefront infers the shipping label
# from the category (engine/transmission/body-parts = freight, suspension/wheels =
# multibox), which charged $199 on single boxed parts such as a $27 thermostat
# housing. Every genuine Toyota part imported so far ships as one carton, so it is
# labelled a parcel; only whole assemblies that need a pallet are freight.
PARCEL_NOTE = "Ships as a single parcel."
FREIGHT_NOTE = "Ships as palletized freight (oversized assembly)."
FREIGHT_KINDS = {"engine_assembly", "transmission_assembly", "hood", "bumper_cover", "bumper_reinf"}

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
    # Batch 8: the /img/<ND>/<PN>_1 photo is an A/C compressor and _2/_3 are not
    # identifiable as this part; only the two /img/<ND>/<ND>_n views show the transfer case.
    "36100-0C020": ["361000C020_1.webp", "361000C020_2.webp"],
    # Batch 8: photo 3 is an annotated service diagram, not a product view.
    "36100-04010": ["3610004010_1.webp", "3610004010_2.webp"],
    # Batch 9: photo 2 is a close-up fitting not identifiable as this cylinder.
    "48886-60032": ["pn_48886-60032_1.webp", "pn_48886-60032_3.webp"],
    # Batch 12: Toyota genuine accessory; photos from toyota.com (TCOM_SOURCES).
    "PT925-60240": ["tcom_PT925-60240_1.webp", "tcom_PT925-60240_2.webp"],
    "PT228-60241": ["tcom_PT228-60241_1.webp"],
    "PT228-60242": ["tcom_PT228-60242_1.webp"],
    "PT944-60240": ["tcom_PT944-60240_1.webp"],
    "PT970-60241": ["tcom_PT970-60241_1.webp"],
    # Toyota reman transmissions: lead with the side view of the whole unit
    "35010-0C090-84": ["imgpn_35010-0C090-84_2.webp", "imgpn_35010-0C090-84_1.webp"],
    "44250-04041": ["4425004041_1.webp"],
    "44250-35042": ["imgpn_44250-35042_1.webp"],
    "44310-0C080": ["imgpn_44310-0C080_3.webp", "imgpn_44310-0C080_1.webp", "imgpn_44310-0C080_2.webp"],
    "35010-60E00-84": ["imgpn_35010-60E00-84_1.webp", "imgpn_35010-60E00-84_3.webp", "imgpn_35010-60E00-84_2.webp"],
    # LC200 radiator: the three imgpn photos show this radiator; pn_ photo 2 shows a different core, so it is left out
    "16400-50384": ["imgpn_16400-50384_1.webp", "imgpn_16400-50384_3.webp", "imgpn_16400-50384_2.webp"],
    "53301-60690": ["pn_53301-60690_2.webp", "pn_53301-60690_1.webp"],
    # Image audit 2026-11-22: lead with the part itself; drop label cards, text
    # graphics and close-up fragments that are not product views.
    "16360-F0070": ["16360F0070_3.webp", "16360F0070_2.webp"],
    "16360-F0100": ["16360F0100_2.webp"],
    "16360-F0150": ["16360F0150_1.webp", "16360F0150_2.webp"],
    "44250-0C160": ["442500C160_2.webp", "442500C160_1.webp"],
    "81150-08430": ["8115008430_1.webp", "8115008430_2.webp"],
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
    found += sorted(f for f in os.listdir(IMG_DIR) if re.fullmatch(rf"imgpn_{re.escape(pn)}_\d\.webp", f))
    return found


PART_TITLE = {"pads_front": "Front Brake Pad Set", "rotor_front": "Front Brake Rotor"}


# Genuine Toyota accessory photos published by Toyota on toyota.com (accessory
# cards on the model's accessories page), saved as tcom_<PN>_<n>.webp. Toyota's
# parts-catalog image host has no photo for accessory (PT) numbers.
TCOM_ACCESSORY_PAGE = "https://www.toyota.com/landcruiser/accessories/"
TCOM_SOURCES = {
    "tcom_PT925-60240_1.webp": "https://media.ads.vapims.tms.aws.toyota.com/parts/toyota/images/PT925-60240_SK.jpg",
    "tcom_PT925-60240_2.webp": "https://media.ads.vapims.tms.aws.toyota.com/parts/toyota/images/PT925-60240.jpg",
    "tcom_PT228-60241_1.webp": "https://media.ads.vapims.tms.aws.toyota.com/parts/toyota/images/PT228-60241.jpg",
    "tcom_PT228-60242_1.webp": "https://media.ads.vapims.tms.aws.toyota.com/parts/toyota/images/PT228-60242.jpg",
    "tcom_PT944-60240_1.webp": "https://media.ads.vapims.tms.aws.toyota.com/parts/toyota/images/PT944-60240.jpg",
    "tcom_PT970-60241_1.webp": "https://media.ads.vapims.tms.aws.toyota.com/parts/toyota/images/PT970-60241.jpg",
}


def source_url(fname):
    if fname in TCOM_SOURCES:
        return TCOM_SOURCES[fname]
    if fname.startswith("top_"):
        return f"https://epc-images.toyota.com/{fname[4:-5]}.webp"
    if fname.startswith("pn_"):
        return f"https://epc-images.toyota.com/{fname[3:-5]}.webp"
    if fname.startswith("imgpn_"):
        pn, i = fname[6:-5].rsplit("_", 1)
        return f"https://epc-images.toyota.com/img/{pn.replace('-', '')}/{pn}_{i}.webp"
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
    reman = r.get("condition") == "remanufactured"
    name = f"Genuine Toyota {'Remanufactured ' if reman else ''}{title} {pn} for Toyota {' / '.join(models)} ({years_text(apps)})"
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
        f"Part number: {pn}", "Brand: Toyota", "Type: Genuine Toyota part", "Condition: " + ("Remanufactured (Toyota Genuine Remanufactured)" if reman else "New"),
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
        "condition": "remanufactured" if reman else "brand-new",
        "partNumber": pn,
        "freightNotes": FREIGHT_NOTE if r.get("partKind") in FREIGHT_KINDS else PARCEL_NOTE,
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
    tcom = "media.ads.vapims.tms.aws.toyota.com" in files[0]["sourceUrl"]
    prov_new[f"product-{pid}"] = {
        "productId": pid,
        "productName": name,
        "localFile": files[0]["localFile"],
        "sourceUrl": files[0]["sourceUrl"],
        "sourceName": "toyota.com" if tcom else "epc-images.toyota.com",
        "landingPage": TCOM_ACCESSORY_PAGE if tcom else next((u for u in r["sources"] if "autoparts.toyota.com" in u), "https://autoparts.toyota.com/"),
        "creator": "Toyota Motor North America (Toyota Genuine Accessories, toyota.com)" if tcom else "Toyota Motor North America (Toyota Genuine Parts catalog)",
        "creatorUrl": "https://www.toyota.com/" if tcom else "https://autoparts.toyota.com/",
        "hostedBy": "manufacturer",
        "retailer": None,
        "license": None,
        "licenseRaw": None,
        "licenseUrl": "",
        "attributionRequired": False,
        "usageBasis": ("manufacturer accessory photography published by Toyota on toyota.com for this exact accessory part number, showing "
                       "the accessory installed. No machine-readable licence is offered by the source, and DrivoraParts claims no ownership of "
                       "the image. Added on the site owner's instruction (2026-11-22); reuse rights beyond that instruction are not verified "
                       "by this repository.") if tcom else ("manufacturer product photography, taken from the manufacturer's own parts catalog image for this exact part number "
                       "and used to show the part itself. No machine-readable licence is offered by the source, and DrivoraParts claims no "
                       "ownership of the image. Added on the site owner's instruction (2026-11-19 Toyota catalog rebuild, original import "
                       "workflow); reuse rights beyond that instruction are not verified by this repository."),
        "matchedTokens": [pn, pn.replace("-", "")],
        "query": f"toyota.com accessory card for {pn}" if tcom else f"Toyota catalog rebuild 2026-11-19: Toyota image host for {pn}",
        "sha256": files[0]["sha256"], "bytes": files[0]["bytes"], "width": files[0]["width"], "height": files[0]["height"],
        "additionalFiles": files[1:],
        "downloadedAt": f"{TODAY}T00:00:00.000Z",
        "status": "downloaded",
        "verified": ("Toyota's accessory card on toyota.com names this part number in the image file; image fetched HTTP 200 (JPEG, converted to WebP), checked by eye against the accessory" if tcom
                     else "Toyota's image host is keyed by this part number; image fetched HTTP 200, WebP, compared visually with the part type"),
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
