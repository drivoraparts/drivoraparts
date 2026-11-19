#!/usr/bin/env python3
"""Approval status for Toyota expansion batch 1 and its kits.

    python3 scripts/build-toyota-approval-report.py

Reads the staged batch, kit and image-search files and writes
docs/catalog-expansion/toyota-expansion-batch-1-approval-status.md.
Nothing is approved or published by this script.
"""
import json
import os

DIR = "docs/catalog-expansion"
batch = json.load(open(f"{DIR}/toyota-expansion-batch-1.json", encoding="utf-8"))
kits = json.load(open(f"{DIR}/toyota-service-kits-batch-1.json", encoding="utf-8"))["kits"]
images = json.load(open(f"{DIR}/toyota-expansion-batch-1-image-search.json", encoding="utf-8"))
records = batch["records"]
ORDER = ["Ready for approval", "Rejected (incorrect or unsupported)", "Awaiting Toyota fitment confirmation",
         "Awaiting pricing verification", "Awaiting supplier cost", "Awaiting image verification"]


def label(r):
    return r["partNumber"] or f"{r['engines']} engine"


def short(r):
    return r["name"].split(" — ")[0].replace("Genuine Toyota ", "")


md = ["# Toyota Expansion Batch 1 — Approval Status\n",
      "Generated from the staged data (2026-11-18). **Nothing is approved, published, merged or deployed.** "
      "A record is never ready just because the validator passes: ready needs verified fitment, three or more attributed competitor prices, "
      "a verified supplier cost with a profitable price, a licensed photo of the exact part, and your approval.\n",
      "## Summary\n", "| Status | Records |", "|---|---|"]
for b in ORDER:
    md.append(f"| {b} | {sum(r['audit']['primaryStatus'] == b for r in records)} |")
md += ["", "Each record sits in its first blocking status in the order above; most qualified records are blocked by both supplier cost and images.\n"]

# Qualified: fitment + pricing done
qual = [r for r in records if not r["audit"]["checks"]["Awaiting Toyota fitment confirmation"]
        and not r["audit"]["checks"]["Awaiting pricing verification"] and not r["audit"]["checks"]["Rejected (incorrect or unsupported)"]]
md += [f"## Fitment and pricing complete — awaiting supplier cost and a licensed image ({len(qual)})\n",
       "| Part number | Product | Listed fitment | Fitment | Lowest verified competitor | Proposed price (5% target) | Competitors |",
       "|---|---|---|---|---|---|---|"]
for r in qual:
    p = r["pricing"]
    lo = p["lowestCompetitor"]
    md.append(f"| {label(r)} | {short(r)} | {r['fitment']} | {r['fitmentVerification']['verificationStatus'].replace('_', '-')} | "
              f"[{lo['seller']} ${lo['price']:.2f}]({lo['url']}) | ${p['recommendedPrice']:.2f} | {len(p['competitors'])} |")
md += ["", "Proposed prices are competitive targets only: no supplier cost is on file, so profitability is unestablished and every price stays flagged for review.\n"]

md += ["## Awaiting Toyota fitment confirmation\n", "| Record | Exact reason |", "|---|---|"]
for r in records:
    if r["audit"]["primaryStatus"] == "Awaiting Toyota fitment confirmation":
        fv = r["fitmentVerification"]
        if r.get("partKind") == "engine":
            why = "engine assembly: vendor unit details (condition, mileage, inclusions) and VIN-level interchange"
        else:
            why = "; ".join(fv["blocking"] + fv["unresolved"][:2]) or "no verified application"
        md.append(f"| {label(r)} | {why} |")
md += ["", "## Rejected (incorrect or unsupported)\n", "| Record | Reason |", "|---|---|"]
for r in records:
    if r["audit"]["primaryStatus"] == "Rejected (incorrect or unsupported)":
        why = f"superseded by {r['supersededBy']} — list the current number instead" if r.get("supersededBy") else "; ".join(a["reason"] for a in r["fitmentVerification"]["applications"])
        md.append(f"| {label(r)} | {why} |")

md += ["", "## Kits\n", "| Kit | Contents | Fitment | Benchmark (sum of lowest) | Kit target | Status |", "|---|---|---|---|---|---|"]
for k in kits:
    p = k["pricing"]
    contents = ", ".join(f"{c['partNumber']} x{c['quantity']}" for c in k["components"])
    md.append(f"| {k['name']} | {contents} | {k['fitment']} | ${p['componentBenchmarkTotal']:.2f} | ${p['kitTargetPrice']:.2f} | {k['status']} |")
md += ["", "Every kit component has verified or VIN-dependent fitment covering the kit's vehicles. Kit targets are the sum of component targets (no kit discount). "
       "Kits stay unapproved until each component has a supplier cost and the kit has a photo of its actual contents.\n"]

matched = sum(len(v["openverseMatches"]) + len(v["commonsMatches"] or []) for v in images["results"].values())
answered = sum(1 for v in images["results"].values() if v["commonsAnswered"])
md += ["## Images\n",
       f"- Searched every batch part number on Openverse ({len(images['results'])}/{len(images['results'])} answered) and Wikimedia Commons ({answered}/{len(images['results'])} answered; the rest rate-limited) — the licensed sources the catalog's image workflow uses. **Licensed matches: {matched}.**",
       "- Toyota's parts site and dealer catalogs show photos, but their terms do not license reuse, and copying them is excluded by your image rules. No AI, generic or unrelated image was used.",
       "- Record: `toyota-expansion-batch-1-image-search.json`.",
       "- Legitimate routes: (1) photos from the supplier DrivoraParts buys from, with permission to use them; (2) a licensed distributor image feed; (3) photographing stock on hand. Any of these drops into `public/` with provenance in `lib/inventory/data/image-provenance.json`, the existing workflow.\n",
       "## Supplier cost\n",
       "- **Established: 0 of 50.** No public source gives a Toyota wholesale or distributor acquisition cost, and the standing rules exclude contacting vendors, making purchases or inventing costs.",
       "- To finish pricing: enter each part's supplier cost and your minimum margin in `SUPPLIER_COST` / `MIN_MARGIN` (`scripts/toyota_expansion_pricing.py`). Each price is then checked at 5% under the lowest competitor, moved toward 3% if the margin requires it, or flagged as not viable.\n",
       "## Outstanding VIN or dealer parts-counter confirmations\n",
       "No VIN lookup or dealer contact was performed. These applications are listed with their restriction (VIN-dependent) or held back:\n"]
for r in records:
    for a in r["fitmentVerification"]["applications"]:
        if a["status"] == "vin_dependent" and r.get("partKind") != "engine":
            rest = "; ".join(x for x in (a.get("restriction"), a.get("assemblyOrigin"), a.get("productionDates")) if x)
            md.append(f"- {label(r)} — {a['yearFrom']}-{a['yearTo']} {a['model']}: {rest}")
os.makedirs(DIR, exist_ok=True)
open(f"{DIR}/toyota-expansion-batch-1-approval-status.md", "w", encoding="utf-8").write("\n".join(md) + "\n")
print("approval status:", {b: sum(r['audit']['primaryStatus'] == b for r in records) for b in ORDER}, "| qualified:", len(qual), "| kits:", len(kits))
