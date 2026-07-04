import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();
const DEFAULT_IMAGE = "/product-media/avatars/default.svg";
const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif"]);
const IMAGE_REF_RE = /"(\/product-media\/[^"]+)"/g;

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
    if (!name.endsWith(".json") || name === "product-media-overrides.json") continue;
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

function ensurePlaceholder(productId) {
  const dir = path.join(root, "public/product-media/placeholders");
  fs.mkdirSync(dir, { recursive: true });
  const ref = `/product-media/placeholders/${productId}.svg`;
  const fp = path.join(root, "public", ref.slice(1));
  if (!fs.existsSync(fp)) {
    const hue = (productId * 47) % 360;
    fs.writeFileSync(
      fp,
      `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><rect fill="hsl(${hue}, 42%, 90%)" width="512" height="512"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="hsl(${hue}, 55%, 32%)" font-family="Arial,sans-serif" font-size="44" font-weight="700">#${productId}</text></svg>`
    );
  }
  return ref;
}

function normalizeProductMedia(product, claimedHashes, claimedThumbnails) {
  const folders = new Set();
  const refs = [product.thumbnail, ...(product.images ?? [])].filter(Boolean);

  for (const ref of refs) {
    const folder = folderFromRef(ref);
    if (folder) folders.add(folder);
  }

  const uniqueImages = [];
  const seenLocal = new Set();
  for (const ref of refs) {
    const hash = fileHash(ref);
    if (!hash || seenLocal.has(hash)) continue;
    seenLocal.add(hash);
    uniqueImages.push(ref);
  }

  let kept = [];
  for (const ref of uniqueImages) {
    const hash = fileHash(ref);
    if (!hash || claimedHashes.has(hash)) continue;
    kept.push(ref);
    claimedHashes.add(hash);
  }

  if (kept.length === 0) {
    for (const folderRef of folders) {
      for (const candidate of listFolderImages(folderRef)) {
        const hash = fileHash(candidate);
        if (!hash || claimedHashes.has(hash)) continue;
        kept.push(candidate);
        claimedHashes.add(hash);
        break;
      }
      if (kept.length > 0) break;
    }
  }

  if (kept.length === 0) {
    kept.push(ensurePlaceholder(product.id));
  }

  kept = kept.map((ref) =>
    ref === DEFAULT_IMAGE ? ensurePlaceholder(product.id) : ref
  );

  let thumbnail = kept[0];
  if (thumbnail === DEFAULT_IMAGE) {
    thumbnail = ensurePlaceholder(product.id);
  }

  const thumbHash = fileHash(thumbnail);
  if (thumbHash && claimedThumbnails.has(thumbHash)) {
    const alternate = kept.find((ref) => {
      const hash = fileHash(ref);
      return hash && !claimedThumbnails.has(hash);
    });
    if (alternate) {
      thumbnail = alternate;
    } else {
      thumbnail = ensurePlaceholder(product.id);
    }
  }

  const thumbHashFinal = fileHash(thumbnail);
  if (thumbHashFinal) claimedThumbnails.add(thumbHashFinal);

  if (!kept.includes(thumbnail)) {
    kept = [thumbnail, ...kept.filter((ref) => ref !== thumbnail)];
  }

  return {
    thumbnail,
    images: kept,
  };
}

const claimedHashes = new Set();
const claimedThumbnails = new Set();
const overrides = {};
let changed = 0;

for (const product of loadAllProductMedia()) {
  const before = {
    thumbnail: product.thumbnail,
    images: product.images,
  };
  const next = normalizeProductMedia(product, claimedHashes, claimedThumbnails);
  if (
    next.thumbnail !== before.thumbnail ||
    JSON.stringify(next.images) !== JSON.stringify(before.images)
  ) {
    overrides[product.id] = next;
    changed += 1;
  }
}

const jsonSources = ["ess-catalog.json", "edmunds-truck-parts.json"];
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

console.log(`Wrote ${Object.keys(overrides).length} overrides (${changed} changed listings).`);
