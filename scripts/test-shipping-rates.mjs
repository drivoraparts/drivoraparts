/**
 * Regression check for the published US shipping rates, the shipping labels
 * and the Google Merchant feed / JSON-LD that carry them.
 *
 * Runs against the real catalog plus synthetic carts; no database or network.
 *   node scripts/test-shipping-rates.mjs
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "shipping-rates-"));
const entry = path.join(tmp, "entry.ts");
const bundle = path.join(tmp, "entry.mjs");

fs.writeFileSync(
  entry,
  `import {
  US_PARCEL_RATE_TABLE, FREIGHT_RATE_TABLES, validateRateTable, quoteShippingWith,
  labelFromFreightNotes, classifyProductShipping, classifyShipping, SHIPPING_LABELS,
} from "@/lib/shipping/rates";
import { buildGoogleMerchantFeedRows, renderGoogleMerchantTsv } from "@/lib/feeds/google-merchant";
import { productOfferShippingDetails } from "@/lib/seo/merchant-policies";
import { getAllProducts } from "@/lib/inventory";

const results: Record<string, unknown> = {};
let tableError: string | null = null;
try { validateRateTable(US_PARCEL_RATE_TABLE); } catch (e) { tableError = String(e); }
results.tableError = tableError;
results.freightTablesUnset = FREIGHT_RATE_TABLES.multibox === null && FREIGHT_RATE_TABLES.freight === null;

const labels: Record<number, any> = { 1: "parcel", 2: "parcel", 3: "freight", 4: "multibox" };
const classify = (id: number) => (labels[id] ? { label: labels[id], source: "listing" } : null);
const q = (items: any[], country: string | null = "United States") => quoteShippingWith(items, country, classify as any);
const one = (price: number, country: string | null = "United States") => q([{ productId: 1, quantity: 1, price }], country);
const view = (r: any) => (r.status === "calculated" ? r.amount : r.reason);

results.cases = {
  empty: view(q([])),
  p0_01: view(one(0.01)),
  p999_99: view(one(999.99)),
  p1000: view(one(1000)),
  p1999_99: view(one(1999.99)),
  p2000: view(one(2000)),
  p4999_99: view(one(4999.99)),
  p5000: view(one(5000)),
  p54999_99: view(one(54999.99)),
  p55000: view(one(55000)),
  p59999_99: view(one(59999.99)),
  p60000: view(one(60000)),
  p70000: view(one(70000)),
  p74999_99: view(one(74999.99)),
  p75000: view(one(75000)),
  twoAt600: view(q([{ productId: 1, quantity: 1, price: 600 }, { productId: 2, quantity: 1, price: 600 }])),
  qty2At600: view(q([{ productId: 1, quantity: 2, price: 600 }])),
  mixedParcelFreight: view(q([{ productId: 1, quantity: 1, price: 100 }, { productId: 3, quantity: 1, price: 100 }])),
  multibox: view(q([{ productId: 4, quantity: 1, price: 100 }])),
  unknownProduct: view(q([{ productId: 999, quantity: 1, price: 100 }])),
  usa: view(one(500, "USA")),
  us: view(one(500, "us")),
  canada: view(one(500, "Canada")),
  noCountry: view(one(500, "")),
};

results.notes = {
  parcelCourier: labelFromFreightNotes("Ships via standard insured parcel/courier — no special freight handling required."),
  parcel: labelFromFreightNotes("Ships as a parcel."),
  multibox: labelFromFreightNotes("Ships in multiple insured boxes via ground courier; larger kits may be palletized."),
  oversized: labelFromFreightNotes("Ships by freight (oversized)."),
  pallet: labelFromFreightNotes("Ships as palletized heavy freight. A commercial address is recommended."),
  bulky: labelFromFreightNotes("Bulky item. Ships by freight."),
  ltl: labelFromFreightNotes("International freight / LTL."),
  none: labelFromFreightNotes(""),
};

results.nameRule = {
  truckBedAftermarket: classifyShipping({ category: "aftermarket", name: "1999–2006 Chevrolet Silverado Truck Bed" }),
  truckBedMat: classifyShipping({ category: "interior", name: "Truck Bed Mat for F-150" }),
  completeGearbox: classifyShipping({ category: "aftermarket", name: "Hino FD500 Complete Gearbox" }),
  notesWin: classifyShipping({ category: "aftermarket", name: "Truck Bed", freightNotes: "Ships as palletized heavy freight." }),
};

const products = getAllProducts();
const counts: Record<string, number> = {};
const bySource: Record<string, number> = {};
for (const p of products) {
  const c = classifyProductShipping(p);
  counts[c.label] = (counts[c.label] ?? 0) + 1;
  bySource[c.label + ":" + c.source] = (bySource[c.label + ":" + c.source] ?? 0) + 1;
}
results.catalog = { total: products.length, counts, bySource, maxPrice: Math.max(...products.map((p) => p.price)) };

const rows = buildGoogleMerchantFeedRows();
const byId = new Map(products.map((p) => [String(p.id), p]));
const tsv = renderGoogleMerchantTsv(rows);
const lines = tsv.trim().split("\\n");
const header = lines[0].split("\\t");
results.feed = {
  rows: rows.length,
  headerHasLabel: header.includes("shipping_label"),
  badColumnCount: lines.filter((l) => l.split("\\t").length !== header.length).length,
  badLabels: rows.filter((r) => !SHIPPING_LABELS.includes(r.shipping_label)).map((r) => r.id),
  mismatched: rows.filter((r) => classifyProductShipping(byId.get(r.id) as any).label !== r.shipping_label).map((r) => r.id),
  labelCounts: rows.reduce((acc: any, r) => ((acc[r.shipping_label] = (acc[r.shipping_label] ?? 0) + 1), acc), {}),
};

const base: any = { id: 99998, name: "Synthetic gauge", category: "electronics", brand: "x", price: 500, description: "x" };
const us = (d: any) => (Array.isArray(d) ? d : [d]).find((x: any) => x.shippingDestination.addressCountry === "US");
results.jsonld = {
  parcel500: us(productOfferShippingDetails({ ...base, freightNotes: "Ships as a parcel." }, 500))?.shippingRate?.value ?? null,
  parcel1500: us(productOfferShippingDetails({ ...base, freightNotes: "Ships as a parcel." }, 1500))?.shippingRate?.value ?? null,
  freight500: us(productOfferShippingDetails({ ...base, freightNotes: "Ships by freight (oversized)." }, 500))?.shippingRate ?? null,
  freightLabel: us(productOfferShippingDetails({ ...base, freightNotes: "Ships by freight (oversized)." }, 500))?.shippingLabel ?? null,
  nonUsHasRate: (productOfferShippingDetails({ ...base, freightNotes: "Ships as a parcel." }, 500) as any[]).some((d: any) => d.shippingDestination.addressCountry !== "US" && d.shippingRate),
};

process.stdout.write(JSON.stringify(results));
`
);

const { build } = await import("esbuild");
await build({
  entryPoints: [entry], bundle: true, platform: "node", format: "esm", outfile: bundle,
  loader: { ".json": "json" }, alias: { "@": ROOT }, logLevel: "error", absWorkingDir: ROOT, tsconfigRaw: "{}",
});
const out = JSON.parse(execFileSync(process.execPath, [bundle], { cwd: ROOT, maxBuffer: 256 * 1024 * 1024, encoding: "utf8" }));
fs.rmSync(tmp, { recursive: true, force: true });

const expectCases = {
  empty: "empty_cart",
  p0_01: 0, p999_99: 0, p1000: 100, p1999_99: 100, p2000: 150, p4999_99: 150, p5000: 250,
  p54999_99: 700, p55000: 750, p59999_99: 750, p60000: 800, p70000: 900, p74999_99: 900,
  p75000: "above_rate_table",
  twoAt600: 100, qty2At600: 100,
  mixedParcelFreight: "freight_rate_not_set", multibox: "freight_rate_not_set", unknownProduct: "freight_rate_not_set",
  usa: 0, us: 0, canada: "outside_us", noCountry: "destination_unknown",
};
const expectNotes = {
  parcelCourier: "parcel", parcel: "parcel", multibox: "multibox", oversized: "freight",
  pallet: "freight", bulky: "freight", ltl: "freight",
};

const problems = [];
if (out.tableError) problems.push(`US rate table invalid: ${out.tableError}`);
if (!out.freightTablesUnset) problems.push("a freight rate table is set -- update this test and the policy page deliberately");
for (const [k, v] of Object.entries(expectCases)) {
  if (out.cases[k] !== v) problems.push(`quote ${k}: expected ${JSON.stringify(v)}, got ${JSON.stringify(out.cases[k])}`);
}
for (const [k, v] of Object.entries(expectNotes)) {
  if (out.notes[k] !== v) problems.push(`notes ${k}: expected ${v}, got ${out.notes[k]}`);
}
if (out.nameRule.truckBedAftermarket.label !== "freight" || out.nameRule.truckBedAftermarket.source !== "name") problems.push("a truck bed filed under aftermarket is not freight");
if (out.nameRule.truckBedMat.label !== "parcel") problems.push("a truck bed MAT is classed as freight");
if (out.nameRule.completeGearbox.label !== "freight") problems.push("a complete gearbox is not freight");
if (out.nameRule.notesWin.source !== "listing") problems.push("listing freight notes no longer take priority");
if (out.notes.none !== undefined && out.notes.none !== null) problems.push("empty notes should give no label");
if (out.catalog.maxPrice > 74999.99) problems.push(`catalog has a product above the top bracket: $${out.catalog.maxPrice}`);
if (!out.feed.headerHasLabel) problems.push("Google feed header has no shipping_label");
if (out.feed.badColumnCount) problems.push(`${out.feed.badColumnCount} Google feed lines have the wrong column count`);
if (out.feed.badLabels.length) problems.push(`Google feed rows with unknown labels: ${out.feed.badLabels.slice(0, 10).join(", ")}`);
if (out.feed.mismatched.length) problems.push(`Google feed labels disagree with checkout classification: ${out.feed.mismatched.slice(0, 10).join(", ")}`);
if (out.jsonld.parcel500 !== "0.00") problems.push(`JSON-LD parcel $500 US rate: expected 0.00, got ${out.jsonld.parcel500}`);
if (out.jsonld.parcel1500 !== "100.00") problems.push(`JSON-LD parcel $1,500 US rate: expected 100.00, got ${out.jsonld.parcel1500}`);
if (out.jsonld.freight500 !== null) problems.push("JSON-LD states a rate for a freight item");
if (out.jsonld.freightLabel !== "freight") problems.push("JSON-LD freight item has the wrong shippingLabel");
if (out.jsonld.nonUsHasRate) problems.push("JSON-LD states a rate outside the US");

if (problems.length) {
  console.error(problems.map((p) => `  [shipping] ${p}`).join("\n"));
  process.exit(1);
}
console.log(
  `Shipping rates check passed: ${Object.keys(expectCases).length} quote cases, ` +
    `${out.catalog.total} products classified ${JSON.stringify(out.catalog.counts)} ` +
    `(by source ${JSON.stringify(out.catalog.bySource)}), ` +
    `${out.feed.rows} Google feed rows ${JSON.stringify(out.feed.labelCounts)}.`
);
