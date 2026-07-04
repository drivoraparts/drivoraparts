/**
 * Remove byte-identical slides from BimmerWorld wheels/tires catalog.
 * Rewrites JSON, overrides, and deletes duplicate files on disk.
 *
 * Usage: node scripts/clean-bimmerworld-galleries.mjs
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();
const BW_JSON = path.join(root, "lib/inventory/data/bimmerworld-wheels-tires.json");
const OVERRIDES_JSON = path.join(
  root,
  "lib/inventory/data/product-media-overrides.json"
);
const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif"]);

function fileHash(ref) {
  const fp = path.join(root, "public", ref.slice(1));
  if (!fs.existsSync(fp)) return null;
  return crypto.createHash("sha256").update(fs.readFileSync(fp)).digest("hex");
}

function folderFromRef(ref) {
  if (!ref?.startsWith("/product-media/wheels-tires/")) return null;
  return path.dirname(ref);
}

function listFolderImages(folderRef) {
  const dir = path.join(root, "public", folderRef.slice(1));
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((name) => IMAGE_EXT.has(path.extname(name).toLowerCase()))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .map((name) => `${folderRef}/${name}`.replace(/\\/g, "/"));
}

function dedupeRefsByHash(refs) {
  const kept = [];
  const seen = new Set();
  for (const ref of refs) {
    const hash = fileHash(ref);
    const key = hash ?? ref;
    if (seen.has(key)) continue;
    seen.add(key);
    kept.push(ref);
  }
  return kept;
}

function cleanFolder(folderRef) {
  const dir = path.join(root, "public", folderRef.slice(1));
  if (!fs.existsSync(dir)) return [];

  const unique = dedupeRefsByHash(listFolderImages(folderRef));
  const renumbered = [];

  unique.forEach((oldRef, index) => {
    const ext = path.extname(oldRef).toLowerCase() || ".jpg";
    const newName = `${index + 1}${ext}`;
    const newRef = `${folderRef}/${newName}`.replace(/\\/g, "/");
    const oldPath = path.join(root, "public", oldRef.slice(1));
    const newPath = path.join(root, "public", newRef.slice(1));

    if (oldPath !== newPath) {
      if (fs.existsSync(newPath) && oldPath !== newPath) {
        fs.unlinkSync(newPath);
      }
      fs.renameSync(oldPath, newPath);
    }
    renumbered.push(newRef);
  });

  for (const name of fs.readdirSync(dir)) {
    if (!IMAGE_EXT.has(path.extname(name).toLowerCase())) continue;
    const ref = `${folderRef}/${name}`.replace(/\\/g, "/");
    if (!renumbered.includes(ref)) {
      fs.unlinkSync(path.join(dir, name));
    }
  }

  return renumbered;
}

const products = JSON.parse(fs.readFileSync(BW_JSON, "utf8"));
const overrides = JSON.parse(fs.readFileSync(OVERRIDES_JSON, "utf8"));

let cleanedProducts = 0;
let removedFiles = 0;

const updated = products.map((product) => {
  const folder = folderFromRef(product.thumbnail ?? product.images?.[0]);
  if (!folder) return product;

  const beforeCount = listFolderImages(folder).length;
  const gallery = cleanFolder(folder);
  removedFiles += Math.max(0, beforeCount - gallery.length);

  if (gallery.length === 0) return product;

  const next = {
    ...product,
    thumbnail: gallery[0],
    image: gallery[0],
    images: gallery,
  };

  if (JSON.stringify(next.images) !== JSON.stringify(product.images)) {
    cleanedProducts += 1;
  }

  overrides[String(product.id)] = {
    thumbnail: gallery[0],
    images: gallery,
  };

  return next;
});

fs.writeFileSync(BW_JSON, `${JSON.stringify(updated, null, 2)}\n`);
fs.writeFileSync(OVERRIDES_JSON, `${JSON.stringify(overrides, null, 2)}\n`);

console.log(`Cleaned ${cleanedProducts} BimmerWorld product galleries.`);
console.log(`Removed ${removedFiles} duplicate image files from disk.`);

// Verify
let bad = 0;
for (const product of updated) {
  const gallery = product.images ?? [];
  const hashes = gallery.map(fileHash).filter(Boolean);
  if (new Set(hashes).size < hashes.length) bad += 1;
}
console.log(`Remaining products with duplicate slide bytes: ${bad}`);
if (bad > 0) process.exitCode = 1;
