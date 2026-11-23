/**
 * Guards lib/inventory/data/toyota-genuine.json -- the only source of the
 * "Toyota Genuine Part" label and the /catalog/toyota-genuine section.
 * Every verified entry must name a public listing and carry its paper trail:
 * the Toyota part number, who verified it, when, and the evidence. Run in
 * CI through audit:storefront-claims.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), "utf8"));
const genuine = read("lib/inventory/data/toyota-genuine.json");
const catalogVisibility = read("lib/inventory/data/toyota-catalog.json");
const visible = new Set(catalogVisibility.visible);
// Verified listings hidden only by the owner's minimum listing price keep their
// verification record; any other verified listing must stay public.
const belowMinimumPrice = new Set(catalogVisibility.belowMinimumPrice ?? []);
// Likewise for listings hidden by a US-market fitment decision (EXCLUDE / HOLD).
const usFitmentHidden = new Set(
  read("lib/inventory/data/us-fitment-decisions.json")
    .decisions.filter((d) => d.decision === "EXCLUDE" || d.decision === "HOLD")
    .map((d) => d.id)
);

const TOYOTA_PART_NUMBER = /^(?:\d{5}-[0-9A-Z]{5}(?:-[0-9A-Z]{2})?|SU\d{3}-\d{5}|[0-9A-Z]{5}-[0-9A-Z]{5})$/;
const problems = [];
const seen = new Set();

for (const [i, entry] of (genuine.verified ?? []).entries()) {
  const where = `verified[${i}] (id ${entry?.id})`;
  if (!Number.isInteger(entry?.id)) problems.push(`${where}: id must be a listing id`);
  else if (!visible.has(entry.id) && !belowMinimumPrice.has(entry.id) && !usFitmentHidden.has(entry.id)) problems.push(`${where}: listing is not public (lib/inventory/data/toyota-catalog.json)`);
  if (seen.has(entry?.id)) problems.push(`${where}: listed twice`);
  seen.add(entry?.id);
  if (!TOYOTA_PART_NUMBER.test(String(entry?.partNumber ?? ""))) problems.push(`${where}: partNumber must be a Toyota part number, e.g. 35000-0K130`);
  for (const field of ["verifiedBy", "evidence"]) {
    if (!String(entry?.[field] ?? "").trim()) problems.push(`${where}: ${field} is required`);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(entry?.verifiedOn ?? ""))) problems.push(`${where}: verifiedOn must be YYYY-MM-DD`);
}

if (problems.length) {
  console.error("Toyota Genuine check failed:\n  " + problems.join("\n  "));
  process.exit(1);
}
console.log(`Toyota Genuine check passed (${seen.size} verified listing${seen.size === 1 ? "" : "s"}).`);
