import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();
const overrides = JSON.parse(
  fs.readFileSync(
    path.join(root, "lib/inventory/data/product-media-overrides.json"),
    "utf8"
  )
);

function collectFromTs(text) {
  const products = [];
  for (const block of text.split(/\n  \{\n    id: /).slice(1)) {
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

const products = [];
for (const name of fs.readdirSync(path.join(root, "lib/inventory"))) {
  if (name === "products.ts" || name.endsWith("-products.ts")) {
    products.push(
      ...collectFromTs(
        fs.readFileSync(path.join(root, "lib/inventory", name), "utf8")
      )
    );
  }
}
for (const name of fs.readdirSync(path.join(root, "lib/inventory/data"))) {
  if (!name.endsWith(".json") || name === "product-media-overrides.json") continue;
  for (const item of JSON.parse(
    fs.readFileSync(path.join(root, "lib/inventory/data", name), "utf8")
  )) {
    products.push({
      id: item.id,
      thumbnail: item.thumbnail,
      images: item.images ?? [],
    });
  }
}

const byId = new Map();
for (const p of products) byId.set(p.id, p);
const merged = [...byId.values()].map((p) => ({
  ...p,
  ...(overrides[String(p.id)] ?? {}),
}));

function hash(ref) {
  const fp = path.join(root, "public", ref.slice(1));
  if (!fs.existsSync(fp)) return null;
  return crypto.createHash("sha256").update(fs.readFileSync(fp)).digest("hex");
}

const thumbMap = new Map();
for (const p of merged) {
  const h = hash(p.thumbnail);
  if (!h) continue;
  if (!thumbMap.has(h)) thumbMap.set(h, []);
  thumbMap.get(h).push(p.id);
}

const dupThumbs = [...thumbMap.entries()].filter(([, ids]) => ids.length > 1);
console.log(`Duplicate thumbnails across products: ${dupThumbs.length}`);
dupThumbs.slice(0, 15).forEach(([h, ids]) => {
  console.log(`  ${h.slice(0, 12)}... -> #${ids.join(", #")}`);
});
