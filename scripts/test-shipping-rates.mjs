/**
 * Regression check for US-only shipping: the published US rates, the
 * shipping labels, the US-address rule checkout enforces, and the Google
 * Merchant feed / JSON-LD that carry them.
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
  US_PARCEL_RATE_TABLE, FREIGHT_RATE_TABLES, SHIPPING_DESTINATIONS,
  validateRateTable, quoteShippingWith, describeQuote, shippingDestinationFor,
  labelFromFreightNotes, classifyProductShipping, classifyShipping, SHIPPING_LABELS, checkoutCountryError,
} from "@/lib/shipping/rates";
import { usShippingAddressError, OUTSIDE_US_MESSAGE, normalizeUsState, isValidUsZip } from "@/lib/shipping/us-address";
import { buildGoogleMerchantFeedRows, renderGoogleMerchantTsv } from "@/lib/feeds/google-merchant";
import { productOfferShippingDetails, productOfferReturnPolicy } from "@/lib/seo/merchant-policies";
import { getAllProducts } from "@/lib/inventory";

const results: Record<string, unknown> = {};
let tableError: string | null = null;
try { validateRateTable(US_PARCEL_RATE_TABLE); } catch (e) { tableError = "US: " + String(e); }
results.tableError = tableError;
let freightTableError: string | null = null;
for (const [dest, tables] of Object.entries(FREIGHT_RATE_TABLES) as any) {
  for (const label of ["multibox", "freight"]) {
    try { validateRateTable(tables[label]); } catch (e) { freightTableError = dest + " " + label + ": " + String(e); }
  }
}
results.freightTableError = freightTableError;
results.destinationsList = SHIPPING_DESTINATIONS;
results.freightFlat = Object.fromEntries(Object.entries(FREIGHT_RATE_TABLES).map(([d, t]: any) => [d, [t.multibox, t.freight].map((x: any) => x.map((b: any) => b.feeCents + ":" + b.minCents + "-" + b.maxCents).join("|"))]));
results.usTableTop = US_PARCEL_RATE_TABLE[US_PARCEL_RATE_TABLE.length - 1].maxCents;

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
  usPadded: view(one(40, "  United States ")),
  usDot: view(one(40, "U.S")),
  usDotA: view(one(40, "U.S.A")),
  usDots: view(one(40, "U.S.A.")),
  usSpaced: view(one(40, "u s a")),
  usThe: view(one(40, "The United States")),
  usParen: view(one(40, "United States (USA)")),
  usComma: view(one(40, "USA,")),
  noCountry: view(one(500, "")),
  nullCountry: view(one(40, null)),
  spacesCountry: view(one(40, "   ")),
  // Every other destination is outside the service area: never priced.
  canada: view(one(500, "Canada")),
  canadaFreight: view(q([{ productId: 3, quantity: 1, price: 100 }], "Canada")),
  uk: view(one(500, "United Kingdom")),
  ukShort: view(one(40, "UK")),
  england: view(one(40, "England")),
  australia: view(one(40, "Australia")),
  germany: view(one(100, "Germany")),
  france: view(one(100, "France")),
  southAfrica: view(one(100, "South Africa")),
  nigeria: view(one(100, "Nigeria")),
  japan: view(one(100, "Japan")),
  mexico: view(one(100, "Mexico")),
  newZealand: view(one(100, "New Zealand")),
  puertoRico: view(one(100, "Puerto Rico")),
  usTypo: view(one(40, "United State")),
  // Alaska and Hawaii: served, but always quoted by hand.
  akParcel: view(quoteShippingWith([{ productId: 1, quantity: 1, price: 500 }], "United States", classify as any, "AK")),
  hiFreight: view(quoteShippingWith([{ productId: 3, quantity: 1, price: 100 }], "USA", classify as any, "Hawaii")),
  caState: view(quoteShippingWith([{ productId: 1, quantity: 1, price: 500 }], "United States", classify as any, "CA")),
  dcState: view(quoteShippingWith([{ productId: 1, quantity: 1, price: 500 }], "United States", classify as any, "DC")),
};
results.akDescribe = describeQuote(quoteShippingWith([{ productId: 1, quantity: 1, price: 500 }], "United States", classify as any, "AK"));

const addr = (country: any, state: any, zip: any) => usShippingAddressError({ country, state, zip });
results.address = {
  usOk: addr("United States", "CA", "90210"),
  usZip4: addr("USA", "New York", "10001-1234"),
  usDc: addr("United States", "DC", "20001"),
  canada: addr("Canada", "ON", "M5V 2T6"),
  uk: addr("United Kingdom", "", "SW1A 1AA"),
  australia: addr("Australia", "NSW", "2000"),
  germany: addr("Germany", "", "10115"),
  southAfrica: addr("South Africa", "", "2000"),
  mexicoUsZip: addr("Mexico", "CA", "90210"),
  noCountry: addr("", "CA", "90210"),
  noState: addr("United States", "", "90210"),
  badState: addr("United States", "ZZ", "90210"),
  territory: addr("United States", "PR", "00901"),
  military: addr("United States", "AE", "09001"),
  badZip: addr("United States", "CA", "9021"),
  ukPostcodeAsUs: addr("United States", "CA", "SW1A 1AA"),
};
results.outsideMessage = OUTSIDE_US_MESSAGE;
results.stateNorm = { ca: normalizeUsState("ca"), name: normalizeUsState("north carolina"), bad: normalizeUsState("Ontario") };
results.zip = { five: isValidUsZip("02903"), plus4: isValidUsZip("02903-1234"), short: isValidUsZip("2903"), alpha: isValidUsZip("M5V2T6") };

results.countryError = { empty: checkoutCountryError(""), nul: checkoutCountryError(null), spaces: checkoutCountryError("  "), germany: checkoutCountryError("Germany"), us: checkoutCountryError("United States") };
results.describe = {
  us0: describeQuote(one(500)),
  us100: describeQuote(one(1500)),
  freight: describeQuote(q([{ productId: 3, quantity: 1, price: 100 }])),
  canada: describeQuote(one(500, "Canada")),
  none: describeQuote(one(500, "")),
};
results.destinations = {
  us: shippingDestinationFor("United States of America"),
  gb: shippingDestinationFor("Great Britain") ?? null,
  au: shippingDestinationFor(" Australia ") ?? null,
};

results.notes = {
  parcelCourier: labelFromFreightNotes("Ships via standard insured parcel/courier — no special freight handling required."),
  parcel: labelFromFreightNotes("Ships as a parcel."),
  multibox: labelFromFreightNotes("Ships in multiple insured boxes via ground courier; larger kits may be palletized."),
  oversized: labelFromFreightNotes("Ships by freight (oversized)."),
  pallet: labelFromFreightNotes("Ships as palletized heavy freight. A commercial address is recommended."),
  bulky: labelFromFreightNotes("Bulky item. Ships by freight."),
  ltl: labelFromFreightNotes("Freight / LTL."),
  none: labelFromFreightNotes(""),
};

results.nameRule = {
  truckBedAftermarket: classifyShipping({ category: "aftermarket", name: "Toyota Tacoma Truck Bed" }),
  truckBedMat: classifyShipping({ category: "interior", name: "Truck Bed Mat for Tundra" }),
  completeGearbox: classifyShipping({ category: "aftermarket", name: "Toyota Complete Gearbox" }),
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
const all = (d: any) => (Array.isArray(d) ? d : [d]);
const country = (d: any, code: string) => all(d).find((x: any) => x.shippingDestination.addressCountry === code);
const us = (d: any) => country(d, "US");
const parcel500 = productOfferShippingDetails({ ...base, freightNotes: "Ships as a parcel." }, 500);
results.jsonld = {
  countries: all(parcel500).map((x: any) => x.shippingDestination.addressCountry),
  returnCountries: all(productOfferReturnPolicy()).map((x: any) => x.applicableCountry),
  parcel500: us(parcel500)?.shippingRate?.value ?? null,
  parcel1500: us(productOfferShippingDetails({ ...base, freightNotes: "Ships as a parcel." }, 1500))?.shippingRate?.value ?? null,
  freight500: us(productOfferShippingDetails({ ...base, freightNotes: "Ships by freight (oversized)." }, 500))?.shippingRate?.value ?? null,
  freightLabel: us(productOfferShippingDetails({ ...base, freightNotes: "Ships by freight (oversized)." }, 500))?.shippingLabel ?? null,
  transit: us(parcel500)?.deliveryTime?.transitTime ?? null,
  regions: us(parcel500)?.shippingDestination?.addressRegion ?? null,
  handling: us(parcel500)?.deliveryTime?.handlingTime ?? null,
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

const OUT = "outside_service_area";
const expectCases = {
  empty: "empty_cart",
  p0_01: 0, p999_99: 0, p1000: 100, p1999_99: 100, p2000: 150, p4999_99: 150, p5000: 250,
  p54999_99: 700, p55000: 750, p59999_99: 750, p60000: 800, p70000: 900, p74999_99: 900,
  p75000: "above_rate_table",
  twoAt600: 100, qty2At600: 100,
  mixedParcelFreight: 199, multibox: 199, unknownProduct: 199,
  usa: 0, us: 0, usPadded: 0, usDot: 0, usDotA: 0, usDots: 0, usSpaced: 0, usThe: 0, usParen: 0, usComma: 0,
  noCountry: "destination_unknown", nullCountry: "destination_unknown", spacesCountry: "destination_unknown",
  canada: OUT, canadaFreight: OUT, uk: OUT, ukShort: OUT, england: OUT, australia: OUT, germany: OUT,
  france: OUT, southAfrica: OUT, nigeria: OUT, japan: OUT, mexico: OUT, newZealand: OUT, puertoRico: OUT,
  usTypo: OUT,
  akParcel: "quoted_state", hiFreight: "quoted_state", caState: 0, dcState: 0,
};
const expectDescribe = {
  us0: "Free standard US shipping",
  us100: "$100.00 standard US shipping",
  freight: "$199.00 freight shipping to the United States",
  canada: "We ship only within the United States",
  none: "Enter your US address to see shipping",
};
const expectNotes = {
  parcelCourier: "parcel", parcel: "parcel", multibox: "multibox", oversized: "freight",
  pallet: "freight", bulky: "freight", ltl: "freight",
};

const problems = [];

// US-address rule
const a = out.address;
for (const k of ["usOk", "usZip4", "usDc"]) if (a[k] !== null) problems.push(`US address ${k} refused: ${a[k]}`);
for (const k of ["canada", "uk", "australia", "germany", "southAfrica", "mexicoUsZip"])
  if (a[k] !== out.outsideMessage) problems.push(`international address ${k} not refused as outside the US: ${JSON.stringify(a[k])}`);
if (!/territories/.test(a.territory ?? "") || !/APO/.test(a.military ?? "")) problems.push(`territory/military not explained: ${a.territory} | ${a.military}`);
for (const k of ["noCountry", "noState", "badState", "territory", "military", "badZip", "ukPostcodeAsUs"])
  if (!a[k]) problems.push(`incomplete/invalid address ${k} was accepted`);
if (out.stateNorm.ca !== "CA" || out.stateNorm.name !== "NC" || out.stateNorm.bad !== null) problems.push(`state normalisation wrong: ${JSON.stringify(out.stateNorm)}`);
if (!out.zip.five || !out.zip.plus4 || out.zip.short || out.zip.alpha) problems.push(`ZIP validation wrong: ${JSON.stringify(out.zip)}`);
if (!out.countryError.empty || !out.countryError.nul || !out.countryError.spaces || out.countryError.germany !== out.outsideMessage || out.countryError.us !== null)
  problems.push(`checkoutCountryError wrong: ${JSON.stringify(out.countryError)}`);

// The server must enforce it, not only the page.
{
  const route = fs.readFileSync(path.join(ROOT, "app/api/checkout/route.ts"), "utf8");
  const service = fs.readFileSync(path.join(ROOT, "lib/checkout/service.ts"), "utf8");
  const page = fs.readFileSync(path.join(ROOT, "app/(storefront)/checkout/page.tsx"), "utf8");
  if (!route.includes("usShippingAddressError(customer)")) problems.push("/api/checkout no longer refuses non-US addresses");
  if (!service.includes("usShippingAddressError(input)")) problems.push("processCheckout no longer refuses non-US addresses");
  if (!page.includes("usShippingAddressError(")) problems.push("the checkout page no longer checks the US address before submitting");
  if (/<datalist id="checkout-country-options">/.test(page)) problems.push("the checkout page offers a list of countries again");
}

if (JSON.stringify(out.destinationsList) !== JSON.stringify(["US"])) problems.push(`shipping destinations are not US-only: ${JSON.stringify(out.destinationsList)}`);
if (out.destinations.us !== "US" || out.destinations.gb !== null || out.destinations.au !== null)
  problems.push(`destination matching wrong: ${JSON.stringify(out.destinations)}`);
if (out.tableError) problems.push(`US rate table invalid: ${out.tableError}`);
if (out.freightTableError) problems.push(`freight rate table invalid: ${out.freightTableError}`);
{
  const want = "19900:0-7499999";
  if (JSON.stringify(out.freightFlat.US) !== JSON.stringify([want, want]))
    problems.push(`US freight table: expected a flat $199 to $74,999.99, got ${JSON.stringify(out.freightFlat.US)}`);
}
if (out.usTableTop !== 7499999) problems.push("the US rate table top is not $74,999.99");
for (const [k, v] of Object.entries(expectCases)) {
  if (out.cases[k] !== v) problems.push(`quote ${k}: expected ${JSON.stringify(v)}, got ${JSON.stringify(out.cases[k])}`);
}
for (const [k, v] of Object.entries(expectDescribe)) {
  if (out.describe[k] !== v) problems.push(`describe ${k}: expected ${JSON.stringify(v)}, got ${JSON.stringify(out.describe[k])}`);
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
if (JSON.stringify(out.jsonld.countries) !== JSON.stringify(["US"])) problems.push(`JSON-LD declares shipping to ${JSON.stringify(out.jsonld.countries)}, expected only US`);
if (JSON.stringify(out.jsonld.returnCountries) !== JSON.stringify(["US"])) problems.push(`JSON-LD return policy countries ${JSON.stringify(out.jsonld.returnCountries)}, expected only US`);
if (out.jsonld.parcel500 !== "0.00") problems.push(`JSON-LD parcel $500 US rate: expected 0.00, got ${out.jsonld.parcel500}`);
if (out.jsonld.parcel1500 !== "100.00") problems.push(`JSON-LD parcel $1,500 US rate: expected 100.00, got ${out.jsonld.parcel1500}`);
if (out.jsonld.freight500 !== "199.00") problems.push(`JSON-LD US freight rate: expected 199.00, got ${out.jsonld.freight500}`);
if (out.jsonld.freightLabel !== "freight") problems.push("JSON-LD freight item has the wrong shippingLabel");
if (!/Alaska and Hawaii/.test(out.akDescribe ?? "")) problems.push(`AK quote text wrong: ${out.akDescribe}`);
{
  const r = out.jsonld.regions ?? [];
  if (!Array.isArray(r) || r.length !== 49 || r.includes("AK") || r.includes("HI") || !r.includes("DC") || !r.includes("CA"))
    problems.push(`JSON-LD US regions should be the 48 contiguous states + DC: ${JSON.stringify(r)}`);
}
{
  const route = fs.readFileSync(path.join(ROOT, "app/api/checkout/route.ts"), "utf8");
  if (!/customer\.country,\s*customer\.state/.test(route)) problems.push("/api/checkout no longer passes the state to the shipping quote (AK/HI would be priced from the table)");
}
if (out.jsonld.transit?.minValue !== 5 || out.jsonld.transit?.maxValue !== 15) problems.push(`US transit is not 5-15: ${JSON.stringify(out.jsonld.transit)}`);
if (out.jsonld.handling?.minValue !== 1 || out.jsonld.handling?.maxValue !== 5) problems.push(`US handling is not 1-5: ${JSON.stringify(out.jsonld.handling)}`);

if (problems.length) {
  console.error(problems.map((p) => `  [shipping] ${p}`).join("\n"));
  process.exit(1);
}
console.log(
  `Shipping rates check passed: ${Object.keys(expectCases).length} quote cases, ` +
    `${Object.keys(out.address).length} address cases, ` +
    `${out.catalog.total} products classified ${JSON.stringify(out.catalog.counts)}, ` +
    `${out.feed.rows} Google feed rows ${JSON.stringify(out.feed.labelCounts)}.`
);
