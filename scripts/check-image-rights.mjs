/**
 * Fails when a published listing has a photograph without verified
 * commercial-use permission (owner instruction 2026-11-23).
 *
 * Every image of every listing in the deployed snapshot must have a
 * VERIFIED_LICENSED or VERIFIED_AUTHORIZED entry in
 * lib/inventory/data/image-rights-registry.json, with evidence, and must be a
 * real file (no placeholder). Runs before every build (npm "prebuild") and in
 * audit:storefront-claims.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PUBLISHABLE, STATUSES, imagesOf, loadRegistry } from "./lib/image-rights.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const registry = loadRegistry(ROOT);
const snapshot = JSON.parse(fs.readFileSync(path.join(ROOT, "lib/inventory/data/catalog-snapshot.json"), "utf8"));
const pricing = fs.readFileSync(path.join(ROOT, "lib/inventory/pricing.ts"), "utf8");
const testId = Number((pricing.match(/CHECKOUT_TEST_PRODUCT_ID\s*=\s*(\d+)/) || [])[1]);

const problems = [];
for (const e of registry.images) {
  if (!STATUSES.includes(e.permissionStatus)) problems.push(`registry: ${e.productId} ${e.currentImageUrl}: unknown status ${e.permissionStatus}`);
  if (PUBLISHABLE.has(e.permissionStatus) && !(e.evidence || []).some((x) => x && (x.url || x.document) && x.quote)) {
    problems.push(`registry: ${e.productId} ${e.currentImageUrl}: ${e.permissionStatus} without licence or authorization evidence`);
  }
}
const byKey = new Map(registry.images.map((e) => [`${e.productId}|${e.currentImageUrl}`, e]));
let images = 0;
for (const p of snapshot.records) {
  if (p.id === testId) continue; // internal checkout test item, not listed in the storefront
  const urls = imagesOf(p);
  if (!urls.length) problems.push(`${p.id}: published with no photograph`);
  for (const u of urls) {
    images++;
    const e = byKey.get(`${p.id}|${u}`);
    if (!e) problems.push(`${p.id}: ${u} has no image-rights entry`);
    else if (!PUBLISHABLE.has(e.permissionStatus)) problems.push(`${p.id}: ${u} is ${e.permissionStatus}`);
    if (/\/placeholders\/|\/avatars\/default/.test(u)) problems.push(`${p.id}: ${u} is a placeholder`);
    else if (u.startsWith("/") && !fs.existsSync(path.join(ROOT, "public", u))) problems.push(`${p.id}: ${u} file missing`);
  }
}
const counts = registry.images.reduce((m, e) => ((m[e.permissionStatus] = (m[e.permissionStatus] || 0) + 1), m), {});
if (problems.length) {
  console.error(`Image-rights check failed (${problems.length}):`);
  for (const x of problems.slice(0, 50)) console.error("  " + x);
  process.exit(1);
}
console.log(`Image-rights check passed: ${snapshot.records.filter((p) => p.id !== testId).length} published listings, ${images} images, all verified. Registry: ${JSON.stringify(counts)}`);
