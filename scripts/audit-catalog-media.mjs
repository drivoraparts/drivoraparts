/**
 * Audit catalog for missing images, placeholders, and duplicate media.
 * Usage: node scripts/audit-catalog-media.mjs
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();
const DEFAULT = "/product-media/avatars/default.svg";

function hashFile(ref) {
  if (!ref?.startsWith("/")) return null;
  const fp = path.join(root, "public", ref.slice(1));
  if (!fs.existsSync(fp)) return null;
  return crypto.createHash("sha256").update(fs.readFileSync(fp)).digest("hex");
}

function loadJsonProducts(file) {
  if (!fs.existsSync(file)) return [];
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function loadInlineProducts() {
  const pts = fs.readFileSync("lib/inventory/products.ts", "utf8");
  const products = [];
  for (const block of pts.split(/\n  \{\n    id: /).slice(1)) {
    const id = Number(block.match(/^(\d+),/)?.[1]);
    if (!id) continue;
    const thumbnail =
      block.match(/^\s*thumbnail:\s*"([^"]+)"/m)?.[1] ??
      block.match(/^\s*image:\s*"([^"]+)"/m)?.[1];
    const images = [...block.matchAll(/^\s*"(\/product-media\/[^"]+)"/gm)].map(
      (m) => m[1]
    );
    products.push({
      id,
      thumbnail,
      images: images.length ? images : thumbnail ? [thumbnail] : [],
    });
  }
  return products;
}

function loadExtensionProducts() {
  const dir = "lib/inventory";
  const skip = new Set([
    "products.ts",
    "truck-parts-products.ts",
    "ess-catalog-products.ts",
    "bimmerworld-wheels-products.ts",
  ]);
  const products = [];
  for (const name of fs.readdirSync(dir)) {
    if (!name.endsWith("-products.ts") || skip.has(name)) continue;
    const src = fs.readFileSync(path.join(dir, name), "utf8");
    for (const block of src.split(/\n  \{\n    id: /).slice(1)) {
      const id = Number(block.match(/^(\d+),/)?.[1]);
      if (!id) continue;
      const thumbnail =
        block.match(/^\s*thumbnail:\s*"([^"]+)"/m)?.[1] ??
        block.match(/^\s*image:\s*"([^"]+)"/m)?.[1];
      const images = [...block.matchAll(/^\s*"(\/product-media\/[^"]+)"/gm)].map(
        (m) => m[1]
      );
      products.push({
        id,
        name: block.match(/^\s*name:\s*"([^"]+)"/m)?.[1],
        thumbnail,
        images: images.length ? images : thumbnail ? [thumbnail] : [],
      });
    }
  }
  return products;
}

const overrides = loadJsonProducts(
  "lib/inventory/data/product-media-overrides.json"
);

const byId = new Map();
for (const p of [
  ...loadInlineProducts(),
  ...loadExtensionProducts(),
  ...loadJsonProducts("lib/inventory/data/bimmerworld-wheels-tires.json"),
  ...loadJsonProducts("lib/inventory/data/edmunds-truck-parts.json"),
  ...loadJsonProducts("lib/inventory/data/ess-catalog.json"),
]) {
  byId.set(p.id, { ...byId.get(p.id), ...p });
}

for (const [idStr, o] of Object.entries(overrides)) {
  const id = Number(idStr);
  const p = byId.get(id) ?? { id };
  if (o.thumbnail) p.thumbnail = o.thumbnail;
  if (o.images?.length) p.images = o.images;
  byId.set(id, p);
}

const products = [...byId.values()].sort((a, b) => a.id - b.id);

const noImage = [];
const defaultOnly = [];
const missingFile = [];
const emptyGallery = [];
const dupWithin = [];
const thumbHashMap = new Map();

for (const p of products) {
  const thumb = p.thumbnail || p.image;
  const images = p.images?.length ? p.images : thumb ? [thumb] : [];

  if (!thumb && images.length === 0) noImage.push(p);
  if (images.length === 0) emptyGallery.push(p);
  if (
    thumb === DEFAULT ||
    (images.length > 0 && images.every((i) => i === DEFAULT))
  ) {
    defaultOnly.push(p);
  }

  const refs = [...new Set([thumb, ...images].filter(Boolean))];
  for (const ref of refs) {
    if (ref.startsWith("http")) continue;
    if (ref === DEFAULT) continue;
    if (!hashFile(ref)) {
      missingFile.push({ id: p.id, name: p.name, ref });
    }
  }

  const seenInGallery = new Set();
  for (const ref of images) {
    const h = hashFile(ref) ?? ref;
    if (seenInGallery.has(h)) dupWithin.push({ id: p.id, name: p.name, ref });
    seenInGallery.add(h);
  }

  const thumbHash = hashFile(thumb) ?? (thumb?.startsWith("http") ? thumb : null);
  if (thumbHash) {
    if (!thumbHashMap.has(thumbHash)) thumbHashMap.set(thumbHash, []);
    thumbHashMap.get(thumbHash).push(p.id);
  }
}

const crossProductDupes = [...thumbHashMap.entries()]
  .map(([hash, ids]) => ({ hash, ids: [...new Set(ids)] }))
  .filter((g) => g.ids.length > 1)
  .sort((a, b) => b.ids.length - a.ids.length);

console.log(`Total products: ${products.length}`);
console.log(`No image at all: ${noImage.length}`);
console.log(`Default placeholder only: ${defaultOnly.length}`);
console.log(`Missing local image files: ${missingFile.length}`);
console.log(`Empty galleries: ${emptyGallery.length}`);
console.log(`Duplicate images within product gallery: ${dupWithin.length}`);
console.log(
  `Cross-product identical thumbnails: ${crossProductDupes.length} groups`
);

if (defaultOnly.length) {
  console.log("\n--- Placeholder-only products ---");
  for (const p of defaultOnly) {
    console.log(`  #${p.id} ${p.name ?? "(unnamed)"}`);
  }
}

if (missingFile.length) {
  console.log("\n--- Missing files (first 20) ---");
  for (const m of missingFile.slice(0, 20)) {
    console.log(`  #${m.id} ${m.ref}`);
  }
}

if (dupWithin.length) {
  console.log("\n--- Within-gallery duplicates (first 20) ---");
  for (const d of dupWithin.slice(0, 20)) {
    console.log(`  #${d.id} ${d.ref}`);
  }
}

if (crossProductDupes.length) {
  console.log("\n--- Shared thumbnails across products (first 15) ---");
  for (const g of crossProductDupes.slice(0, 15)) {
    console.log(`  ${g.ids.length} products: ${g.ids.join(", ")}`);
  }
}

const issues =
  noImage.length +
  defaultOnly.length +
  missingFile.length +
  emptyGallery.length +
  dupWithin.length;

if (issues === 0) {
  console.log("\nOK: No empty listings or broken local image paths detected.");
} else {
  console.log(`\nIssues found: ${issues} (see above)`);
  process.exitCode = 1;
}

if (crossProductDupes.length) {
  console.log(
    `\nNote: ${crossProductDupes.length} thumbnail groups are shared across products (often same SKU photo reused intentionally).`
  );
}
