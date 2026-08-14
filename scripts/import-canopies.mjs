/**
 * Import Top 50 high-demand canopy SKUs (USA + Australia).
 * Each SKU gets its own photo via lib/inventory/data/canopy-photo-urls.json.
 *
 * Usage:
 *   node scripts/import-canopies.mjs
 *   node scripts/import-canopies.mjs --skip-download
 */
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { CANOPY_SOURCES } from "./canopy-sources.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const OUT_JSON = path.join(ROOT, "lib/inventory/data/canopies-ext.json");
const PHOTO_JSON = path.join(ROOT, "lib/inventory/data/canopy-photo-urls.json");
const MEDIA_ROOT = path.join(ROOT, "public/product-media/canopy");
const AFTERMARKET_MEDIA = path.join(ROOT, "public/product-media/aftermarket");
const START_ID = 2026;

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
const skipDownload = process.argv.includes("--skip-download");
const MAX_IMAGES = 6;

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 72);
}

function buildDescription(name, fitment, body = "") {
  // No material claim in the fallback: these canopies are variously aluminium
  // and composite, and the feed carries no material field, so naming one would
  // be a guess the customer can't verify. Pass a real `body` to state it.
  const intro =
    body ||
    `${name} — lock-ready ute/truck canopy engineered for secure cargo storage, roof load capacity, and clean OEM-style fitment.`;
  return `${name}

${intro}

Fitment: ${fitment}

Warranty
Manufacturer Warranty

Shipping
Freight shipping available on oversized canopies — contact for international delivery quotes.`;
}

async function downloadFromUrl(url, seenHashes) {
  const extMatch = url.match(/\.(jpe?g|png|webp)(?:\?|$)/i);
  const ext = extMatch ? extMatch[1].toLowerCase().replace("jpeg", "jpg") : "jpg";

  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) return null;

  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 800) return null;
  if (/text\/html/i.test(res.headers.get("content-type") ?? "")) return null;

  const hash = crypto.createHash("sha256").update(buf).digest("hex");
  if (seenHashes.has(hash)) return null;
  seenHashes.add(hash);

  return { buf, ext };
}

async function copyLocalFile(relPath, seenHashes) {
  const src = path.join(AFTERMARKET_MEDIA, relPath);
  const buf = await fs.readFile(src);
  if (buf.length < 800) return null;

  const hash = crypto.createHash("sha256").update(buf).digest("hex");
  if (seenHashes.has(hash)) return null;
  seenHashes.add(hash);

  const ext = path.extname(relPath).slice(1).toLowerCase().replace("jpeg", "jpg") || "jpg";
  return { buf, ext };
}

async function downloadImages(slug, photoEntry) {
  const dir = path.join(MEDIA_ROOT, slug);
  await fs.mkdir(dir, { recursive: true });

  if (skipDownload) {
    return (await fs.readdir(dir).catch(() => []))
      .filter((f) => /\.(jpe?g|png|webp)$/i.test(f))
      .sort();
  }

  await fs.rm(dir, { recursive: true, force: true }).catch(() => {});
  await fs.mkdir(dir, { recursive: true });

  const seenHashes = new Set();
  const saved = [];

  for (const url of photoEntry.urls ?? []) {
    if (saved.length >= MAX_IMAGES) break;
    try {
      const file = await downloadFromUrl(url, seenHashes);
      if (!file) continue;
      const filename = `${saved.length + 1}.${file.ext}`;
      await fs.writeFile(path.join(dir, filename), file.buf);
      saved.push(filename);
    } catch {
      /* skip bad URL */
    }
  }

  for (const rel of photoEntry.local ?? []) {
    if (saved.length >= MAX_IMAGES) break;
    try {
      const file = await copyLocalFile(rel, seenHashes);
      if (!file) continue;
      const filename = `${saved.length + 1}.${file.ext}`;
      await fs.writeFile(path.join(dir, filename), file.buf);
      saved.push(filename);
    } catch {
      /* skip missing local file */
    }
  }

  return saved;
}

async function main() {
  const photoMap = JSON.parse(await fs.readFile(PHOTO_JSON, "utf8"));
  const products = [];

  for (let i = 0; i < CANOPY_SOURCES.length; i++) {
    const item = CANOPY_SOURCES[i];
    const slug = slugify(item.name);
    const photoEntry = photoMap[slug];

    if (!photoEntry) {
      throw new Error(`Missing photo map entry for ${slug}`);
    }

    console.log(`[${i + 1}/${CANOPY_SOURCES.length}] ${item.name}`);

    const imageFiles = await downloadImages(slug, photoEntry);
    const mediaBase = `/product-media/canopy/${slug}`;

    if (!imageFiles.length) {
      throw new Error(`No images for ${slug}`);
    }

    const images = imageFiles.map((f) => `${mediaBase}/${f}`);
    const product = {
      id: START_ID + i,
      name: item.name,
      category: "canopy",
      brand: item.brand,
      price: item.price,
      stock: true,
      stockQty: 3,
      condition: "brand-new",
      warranty: "Manufacturer Warranty",
      location: "USA Warehouse",
      fitment: item.fitment,
      thumbnail: images[0],
      images,
      image: images[0],
      description: buildDescription(item.name, item.fitment),
      sourceUrl: item.url ?? "https://drivoraparts.com",
      sourceSlug: slug,
      createdAt: 1_752_080_000_000 - i,
    };

    if (item.topDemand) product.topDemand = true;
    products.push(product);
    console.log(`  ${images.length} image(s), $${item.price}`);
  }

  await fs.mkdir(path.dirname(OUT_JSON), { recursive: true });
  await fs.writeFile(OUT_JSON, JSON.stringify(products, null, 2));
  console.log(`\nWrote ${products.length} products → ${OUT_JSON}`);
}

const isMain =
  process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

if (isMain) {
  await main();
}
