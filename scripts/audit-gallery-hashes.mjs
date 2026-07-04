/**
 * Find products whose carousel would show duplicate slides (same image bytes).
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();
const overrides = JSON.parse(
  fs.readFileSync("lib/inventory/data/product-media-overrides.json", "utf8")
);

function hashRef(ref) {
  if (!ref?.startsWith("/")) return ref;
  const fp = path.join(root, "public", ref.slice(1));
  if (!fs.existsSync(fp)) return ref;
  return crypto.createHash("sha256").update(fs.readFileSync(fp)).digest("hex");
}

function loadAll() {
  const products = [];
  const parseTs = (text) => {
    for (const block of text.split(/\n  \{\n    id: /).slice(1)) {
      const id = Number(block.match(/^(\d+),/)?.[1]);
      if (!id) continue;
      const thumbnail = block.match(/^\s*thumbnail:\s*"([^"]+)"/m)?.[1];
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
  };

  for (const f of fs.readdirSync("lib/inventory")) {
    if (f.endsWith("-products.ts") || f === "products.ts") {
      parseTs(fs.readFileSync(path.join("lib/inventory", f), "utf8"));
    }
  }
  for (const f of fs.readdirSync("lib/inventory/data")) {
    if (!f.endsWith(".json") || f === "product-media-overrides.json" || f.endsWith(".bak")) {
      continue;
    }
    products.push(
      ...JSON.parse(fs.readFileSync(path.join("lib/inventory/data", f), "utf8"))
    );
  }

  const byId = new Map();
  for (const p of products) byId.set(p.id, { ...byId.get(p.id), ...p });
  return [...byId.values()];
}

function finalGallery(p) {
  const o = overrides[String(p.id)];
  const images = o?.images ?? p.images ?? [];
  if (images.length) return images;
  const thumb = o?.thumbnail ?? p.thumbnail;
  return thumb ? [thumb] : [];
}

const bad = [];
for (const p of loadAll()) {
  const gallery = finalGallery(p);
  if (gallery.length < 2) continue;
  const hashes = gallery.map(hashRef);
  const unique = new Set(hashes);
  if (unique.size < hashes.length || (gallery.length >= 3 && unique.size === 1)) {
    bad.push({
      id: p.id,
      name: p.name,
      total: gallery.length,
      unique: unique.size,
      gallery,
    });
  }
}

console.log(`Products with duplicate carousel slides: ${bad.length}`);
for (const b of bad.slice(0, 30)) {
  console.log(
    `#${b.id} ${(b.name ?? "").slice(0, 60)} — ${b.total} slides, ${b.unique} unique`
  );
}

if (bad.length) process.exitCode = 1;
