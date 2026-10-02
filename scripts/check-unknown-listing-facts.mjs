/**
 * Regression check: generated ad / social copy must never print "undefined" or
 * "null" for a listing whose location or condition is intentionally unknown
 * (listings held pending business confirmation), and must keep the existing
 * wording for a listing that does record them.
 *
 * Database-backed inputs (analytics, product signals) are stubbed, so this runs
 * in CI with no credentials and touches no data.
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "unknown-facts-"));
const entry = path.join(tmp, "entry.ts");
const bundle = path.join(tmp, "entry.mjs");
const stub = path.join(tmp, "stubs.ts");

fs.writeFileSync(
  stub,
  `export async function listAnalyticsEvents() { return []; }
export async function collectProductSignals() { return []; }
export async function detectViralProducts() { return { products: [] }; }
export function estimateUnitCost(n: number) { return n; }
export function minAllowedPrice(n: number) { return n; }
`
);
fs.writeFileSync(
  entry,
  `import { getAllProducts, getProductById } from "@/lib/inventory";
import { generateAdPack } from "@/lib/ads/generator";
import { generateAutopilotAdsForProduct } from "@/lib/ads/autopilot";
import { generateSocialContentForProduct } from "@/lib/content/social";
const all = getAllProducts();
const unknown = all.find((p) => p.id >= 1945 && p.id <= 1986 && !p.location);
const known = all.find((p) => p.location && p.condition);
async function texts(id: number) {
  return JSON.stringify([
    await generateAdPack(id),
    await generateAutopilotAdsForProduct(id),
    await generateSocialContentForProduct(id),
  ]);
}
process.stdout.write(JSON.stringify({
  unknownId: unknown?.id ?? null,
  unknownText: unknown ? await texts(unknown.id) : "",
  knownId: known?.id ?? null,
  knownLocation: known?.location ?? "",
  knownText: known ? await texts(known.id) : "",
}));
`
);

const { build } = await import("esbuild");
const stubPlugin = {
  name: "stub-db",
  setup(b) {
    b.onResolve({ filter: /^@\/lib\/db\/analytics$|^@\/lib\/ai\/product-metrics$|^@\/lib\/ai\/viral-detector$/ }, () => ({ path: stub }));
  },
};
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
  tsconfigRaw: "{}",
  plugins: [stubPlugin],
});
const out = JSON.parse(
  execFileSync(process.execPath, [bundle], { cwd: ROOT, maxBuffer: 64 * 1024 * 1024, encoding: "utf8" })
);
fs.rmSync(tmp, { recursive: true, force: true });

/*
 * Only location/condition leaks are in scope: a literal "undefined"/"null"
 * where one of those facts belongs. Other generated fields (e.g. rating) are
 * not covered by this check.
 */
const LEAK =
  /(?:from|Location:|Condition:|In-stock)\s*(?:undefined|null)\b|·\s*(?:undefined|null)\b(?![★+])|\b(?:undefined|null)(?: condition| auto parts| ·)/i;
const problems = [];
if (out.unknownId == null) problems.push("no location-less listing found to test (expected a held listing in 1945-1986)");
if (out.knownId == null) problems.push("no listing with a location and condition found to test");
if (LEAK.test(out.unknownText)) {
  problems.push(`generated copy for #${out.unknownId} (no location/condition) contains "undefined" or "null"`);
}
if (/ships from|fast shipping from|Location:|fulfillment from/i.test(out.unknownText)) {
  problems.push(`generated copy for #${out.unknownId} still mentions a location it does not have`);
}
if (!out.knownText.includes(out.knownLocation)) {
  problems.push(`generated copy for #${out.knownId} lost its known location "${out.knownLocation}"`);
}
if (LEAK.test(out.knownText)) {
  problems.push(`generated copy for #${out.knownId} contains "undefined" or "null"`);
}

if (problems.length) {
  console.error(problems.map((p) => `  [unknown-facts] ${p}`).join("\n"));
  process.exit(1);
}
console.log(`Unknown-facts check passed (location-less #${out.unknownId}, known-location #${out.knownId}).`);
