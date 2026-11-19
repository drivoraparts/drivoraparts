"""Shared builder for staged Toyota expansion batches (batch 3 onward).

The record shape and rules are exactly those of
scripts/build-toyota-expansion-batch-2.py, so every batch is checked by
scripts/check-toyota-expansion.mjs and imported by
scripts/import-toyota-genuine-oem.py the same way.
"""
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from toyota_expansion_pricing import PRICING, assess, c  # noqa: E402,F401
from toyota_fitment_evidence import A, E, S  # noqa: E402,F401

OUT = "docs/catalog-expansion"
CHECKED = "2026-11-19"

# Storefront categories (lib/inventory/categories.ts). Engine-bay components
# (cooling, charging, ignition, HVAC compressors) file under Engine, as the
# existing catalog does.
CAT = {
    "rotor_front": ("brakes", "Brakes"), "rotor_rear": ("brakes", "Brakes"), "pads_front": ("brakes", "Brakes"),
    "pads_rear": ("brakes", "Brakes"), "caliper": ("brakes", "Brakes"), "booster": ("brakes", "Brakes"),
    "strut": ("suspension", "Suspension"), "shock": ("suspension", "Suspension"), "control_arm": ("suspension", "Suspension"),
    "hub_bearing": ("suspension", "Suspension"), "steering": ("suspension", "Suspension"),
    "radiator": ("engine", "Engine"), "ac_compressor": ("engine", "Engine"), "condenser": ("engine", "Engine"),
    "alternator": ("engine", "Engine"), "starter": ("engine", "Engine"), "water_pump": ("engine", "Engine"),
    "ignition_coil": ("engine", "Engine"), "sensor": ("engine", "Engine"), "fuel_pump": ("engine", "Engine"),
    "inverter_cooler": ("engine", "Engine"), "fan": ("engine", "Engine"), "thermostat": ("engine", "Engine"), "engine_mount": ("engine", "Engine"), "tensioner": ("engine", "Engine"), "axle": ("transmission", "Transmission"), "hose": ("engine", "Engine"),
    "headlight": ("lighting", "Lighting"), "taillight": ("lighting", "Lighting"), "fog_light": ("lighting", "Lighting"),
    "mirror": ("body-parts", "Body Parts"), "grille": ("body-parts", "Body Parts"),
}


def P(pn, kind, name, msrp, comps, apps, spec, sup=None, unattributed=None, excluded=""):
    return dict(pn=pn, kind=kind, name=name, cat=CAT[kind], msrp=msrp, comps=[c(*x) for x in comps],
                apps=apps, spec=spec, sup=sup or [], unattributed=unattributed or [], excluded=excluded)


def D(name, url):
    """Dealer catalog evidence (a Toyota dealer's own parts store)."""
    return E("dealer_catalog", name, url)


def T(name, url):
    return E("toyota_official", name, url)


def R(name, url):
    return E("retailer", name, url)


def build(batch_no, PARTS, comment):
    for p in PARTS:
        PRICING[p["pn"]] = dict(msrp=p["msrp"], comps=p["comps"], unattributed=p["unattributed"], excluded=p["excluded"])
    ENGINE_CODE = re.compile(r"\b[0-9A-Z]{2,5}-[A-Z]{2,4}\b")


    def sub_text(a):
        segs = [ENGINE_CODE.sub("", s).strip() for s in (a["engine"] or "").split(" / ")]
        disp = " / ".join(x for x in segs if x)
        restr = a.get("restriction") or ""
        if disp and restr.startswith(disp):
            restr = restr[len(disp):].lstrip(" ;,")
        bits = [b for b in (disp, restr) if b]
        return "; ".join(bits) or None


    def fit_text(apps):
        return "; ".join(f"{a['yearFrom']}–{a['yearTo']} Toyota {a['model']}" + (f" ({a['submodel']})" if a.get("submodel") else "") for a in apps)


    records = []
    for p in PARTS:
        claimed = [a for a in p["apps"] if a["status"] in ("verified", "vin_dependent")]
        apps = [{"yearFrom": a["yearFrom"], "yearTo": a["yearTo"], "make": "Toyota", "model": a["model"], "submodel": sub_text(a)} for a in claimed]
        vin = any(a["status"] == "vin_dependent" for a in claimed)
        overall = "unresolved" if not claimed else ("vin_dependent" if vin else "verified")
        status = "commercial_pending" if claimed else "research_pending"
        models = []
        for a in apps:
            if a["model"] not in models:
                models.append(a["model"])
        fit = fit_text(apps)
        restr = [f"Restriction ({a['yearFrom']}-{a['yearTo']} {a['model']}): " + "; ".join(x for x in (a.get("restriction"), a.get("assemblyOrigin"), a.get("productionDates")) if x)
                 for a in claimed if a["status"] == "vin_dependent"]
        desc = (f"Genuine Toyota {p['name'].lower()} {p['pn']} for the Toyota {', '.join(models) or 'vehicles listed below'}. {p['spec']}\n\n"
                f"Specifications\n\nPart number: {p['pn']}\nBrand: Toyota\nType: Genuine Toyota part\nCondition: New\n"
                f"Fitment: {fit or 'under review (no verified application)'}\n" + "".join(x + "\n" for x in restr)
                + "\nConfirm fitment with your VIN before ordering.")
        pricing = assess(p["pn"], False)
        rec = {
            "status": status,
            "name": f"Genuine Toyota {p['name']} {p['pn']} — {' / '.join(models) if models else 'fitment under review'}",
            "brand": "toyota", "manufacturer": "Toyota", "partNumber": p["pn"],
            "supersedes": "", "supersededBy": None,
            "partType": "Genuine Toyota", "partKind": p["kind"], "condition": "brand-new",
            "proposedCategory": p["cat"][0], "proposedCategoryName": p["cat"][1],
            "fitment": fit, "fitmentApplications": apps,
            "engines": "; ".join(sorted({m for a in claimed for m in ENGINE_CODE.findall(a["engine"] or "")})),
            "description": desc, "price": None, "pricing": pricing,
            "image": None, "imageStatus": "none: no licensed photo of this part number (Openverse / Wikimedia Commons hold none; dealer photos are not licensed)",
            "fitmentConfidence": {"verified": "high (dealer catalog)", "vin_dependent": "medium (VIN-dependent restrictions)", "unresolved": "low (unresolved)"}[overall],
            "vinDependent": vin, "vinLookupPerformed": False,
            "fitmentVerification": {"auditedOn": CHECKED, "verificationStatus": overall, "vinLookupPerformed": False, "identity": None,
                                    "applications": p["apps"], "supersession": p.get("sup", []), "rejectedSupersessions": [], "blocking": [],
                                    "unresolved": [f"{a['yearFrom']}-{a['yearTo']} {a['model']}: {a['reason']}" for a in p["apps"] if a["status"] in ("unresolved", "removed")]},
            "sources": sorted({e["url"] for a in p["apps"] for e in a["evidence"]} | {x["url"] for x in p["comps"]}),
            "approvalStatus": "REVIEW REQUIRED" if claimed else "REVIEW REQUIRED (fitment)",
            "reviewReasons": [r for r in [
                None if claimed else "fitment unresolved",
                None if pricing.get("recommendedPrice") is not None else f"pricing: {len(p['comps'])} attributed competitor price(s), 3 required",
                "supplier cost not established",
                "no licensed product image",
            ] if r],
        }
        records.append(rec)

    os.makedirs(OUT, exist_ok=True)
    with open(f"{OUT}/toyota-expansion-batch-{batch_no}.json", "w", encoding="utf-8") as f:
        json.dump({"_comment": comment, "records": records}, f, ensure_ascii=False, indent=2)
        f.write("\n")
    print(len(records), f"batch {batch_no} records:", {s: sum(r["status"] == s for r in records) for s in ("commercial_pending", "research_pending")},
          "| priced:", sum(r["pricing"].get("recommendedPrice") is not None for r in records))
    return records
