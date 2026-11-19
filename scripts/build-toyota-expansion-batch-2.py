#!/usr/bin/env python3
"""Toyota catalog expansion batch 2: high-value parts ($200+), staged only.

    python3 scripts/build-toyota-expansion-batch-2.py

Writes docs/catalog-expansion/toyota-expansion-batch-2.{json,md}. Not loaded by
the storefront. Validate with: node scripts/check-toyota-expansion.mjs

Research channel (2026-11-18): dealer and retailer catalog pages as indexed by
web search. Direct reading was attempted and refused: the RevolutionParts
dealer stores (Modern Toyota Wholesale Direct, Lakeland, Toyota OEM Parts
Online) answer automated requests with a Cloudflare block, and ToyotaPartsDeal
blocked after five requests. Those blocks were respected, not worked around.
Toyota's own parts site (autoparts.toyota.com) is readable for identity and
MSRP, but loads fitment with JavaScript.

Evidence classes follow scripts/toyota_fitment_evidence.py. ToyotaPartsDeal and
ToyotaPartsNow are classed as `retailer`: ToyotaPartsDeal describes itself as an
online store whose parts ship from authorized Toyota dealers (it is operated by
Original Parts Giant), so it is not itself a dealer catalog. They count as
competitor prices but cannot establish fitment alone.
"""
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from toyota_expansion_pricing import PRICING, assess, c  # noqa: E402
from toyota_fitment_evidence import A, E, S  # noqa: E402

OUT = "docs/catalog-expansion"
CHECKED = "2026-11-18"
TA = "https://autoparts.toyota.com/products/product"

# fmt: off
PARTS = [
    dict(pn="88310-06570", kind="ac_compressor", name="A/C Compressor with Pulley", cat=("hvac", "Heating & Air Conditioning"), msrp=894.27,
         comps=[c("Ourisman Toyota of Richmond", 583.95, "https://toyotaparts.ourismantoyotaofrichmond.com/oem-parts/toyota-compressor-8831006570"),
                c("ToyotaPartsDeal", 594.09, "https://www.toyotapartsdeal.com/oem/toyota~compressor~assy~w~p~88310-06570.html"),
                c("Sparks Toyota", 613.28, "https://www.sparksparts.com/oem-parts/toyota-compressor-8831006570"),
                c("Capo Valley Toyota", 670.70, "https://parts.capovalleytoyota.com/oem-parts/toyota-compressor-8831006570")],
         apps=[A(2018, 2024, "Camry", "A25A-FKS 2.5L", "vin_dependent",
                 [E("dealer_catalog", "Sparks Toyota (2018-2025 Toyota, 88310-06570)", "https://www.sparksparts.com/oem-parts/toyota-compressor-8831006570"),
                  E("dealer_catalog", "Toyota OEM Parts Online (2018-2025 Toyota A/C compressor)", "https://toyota.oempartsonline.com/oem-parts/toyota-a-c-compressor-8831006570"),
                  E("retailer", "ToyotaPartsDeal (2018-2024 Camry, 2020-2022 Avalon, 2019-2024 RAV4)", "https://www.toyotapartsdeal.com/oem/toyota~compressor~assy~w~p~88310-06570.html")],
                 restriction="2.5L gas; the same catalog lists 88310-33330 and 88310-06650 for some 2018 Camrys"),
               A(2019, 2024, "RAV4", "A25A-FKS 2.5L", "vin_dependent",
                 [E("dealer_catalog", "Sparks Toyota (2018-2025 Toyota)", "https://www.sparksparts.com/oem-parts/toyota-compressor-8831006570"),
                  E("retailer", "ToyotaPartsDeal (2019-2024 RAV4)", "https://www.toyotapartsdeal.com/oem/toyota~compressor~assy~w~p~88310-06570.html")],
                 restriction="2.5L gas (hybrids use an electric compressor)"),
               A(2018, 2024, "Camry", "A25A-FXS 2.5L hybrid", "unresolved", [], reason="Hybrid models use an electric compressor; not claimed.")],
         spec="New genuine Toyota A/C compressor assembly with pulley."),
    dict(pn="16400-31B70", kind="radiator", name="Radiator Assembly", cat=("engine", "Engine"), msrp=434.79,
         comps=[c("ToyotaPartsDeal", 303.21, "https://www.toyotapartsdeal.com/oem-2022-toyota-4runner-radiator.html"),
                c("ToyotaPartsNow", 304.52, "https://www.toyotapartsnow.com/oem/toyota~radiator-assy~16400-31b70"),
                c("Olathe Toyota", 305.83, "https://parts.olathetoyota.com/oem-parts/toyota-radiator-assembly-1640031b70")],
         apps=[A(2010, 2024, "4Runner", "1GR-FE 4.0L V6", "verified",
                 [E("dealer_catalog", "American Toyota (2010-2024 4Runner radiator assembly)", "https://parts.americantoyota.com/oem-parts/toyota-radiator-assembly-1640031b70"),
                  E("dealer_catalog", "Lakeland Toyota (2010-2024 4Runner)", "https://toyotaparts.lakelandtoyota.com/oem-parts/toyota-radiator-assembly-1640031b70"),
                  E("dealer_catalog", "Olathe Toyota (2010-2024 4Runner)", "https://parts.olathetoyota.com/oem-parts/toyota-radiator-assembly-1640031b70"),
                  E("toyota_official", "Toyota parts (radiator assy, MSRP $434.79)", f"{TA}/radiator-assy-1640031b70")])],
         sup=[S("16400-31712", "supersedes", [E("retailer", "listing: 16400-31712 replaced by 16400-31B70", "https://www.toyotapartsdeal.com/oem/toyota~radiator~assy~16400-31712.html")],
                status="unresolved", reason="Supersession seen on a retailer page only.")],
         spec="New genuine Toyota radiator assembly."),
    dict(pn="16400-0S030", kind="radiator", name="Radiator Assembly", cat=("engine", "Engine"), msrp=400.85,
         comps=[c("ToyotaPartsDeal", 279.55, "https://www.toyotapartsdeal.com/oem-2014-toyota-tundra-radiator.html"),
                c("AutoNation Parts", 319.07, "https://www.autonationparts.com/part-categories/cooling-systems/radiators/Toyota?page=1"),
                c("Modern Toyota", 274.73, "https://wholesaledirect.moderntoyota.com/oem-parts/toyota-radiator-assembly-164000s030"),
                c("Sparks Toyota", 277.14, "https://www.sparksparts.com/oem-parts/toyota-radiator-assembly-164000s030"),
                c("Olathe Toyota", 281.96, "https://parts.olathetoyota.com/oem-parts/toyota-radiator-assembly-164000s030")],
         apps=[A(2014, 2021, "Tundra", "3UR-FE 5.7L V8 / 1UR-FE 4.6L V8", "vin_dependent",
                 [E("dealer_catalog", "Olathe Toyota (2014-2021 Tundra radiator assembly)", "https://parts.olathetoyota.com/oem-parts/toyota-radiator-assembly-164000s030"),
                  E("dealer_catalog", "Toyota OEM Parts Online (2014-2021 Tundra)", "https://toyota.oempartsonline.com/oem-parts/toyota-radiator-assembly-164000s030"),
                  E("dealer_catalog", "Modern Toyota Wholesale Direct (2014-2021 Tundra)", "https://wholesaledirect.moderntoyota.com/oem-parts/toyota-radiator-assembly-164000s030")],
                 restriction="V8; one 2014 catalog page carries a 'to 08/2013' build note", production="early 2014 builds may differ")],
         spec="New genuine Toyota radiator assembly."),
    dict(pn="16400-F0080", kind="radiator", name="Radiator", cat=("engine", "Engine"), msrp=367.99,
         comps=[c("ToyotaPartsDeal", 256.63, "https://www.toyotapartsdeal.com/oem-2023-toyota-highlander-radiator.html"),
                c("Olathe Toyota", 258.84, "https://parts.olathetoyota.com/oem-parts/toyota-radiator-16400f0080"),
                c("Modern Toyota", 252.20, "https://wholesaledirect.moderntoyota.com/oem-parts/toyota-radiator-16400f0080"),
                c("Longo Toyota", 292.02, "https://parts.longotoyota.com/v-2021-toyota-highlander--hybrid-limited--2-5l-l4-electric-gas/cooling-system--radiator-and-components")],
         apps=[A(2020, 2022, "Highlander", "2GR-FKS 3.5L V6", "verified",
                 [E("dealer_catalog", "Olathe Toyota (3.5L and 2.5L hybrid Highlander)", "https://parts.olathetoyota.com/oem-parts/toyota-radiator-16400f0080"),
                  E("dealer_catalog", "Modern Toyota Wholesale Direct (3.5L and 2.5L Hybrid)", "https://wholesaledirect.moderntoyota.com/oem-parts/toyota-radiator-16400f0080")]),
               A(2020, 2024, "Highlander", "A25A-FXS 2.5L hybrid", "vin_dependent",
                 [E("dealer_catalog", "Olathe Toyota (2.5L hybrid)", "https://parts.olathetoyota.com/oem-parts/toyota-radiator-16400f0080")],
                 restriction="hybrid; 2024 also lists 16400-F0190 for some builds"),
               A(2023, 2024, "Highlander", "T24A-FTS 2.4L turbo", "unresolved",
                 [E("dealer_catalog", "Lakeland Toyota (16400-F0190 for 2.4L)", "https://parts.lakelandtoyota.com/p/toyota__/Radiator-Radiator-Assembly-Engine-Cooling-Radiator/17305970/16400F0190.html")],
                 reason="2.4L turbo is listed with 16400-F0190; not claimed.")],
         spec="New genuine Toyota radiator."),
    dict(pn="88310-02B60", kind="ac_compressor", name="A/C Compressor", cat=("hvac", "Heating & Air Conditioning"), msrp=856.03,
         comps=[c("Olathe Toyota", 562.64, "https://parts.olathetoyota.com/oem-parts/toyota-a-c-compressor-8831002b60"),
                c("Toyota OEM Parts Online", 567.75, "https://toyota.oempartsonline.com/oem-parts/toyota-a-c-compressor-8831002b60"),
                c("AutoPartsPrime", 576.95, "https://autopartsprime.com/toyota/compressor-assembly-w-p/oe-8831002b60"),
                c("ToyotaPartsNow", 580.54, "https://www.toyotapartsnow.com/parts-select/2024-toyota-corolla-a-c-compressor")],
         apps=[A(2020, 2024, "Corolla", "M20A-FKS 2.0L", "vin_dependent",
                 [E("dealer_catalog", "Toyota OEM Parts Online (2019-2026 Toyota; sedan, without hybrid, 2.0L)", "https://toyota.oempartsonline.com/oem-parts/toyota-a-c-compressor-8831002b60")],
                 restriction="sedan, 2.0L, without hybrid")],
         spec="New genuine Toyota A/C compressor; replaces 88310-12B10 per the dealer listing."),
    dict(pn="16400-0S040", kind="radiator", name="Radiator Assembly", cat=("engine", "Engine"), msrp=392.04,
         comps=[c("AutoPartsPrime", 269.86, "https://www.autopartsprime.com/p/2015-toyota-sequoia-radiator"),
                c("ToyotaPartsNow", 274.58, "https://www.toyotapartsnow.com/parts-select/2015-toyota-sequoia-radiator"),
                c("Olathe Toyota", 275.76, "https://parts.olathetoyota.com/oem-parts/toyota-radiator-assembly-164000s040")],
         apps=[A(2014, 2022, "Sequoia", "3UR-FE 5.7L V8", "verified",
                 [E("dealer_catalog", "Modern Toyota Wholesale Direct (2014-2022 Sequoia radiator assembly)", "https://wholesaledirect.moderntoyota.com/oem-parts/toyota-radiator-assembly-164000s040"),
                  E("dealer_catalog", "Olathe Toyota (2014-2022 Sequoia, 5.7L)", "https://parts.olathetoyota.com/oem-parts/toyota-radiator-assembly-164000s040")])],
         spec="New genuine Toyota radiator assembly."),
    dict(pn="G9010-48100", kind="inverter_cooler", name="Hybrid Inverter Cooler (Radiator)", cat=("engine", "Engine"), msrp=640.04,
         comps=[c("ToyotaPartsDeal", 429.04, "https://www.toyotapartsdeal.com/oem/toyota~radiator~assy~g9010-48100.html"),
                c("AutoNation Parts", 486.76, "https://www.autonationparts.com/v-2021-toyota-sienna--limited--2-5l-l4-electric-gas/belts-and-cooling--radiators-coolers-and-related-components")],
         apps=[A(2021, 2021, "Sienna", "A25A-FXS 2.5L hybrid", "vin_dependent",
                 [E("dealer_catalog", "Lakeland Toyota (2021 Sienna inverter cooler)", "https://parts.lakelandtoyota.com/p/toyota_2021_SIENNA/Radiator-Inverter-Cooler-AUXILIARY-Drive-Motor/16361171/G901048100.html")],
                 restriction="hybrid inverter cooler; G9010-48110 also listed"),
               A(2022, 2022, "Sienna", "A25A-FXS 2.5L hybrid", "vin_dependent",
                 [E("dealer_catalog", "Chapel Hill Toyota (2022 Sienna 2.5L FHEV LE inverter cooler)", "https://toyotaparts.chtoyota.com/p/Toyota_2022_Sienna-25L-FULL-HYBRID-EV-GAS-FHEV-CVT-FWD-LE-Mini-Passenger-Van/Radiator-Inverter-Cooler-AUXILIARY-Drive-Motor/98558429/G901048100.html")],
                 restriction="hybrid inverter cooler; G9010-48110 also listed"),
               A(2023, 2024, "Sienna", "A25A-FXS 2.5L hybrid", "unresolved",
                 [E("retailer", "ToyotaPartsDeal (2024 Sienna radiator page)", "https://www.toyotapartsdeal.com/oem-2024-toyota-sienna-radiator.html")], reason="Retailer-only for 2023-2024.")],
         spec="New genuine Toyota inverter cooler (auxiliary radiator for the hybrid drive inverter); not the engine radiator.",
         unattributed=[320.95], excluded="Country Hills Toyota $417.70 CAD (Canada); Go-Parts $320.95 (genuine status not stated)"),
    dict(pn="16410-0P290", kind="radiator", name="Radiator", cat=("engine", "Engine"), msrp=423.29,
         comps=[c("OEMGenuineParts", 285.02, "https://www.oemgenuineparts.com/oem-parts/toyota-radiator-164100p290")],
         apps=[A(2016, 2023, "Tacoma", "2GR-FKS 3.5L V6", "unresolved",
                 [E("retailer", "OEMGenuineParts (2016-2023 Tacoma)", "https://www.oemgenuineparts.com/oem-parts/toyota-radiator-164100p290")],
                 reason="Retailer-only; Tacoma radiators split by transmission (16410-0P300 listed for the manual) and engine.")],
         spec="New genuine Toyota radiator."),
    dict(pn="81150-04270", kind="headlight", name="Headlight Assembly, Left (Halogen with LED DRL)", cat=("lighting", "Lighting"), msrp=850.95,
         comps=[c("Olathe Toyota", 570.14, "https://parts.olathetoyota.com/oem-parts/toyota-headlamp-assembly-drivers-side-8115004270"),
                c("BAM Wholesale Parts", 595.50, "https://www.bamwholesaleparts.com/oem-parts/toyota-composite-assembly-left-8115004270")],
         apps=[A(2016, 2023, "Tacoma", "", "vin_dependent",
                 [E("dealer_catalog", "Olathe Toyota (2016-2023 Tacoma headlamp assembly, driver side)", "https://parts.olathetoyota.com/oem-parts/toyota-headlamp-assembly-drivers-side-8115004270")],
                 restriction="driver side; halogen with LED daytime running lights (LED and sequential-turn headlights use other numbers)")],
         spec="New genuine Toyota driver-side headlight assembly."),
    dict(pn="81150-04290", kind="headlight", name="Headlight Assembly, Left (LED, Sequential Turn)", cat=("lighting", "Lighting"), msrp=None,
         comps=[c("ToyotaPartsDeal", 856.65, "https://www.toyotapartsdeal.com/oem-toyota-tacoma-headlight.html"),
                c("Sparks Toyota", 884.34, "https://www.sparksparts.com/oem-parts/toyota-2020-2023-toyota-tacoma-headlight-left-8115004290")],
         apps=[A(2020, 2023, "Tacoma", "", "vin_dependent",
                 [E("dealer_catalog", "Sparks Toyota (2020-2023 Tacoma headlight left; LED, sequential turn)", "https://www.sparksparts.com/oem-parts/toyota-2020-2023-toyota-tacoma-headlight-left-8115004290")],
                 restriction="driver side; LED headlight with sequential turn signal")],
         spec="New genuine Toyota driver-side LED headlight assembly with sequential turn signal."),
    dict(pn="88370-48170", kind="ac_compressor", name="Electric A/C Compressor (Hybrid)", cat=("hvac", "Heating & Air Conditioning"), msrp=1608.19,
         comps=[c("ToyotaPartsDeal", 1074.92, "https://www.toyotapartsdeal.com/oem-toyota-sienna-a_c_compressor.html"),
                c("Venice Toyota", 1148.25, "https://parts.venicetoyota.com/p/toyota__Sienna/AC-Compressor/94497281/8837048170.html")],
         apps=[A(2021, 2023, "Sienna", "A25A-FXS 2.5L hybrid", "vin_dependent",
                 [E("toyota_official", "Toyota parts (2022 Sienna A/C compressor 88370-48170, MSRP $1,608.19)", "https://parts.toyota.com/p/Toyota_2022_Sienna/AC-Compressor/92686229/8837048170.html"),
                  E("dealer_catalog", "Venice Toyota (Sienna 2021-2023)", "https://parts.venicetoyota.com/p/toyota__Sienna/AC-Compressor/94497281/8837048170.html")],
                 restriction="hybrid electric compressor; 88370-08020 also listed for some Siennas")],
         spec="New genuine Toyota electric A/C compressor for the hybrid powertrain."),
]
# fmt: on

for p in PARTS:
    PRICING[p["pn"]] = dict(msrp=p["msrp"], comps=p["comps"], unattributed=p.get("unattributed", []), excluded=p.get("excluded", ""))

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
json.dump({"_comment": "Toyota expansion batch 2 (2026-11-18): high-value parts, staged only. NOT loaded by the storefront. Nothing approved or published.",
           "records": records}, open(f"{OUT}/toyota-expansion-batch-2.json", "w", encoding="utf-8"), ensure_ascii=False, indent=2)

md = ["# Toyota Expansion Batch 2 — High-Value Parts (staged)\n",
      f"Researched {CHECKED}. **Research-only candidates, not catalog entries:** nothing is approved, published or loaded by the storefront.\n",
      "| Part number | Product | Fitment | Fitment status | Competitor prices | Lowest | Proposed (5% target) | Status | Review reasons |",
      "|---|---|---|---|---|---|---|---|---|"]
for r in records:
    p = r["pricing"]
    lo = p.get("lowestCompetitor")
    md.append(f"| {r['partNumber']} | {r['name'].split(' — ')[0].replace('Genuine Toyota ', '')} | {r['fitment'] or '—'} | {r['fitmentVerification']['verificationStatus']} | "
              f"{len(p.get('competitors', []))} | {('$%.2f %s' % (lo['price'], lo['seller'])) if lo else '—'} | "
              f"{('$%.2f' % p['recommendedPrice']) if p.get('recommendedPrice') else '—'} | {r['approvalStatus']} | {'; '.join(r['reviewReasons'])} |")
md += ["", "## Research channel and limits\n",
       "- Dealer-platform stores (Modern Toyota Wholesale Direct, Lakeland, Toyota OEM Parts Online) refuse automated reading (Cloudflare block); ToyotaPartsDeal blocked after five requests. Blocks were respected. Evidence comes from their pages as indexed by web search, plus Toyota's own parts site for identity and MSRP.",
       "- ToyotaPartsDeal / ToyotaPartsNow are classed as retailers (operated by Original Parts Giant; parts ship from authorized dealers), not dealer catalogs.",
       "- Throughput through this channel is roughly one well-evidenced high-value part per search."]
open(f"{OUT}/toyota-expansion-batch-2.md", "w", encoding="utf-8").write("\n".join(md) + "\n")
print(len(records), "batch 2 records:", {s: sum(r["status"] == s for r in records) for s in ("commercial_pending", "research_pending")},
      "| priced:", sum(r["pricing"].get("recommendedPrice") is not None for r in records))
