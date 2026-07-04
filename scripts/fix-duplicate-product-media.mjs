import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();
const DEFAULT_IMAGE = "/product-media/avatars/default.svg";
const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif"]);

const hashCache = new Map();

function fileHash(ref) {
  if (hashCache.has(ref)) return hashCache.get(ref);
  const fp = path.join(root, "public", ref.slice(1));
  if (!fs.existsSync(fp)) {
    hashCache.set(ref, null);
    return null;
  }
  const hash = crypto
    .createHash("sha256")
    .update(fs.readFileSync(fp))
    .digest("hex");
  hashCache.set(ref, hash);
  return hash;
}

function folderFromRef(ref) {
  if (!ref?.startsWith("/product-media/")) return null;
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

function collectFromSourceText(text, fileName) {
  if (fileName.endsWith(".json")) {
    const items = JSON.parse(text);
    return items.map((item) => ({
      id: item.id,
      thumbnail: item.thumbnail ?? item.image,
      images:
        item.images?.length > 0
          ? item.images
          : item.thumbnail
            ? [item.thumbnail]
            : [],
    }));
  }

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

function loadAllProductMedia() {
  const products = [];
  const inventoryDir = path.join(root, "lib/inventory");

  for (const name of fs.readdirSync(inventoryDir)) {
    if (name === "products.ts" || name.endsWith("-products.ts")) {
      const text = fs.readFileSync(path.join(inventoryDir, name), "utf8");
      products.push(...collectFromSourceText(text, name));
    }
  }

  for (const name of fs.readdirSync(path.join(inventoryDir, "data"))) {
    if (
      !name.endsWith(".json") ||
      name === "product-media-overrides.json" ||
      name.endsWith(".bak")
    ) {
      continue;
    }
    const text = fs.readFileSync(path.join(inventoryDir, "data", name), "utf8");
    products.push(...collectFromSourceText(text, name));
  }

  const byId = new Map();
  for (const product of products) {
    if (!product.id) continue;
    byId.set(product.id, product);
  }
  return [...byId.values()].sort((a, b) => a.id - b.id);
}

function assignProductMedia(product, usedThumbnailHashes) {
  const folders = new Set();
  for (const ref of [product.thumbnail, ...(product.images ?? [])].filter(Boolean)) {
    const folder = folderFromRef(ref);
    if (folder) folders.add(folder);
  }

  let pool = [];
  for (const folderRef of folders) {
    pool.push(...listFolderImages(folderRef));
  }

  if (pool.length === 0) {
    pool = dedupeRefsByHash(
      [product.thumbnail, ...(product.images ?? [])].filter(Boolean)
    );
  } else {
    pool = dedupeRefsByHash(pool);
  }

  if (pool.length === 0) {
    return {
      thumbnail: product.thumbnail || DEFAULT_IMAGE,
      images: product.images?.length ? product.images : [DEFAULT_IMAGE],
    };
  }

  let thumbnail =
    pool.find((ref) => {
      const hash = fileHash(ref);
      return hash && !usedThumbnailHashes.has(hash);
    }) ?? pool[product.id % pool.length];

  const thumbHash = fileHash(thumbnail);
  if (thumbHash) usedThumbnailHashes.add(thumbHash);

  const images = dedupeRefsByHash([thumbnail, ...pool]).slice(0, 6);

  return { thumbnail: images[0] ?? thumbnail, images };
}

const usedThumbnailHashes = new Set();
const overrides = {};
let changed = 0;

for (const product of loadAllProductMedia()) {
  const before = {
    thumbnail: product.thumbnail,
    images: product.images,
  };
  const next = assignProductMedia(product, usedThumbnailHashes);
  if (
    next.thumbnail !== before.thumbnail ||
    JSON.stringify(next.images) !== JSON.stringify(before.images)
  ) {
    overrides[product.id] = next;
    changed += 1;
  }
}

const jsonSources = [
  "ess-catalog.json",
  "edmunds-truck-parts.json",
  "bimmerworld-wheels-tires.json",
];
for (const fileName of jsonSources) {
  const filePath = path.join(root, "lib/inventory/data", fileName);
  const products = JSON.parse(fs.readFileSync(filePath, "utf8"));
  let fileChanged = false;
  const updated = products.map((product) => {
    const override = overrides[product.id];
    if (!override) return product;
    fileChanged = true;
    return {
      ...product,
      thumbnail: override.thumbnail,
      image: override.thumbnail,
      images: override.images,
    };
  });
  if (fileChanged) {
    fs.writeFileSync(filePath, `${JSON.stringify(updated, null, 2)}\n`);
    console.log(`Updated ${fileName}`);
  }
}

const overridesPath = path.join(
  root,
  "lib/inventory/data/product-media-overrides.json"
);
fs.writeFileSync(overridesPath, `${JSON.stringify(overrides, null, 2)}\n`);

const placeholderCount = Object.values(overrides).filter((entry) =>
  entry.thumbnail?.includes("/placeholders/")
).length;

console.log(
  `Wrote ${Object.keys(overrides).length} overrides (${changed} changed). Placeholders: ${placeholderCount}.`
);
