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
const DIR = path.join(ROOT, "docs/catalog-expansion");
const GROUPS = new Set(["ready", "commercial_pending", "research_pending"]);
const US_MODELS = new Set([
  "4Runner", "86", "Avalon", "bZ4X", "C-HR", "Camry", "Corolla", "Corolla Cross", "Crown",
  "FJ Cruiser", "GR Corolla", "GR Supra", "GR86", "Grand Highlander", "Highlander", "Land Cruiser",
  "Matrix", "Mirai", "Prius", "RAV4", "Sequoia", "Sienna", "Tacoma", "Tundra", "Venza", "Yaris",
]);
const PART_NUMBER = /^[0-9A-Z]{5}-[0-9A-Z]{5}$/;
const FORBIDDEN = /\b(authori[sz]ed (?:toyota )?dealer|in stock|ships (?:in|within) \d|same[- ]day|warranty|guarantee[ds]?)\b/i;

const snapshot = JSON.parse(fs.readFileSync(path.join(ROOT, "lib/inventory/data/catalog-snapshot.json"), "utf8"));
const liveNumbers = new Set(
  snapshot.records.map((r) => String(r.partNumber ?? "").trim().toUpperCase()).filter(Boolean)
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
      if (liveNumbers.has(pn)) problems.push(`${at}: already in the live catalog`);
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

if (problems.length) {
  console.error(problems.map((p) => `  [toyota-expansion] ${p}`).join("\n"));
  process.exit(1);
}
console.log(
  `Toyota expansion check passed: ${files.length} batch file(s), ` +
    `${counts.ready} ready, ${counts.commercial_pending} awaiting commercial approval, ` +
    `${counts.research_pending} research pending.`
);
