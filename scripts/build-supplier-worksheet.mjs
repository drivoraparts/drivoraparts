/**
 * Builds the supplier-confirmation worksheet for engines, swap assemblies and
 * transmissions (the highest-priority product families).
 *
 *   node scripts/build-supplier-worksheet.mjs
 *
 * Writes docs/supplier-confirmation-worksheet.csv. One row per product family:
 * a family is the same product sold under several listings (years, drivetrain
 * or part-number variants), so one confirmed answer can fill every listing in
 * it. The blank columns on the right are for the supplier's answers; the
 * columns on the left describe what we already know. Re-run after answers are
 * entered into lib/inventory/package-contents.ts to refresh "already known".
 *
 * Read-only with respect to the catalog: nothing here changes a listing.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "drivora-worksheet-"));
const entry = path.join(tmp, "entry.ts");
const bundle = path.join(tmp, "entry.mjs");

fs.writeFileSync(
  entry,
  [
    'import { getAllProducts } from "@/lib/inventory";',
    'import { getProductCatalogMeta } from "@/lib/inventory/productEnhancements";',
    "const rows = getAllProducts().map((p) => {",
    "  const m = getProductCatalogMeta(p);",
    "  const l = m.logistics as { included?: string[]; contents?: { status: string } };",
    "  return { id: p.id, name: p.name, category: p.category, brand: p.brand, price: p.price,",
    "    label: m.conditionLabel, desc: p.description || '', included: l.included || [],",
    "    contentsStatus: l.contents ? l.contents.status : '' };",
    "});",
    "process.stdout.write(JSON.stringify(rows));",
  ].join("\n")
);

const { build } = await import("esbuild");
await build({
  entryPoints: [entry],
  bundle: true,
  platform: "node",
  format: "esm",
  outfile: bundle,
  loader: { ".json": "json" },
  alias: { "@": ROOT },
  logLevel: "error",
  absWorkingDir: ROOT,
});
const products = JSON.parse(
  execFileSync(process.execPath, ["--max-old-space-size=4096", bundle], {
    cwd: ROOT,
    encoding: "utf8",
    maxBuffer: 512 * 1024 * 1024,
  })
);
fs.rmSync(tmp, { recursive: true, force: true });

/* Same name-based classification the catalog audit used. */
const ACCESSORY =
  /\b(mount|mounts|bracket|brace|skid|filter|belt|hose|line|lines|manifold|sensor|gasket|seal|bolt|stud|nut|washer|hardware|cooler|pan|pump|adapter|adaptor|spacer|shifter|linkage|cable|harness|controller|solenoid|valve body|dipstick|crossmember|fluid|cover|plate|flange|clamp|bushing|insulator|power steering|service kit|rebuild kit|shift kit|install kit|swap kit|conversion kit|kit for|flexplate|flywheel|clutch|dust|shield|guard|spring|arm|link|exhaust brake|brakeloc|idle control|module|support|tuner|programmer|monitor|gauge|switch|relay|wire|piston|rod|rods|cam|camshaft|head|heads|crank|crankshaft|timing|valve|injector|rocker|lifter|pulley|damper|oil|pedal|actuator|wastegate|intercooler|piping|pipe|tuning)\b/i;

function productType(p) {
  const n = p.name;
  if (
    /\b(complete engine|engine assembly|long ?block|short ?block|crate engine|engine package|swap package|drop[- ]in package|drivetrain|complete drivetrain|rotating assembly)\b/i.test(n) ||
    (/\bengine\b|\bV\d+\b.*\b(L|Liter)\b/i.test(n) && p.category === "engine" && !ACCESSORY.test(n) && /\b\d\.\d\s?L?\b|engine$/i.test(n))
  )
    return "Engine / swap assembly";
  if (/\b(transmission|transaxle|gearbox)\b/i.test(n) && !ACCESSORY.test(n)) return "Transmission / gearbox";
  return null;
}

/* Family key: the product without years, drivetrain letters or part number. */
function familyKey(name) {
  return name
    .split(" — ")[0]
    .replace(/\b(19|20)\d{2}\s*[–-]\s*((19|20)\d{2}|\d{2})\b/g, "")
    .replace(/\b(19|20)\d{2}\+?\b/g, "")
    .replace(/\b(2WD|4WD|RWD|AWD|FWD|2wd|4wd)\b/g, "")
    .replace(/,?\s*BD part \S+\.?/i, "")
    .replace(/\s+/g, " ")
    .replace(/[,\s–-]+$/g, "")
    .trim()
    .toLowerCase();
}

const INFO_NEEDED = {
  "Engine / swap assembly":
    "Confirm: engine identification; ECU/PCM and wiring harness included (y/n); sensors, connectors, control modules; intake manifold and throttle body; fuel injectors, rails, pumps and regulators; ignition coils and plugs; forced-induction parts (intercooler, piping, bypass valves, boost control); accessory drive, alternator, starter; oil pan and pump, water pump; exhaust manifolds or headers; calibration or tuning supplied; immobilizer/security needs; what must be bought separately and what is vehicle-specific.",
  "Transmission / gearbox":
    "Confirm: model, identification code and gear count; torque converter (auto) or clutch assembly (manual) included; flexplate or flywheel; TCM/TCU and wiring harness; valve body and control components; shifter and selector; sensors; mounts and crossmember; bellhousing/adapter; transfer-case compatibility; cooler and lines; fluid; programming or ECU/TCU integration; what must be bought separately.",
};

const csv = (v) => {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

const families = new Map();
for (const p of products) {
  const type = productType(p);
  if (!type) continue;
  const key = `${type}|${familyKey(p.name)}`;
  if (!families.has(key)) families.set(key, { type, members: [] });
  families.get(key).members.push(p);
}

const specValue = (desc, label) => {
  const m = desc.match(new RegExp(`${label}:\\s*(.+)`, "i"));
  return m ? m[1].trim() : "";
};

const sorted = [...families.values()].sort(
  (a, b) => Math.max(...b.members.map((x) => x.price)) - Math.max(...a.members.map((x) => x.price))
);

const header = [
  "family_id", "product_family", "type", "manufacturer_or_brand", "listing_count", "product_ids",
  "example_listing_name", "applications_seen", "part_numbers_seen", "conditions", "price_range_usd",
  "contents_already_known", "contents_status", "information_needed",
  // Supplier answers (blank):
  "confirmed_package_contents", "ecu_pcm_included", "wiring_harness_included",
  "other_included_accessories_and_components", "required_components_sold_separately",
  "optional_upgrades", "vehicle_compatibility", "installation_requirements",
  "supplier_confirmation_status", "supplier_contact", "date_requested", "date_confirmed", "notes",
];
const rows = [header];

sorted.forEach((fam, i) => {
  const ms = fam.members.sort((a, b) => a.id - b.id);
  const prices = ms.map((m) => m.price);
  const mfr = ms.map((m) => specValue(m.desc, "Manufacturer")).find(Boolean) || ms[0].brand;
  const apps = [...new Set(ms.map((m) => specValue(m.desc, "Application")).filter(Boolean))].slice(0, 4).join(" | ");
  const pns = [...new Set(ms.map((m) => specValue(m.desc, "Part number")).filter(Boolean))].slice(0, 6).join(" | ");
  const known = [...new Set(ms.flatMap((m) => m.included))].slice(0, 8).join("; ");
  const statuses = [...new Set(ms.map((m) => m.contentsStatus).filter(Boolean))].join("/");
  rows.push([
    `F${String(i + 1).padStart(3, "0")}`,
    ms[0].name.split(" — ")[0],
    fam.type,
    mfr,
    ms.length,
    ms.map((m) => m.id).join(" "),
    ms[0].name,
    apps,
    pns,
    [...new Set(ms.map((m) => m.label))].join(" / "),
    `${Math.min(...prices)}-${Math.max(...prices)}`,
    known,
    statuses || "not started",
    INFO_NEEDED[fam.type],
    "", "", "", "", "", "", "", "",
    "Not requested", "", "", "", "",
  ]);
});

const out = path.join(ROOT, "docs", "supplier-confirmation-worksheet.csv");
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, rows.map((r) => r.map(csv).join(",")).join("\n") + "\n");
console.log(`${rows.length - 1} families, ${products.filter((p) => productType(p)).length} listings -> ${path.relative(ROOT, out)}`);
