/**
 * Validates the Toyota catalog-expansion import files
 * (docs/catalog-expansion/toyota-expansion-batch-*.json) against the
 * publishing rules, and reports which records are ready to import.
 *
 *   node scripts/check-toyota-expansion.mjs
 *
 * Rules
 *  - every record is in one group: ready | commercial_pending | research_pending
 *  - part numbers look like Toyota service numbers (12345-ABCDE); none repeats
 *    inside a batch or matches a part number already in the live catalog
 *  - fitment names only US-market Toyota models (no Hilux, Prado, LandCruiser 70/79...)
 *  - commercial_pending and ready need fitment applications, at least one
 *    source and no "low" confidence
 *  - a competitive price sits 3-5% under the lowest attributed competitor
 *    (target 5%) and is flagged for review unless profitability is verified
 *  - ready additionally needs an approved numeric price (never the market
 *    referencePrice), verified profitability and an image file under public/
 *  - no description claims dealer authorization, stock, delivery times or a
 *    warranty -- none of these are established for these records
 *
 * Exits 1 on any rule violation. Nothing here writes to the catalog: a record
 * is imported into lib/inventory only once it validates as `ready`.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
// TOYOTA_EXPANSION_DIR lets scripts/test-toyota-fitment-validator.mjs run the
// checks against mutated copies; it is never set in normal use.
const DIR = process.env.TOYOTA_EXPANSION_DIR || path.join(ROOT, "docs/catalog-expansion");
const GROUPS = new Set(["ready", "commercial_pending", "research_pending"]);
const US_MODELS = new Set([
  "4Runner", "86", "Avalon", "bZ4X", "C-HR", "Camry", "Corolla", "Corolla Cross", "Crown",
  "FJ Cruiser", "GR Corolla", "GR Supra", "GR86", "Grand Highlander", "Highlander", "Land Cruiser",
  "Matrix", "Mirai", "Prius", "RAV4", "Sequoia", "Sienna", "Tacoma", "Tundra", "Venza", "Yaris",
]);
// Optional two-character suffix: Toyota Genuine Remanufactured units carry "-84"
// (35010-0C090-84), as check-toyota-genuine.mjs already accepts.
const PART_NUMBER = /^[0-9A-Z]{5}-[0-9A-Z]{5}(?:-[0-9A-Z]{2})?$/;
const FORBIDDEN = /\b(authori[sz]ed (?:toyota )?dealer|in stock|ships (?:in|within) \d|same[- ]day|warranty|guarantee[ds]?)\b/i;

const snapshot = JSON.parse(fs.readFileSync(path.join(ROOT, "lib/inventory/data/catalog-snapshot.json"), "utf8"));
const liveNumbers = new Set(
  snapshot.records.map((r) => String(r.partNumber ?? "").trim().toUpperCase()).filter(Boolean)
);

// Staged records imported into the storefront by scripts/import-toyota-genuine-oem.py:
// the live listing is the import of that record, not a duplicate of it.
const importFile = path.join(ROOT, "lib/inventory/data/toyota-genuine-oem.json");
const importedNumbers = new Set(
  (fs.existsSync(importFile) ? JSON.parse(fs.readFileSync(importFile, "utf8")) : []).map((p) => String(p.partNumber).toUpperCase())
);

const files = fs.existsSync(DIR)
  ? fs.readdirSync(DIR).filter((f) => /^toyota-expansion-batch-\d+\.json$/.test(f))
  : [];
if (!files.length) {
  console.log("No Toyota expansion batches found.");
  process.exit(0);
}

const problems = [];
const seen = new Map();
const counts = { ready: 0, commercial_pending: 0, research_pending: 0 };

for (const file of files) {
  const { records } = JSON.parse(fs.readFileSync(path.join(DIR, file), "utf8"));
  records.forEach((r, i) => {
    const at = `${file} #${i + 1} ${r.partNumber || r.name}`;
    if (!GROUPS.has(r.status)) problems.push(`${at}: unknown status "${r.status}"`);
    else counts[r.status] += 1;

    if (r.partNumber) {
      const pn = r.partNumber.toUpperCase();
      if (!PART_NUMBER.test(pn)) problems.push(`${at}: part number "${pn}" is not a Toyota service number`);
      if (seen.has(pn)) problems.push(`${at}: duplicate of ${seen.get(pn)}`);
      seen.set(pn, at);
      if (liveNumbers.has(pn) && !importedNumbers.has(pn)) problems.push(`${at}: already in the live catalog`);
      if (importedNumbers.has(pn)) counts.imported = (counts.imported ?? 0) + 1;
    }

    for (const a of r.fitmentApplications ?? []) {
      if (a.make !== "Toyota" || !US_MODELS.has(a.model)) problems.push(`${at}: "${a.make} ${a.model}" is not a US-market Toyota model`);
      if (!(a.yearFrom <= a.yearTo)) problems.push(`${at}: bad year range ${a.yearFrom}-${a.yearTo}`);
    }

    if (FORBIDDEN.test(r.description ?? "")) problems.push(`${at}: description makes an unestablished claim (${(r.description.match(FORBIDDEN) || [])[0]})`);

    if (r.status === "commercial_pending" || r.status === "ready") {
      if (!(r.fitmentApplications ?? []).length) problems.push(`${at}: no fitment applications`);
      if (!(r.sources ?? []).length) problems.push(`${at}: no sources`);
      if (/^low/.test(r.fitmentConfidence ?? "")) problems.push(`${at}: low-confidence fitment cannot be ${r.status}`);
    }
    // Competitor pricing: research evidence, never an automatic price.
    const pr = r.pricing;
    if (!pr || !pr.checkedOn) problems.push(`${at}: no pricing research block`);
    else {
      const comps = pr.competitors ?? [];
      for (const cmp of comps) {
        if (!cmp.seller || !/^https?:\/\//.test(cmp.url ?? "") || !(cmp.price > 0)) problems.push(`${at}: competitor price without seller, URL or amount`);
      }
      if (pr.recommendedPrice != null) {
        if (comps.length < 3) problems.push(`${at}: recommended price from fewer than 3 attributed competitors`);
        const lowest = Math.min(...comps.map((x) => x.price));
        // Pricing policy: about 5% under the lowest verified competitor, moving
        // toward 3% only when needed -- never more than 5% or less than 3% under.
        const floor = Math.ceil(lowest * 95 - 1e-6) / 100; // 5% under, rounded up to the cent
        const ceiling = lowest * 0.97 + 0.005;
        if (!(pr.recommendedPrice >= floor && pr.recommendedPrice <= ceiling)) problems.push(`${at}: price $${pr.recommendedPrice} is outside 3-5% under the lowest competitor ($${lowest}): $${(lowest * 0.95).toFixed(2)}-$${(lowest * 0.97).toFixed(2)}`);
        if (pr.profitability !== "verified" && !(pr.profitabilityFlags ?? []).length) problems.push(`${at}: profitability not established and not flagged for review`);
        if (pr.lowestCompetitor?.price !== lowest) problems.push(`${at}: lowestCompetitor is not the lowest attributed price`);
      }
      if (r.price != null && !pr.approved) problems.push(`${at}: selling price set without pricing approval`);
    }

    if (r.status === "ready") {
      if (typeof r.price !== "number" || !(r.price > 0)) problems.push(`${at}: ready without an approved price`);
      if (!pr?.approved) problems.push(`${at}: ready without pricing approval`);
      if (pr?.profitability !== "verified") problems.push(`${at}: ready without verified profitability (supplier cost)`);
      const img = r.image ? path.join(ROOT, "public", r.image.replace(/^\//, "")) : null;
      if (!img || !fs.existsSync(img)) problems.push(`${at}: ready without an image file under public/`);
    }
  });
}

// ---------------------------------------------------------------------------
// Fitment evidence (scripts/toyota_fitment_evidence.py). Passing these checks
// means the record carries the documented evidence the standard requires --
// it is NOT proof of fitment. Nothing here performs or implies a VIN lookup.
// ---------------------------------------------------------------------------
const CLAIMED = new Set(["verified", "vin_dependent"]);
const NOT_LISTED = new Set(["unresolved", "removed"]);
const CATALOG_KINDS = new Set(["toyota_official", "dealer_catalog"]); // what can establish fitment
const EVIDENCE_KINDS = new Set([...CATALOG_KINDS, "dealer_catalog_ca", "service_doc", "retailer", "secondary"]);
// US model-year availability.
const MODEL_YEARS = {
  "4Runner": [[1984, 2025]], Avalon: [[1995, 2022]], Camry: [[1983, 2025]], Corolla: [[1968, 2025]],
  "Corolla Cross": [[2022, 2025]], "FJ Cruiser": [[2007, 2014]], Highlander: [[2001, 2025]], RAV4: [[1996, 2025]],
  Sequoia: [[2001, 2025]], Sienna: [[1998, 2025]], Tacoma: [[1995, 2025]], Tundra: [[2000, 2025]],
  Venza: [[2009, 2015], [2021, 2024]], Prius: [[2001, 2025]], "C-HR": [[2018, 2022]], Matrix: [[2003, 2013]],
};
// US model years in which each engine was offered in each model.
const ENGINE_YEARS = {
  "Camry|A25A-FKS": [2018, 2024], "Camry|A25A-FXS": [2018, 2024], "Camry|2GR-FKS": [2018, 2024],
  "Camry|2GR-FE": [2007, 2017], "Camry|2AR-FE": [2010, 2017],
  "RAV4|A25A-FKS": [2019, 2025], "RAV4|A25A-FXS": [2019, 2025], "RAV4|2AR-FE": [2009, 2018], "RAV4|2GR-FE": [2006, 2012],
  "Highlander|2GR-FKS": [2017, 2022], "Highlander|2GR-FE": [2008, 2016], "Highlander|A25A-FXS": [2020, 2025],
  "Highlander|T24A-FTS": [2023, 2025],
  "Tacoma|2GR-FKS": [2016, 2023], "Tacoma|2TR-FE": [2005, 2023], "Tacoma|1GR-FE": [2005, 2015], "Tacoma|T24A-FTS": [2024, 2025],
  "4Runner|1GR-FE": [2003, 2024], "4Runner|2UZ-FE": [2003, 2009],
  "Tundra|2UZ-FE": [2000, 2009], "Tundra|1GR-FE": [2005, 2014], "Tundra|3UR-FE": [2007, 2021], "Tundra|1UR-FE": [2010, 2021],
  "Tundra|V35A-FTS": [2022, 2025],
  "Sequoia|3UR-FE": [2008, 2022], "Sequoia|V35A-FTS": [2023, 2025],
  "Corolla|2ZR-FE": [2009, 2019], "Corolla|2ZR-FAE": [2014, 2022], "Corolla|2ZR-FXE": [2020, 2025], "Corolla|M20A-FKS": [2019, 2025],
  "Corolla Cross|M20A-FKS": [2022, 2025], "Sienna|2GR-FKS": [2017, 2020], "Sienna|A25A-FXS": [2021, 2025] /* Toyota oil filter chart: SIENNA 2021- A25AFXS */, "Sienna|2GR-FE": [2007, 2016],
  "FJ Cruiser|1GR-FE": [2007, 2014],
  // From Toyota's oil filter and spark plug application charts.
  "Matrix|2ZR-FE": [2009, 2013], "Prius|2ZR-FXE": [2010, 2025], "Sequoia|2UZ-FE": [2001, 2009], "Venza|A25A-FXS": [2021, 2024],
};
const ENGINE_CODE = /\b[0-9A-Z]{2,5}-[A-Z]{2,4}\b/g;
const FAMILY = { oil_filter: "oil_filter", oil_filter_spin: "oil_filter" };
// Vehicle corner a record's name states ("Front Left", "Rear Right"), or "" when unsided.
const position = (r) => {
  const n = r.name ?? "";
  const axle = /\bRear\b/.test(n) ? "rear" : /\bFront\b/.test(n) ? "front" : "";
  const side = /\bLeft\b/.test(n) ? "left" : /\bRight\b/.test(n) ? "right" : "";
  return side ? `${axle}-${side}` : "";
};
const VIN_CLAIM = /\bVIN[- ](?:verified|confirmed|based|checked)\b|\b(?:verified|confirmed) (?:by|with|against) (?:the )?VIN\b/i;

const allRecords = [];
for (const file of files) {
  for (const r of JSON.parse(fs.readFileSync(path.join(DIR, file), "utf8")).records) allRecords.push({ file, r });
}
const byNumber = new Map(allRecords.filter(({ r }) => r.partNumber).map(({ r }) => [r.partNumber.toUpperCase(), r]));
const fitCounts = { verified: 0, vin_dependent: 0, unresolved: 0, removed: 0 };

for (const { file, r } of allRecords) {
  const at = `${file} ${r.partNumber || r.name}`;
  const fv = r.fitmentVerification;
  if (!fv || !Array.isArray(fv.applications)) { problems.push(`${at}: no fitment verification block`); continue; }
  const isEngine = r.partKind === "engine";

  // VIN-level confirmation is never claimed without an actual catalog lookup.
  const lookups = Array.isArray(fv.vinLookups) ? fv.vinLookups.filter((l) => l?.catalog && l?.date && l?.vinRef) : [];
  if ((r.vinLookupPerformed || fv.vinLookupPerformed) && !lookups.length) problems.push(`${at}: claims a VIN lookup without a recorded catalog lookup`);
  if (VIN_CLAIM.test(r.description ?? "") && !lookups.length) problems.push(`${at}: description claims VIN-level confirmation`);

  const claimed = fv.applications.filter((a) => CLAIMED.has(a.status));
  for (const a of fv.applications) {
    const where = `${at} ${a.yearFrom}-${a.yearTo} ${a.model}${a.engine ? ` ${a.engine}` : ""}`;
    if (!CLAIMED.has(a.status) && !NOT_LISTED.has(a.status)) { problems.push(`${where}: unknown status "${a.status}"`); continue; }
    fitCounts[a.status] += 1;
    for (const e of a.evidence ?? []) {
      if (!EVIDENCE_KINDS.has(e.kind) || !/^https:\/\//.test(e.url ?? "") || !e.source) problems.push(`${where}: evidence without kind, source or https URL`);
    }
    if (NOT_LISTED.has(a.status) && !(a.reason ?? "").trim()) problems.push(`${where}: ${a.status} application without an exact reason`);
    if (!CLAIMED.has(a.status)) continue;

    // Evidence: part numbers need a Toyota or US Toyota-dealer catalog source.
    if (!isEngine && !(a.evidence ?? []).some((e) => CATALOG_KINDS.has(e.kind))) {
      problems.push(`${where}: listed without Toyota or US dealer catalog evidence (retailer / secondary / Canadian sources cannot establish fitment)`);
    }
    // Restrictions only the VIN resolves must be marked VIN-dependent and stated.
    if ((a.assemblyOrigin || a.productionDates) && a.status !== "vin_dependent") problems.push(`${where}: production-origin or production-date restriction marked "${a.status}" -- must be vin_dependent`);
    if (a.status === "vin_dependent" && !(a.restriction || a.assemblyOrigin || a.productionDates)) problems.push(`${where}: VIN-dependent without the restriction that makes it so`);
    if (isEngine && a.status !== "vin_dependent") problems.push(`${where}: engine applications are always VIN-dependent`);

    // Model years must exist in the US market, and the engine in that model.
    const ranges = MODEL_YEARS[a.model];
    if (ranges && !ranges.some(([f, t]) => a.yearFrom >= f && a.yearTo <= t)) problems.push(`${where}: years outside the US ${a.model} model years`);
    for (const code of new Set((a.engine ?? "").match(ENGINE_CODE) ?? [])) {
      const span = ENGINE_YEARS[`${a.model}|${code}`];
      if (!span) problems.push(`${where}: ${code} is not a recorded US ${a.model} engine (add it to ENGINE_YEARS only after checking)`);
      else if (a.yearFrom < span[0] || a.yearTo > span[1]) problems.push(`${where}: ${code} was offered in the US ${a.model} only ${span[0]}-${span[1]}`);
    }
  }

  // The listed fitment is exactly the claimed applications -- nothing more.
  const key = (x) => `${x.model}|${x.yearFrom}|${x.yearTo}`;
  const listed = (r.fitmentApplications ?? []).map(key).sort().join(",");
  if (listed !== claimed.map(key).sort().join(",")) problems.push(`${at}: listed fitment does not match the verified / VIN-dependent applications`);

  if (claimed.some((a) => a.status === "vin_dependent")) {
    if (!r.vinDependent) problems.push(`${at}: has VIN-dependent applications but vinDependent is not set`);
    if (r.universalFitment) problems.push(`${at}: VIN-dependent applications cannot be marked universal fitment`);
    if (!/\bVIN\b/.test(r.description ?? "")) problems.push(`${at}: VIN-dependent listing does not tell the buyer to confirm by VIN`);
  }

  // Supersession.
  const pn = (r.partNumber ?? "").toUpperCase();
  for (const sx of fv.supersession ?? []) {
    const other = String(sx.partNumber ?? "").toUpperCase();
    if (!PART_NUMBER.test(other)) problems.push(`${at}: supersession part number "${other}" is malformed`);
    if (other === pn) problems.push(`${at}: supersedes itself`);
    if (!["supersedes", "superseded_by"].includes(sx.relation)) problems.push(`${at}: unknown supersession relation "${sx.relation}"`);
    if (sx.status === "verified" && !(sx.evidence ?? []).some((e) => CATALOG_KINDS.has(e.kind) || e.kind === "dealer_catalog_ca")) problems.push(`${at}: supersession ${other} marked verified without catalog evidence`);
    if (sx.status !== "verified" && !(sx.reason ?? "").trim()) problems.push(`${at}: unverified supersession ${other} without a reason`);
    if (sx.status === "verified" && pn && other.slice(0, 5) !== pn.slice(0, 5)) problems.push(`${at}: supersession across part families (${pn} / ${other}) -- record it under rejectedSupersessions`);
    if (sx.status === "verified" && sx.relation === "supersedes") {
      const old = byNumber.get(other);
      if (old && String(old.supersededBy ?? "").toUpperCase() !== pn) problems.push(`${at}: supersedes batch record ${other}, which is not marked superseded by ${pn}`);
      if (old && (old.fitmentVerification?.supersession ?? []).some((y) => y.relation === "supersedes" && y.status === "verified" && String(y.partNumber).toUpperCase() === pn)) problems.push(`${at}: supersession cycle with ${other}`);
    }
  }
  for (const rj of fv.rejectedSupersessions ?? []) if (!(rj.reason ?? "").trim()) problems.push(`${at}: rejected supersession without a reason`);
  if ((r.supersedes ?? "").split(/;\s*/).filter(Boolean).some((x) => !(fv.supersession ?? []).some((y) => y.status === "verified" && y.relation === "supersedes" && y.partNumber === x))) {
    problems.push(`${at}: supersedes field lists a number that is not a verified supersession`);
  }
  if (r.supersededBy && r.status !== "research_pending") problems.push(`${at}: superseded by ${r.supersededBy} -- the current number must be listed instead`);

  // Groups: only resolved fitment can move toward publication.
  if (r.status === "commercial_pending" || r.status === "ready") {
    if (!claimed.length) problems.push(`${at}: ${r.status} with no verified or VIN-dependent application`);
    if ((fv.blocking ?? []).length) problems.push(`${at}: ${r.status} with unresolved fitment blockers`);
    if (!CLAIMED.has(fv.verificationStatus)) problems.push(`${at}: ${r.status} with fitment status "${fv.verificationStatus}"`);
    if (isEngine) problems.push(`${at}: engine assemblies stay research_pending until a vendor unit is documented`);
  }
}

// Conflicting part numbers: two listable records of the same part family
// claiming the same model, years and engine, without a VIN-level restriction
// on both that tells them apart.
const listable = allRecords.filter(({ r }) => r.status !== "research_pending" && r.partNumber);
for (let i = 0; i < listable.length; i += 1) {
  for (let j = i + 1; j < listable.length; j += 1) {
    const A = listable[i].r;
    const B = listable[j].r;
    if ((FAMILY[A.partKind] ?? A.partKind) !== (FAMILY[B.partKind] ?? B.partKind)) continue;
    // Sided parts (e.g. calipers) for different corners of the vehicle are
    // different positions, not competing numbers for one position.
    if (position(A) !== position(B)) continue;
    for (const a of A.fitmentVerification.applications.filter((x) => CLAIMED.has(x.status))) {
      for (const b of B.fitmentVerification.applications.filter((x) => CLAIMED.has(x.status))) {
        if (a.model !== b.model || a.yearTo < b.yearFrom || b.yearTo < a.yearFrom) continue;
        const ea = new Set((a.engine ?? "").match(ENGINE_CODE) ?? []);
        const eb = (b.engine ?? "").match(ENGINE_CODE) ?? [];
        const engineOverlap = !ea.size || !eb.length || eb.some((c) => ea.has(c));
        if (!engineOverlap) continue;
        const separated = a.status === "vin_dependent" && b.status === "vin_dependent" && (a.restriction || a.assemblyOrigin || a.productionDates) && (b.restriction || b.assemblyOrigin || b.productionDates);
        if (!separated) problems.push(`conflict: ${A.partNumber} and ${B.partNumber} both claim ${a.model} ${Math.max(a.yearFrom, b.yearFrom)}-${Math.min(a.yearTo, b.yearTo)}${ea.size ? ` (${[...ea].join("/")})` : ""} without a VIN-level restriction separating them`);
      }
    }
  }
}

// Bundle (kit) listings built from batch components.
const batchRecords = new Map();
for (const file of files) {
  for (const r of JSON.parse(fs.readFileSync(path.join(DIR, file), "utf8")).records) {
    if (r.partNumber) batchRecords.set(r.partNumber.toUpperCase(), r);
  }
}
const kitFiles = fs.readdirSync(DIR).filter((f) => /^toyota-service-kits-batch-\d+\.json$/.test(f));
const kitCounts = { ready: 0, commercial_pending: 0, research_pending: 0 };
const kitIds = new Set();
const covers = (apps, k) =>
  (apps ?? []).some((a) => a.model === k.model && a.yearFrom <= k.yearFrom && a.yearTo >= k.yearTo);
for (const file of kitFiles) {
  for (const kit of JSON.parse(fs.readFileSync(path.join(DIR, file), "utf8")).kits) {
    const at = `${file} ${kit.id}`;
    if (!GROUPS.has(kit.status)) problems.push(`${at}: unknown status "${kit.status}"`);
    else kitCounts[kit.status] += 1;
    if (kitIds.has(kit.id)) problems.push(`${at}: duplicate kit id`);
    kitIds.add(kit.id);
    if (FORBIDDEN.test(kit.description ?? "")) problems.push(`${at}: description makes an unestablished claim`);
    if (!/not a Toyota-packaged kit/.test(kit.description ?? "")) problems.push(`${at}: description must say the kit is assembled by DrivoraParts, not packaged by Toyota`);
    for (const a of kit.fitmentApplications ?? []) {
      if (a.make !== "Toyota" || !US_MODELS.has(a.model)) problems.push(`${at}: "${a.make} ${a.model}" is not a US-market Toyota model`);
    }
    let sum = 0;
    let priced = true;
    for (const c of kit.components ?? []) {
      const r = batchRecords.get(String(c.partNumber).toUpperCase());
      if (!r) { problems.push(`${at}: component ${c.partNumber} is not in an expansion batch`); priced = false; continue; }
      if (!(c.quantity >= 1)) problems.push(`${at}: component ${c.partNumber} has no quantity`);
      const target = r.pricing?.recommendedPrice;
      if (target == null) priced = false;
      else {
        if (c.componentTargetPrice !== target) problems.push(`${at}: component ${c.partNumber} price differs from its batch target`);
        sum += target * c.quantity;
      }
      if (kit.status !== "research_pending") {
        if (r.audit?.checks?.["Awaiting Toyota fitment confirmation"]) problems.push(`${at}: component ${c.partNumber} still needs fitment verification`);
        for (const a of kit.fitmentApplications ?? []) {
          if (!covers(r.fitmentApplications, a)) problems.push(`${at}: component ${c.partNumber} fitment does not cover ${a.yearFrom}-${a.yearTo} ${a.model}`);
        }
      }
    }
    if (kit.status !== "research_pending" && !(kit.components ?? []).length) problems.push(`${at}: kit has no components`);
    if (kit.status === "research_pending" && !(kit.issues ?? []).length) problems.push(`${at}: research_pending kit without a recorded issue`);
    const pr = kit.pricing ?? {};
    if (pr.kitTargetPrice != null) {
      if (!priced) problems.push(`${at}: kit target set while a component is unpriced`);
      else if (Math.abs(pr.kitTargetPrice - Math.round(sum * 100) / 100) > 0.001) problems.push(`${at}: kit target $${pr.kitTargetPrice} is not the sum of component targets ($${sum.toFixed(2)})`);
      if (pr.kitDiscount) problems.push(`${at}: kit discount applied -- kits are priced from component targets only`);
    }
    if (kit.price != null && !pr.approved) problems.push(`${at}: selling price set without pricing approval`);
    if (pr.profitability !== "verified" && !(pr.profitabilityFlags ?? []).length) problems.push(`${at}: profitability not established and not flagged for review`);
    if (kit.status === "ready") {
      if (typeof kit.price !== "number" || !pr.approved || pr.profitability !== "verified") problems.push(`${at}: ready without approved price and verified profitability`);
      const img = kit.image ? path.join(ROOT, "public", kit.image.replace(/^\//, "")) : null;
      if (!img || !fs.existsSync(img)) problems.push(`${at}: ready without an image file under public/`);
    }
  }
}

// Storefront "add all to cart" bundles (lib/catalog/data/bundles.json) must
// mirror a staged kit, and may be approved only once that kit is ready.
const stagedKits = new Map();
for (const file of kitFiles) {
  for (const kit of JSON.parse(fs.readFileSync(path.join(DIR, file), "utf8")).kits) stagedKits.set(kit.id, kit);
}
const bundleFile = path.join(ROOT, "lib/catalog/data/bundles.json");
let bundleCount = 0;
let approvedBundles = 0;
if (fs.existsSync(bundleFile)) {
  const seenBundles = new Set();
  for (const b of JSON.parse(fs.readFileSync(bundleFile, "utf8")).bundles) {
    const at = `bundles.json ${b.id}`;
    bundleCount += 1;
    if (seenBundles.has(b.id)) problems.push(`${at}: duplicate bundle id`);
    seenBundles.add(b.id);
    const kit = stagedKits.get(b.id);
    if (!kit) { problems.push(`${at}: no staged kit with this id`); continue; }
    if (kit.status === "research_pending") problems.push(`${at}: staged kit is still research_pending`);
    const key = (list) => list.map((c) => `${String(c.partNumber).toUpperCase()}x${c.quantity}`).sort().join(",");
    if (key(b.components ?? []) !== key(kit.components ?? [])) problems.push(`${at}: components differ from the staged kit`);
    const text = `${b.name} ${b.summary} ${b.notIncluded}`;
    if (FORBIDDEN.test(text) || /\b(save|discount|sale|% off)\b/i.test(text)) problems.push(`${at}: bundle text makes a price or unestablished claim`);
    if (typeof b.approved !== "boolean") problems.push(`${at}: approved must be true or false`);
    if (b.approved) {
      approvedBundles += 1;
      if (kit.status !== "ready" || !kit.pricing?.approved) problems.push(`${at}: approved on the storefront before the staged kit is ready and price-approved`);
    }
  }
}

if (problems.length) {
  console.error(problems.map((p) => `  [toyota-expansion] ${p}`).join("\n"));
  process.exit(1);
}
console.log(
  `Toyota expansion check passed: ${files.length} batch file(s), ` +
    `${counts.ready} ready, ${counts.commercial_pending} awaiting commercial approval, ` +
    `${counts.research_pending} research pending.` +
    (kitFiles.length
      ? ` Kits: ${kitCounts.ready} ready, ${kitCounts.commercial_pending} awaiting commercial approval, ${kitCounts.research_pending} research pending.`
      : "") +
    ` Fitment applications: ${fitCounts.verified} verified, ${fitCounts.vin_dependent} VIN-dependent, ${fitCounts.unresolved} unresolved, ${fitCounts.removed} removed` +
    " (documented evidence only; not proof of fitment)." +
    (bundleCount ? ` Storefront bundles: ${bundleCount} defined, ${approvedBundles} approved.` : "")
);
