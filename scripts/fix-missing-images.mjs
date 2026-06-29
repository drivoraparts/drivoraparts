/**
 * Download missing ESS catalog product images from Shopify and update ess-catalog.json.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const CATALOG_JSON = path.join(ROOT, "lib/inventory/data/ess-catalog.json");
const MEDIA_ROOT = path.join(ROOT, "public/product-media/ess-catalog");

const SKIP_IMAGE = /instagram|nextiva|adsquare|adsqaure|ltsad|ess_email_logo/i;

/** Handles that may use screenshot images from Shopify. */
const ALLOW_SCREENSHOT = new Set(["manley-ls-lt-h-beam-connecting-rod"]);

/** Handles that may use brand logo images from Shopify. */
const ALLOW_LOGO = new Set(["l81-6-6l-aluminum-engine"]);

/** Product handle → Shopify handle when title/slug differs. */
const HANDLE_OVERRIDES = new Map([
  ["07-13 gm truck to gen v lt inline fuel regulator kit", "07-13-gm-truck-to-gen-v-lt-inline-fuel-regulator-kit"],
  ["60-72 frame mounts for ls and lt mount kit", "60-72-fram-mounts-for-ls-and-lt-mount-kit"],
  ["60-87 c10 lt1 install kit", "60-87-c10-lt1-install-kit"],
  ["60-87 c10 lt4 kit", "60-87-c10-l83-6-lt4-kit"],
  ["61-64 impala radiator & fan kit", "61-64-impala-radiator-fan-kit"],
  ["manley ls / lt h beam connecting rod", "manley-ls-lt-h-beam-connecting-rod"],
  ["ram air vi 6.6l aluminum engine package", "l81-6-6l-aluminum-engine"],
  ["tcu programmed", "tcu-programmed"],
]);

/**
 * When a product has no usable images, pull from a related Shopify listing.
 * Key = target handle, value = source handle.
 */
const IMAGE_SOURCE_OVERRIDES = new Map([
  ["07-13-gm-truck-to-gen-v-lt-inline-fuel-regulator-kit", "deatschwerks-dwffr-x-110mm-billet-fuel-filter-regulator-10-micron"],
  ["60-72-fram-mounts-for-ls-and-lt-mount-kit", "umi-performance-68-72-gm-a-body-lsx-motor-mounts"],
  ["60-87-c10-lt1-install-kit", "60-70-c10-l8x-install-kit"],
  ["60-87-c10-l83-6-lt4-kit", "1960-1987-c10-gen-v-lt-swap-package"],
  ["61-64-impala-radiator-fan-kit", "66-70-caprice-radiator-and-fan-package"],
  ["tcu-programmed", "hpt-gm-e90-ecm-t93-tcm-upgrade-kit"],
]);

function sanitizeTitle(title) {
  return title
    .replace(/\bESS\b/gi, "")
    .replace(/\bEngine Swap Supply\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function handleFromProduct(product) {
  const src = product.thumbnail ?? product.images?.[0] ?? "";
  const match = src.match(/\/ess-catalog\/([^/]+)\//);
  return match?.[1] ?? null;
}

function extFromUrl(url) {
  const base = url.split("?")[0];
  const ext = path.extname(base).toLowerCase();
  if (ext === ".jpeg") return ".jpg";
  if ([".jpg", ".webp", ".png", ".avif"].includes(ext)) return ext;
  return ".jpg";
}

function shouldSkipImage(url, handle) {
  if (!url) return true;
  if (ALLOW_SCREENSHOT.has(handle) && /screenshot/i.test(url)) return false;
  if (ALLOW_LOGO.has(handle) && /logo/i.test(url)) return false;
  if (/screenshot/i.test(url)) return true;
  if (/logo\.jpg/i.test(url)) return true;
  return SKIP_IMAGE.test(url);
}

async function fetchAllShopifyProducts() {
  const byHandle = new Map();
  const byTitle = new Map();
  let page = 1;
  while (true) {
    const url = `https://engineswapsupply.com/collections/all/products.json?limit=250&page=${page}`;
    const res = await fetch(url, { headers: { "User-Agent": "DrivoraParts-Fix/1.0" } });
    if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
    const json = await res.json();
    if (!json.products?.length) break;
    for (const p of json.products) {
      byHandle.set(p.handle, p);
      byTitle.set(sanitizeTitle(p.title).toLowerCase(), p.handle);
    }
    if (json.products.length < 250) break;
    page += 1;
  }
  return { byHandle, byTitle };
}

async function fetchProduct(handle, byHandle) {
  let product = byHandle.get(handle);
  if (product) return product;
  const res = await fetch(`https://engineswapsupply.com/products/${handle}.json`, {
    headers: { "User-Agent": "DrivoraParts-Fix/1.0" },
  });
  if (!res.ok) return null;
  return (await res.json()).product;
}

function resolveHandle(product, byTitle) {
  const fromPath = handleFromProduct(product);
  if (fromPath && !fromPath.includes("default")) return fromPath;
  const key = sanitizeTitle(product.name).toLowerCase();
  if (HANDLE_OVERRIDES.has(key)) return HANDLE_OVERRIDES.get(key);
  return byTitle.get(key) ?? null;
}

function imageUrlsFromProduct(product, handle, max = 4) {
  return (product.images ?? [])
    .map((img) => (typeof img === "string" ? img : img.src))
    .filter((src) => src && !shouldSkipImage(src, handle))
    .slice(0, max);
}

async function downloadImages(handle, urls) {
  if (!urls.length) return [];

  const dir = path.join(MEDIA_ROOT, handle);
  await fs.mkdir(dir, { recursive: true });

  const files = [];
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    const name = `${i + 1}${extFromUrl(url)}`;
    const dest = path.join(dir, name);
    try {
      const res = await fetch(url, { headers: { "User-Agent": "DrivoraParts-Fix/1.0" } });
      if (!res.ok) continue;
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 2000) continue;
      await fs.writeFile(dest, buf);
      files.push(name);
      console.log(`  saved ${handle}/${name} (${Math.round(buf.length / 1024)} KB)`);
    } catch (err) {
      console.warn(`  skip ${url}:`, err.message);
    }
  }
  return files;
}

async function fileOk(webPath) {
  if (!webPath || webPath.includes("default.svg")) return false;
  try {
    const stat = await fs.stat(path.join(ROOT, "public", webPath.replace(/^\//, "")));
    return stat.isFile() && stat.size > 1000;
  } catch {
    return false;
  }
}

console.log("Loading Shopify catalog...");
const { byHandle, byTitle } = await fetchAllShopifyProducts();
console.log(`Shopify products: ${byHandle.size}`);

const catalog = JSON.parse(await fs.readFile(CATALOG_JSON, "utf8"));
let fixed = 0;
const failed = [];

for (const product of catalog) {
  if (await fileOk(product.thumbnail)) continue;

  const handle = resolveHandle(product, byTitle);
  if (!handle) {
    failed.push({ id: product.id, name: product.name, reason: "no handle" });
    continue;
  }

  let shopifyProduct = await fetchProduct(handle, byHandle);
  if (!shopifyProduct) {
    failed.push({ id: product.id, name: product.name, reason: `handle not found: ${handle}` });
    continue;
  }

  let urls = imageUrlsFromProduct(shopifyProduct, handle, 4);
  let sourceNote = "";

  if (!urls.length && IMAGE_SOURCE_OVERRIDES.has(handle)) {
    const sourceHandle = IMAGE_SOURCE_OVERRIDES.get(handle);
    const sourceProduct = await fetchProduct(sourceHandle, byHandle);
    if (sourceProduct) {
      urls = imageUrlsFromProduct(sourceProduct, sourceHandle, 4);
      sourceNote = ` (from ${sourceHandle})`;
    }
  }

  console.log(`Fixing #${product.id} ${product.name} (${handle})${sourceNote}`);
  const files = await downloadImages(handle, urls);
  if (!files.length) {
    failed.push({ id: product.id, name: product.name, reason: "no images downloaded" });
    continue;
  }

  product.thumbnail = `/product-media/ess-catalog/${handle}/${files[0]}`;
  product.images = files.map((f) => `/product-media/ess-catalog/${handle}/${f}`);
  fixed += 1;
}

await fs.writeFile(CATALOG_JSON, JSON.stringify(catalog, null, 2));

console.log(`\nFixed ${fixed} products`);
if (failed.length) {
  console.log(`Failed ${failed.length}:`);
  for (const f of failed) console.log(`  #${f.id} ${f.reason} — ${f.name}`);
}

const remaining = [];
for (const p of catalog) {
  if (!(await fileOk(p.thumbnail))) remaining.push({ id: p.id, name: p.name });
}
console.log(`Remaining without images: ${remaining.length}`);
for (const r of remaining) console.log(`  #${r.id} ${r.name}`);
