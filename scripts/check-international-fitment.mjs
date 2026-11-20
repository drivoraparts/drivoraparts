/**
 * PROTOTYPE (not wired into any npm script, the importer or the storefront).
 * Opt-in validator for genuine Toyota fitment on vehicles built for markets
 * outside the US: Land Cruiser 70/80/100/200/250/300, Land Cruiser Prado and
 * Hilux. Proposed in docs/catalog-expansion/phase5/international-fitment-pathway.md;
 * adopting it needs owner approval.
 *
 *   node scripts/check-international-fitment.mjs [dir]
 *
 * Reads <dir>/toyota-international-batch-*.json (default
 * docs/catalog-expansion/international). The US pathway is untouched:
 * scripts/check-toyota-expansion.mjs still rejects every non-US model in
 * `fitmentApplications`. International fitment lives only in the separate
 * `internationalFitmentApplications` field and is checked here.
 *
 * Rules
 *  - model must be in INTL_MODELS; market must be a non-US market
 *  - the chassis (frame) code must belong to that model, e.g. HZJ79 -> Land Cruiser 70
 *  - the engine code must belong to that model AND agree with the chassis-code
 *    prefix (HZJ -> 1HZ, VDJ -> 1VD-FTV, GDJ -> 1GD/2GD ...): this blocks
 *    cross-market and cross-engine mix-ups
 *  - years must sit inside the model's production span
 *  - every application needs Toyota EPC evidence for that market (https URL)
 *  - commercial_pending / ready records need every application "verified";
 *    anything unverified must stay research_pending (HOLD)
 *  - the description must say the vehicle was built for markets outside the US
 *    and ask for frame code and VIN; no warranty, stock or dealer claims
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

export const MARKETS = new Set(["Australia", "Middle East (GCC)", "Japan", "Europe", "General (export)", "Africa", "Latin America", "Southeast Asia"]);

// Chassis-code prefix -> engine-code prefixes it can carry.
export const CHASSIS_ENGINE = {
  BJ: ["3B", "13B"], LJ: ["2L", "3L", "5L"], HJ: ["2H", "12H"], HZJ: ["1HZ"], HDJ: ["1HD"],
  PZJ: ["1PZ"], FJ: ["3F"], FZJ: ["1FZ"], UZJ: ["2UZ"], URJ: ["1UR", "3UR"], VDJ: ["1VD"],
  GRJ: ["1GR"], KDJ: ["1KD"], GDJ: ["1GD", "2GD"], TRJ: ["2TR"], RZJ: ["3RZ"], VZJ: ["5VZ"],
  VJA: ["V35A"], FJA: ["F33A"], TJA: ["T24A"], KUN: ["1KD", "2KD"], GGN: ["1GR"], TGN: ["2TR"],
  GUN: ["1GD", "2GD"], LAN: ["5L"],
};

export const INTL_MODELS = {
  "Land Cruiser 70": { chassis: /^(BJ|LJ|HJ|HZJ|PZJ|FZJ|VDJ|GRJ|GDJ)7\d$/, engines: ["3B", "2L", "3L", "2H", "1HZ", "1HD-FTE", "1PZ", "1FZ-FE", "1VD-FTV", "1GR-FE", "1GD-FTV"], years: [1984, 2026] },
  "Land Cruiser 80": { chassis: /^(FJ|FZJ|HZJ|HDJ|PZJ)8[01]$/, engines: ["3F-E", "1FZ-FE", "1HZ", "1HD-T", "1HD-FT", "1PZ"], years: [1990, 1998] },
  "Land Cruiser 100": { chassis: /^(UZJ|HZJ|HDJ|FZJ)10[05]$/, engines: ["2UZ-FE", "1HZ", "1HD-FTE", "1FZ-FE"], years: [1998, 2007] },
  "Land Cruiser 200": { chassis: /^(URJ|UZJ|VDJ|GRJ)20[02]$/, engines: ["1UR-FE", "3UR-FE", "2UZ-FE", "1VD-FTV", "1GR-FE"], years: [2007, 2021] },
  "Land Cruiser 300": { chassis: /^(VJA|FJA)30[0-9]$/, engines: ["V35A-FTS", "F33A-FTV"], years: [2021, 2026] },
  "Land Cruiser Prado 120": { chassis: /^(KDJ|GRJ|TRJ|RZJ|VZJ)12\d$/, engines: ["1KD-FTV", "1GR-FE", "2TR-FE", "3RZ-FE", "5VZ-FE"], years: [2002, 2009] },
  "Land Cruiser Prado 150": { chassis: /^(KDJ|GRJ|TRJ|GDJ)15\d$/, engines: ["1KD-FTV", "1GD-FTV", "1GR-FE", "2TR-FE"], years: [2009, 2024] },
  "Land Cruiser Prado 250": { chassis: /^(TJA|GDJ|TRJ)25\d$/, engines: ["T24A-FTS", "1GD-FTV", "2TR-FE"], years: [2023, 2026] },
  Hilux: { chassis: /^(KUN|GGN|TGN|LAN|GUN)\d{2,3}$/, engines: ["1KD-FTV", "2KD-FTV", "1GD-FTV", "2GD-FTV", "2TR-FE", "1GR-FE", "5L-E"], years: [2004, 2026] },
};

const DISCLAIMER = /built for markets outside the United States/i;
const CONFIRM = /frame code and VIN/i;
const FORBIDDEN = /\b(authori[sz]ed (?:toyota )?dealer|in stock|ships (?:in|within) \d|same[- ]day|warranty|guarantee[ds]?)\b/i;
const PART_NUMBER = /^[0-9A-Z]{5}-[0-9A-Z]{5}(-[0-9A-Z]{2})?$/;
const GROUPS = new Set(["ready", "commercial_pending", "research_pending"]);

export function validateRecords(records, label = "records") {
  const problems = [];
  records.forEach((r, i) => {
    const at = `${label} #${i + 1} ${r.partNumber || r.name}`;
    if (!GROUPS.has(r.status)) problems.push(`${at}: unknown status "${r.status}"`);
    if (!PART_NUMBER.test(String(r.partNumber ?? "").toUpperCase())) problems.push(`${at}: part number is not a Toyota service number`);
    if ((r.fitmentApplications ?? []).length) problems.push(`${at}: US fitmentApplications are not allowed on an international record; list US fitment in a US batch`);
    const apps = r.internationalFitmentApplications ?? [];
    if (!apps.length) problems.push(`${at}: no internationalFitmentApplications`);
    for (const a of apps) {
      const m = INTL_MODELS[a.model];
      const where = `${at} [${a.model} ${a.chassisCode ?? "?"}]`;
      if (!m) { problems.push(`${where}: "${a.model}" is not a supported international model`); continue; }
      if (!MARKETS.has(a.market)) problems.push(`${where}: market "${a.market}" is not a non-US market`);
      if (!m.chassis.test(a.chassisCode ?? "")) problems.push(`${where}: chassis code "${a.chassisCode}" does not belong to ${a.model}`);
      if (!m.engines.includes(a.engineCode)) problems.push(`${where}: engine "${a.engineCode}" is not offered in ${a.model}`);
      const prefix = String(a.chassisCode ?? "").match(/^[A-Z]+/)?.[0];
      const allowed = CHASSIS_ENGINE[prefix] ?? [];
      if (!allowed.some((e) => String(a.engineCode ?? "").startsWith(e))) problems.push(`${where}: engine "${a.engineCode}" does not match chassis prefix ${prefix}`);
      if (!(a.yearFrom <= a.yearTo) || a.yearFrom < m.years[0] || a.yearTo > m.years[1]) problems.push(`${where}: years ${a.yearFrom}-${a.yearTo} outside ${a.model} production ${m.years.join("-")}`);
      const ev = (a.evidence ?? []).filter((e) => e.kind === "toyota_epc" && /^https:\/\//.test(e.url ?? "") && e.market === a.market);
      if (!ev.length) problems.push(`${where}: no Toyota EPC evidence for the ${a.market} market`);
      if (r.status !== "research_pending" && a.status !== "verified") problems.push(`${where}: unverified application on a ${r.status} record (keep it research_pending / HOLD)`);
    }
    const d = r.description ?? "";
    if (!DISCLAIMER.test(d) || !CONFIRM.test(d)) problems.push(`${at}: description must say the vehicle was built for markets outside the United States and ask for frame code and VIN`);
    if (FORBIDDEN.test(d)) problems.push(`${at}: description makes an unestablished claim (${d.match(FORBIDDEN)[0]})`);
  });
  return problems;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const dir = process.argv[2] || path.join(ROOT, "docs/catalog-expansion/international");
  const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => /^toyota-international-batch-\d+\.json$/.test(f)) : [];
  if (!files.length) { console.log("No international batches (prototype pathway not in use)."); process.exit(0); }
  const problems = files.flatMap((f) => validateRecords(JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")).records, f));
  if (problems.length) { console.error(problems.join("\n")); process.exit(1); }
  console.log(`International fitment check passed (${files.length} batch file(s)).`);
}
