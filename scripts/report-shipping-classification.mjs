/**
 * Shipping-classification review report.
 *
 * Lists every listing whose shipping label (parcel / multibox / freight) was
 * INFERRED from its category rather than read from its own freight notes, plus
 * listings whose notes disagree with an obviously bulky name. Ranked for
 * review: engines and transmissions first, then truck beds, axles and
 * differentials, then wheels and suspension, then everything else.
 *
 * Read-only: changes no product, price, stock or availability.
 *   node scripts/report-shipping-classification.mjs
 * Writes docs/shipping-classification-review.csv and prints a summary.
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "ship-class-"));
const entry = path.join(tmp, "entry.ts");
const bundle = path.join(tmp, "entry.mjs");

fs.writeFileSync(
  entry,
  `import { getAllProducts } from "@/lib/inventory";
import { getProductCatalogMeta } from "@/lib/inventory/productEnhancements";
import { classifyProductShipping } from "@/lib/shipping/rates";
const rows = getAllProducts().map((p) => {
  const c = classifyProductShipping(p);
  const notes = String(p.freightNotes ?? getProductCatalogMeta(p)?.logistics?.freightNotes ?? "");
  return { id: p.id, name: p.name, category: p.category, price: p.price, label: c.label, source: c.source, notes };
});
process.stdout.write(JSON.stringify(rows));
`
);

const { build } = await import("esbuild");
await build({
  entryPoints: [entry], bundle: true, platform: "node", format: "esm", outfile: bundle,
  loader: { ".json": "json" }, alias: { "@": ROOT }, logLevel: "error", absWorkingDir: ROOT, tsconfigRaw: "{}",
});
const products = JSON.parse(execFileSync(process.execPath, [bundle], { cwd: ROOT, maxBuffer: 256 * 1024 * 1024, encoding: "utf8" }));
fs.rmSync(tmp, { recursive: true, force: true });

const has = (re, s) => re.test(s.toLowerCase());
const ENGINE = /\b(engine|long ?block|short ?block|crate motor|motor assembly|transmission|gearbox|transaxle|swap (kit|package|drivetrain)|drivetrain package)\b/;
const BED_AXLE = /\b(truck ?bed|tray|ute tray|axle|differential|diff housing|rear end|third member)\b/;
const WHEEL_SUSP = /\b(wheel|rim|tire|tyre|coil ?over|shock|strut|spring|leaf pack|lift kit|leveling kit|control arm|suspension kit|sway bar)\b/;
const BULKY = /\b(bumper|bull ?bar|nudge bar|grille guard|canopy|rack|roof platform|fuel tank|seat|door|hood|bonnet|fender|tailgate|radiator|intercooler kit|exhaust system|catback|cat-back|headers?|turbo kit|supercharger kit|body kit|hard ?top|winch)\b/;
const SMALL = /\b(pump|filter|sensor|gasket|seal|injector|hose|clamp|bolt|nut|cap|adapter|spacer|bracket|switch|relay|valve|belt|plug|wire|harness|bulb|lug|cover|knob|shirt|sticker|decal|bushing|mount|gauge|module|kit of|spring kit|pin)\b/;
// A part FOR an engine/transmission (a mount, a dipstick) is not a complete unit.
const COMPONENT_OF = /\b(mount|dipstick|cooler line|filter|pan gasket|solenoid|sensor|bushing|seal kit|rebuild kit|torque converter bolt|shifter|cable|bracket)\b/;

function priority(p) {
  const n = p.name;
  if (["engine", "transmission"].includes(p.category) || has(ENGINE, n)) return 1;
  if (has(BED_AXLE, n)) return 2;
  if (["wheels-tires", "suspension"].includes(p.category) || has(WHEEL_SUSP, n)) return 3;
  return 4;
}

function risk(p) {
  const n = p.name;
  const bulkyName = has(ENGINE, n) || has(BED_AXLE, n) || has(BULKY, n);
  if (p.source === "listing") {
    if (p.label === "parcel" && bulkyName && !has(COMPONENT_OF, n) && p.price >= 500)
      return ["possible false negative", "notes say parcel but the name reads as a bulky item"];
    return null;
  }
  // Inferred (category or name rule) from here on.
  if (p.label === "freight") {
    if (has(COMPONENT_OF, n) || p.price < 150)
      return ["possible false positive", "freight by category, but the name or price suggests a component that may ship as a parcel"];
    return ["unconfirmed", p.source === "name" ? "freight because the name is a whole freight unit (truck bed, complete engine/gearbox); no freight notes on the listing" : "freight by category; no freight notes on the listing"];
  }
  if (p.label === "multibox") {
    if (p.price < 150 || has(SMALL, n))
      return ["possible false positive", "multi-box by category, but the name or price suggests a single parcel"];
    return ["unconfirmed", "multi-box by category; no freight notes on the listing"];
  }
  // parcel by category
  if (bulkyName && !has(COMPONENT_OF, n))
    return ["possible false negative", "parcel by category or name, but the name reads as a bulky item"];
  if (p.price >= 2000)
    return ["possible false negative", "parcel by category, but the price suggests a large assembly"];
  return ["unconfirmed", "parcel by category; no freight notes on the listing"];
}

const out = [];
for (const p of products) {
  const r = risk(p);
  if (!r) continue;
  out.push({ ...p, priority: priority(p), risk: r[0], reason: r[1] });
}
const riskRank = { "possible false negative": 0, "possible false positive": 1, unconfirmed: 2 };
out.sort((a, b) => a.priority - b.priority || riskRank[a.risk] - riskRank[b.risk] || b.price - a.price);

const esc = (v) => {
  const s = String(v ?? "");
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const header = ["priority", "risk", "id", "name", "category", "price_usd", "current_label", "label_source", "reason", "freight_notes"];
const csv = [header.join(",")]
  .concat(out.map((r) => [r.priority, r.risk, r.id, r.name, r.category, r.price.toFixed(2), r.label, r.source, r.reason, r.notes].map(esc).join(",")))
  .join("\n") + "\n";
fs.mkdirSync(path.join(ROOT, "docs"), { recursive: true });
fs.writeFileSync(path.join(ROOT, "docs", "shipping-classification-review.csv"), csv);

const summary = {};
for (const r of out) {
  const k = `P${r.priority} ${r.risk}`;
  summary[k] = summary[k] ?? { count: 0, labels: {} };
  summary[k].count += 1;
  summary[k].labels[r.label] = (summary[k].labels[r.label] ?? 0) + 1;
}
console.log(`Review rows: ${out.length} of ${products.length} listings -> docs/shipping-classification-review.csv`);
for (const [k, v] of Object.entries(summary).sort()) console.log(`  ${k}: ${v.count} ${JSON.stringify(v.labels)}`);
const show = (pri, rk, n = 6) =>
  out.filter((r) => r.priority === pri && r.risk === rk).slice(0, n)
    .forEach((r) => console.log(`    #${r.id} $${r.price} [${r.label}] ${r.name.slice(0, 80)}`));
for (const pri of [1, 2, 3]) for (const rk of ["possible false negative", "possible false positive"]) {
  console.log(`  -- examples P${pri} ${rk}`); show(pri, rk);
}
