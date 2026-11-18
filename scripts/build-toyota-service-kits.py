"""Builds bundle (kit) listings from Toyota expansion batch 1 components.

    python3 scripts/build-toyota-service-kits.py

Reads   docs/catalog-expansion/toyota-expansion-batch-1.json
Writes  docs/catalog-expansion/toyota-service-kits-batch-1.json / .csv / .md

The kits are staged import records, NOT loaded by the storefront. Nothing is
approved, priced live or published.

Rules
- Each kit is assembled by DrivoraParts from individual genuine Toyota parts;
  it is never presented as a Toyota-packaged kit.
- A kit's fitment is only the vehicles that EVERY component's verified
  fitment covers (same model, kit years inside the component's years, engine
  compatible). A gap in any component keeps the kit in research.
- Kit target price = sum of component target prices x quantity. Each component
  target is 3-5% under the lowest verified competitor for that exact part, so
  the kit sits 3-5% under the summed benchmark. No kit discount, sale price or
  reference price is added. With no supplier cost on file, the kit total is a
  competitive target flagged for profitability review, not a selling price.
- No image: kits need a licensed photo of the actual kit contents.
"""
import csv
import json
import os

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
DIR = os.path.join(ROOT, "docs/catalog-expansion")
SRC = os.path.join(DIR, "toyota-expansion-batch-1.json")
CHECKED = "2026-11-18"


def app(y1, y2, model, sub=None):
    return {"yearFrom": y1, "yearTo": y2, "make": "Toyota", "model": model, "submodel": sub}


KITS = [
    dict(
        id="toyota-kit-camry-2020-2024-25-filter-plug",
        name="Toyota Camry 2020–2024 2.5L Filter & Spark Plug Kit",
        kitType="service",
        apps=[app(2020, 2024, "Camry", "2.5L gas, non-hybrid")],
        engines="A25A-FKS",
        parts=[("90915-YZZN1", 1), ("17801-F0050", 1), ("87139-0E040", 1), ("90919-01289", 4)],
        intro="Spin-on oil filter, engine air filter, cabin air filter and a full set of four iridium spark plugs for the 2.5L four-cylinder gas (non-hybrid) Camry.",
        notInc="Engine oil and the oil drain plug gasket are not included.",
        fitmentIssue="Oil filter corrected from 04152-YZZA1 (V6 only) to spin-on 90915-YZZN1, but 90915-YZZN1 is confirmed only for the US-built 2020 Camry 2.5L; Japan-built Camry fitment and the full 2020-2024 range need a dealer catalog check by VIN. 90915-YZZN1 also has only one attributed competitor price.",
    ),
    dict(
        id="toyota-kit-tacoma-2016-2023-35-filter-plug",
        name="Toyota Tacoma 2016–2023 3.5L V6 Filter & Spark Plug Kit",
        kitType="service",
        apps=[app(2016, 2023, "Tacoma", "3.5L V6")],
        engines="2GR-FKS",
        parts=[("04152-YZZA1", 1), ("17801-0P100", 1), ("90919-01287", 6)],
        intro="Oil filter element, engine air filter and a full set of six spark plugs for the 3.5L V6 Tacoma.",
        notInc="Engine oil, the cabin air filter, the oil drain plug gasket and the oil filter housing O-ring are not included.",
    ),
    dict(
        id="toyota-kit-tacoma-2016-2023-front-brake",
        name="Toyota Tacoma 2016–2023 Front Brake Kit — Pads & Rotors",
        kitType="brake",
        apps=[app(2016, 2023, "Tacoma")],
        engines="",
        parts=[("04465-04090", 1), ("43512-04052", 2)],
        intro="One front brake pad set (both sides) and two front rotors, for a complete front-axle pad and rotor replacement.",
        notInc="Pad fitting hardware, brake fluid and wheel hardware are not included.",
    ),
    dict(
        id="toyota-kit-oil-filter-04152-yzza1-5-pack",
        name="Genuine Toyota Oil Filter Element 04152-YZZA1 — 5-Pack",
        kitType="multipack",
        apps=[app(2018, 2024, "Camry", "3.5L V6"), app(2017, 2022, "Highlander", "3.5L V6"), app(2016, 2023, "Tacoma", "3.5L V6")],
        engines="2GR-FKS",
        parts=[("04152-YZZA1", 5)],
        intro="Five genuine Toyota 04152-YZZA1 cartridge oil filter elements.",
        notInc="Housing O-rings and drain plug gaskets are not included.",
    ),
    dict(
        id="toyota-kit-rav4-2019-2024-25-filter-plug",
        name="Toyota RAV4 2019–2024 2.5L Filter & Spark Plug Kit",
        kitType="service",
        apps=[app(2019, 2024, "RAV4", "2.5L gas, non-hybrid")],
        engines="A25A-FKS",
        parts=[("90915-YZZN1", 1), ("17801-F0050", 1), ("90919-01289", 4)],
        intro="Spin-on oil filter, engine air filter and a full set of four iridium spark plugs for the 2.5L gas (non-hybrid) RAV4.",
        notInc="Engine oil, the cabin air filter and the oil drain plug gasket are not included.",
        fitmentIssue="Oil filter corrected to spin-on 90915-YZZN1 (2019+ RAV4 2.5L gas, per Toyota of Glendale and ToyotaPartsDeal). Still needs a second competitor price check: 90915-YZZN1 has only one attributed competitor (Longo Toyota $6.18), so it has no target price yet.",
    ),
]


def covers(component_apps, kit_app):
    return any(a["model"] == kit_app["model"] and a["yearFrom"] <= kit_app["yearFrom"] and a["yearTo"] >= kit_app["yearTo"]
               for a in component_apps)


def fit_text(apps):
    return "; ".join(f"{a['yearFrom']}–{a['yearTo']} Toyota {a['model']}" + (f" ({a['submodel']})" if a.get("submodel") else "") for a in apps)


def main():
    batch = json.load(open(SRC, encoding="utf-8"))
    by_pn = {r["partNumber"]: r for r in batch["records"] if r["partNumber"]}
    kits = []
    for k in KITS:
        issues, components = [], []
        target_total = bench_total = 0.0
        priced = True
        for pn, qty in k["parts"]:
            r = by_pn[pn]
            pr = r["pricing"]
            lo = pr.get("lowestCompetitor") or {}
            components.append({
                "partNumber": pn, "quantity": qty,
                "name": r["name"].split(" — ")[0],
                "componentStatus": r["audit"]["primaryStatus"],
                "componentTargetPrice": pr.get("recommendedPrice"),
                "lowestCompetitor": lo or None,
            })
            if pr.get("recommendedPrice") is None:
                priced = False
                issues.append(f"{pn}: no verified competitor pricing")
            else:
                target_total += pr["recommendedPrice"] * qty
                bench_total += lo["price"] * qty
            if r["audit"]["checks"]["Fitment verification required"]:
                issues.append(f"{pn}: component fitment verification required")
            for a in k["apps"]:
                if not covers(r["fitmentApplications"], a):
                    issues.append(f"{pn}: verified fitment does not cover {a['yearFrom']}-{a['yearTo']} {a['model']}")
        if k.get("fitmentIssue"):
            issues.insert(0, k["fitmentIssue"])
        fitment_ok = not any("fitment" in i for i in issues)
        status = "commercial_pending" if fitment_ok and priced else "research_pending"

        lines = [k["name"], "", k["intro"],
                 "This kit is assembled by DrivoraParts from individual genuine Toyota parts; it is not a Toyota-packaged kit.", "",
                 "Kit contents", ""]
        lines += [f"{c['quantity']} x {c['name']} ({c['partNumber']})" for c in components]
        lines += ["", k["notInc"], "", "Specifications", "",
                  "Brand: Toyota (genuine parts)", "Condition: New"]
        if k["engines"]:
            lines.append(f"Engines: {k['engines']}")
        restr = []
        for pn, _ in k["parts"]:
            for x in by_pn[pn]["fitmentVerification"]["applications"]:
                if x["status"] == "vin_dependent" and any(x["model"] == ka["model"] for ka in k["apps"]):
                    r_txt = "; ".join(v for v in (x.get("restriction"), x.get("assemblyOrigin"), x.get("productionDates")) if v)
                    restr.append(f"Restriction ({pn}, {x['yearFrom']}-{x['yearTo']} {x['model']}): {r_txt}")
        lines += [f"Fitment: {fit_text(k['apps'])}"] + restr + ["", "Confirm fitment with your VIN before ordering."]

        target = round(target_total, 2) if priced else None
        bench = round(bench_total, 2) if priced else None
        profit_flags = ["supplier cost not provided -- profitability cannot be established; flagged for review, not a selling price"]
        if target is not None and target < 25:
            profit_flags.append(f"ships free under the US parcel table; shipping cost will likely exceed the margin on a ${target:.2f} kit")
        blocking = ([] if fitment_ok else ["fitment verification required"]) + \
                   ([] if priced else ["pricing evidence insufficient"]) + \
                   ["supplier cost required", "kit photography required", "price approval required"]
        kits.append({
            "id": k["id"],
            "status": status,
            "listingType": "bundle",
            "kitType": k["kitType"],
            "name": k["name"],
            "brand": "Toyota",
            "assembledBy": "DrivoraParts",
            "condition": "New",
            "proposedCategory": "brakes" if k["kitType"] == "brake" else "filters-maintenance",
            "components": components,
            "fitment": fit_text(k["apps"]),
            "fitmentApplications": k["apps"],
            "engines": k["engines"],
            "description": "\n".join(lines),
            "price": None,
            "pricing": {
                "checkedOn": CHECKED,
                "basis": "sum of component targets; each component 3-5% under the lowest verified competitor for that exact part",
                "componentBenchmarkTotal": bench,
                "kitTargetPrice": target,
                "undercutVsBenchmark": round(1 - target / bench, 4) if target else None,
                "kitDiscount": None,
                "competitorKitPrice": None,
                "competitorKitNote": "No competitor price for an identical kit was researched; the benchmark is the sum of the lowest individual prices, which may come from different sellers.",
                "priceType": "competitive target (not approved)" if target else None,
                "profitability": "review required",
                "profitabilityFlags": profit_flags,
                "approved": False,
            },
            "image": None,
            "imageStatus": "none: needs a licensed photo of the actual kit contents",
            "issues": issues,
            "blocking": blocking,
            "sources": sorted({s for pn, _ in k["parts"] for s in by_pn[pn]["sources"]}),
        })

    with open(os.path.join(DIR, "toyota-service-kits-batch-1.json"), "w", encoding="utf-8") as f:
        json.dump({
            "_comment": "Toyota service kits batch 1 (2026-11-18): staged bundle listings built from expansion batch 1 components. NOT loaded by the storefront. Nothing approved or published. Validate with: node scripts/check-toyota-expansion.mjs",
            "componentSource": "toyota-expansion-batch-1.json",
            "kits": kits,
        }, f, ensure_ascii=False, indent=2)
        f.write("\n")

    with open(os.path.join(DIR, "toyota-service-kits-batch-1.csv"), "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["status", "id", "name", "kit_type", "fitment", "contents", "component_benchmark_total",
                    "kit_target_price", "undercut", "profitability", "blocking", "issues"])
        for k in kits:
            p = k["pricing"]
            w.writerow([k["status"], k["id"], k["name"], k["kitType"], k["fitment"],
                        "; ".join(f"{c['partNumber']} x{c['quantity']}" for c in k["components"]),
                        p["componentBenchmarkTotal"] or "", p["kitTargetPrice"] or "",
                        f"{p['undercutVsBenchmark']:.1%}" if p["undercutVsBenchmark"] else "",
                        p["profitability"], "; ".join(k["blocking"]), " | ".join(k["issues"])])

    md = ["# Toyota Service Kits — Batch 1 (staged bundle listings)\n",
          f"Built {CHECKED} from expansion batch 1 components. **Not approved, not priced live, not published.** "
          "Each kit is assembled by DrivoraParts from individual genuine Toyota parts and is described that way, never as a Toyota-packaged kit.\n",
          "## Kits\n",
          "| Kit | Contents | Fitment | Benchmark (sum of lowest) | Kit target | Status |\n|---|---|---|---|---|---|"]
    for k in kits:
        p = k["pricing"]
        contents = ", ".join(f"{c['partNumber']} x{c['quantity']}" for c in k["components"])
        md.append(f"| {k['name']} | {contents} | {k['fitment']} | "
                  f"{'$%.2f' % p['componentBenchmarkTotal'] if p['componentBenchmarkTotal'] else '—'} | "
                  f"{'**$%.2f**' % p['kitTargetPrice'] if p['kitTargetPrice'] else '—'} | {k['status']} |")
    md += ["", "## Pricing\n",
           "Kit target = sum of the component target prices. Each component is priced 3-5% (target 5%) under the lowest verified US retailer for that exact part number, so each kit lands 3-5% under the summed benchmark. "
           "No extra kit discount, sale price or reference price is applied. No supplier cost is on file, so every kit total is a competitive target flagged for profitability review, not a selling price. "
           "No competitor price for an identical kit was researched: the benchmark adds the cheapest individual listings, which may come from different sellers.\n",
           "## Open issues\n"]
    for k in kits:
        if k["issues"]:
            md.append(f"- **{k['name']}**: " + "; ".join(k["issues"]))
    md += ["", "## Before any kit can be published\n",
           "1. Supplier cost for every component (and kitting/packaging cost), plus a minimum margin.",
           "2. A licensed photo of each kit's actual contents.",
           "3. Owner approval of each kit price.",
           "4. Storefront support for bundle listings: the current catalog has single-product listings only, so a kit would need either one listing with its own SKU and stock reserved across components, or an add-all-to-cart bundle. That is a code change not made here.\n"]
    with open(os.path.join(DIR, "toyota-service-kits-batch-1.md"), "w", encoding="utf-8") as f:
        f.write("\n".join(md))

    print(len(kits), "kits:", {s: sum(k["status"] == s for k in kits) for s in ("commercial_pending", "research_pending")})
    for k in kits:
        print(f"  {k['status']:19} {k['pricing']['kitTargetPrice']!s:>8} / {k['pricing']['componentBenchmarkTotal']!s:>8}  {k['name']}")


if __name__ == "__main__":
    main()
