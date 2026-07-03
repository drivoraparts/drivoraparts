/**
 * Download representative product photos for truck listings missing images.
 * Run: node scripts/fetch-truck-stock-photos.mjs
 * Force refresh listed slugs: node scripts/fetch-truck-stock-photos.mjs --force
 * Refresh specific slugs: node scripts/fetch-truck-stock-photos.mjs --force long-car-and-truck-exhaust-pipes
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const JSON_PATH = path.join(ROOT, "lib/inventory/data/edmunds-truck-parts.json");
const MEDIA_ROOT = path.join(ROOT, "public/product-media/truck-parts");

const FORCE = process.argv.includes("--force");
const SLUG_FILTER = new Set(
  process.argv.slice(2).filter((arg) => !arg.startsWith("-"))
);

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

/** slug → array of source image URLs */
const PHOTO_SOURCES = {
  "99-06-chevy-silverado-truck-bed-for-sale": [
    "https://edmundstruckparts.com/wp-content/uploads/2025/12/IMG_2120.jpeg",
    "https://edmundstruckparts.com/wp-content/uploads/2025/12/IMG_2119.jpeg",
    "https://edmundstruckparts.com/wp-content/uploads/2025/12/IMG_2121.jpeg",
    "https://edmundstruckparts.com/wp-content/uploads/2025/12/IMG_2122.jpeg",
    "https://images.pexels.com/photos/210019/pexels-photo-210019.jpeg?auto=compress&cs=tinysrgb&w=1280",
    "https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg?auto=compress&cs=tinysrgb&w=1280",
  ],
  "a-premium-front-catalytic-converter": [
    "https://media.a-premium.com/eXQtcHJvZC1tZWRpYS1hc3NldHM=/MjAyMi9pdGVtL2ltYWdlL0NDVC9VU0NDVDQxNTEzLUMvVVNDQ1Q0MTUxMy1DLTIwMjQwMzIzLTBfd2lkdGhfMTYwMF9oZWlnaHRfMTYwMC5qcGc=",
    "https://media.a-premium.com/eXQtcHJvZC1tZWRpYS1hc3NldHM=/MjAyMi9pdGVtL2ltYWdlL0NDVC9VU0NDVDQxNTEzLUMvVVNDQ1Q0MTUxMy1DLTIwMjQwMzIzLTFfd2lkdGhfMTYwMF9oZWlnaHRfMTYwMC5qcGc=",
    "https://media.a-premium.com/eXQtcHJvZC1tZWRpYS1hc3NldHM=/MjAyMi9pdGVtL2ltYWdlL0NDVC9VU0NDVDQxNTA0LUMvVVNDQ1Q0MTUwNC1DLTIwMjQwMzIzLTBfd2lkdGhfMTYwMF9oZWlnaHRfMTYwMC5qcGc=",
  ],
  "led-tail-light-with-blind-spot-compatible": [
    "https://cdn.shopify.com/s/files/1/0597/1227/4585/files/IMG-1326.jpg?v=1764284862",
  ],
  "long-car-and-truck-exhaust-pipes": [
    "https://cdn11.bigcommerce.com/s-0105d/images/stencil/1280x1280/products/2975/9279/SF-4300-304-Stainless-Steel-Flex-Exhaust-Hose__32650.1633460225.jpg?c=2",
    "https://www.pypesexhaust.com/sites/default/files/styles/product_display_image/public/products/BRC85ckss_0.jpg",
  ],
  "seating-at-tractor-supply-co": [
    "https://media.tractorsupply.com/is/image/TractorSupplyCompany/1266705",
    "https://media.tractorsupply.com/is/image/TractorSupplyCompany/1102641",
  ],
  "torin-atr6300b-rolling-creeper-garage": [
    "https://images.thdstatic.com/productImages/6f3b6de1-8d1e-4416-99ef-40fe6c32d4c2/svn/torin-shop-stools-atr6300b-2-64_1000.jpg",
    "https://images.thdstatic.com/productImages/6f3b6de1-8d1e-4416-99ef-40fe6c32d4c2/svn/torin-shop-stools-atr6300b-2-64_600.jpg",
  ],
};

/** Duplicate listings share the same media folder. */
const SLUG_MEDIA_ALIASES = {
  "99-06-chevy-silverado-truck-bed-for-sale-2":
    "99-06-chevy-silverado-truck-bed-for-sale",
};

/** slug → relative paths under public/ to copy when remote fetch is sparse */
const LOCAL_COPY_SOURCES = {
  "led-tail-light-with-blind-spot-compatible": [
    "product-media/lights/morimoto-xb-led-tail-lights/2.jpg",
    "product-media/lights/morimoto-xb-led-tail-lights/3.jpg",
    "product-media/lights/morimoto-xb-led-tail-lights/4.jpg",
  ],
};

const TARGET_SLUGS = new Set([
  "99-06-chevy-silverado-truck-bed-for-sale",
  "99-06-chevy-silverado-truck-bed-for-sale-2",
  "long-car-and-truck-exhaust-pipes",
  "led-tail-light-with-blind-spot-compatible",
  "seating-at-tractor-supply-co",
  "a-premium-front-catalytic-converter",
  "torin-atr6300b-rolling-creeper-garage",
]);

const ACTIVE_SLUGS =
  SLUG_FILTER.size > 0
    ? new Set([...TARGET_SLUGS].filter((slug) => SLUG_FILTER.has(slug)))
    : TARGET_SLUGS;

function mediaSlug(slug) {
  return SLUG_MEDIA_ALIASES[slug] ?? slug;
}

function extFromContentType(type = "", url = "") {
  if (type.includes("png")) return ".png";
  if (type.includes("webp")) return ".webp";
  const fromUrl = path.extname(url.split("?")[0]).toLowerCase();
  if (fromUrl === ".jpeg") return ".jpg";
  if ([".jpg", ".png", ".webp"].includes(fromUrl)) return fromUrl;
  return ".jpg";
}

async function downloadOne(url, dest) {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "image/*,*/*;q=0.8" },
    redirect: "follow",
    signal: AbortSignal.timeout(45_000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 2000) throw new Error("too small");
  await fs.writeFile(dest, buf);
  return extFromContentType(res.headers.get("content-type") ?? "", url);
}

async function downloadForSlug(slug, urls) {
  const dir = path.join(MEDIA_ROOT, mediaSlug(slug));
  await fs.mkdir(dir, { recursive: true });
  const files = [];

  for (let i = 0; i < urls.length && files.length < 4; i += 1) {
    const url = urls[i];
    try {
      const ext = extFromContentType("", url);
      const name = `${files.length + 1}${ext}`;
      await downloadOne(url, path.join(dir, name));
      files.push(name);
    } catch (err) {
      console.warn(`  skip ${slug}/${url.slice(0, 60)}…: ${err.message}`);
    }
  }

  return files;
}

async function copyLocalForSlug(slug, relPaths, startIndex = 0) {
  const dir = path.join(MEDIA_ROOT, mediaSlug(slug));
  await fs.mkdir(dir, { recursive: true });
  const files = [];

  for (const rel of relPaths) {
    const src = path.join(ROOT, "public", rel);
    try {
      await fs.access(src);
      const ext = path.extname(rel).toLowerCase() || ".jpg";
      const name = `${startIndex + files.length + 1}${ext}`;
      await fs.copyFile(src, path.join(dir, name));
      files.push(name);
    } catch {
      console.warn(`  skip local copy ${rel}`);
    }
  }

  return files;
}

function needsLocalImages(product) {
  const thumb = product.thumbnail ?? "";
  const images = product.images ?? [];

  if (thumb.includes("default.svg")) return true;
  if (thumb.includes("edmundstruckparts.com")) return true;
  if (images.some((src) => src?.includes("edmundstruckparts.com"))) return true;
  if (images.some((src) => src?.includes("default.svg"))) return true;

  return false;
}

function applyLocalPaths(product, slug, files) {
  const folder = mediaSlug(slug);
  product.images = files.map((f) => `/product-media/truck-parts/${folder}/${f}`);
  product.thumbnail = product.images[0];
}

const raw = JSON.parse(await fs.readFile(JSON_PATH, "utf8"));
let updated = 0;
const processedFolders = new Map();

for (const product of raw) {
  const slug = product.sourceSlug;
  if (!slug || !ACTIVE_SLUGS.has(slug)) continue;

  const folder = mediaSlug(slug);
  const urls = PHOTO_SOURCES[slug] ?? PHOTO_SOURCES[folder];
  if (!urls && !SLUG_MEDIA_ALIASES[slug]) continue;

  const shouldProcess =
    FORCE || needsLocalImages(product) || SLUG_MEDIA_ALIASES[slug];

  if (!shouldProcess) continue;

  if (processedFolders.has(folder)) {
    applyLocalPaths(product, slug, processedFolders.get(folder));
    updated += 1;
    console.log(`Linked ${slug} → ${product.thumbnail}`);
    continue;
  }

  console.log(`Fetching ${slug}…`);
  let files = urls ? await downloadForSlug(slug, urls) : [];

  const localPaths = LOCAL_COPY_SOURCES[slug] ?? LOCAL_COPY_SOURCES[folder];
  if (localPaths?.length) {
    const copied = await copyLocalForSlug(slug, localPaths, files.length);
    files = files.concat(copied);
  }

  if (files.length === 0) {
    console.warn(`  no files saved for ${slug}`);
    continue;
  }

  processedFolders.set(folder, files);
  applyLocalPaths(product, slug, files);
  updated += 1;
  console.log(`  saved ${files.length} → ${product.thumbnail}`);
}

await fs.writeFile(JSON_PATH, JSON.stringify(raw, null, 2));
console.log(`Updated ${updated} products in ${JSON_PATH}`);
