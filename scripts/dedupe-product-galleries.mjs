/**
 * Dedupe product gallery URLs (string-level) and fix known image gaps.
 * Usage: node scripts/dedupe-product-galleries.mjs
 */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const DEFAULT = "/product-media/avatars/default.svg";

function dedupeGallery(thumbnail, images = []) {
  const ordered = [];
  const seen = new Set();
  for (const ref of [thumbnail, ...images].filter(Boolean)) {
    if (seen.has(ref)) continue;
    seen.add(ref);
    ordered.push(ref);
  }
  const nextThumb = ordered[0] ?? thumbnail ?? DEFAULT;
  return {
    thumbnail: nextThumb,
    images: ordered.length ? ordered : [nextThumb],
  };
}

function patchJson(filePath) {
  if (!fs.existsSync(filePath)) return 0;
  const products = JSON.parse(fs.readFileSync(filePath, "utf8"));
  let changed = 0;
  const updated = products.map((product) => {
    const before = JSON.stringify({
      t: product.thumbnail,
      i: product.images,
    });
    const next = dedupeGallery(
      product.thumbnail ?? product.image,
      product.images
    );
    const after = JSON.stringify({ t: next.thumbnail, i: next.images });
    if (before !== after) changed += 1;
    return {
      ...product,
      thumbnail: next.thumbnail,
      image: next.thumbnail,
      images: next.images,
    };
  });
  if (changed) fs.writeFileSync(filePath, `${JSON.stringify(updated, null, 2)}\n`);
  return changed;
}

const jsonFiles = [
  "lib/inventory/data/bimmerworld-wheels-tires.json",
  "lib/inventory/data/edmunds-truck-parts.json",
  "lib/inventory/data/ess-catalog.json",
];

let total = 0;
for (const rel of jsonFiles) {
  const n = patchJson(path.join(root, rel));
  if (n) console.log(`${rel}: deduped ${n} products`);
  total += n;
}

// Fix #1721 — supplier page has no photos; use wheel-hardware photo from same catalog.
const bwPath = path.join(root, "lib/inventory/data/bimmerworld-wheels-tires.json");
const bw = JSON.parse(fs.readFileSync(bwPath, "utf8"));
const valveFix = {
  thumbnail: "/product-media/wheels-tires/Valve-BMW-F82-M4-GT4/1.jpg",
  images: ["/product-media/wheels-tires/Valve-BMW-F82-M4-GT4/1.jpg"],
};
const valveIdx = bw.findIndex((p) => p.id === 1721);
if (valveIdx >= 0 && bw[valveIdx].thumbnail === DEFAULT) {
  bw[valveIdx] = { ...bw[valveIdx], ...valveFix };
  fs.writeFileSync(bwPath, `${JSON.stringify(bw, null, 2)}\n`);
  console.log("Fixed #1721 placeholder with wheel-hardware image");
  total += 1;
}

console.log(`Done. ${total} product records updated.`);
