/**
 * Toyota catalog audit.
 *
 *   node scripts/audit-toyota-catalog.mjs           -- report only
 *   node scripts/audit-toyota-catalog.mjs --write   -- also rewrite the outputs
 *
 * Sorts every listing in the catalog into three groups:
 *
 *   A  Toyota  -- the listing's own data names a Toyota (or Lexus, Toyota's
 *                 luxury marque) vehicle, Toyota engine code, or a Toyota
 *                 vehicle platform, and names no other manufacturer.
 *   B  Other   -- the listing names another manufacturer or platform, or its
 *                 structured fitment lists only other makes.
 *   C  Review  -- compatibility cannot be confirmed from the listing: no
 *                 vehicle stated, universal fitment, Toyota mentioned only in
 *                 the description, or Toyota named alongside another make.
 *
 * Nothing is inferred beyond what the listing states. A part that might fit a
 * Toyota but does not say so is C, never A.
 *
 * Only group A is publicly listed. B and C stay in the catalog -- product IDs,
 * orders and the admin are untouched -- and are hidden from the storefront by
 * lib/inventory/toyota-visibility.ts, which reads the visible list written
 * here. A listing added later is hidden until this script is re-run, so a new
 * import can never appear on the storefront unclassified.
 *
 * Outputs (with --write):
 *   lib/inventory/data/toyota-catalog.json  -- visible IDs, used at runtime
 *   docs/toyota-catalog-audit.csv           -- every listing, group and reason
 *
 * "Toyota Genuine Part" is deliberately NOT decided here. A title or brand
 * field saying "Toyota Genuine" is a supplier's claim, not a verification.
 * Listings that carry such a claim, or a Toyota-format part number, are listed
 * as candidates for the reviewed list in lib/inventory/data/toyota-genuine.json.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const WRITE = process.argv.includes("--write");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "drivora-toyota-"));
const entry = path.join(tmp, "entry.ts");
const bundle = path.join(tmp, "entry.mjs");

// The full source catalog, not the deployed snapshot: this script decides
// what is public (and so what scripts/build-catalog-snapshot.mjs deploys).
fs.writeFileSync(
  entry,
  `import { rawProductCatalog } from "@/lib/inventory/full-catalog";
import { finalizeCatalog } from "@/lib/inventory/finalize";
const products = finalizeCatalog(rawProductCatalog);
import { CHECKOUT_TEST_PRODUCT_ID } from "@/lib/inventory/pricing";
import { resolveProductCondition } from "@/lib/inventory/condition";
process.stdout.write(JSON.stringify({
  checkoutTestId: CHECKOUT_TEST_PRODUCT_ID,
  products: products.map((p) => ({
    id: p.id, name: p.name, category: p.category, brand: p.brand,
    platform: p.platform ?? "", fitment: p.fitment ?? "", fitmentYears: p.fitmentYears ?? "",
    fitmentMakes: [...new Set((p.fitmentApplications ?? []).map((a) => a.make))],
    universalFitment: p.universalFitment === true,
    partNumber: p.partNumber ?? "", stock: p.stock !== false, price: p.price,
    condition: resolveProductCondition(p),
    description: p.description ?? "",
  })),
}));
`
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
const raw = execFileSync(process.execPath, ["--max-old-space-size=4096", bundle], {
  cwd: ROOT,
  maxBuffer: 256 * 1024 * 1024,
  encoding: "utf8",
});
fs.rmSync(tmp, { recursive: true, force: true });
const { products, checkoutTestId } = JSON.parse(raw);

/* --------------------------------------------------------------------------
   Rules
-------------------------------------------------------------------------- */

const TOYOTA_WORD = /\b(?:toyota|lexus)\b/i;

const TOYOTA_MODEL =
  /\b(?:tacoma|tundra|4[\s-]?runner|land\s?cruiser|landcruiser|rav[\s-]?4|highlander|camry|corolla|prius|sequoia|sienna|gr\s?supra|supra|gr\s?86|fj\s?cruiser|hilux|prado|celica|mr2|t100|previa|venza|avalon|yaris|c-hr|tercel|cressida|hiace|chaser|soarer|aristo|altezza)\b/i;

// Toyota engine and transmission family codes.
const TOYOTA_DRIVETRAIN =
  /\b(?:1jz(?:-gte?)?|2jz(?:-gte?)?|1uz(?:-fe)?|2uz(?:-fe)?|3uz(?:-fe)?|1gr(?:-fe)?|2gr(?:-fe)?|3vz(?:-fe)?|5vz(?:-fe)?|(?<![\w-])22re?|3rz(?:-fe)?|2tr(?:-fe)?|1kz(?:-te)?|1hz|1hd(?:-ft?e?)?|1fz(?:-fe)?|3s-?gte?|4a-?ge|2az(?:-fe)?|1ur(?:-fe)?|3ur(?:-fe)?|1vd(?:-ftv)?|1gd(?:-ftv)?|1kd(?:-ftv)?|g16e(?:-gts)?|a340[efh]?|a343f|a750[ef]|a760[ef]|ab60f|r150f?|r154|v160|w58)\b/i;

// Another manufacturer, or a platform, engine or model belonging to one.
// Lexus is excluded on purpose: it is Toyota's own marque.
const OTHER_MAKE =
  /\b(?:chevrolet|chevy|gmc|gm|ford|dodge|ram|jeep|chrysler|mopar|nissan|datsun|honda|acura|mazda|subaru|mitsubishi|bmw|mercedes(?:-benz)?|audi|volkswagen|vw|porsche|hyundai|kia|infiniti|scion|land\s?rover|range\s?rover|isuzu|holden|pontiac|buick|cadillac|oldsmobile|lincoln|mercury|volvo|saab|mini|fiat|suzuki|hummer|ls[1-9]|lsx|lt[1-5]|coyote|hemi|duramax|cummins|power\s?stroke|powerstroke|silverado|sierra|f-?150|f-?250|f-?350|super\s?duty|wrangler|gladiator|camaro|corvette|mustang|patrol|navara|frontier|ranger|bronco|colorado|canyon|tahoe|suburban|yukon|escalade|wrx|sti|lancer|skyline|gt-?r|civic|integra|s2000|miata|mx-?5|rx-?7|e30|e36|e46|e90|e92|f80|g80|n54|n55|s55|b58|r35|k20|k24|rb2[56]|sr20|vq3[57]|vr38|ej2[05]|fa2[04]|z4|g29)\b/i;

// Two Toyotas are co-developed twins of another maker's car: the A90 GR
// Supra shares its platform and B58 engine with the G29 BMW Z4, and the GR86
// is built alongside the Subaru BRZ. A listing that names the Toyota and its
// twin is a Toyota fitment, so the twin's names do not count as "another
// manufacturer" when the Toyota is named. "Rola Titan" is a tray product
// line, not the Nissan, which is why Titan is not in OTHER_MAKE.
const TWINS = [
  { toyota: /\b(?:gr\s?)?supra\b/i, twin: /\b(?:bmw\s+)?(?:z4|g29|b58)\b/gi },
  { toyota: /\b(?:toyota\s+)?(?:gr\s?86|86)\b/i, twin: /\b(?:subaru\s+)?(?:brz|fa2[04](?:d)?)\b/gi },
];

function vehicleText(p) {
  return `${p.name} ${p.platform} ${p.fitment} ${p.fitmentYears}`;
}

function classify(p) {
  const text = vehicleText(p);
  const names = {
    toyota: TOYOTA_WORD.test(text) || TOYOTA_MODEL.test(text) || TOYOTA_DRIVETRAIN.test(text),
    other: OTHER_MAKE.test(text),
  };
  if (names.other && names.toyota) {
    let withoutTwins = text;
    for (const { toyota, twin } of TWINS) {
      if (toyota.test(text)) withoutTwins = withoutTwins.replace(twin, "");
    }
    names.other = OTHER_MAKE.test(withoutTwins);
  }
  const structuredMakes = p.fitmentMakes;
  const structuredToyota = structuredMakes.some((m) => /^(?:toyota|lexus)$/i.test(m));

  if (structuredMakes.length && !structuredToyota) {
    return ["B", `structured fitment lists ${structuredMakes.join(", ")}`];
  }
  if (structuredToyota && !names.other) return ["A", "structured fitment lists Toyota"];
  if (names.toyota && !names.other) return ["A", "listing names a Toyota vehicle, engine or platform"];
  if (names.toyota && names.other) return ["C", "listing names Toyota and another manufacturer"];
  if (names.other) return ["B", "listing names another manufacturer or platform"];
  if (TOYOTA_WORD.test(p.description) || TOYOTA_MODEL.test(p.description)) {
    return ["C", "Toyota mentioned only in the description"];
  }
  if (p.universalFitment) return ["C", "universal fitment -- no vehicle stated"];
  return ["C", "no vehicle stated"];
}

// Toyota service part numbers: 5 digits, dash, 5 alphanumerics (35000-0K130),
// or the SU003- prefix used for GR86 / BRZ parts.
const TOYOTA_PART_NUMBER = /\b(?:\d{5}-[0-9A-Z]{5}|SU\d{3}-\d{5})\b/;

/* --------------------------------------------------------------------------
   Classify
-------------------------------------------------------------------------- */

const rows = products
  .filter((p) => p.id !== checkoutTestId)
  .map((p) => {
    const [group, reason] = classify(p);
    const genuineClaim = /\b(?:toyota genuine|genuine toyota)\b/i.test(p.name) || p.brand === "toyota";
    const toyotaPartNumber = TOYOTA_PART_NUMBER.test(`${p.partNumber} ${p.name}`);
    return { ...p, group, reason, genuineCandidate: group === "A" && (genuineClaim || toyotaPartNumber) };
  });

const by = (g) => rows.filter((r) => r.group === g);
const A = by("A");
const B = by("B");
const C = by("C");

const genuineReviewed = JSON.parse(
  fs.readFileSync(path.join(ROOT, "lib/inventory/data/toyota-genuine.json"), "utf8")
);
const genuineIds = new Set(genuineReviewed.verified.map((v) => v.id));

const count = (list, key) =>
  Object.entries(
    list.reduce((acc, r) => ((acc[r[key]] = (acc[r[key]] || 0) + 1), acc), {})
  ).sort((a, b) => b[1] - a[1]);

console.log(`Total catalog listings:                 ${rows.length}`);
console.log(`A  Toyota-compatible (publicly listed): ${A.length}`);
console.log(`     verified Toyota Genuine Parts:     ${A.filter((r) => genuineIds.has(r.id)).length}`);
console.log(`     Genuine candidates (need review):  ${A.filter((r) => r.genuineCandidate && !genuineIds.has(r.id)).length}`);
console.log(`     aftermarket / other condition:     ${A.filter((r) => !genuineIds.has(r.id)).length}`);
console.log(`B  Non-Toyota (hidden):                 ${B.length}`);
console.log(`C  Unverified (hidden, review):         ${C.length}`);
console.log("\nA by condition:", Object.fromEntries(count(A, "condition")));
console.log("A by category: ", Object.fromEntries(count(A, "category")));
console.log("C by reason:   ", Object.fromEntries(count(C, "reason")));

if (WRITE) {
  const out = {
    _comment:
      "Generated by scripts/audit-toyota-catalog.mjs --write. Do not edit by hand: change the listing or the rules and re-run. Listings not in `visible` stay in the catalog but are hidden from the storefront.",
    generatedFrom: rows.length,
    visible: A.map((r) => r.id).sort((a, b) => a - b),
    review: C.map((r) => ({ id: r.id, reason: r.reason })).sort((a, b) => a.id - b.id),
    genuineCandidates: A.filter((r) => r.genuineCandidate && !genuineIds.has(r.id))
      .map((r) => r.id)
      .sort((a, b) => a - b),
  };
  fs.writeFileSync(
    path.join(ROOT, "lib/inventory/data/toyota-catalog.json"),
    JSON.stringify(out, null, 1) + "\n"
  );

  const csv = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const lines = [
    ["id", "group", "reason", "genuine_candidate", "category", "brand", "condition", "part_number", "in_stock", "price", "name"].join(","),
    ...rows
      .sort((a, b) => a.group.localeCompare(b.group) || a.id - b.id)
      .map((r) =>
        [r.id, r.group, r.reason, r.genuineCandidate ? "yes" : "", r.category, r.brand, r.condition, r.partNumber, r.stock ? "yes" : "no", r.price, r.name]
          .map(csv)
          .join(",")
      ),
  ];
  fs.writeFileSync(path.join(ROOT, "docs/toyota-catalog-audit.csv"), lines.join("\n") + "\n");
  console.log("\nWrote lib/inventory/data/toyota-catalog.json and docs/toyota-catalog-audit.csv");
}
