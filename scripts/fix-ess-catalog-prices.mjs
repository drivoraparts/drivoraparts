/**
 * Fix ESS catalog prices (Shopify stores cents, not dollars) and repair missing images.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const CATALOG_JSON = path.join(ROOT, "lib/inventory/data/ess-catalog.json");
const MEDIA_ROOT = path.join(ROOT, "public/product-media/ess-catalog");

const SKIP_IMAGE = /screenshot|instagram|nextiva|adsquare|adsqaure|ltsad|logo\.jpg/i;

function sanitizeTitle(title) {
  return title
    .replace(/\bESS\b/gi, "")
    .replace(/\bEngine Swap Supply\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function shopifyCentsToMsrp(cents) {
  const dollars = cents / 100;
  if (dollars <= 0) return 0;
  if (dollars < 150) return Math.max(Math.round(dollars), 1);
  return Math.ceil(dollars / 10) * 10;
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
      const prices = p.variants.map((v) => parseFloat(v.price)).filter(Number.isFinite);
      if (!prices.length) continue;
      const minCents = Math.min(...prices);
      byHandle.set(p.handle, minCents);
      byTitle.set(sanitizeTitle(p.title).toLowerCase(), p.handle);
    }
    if (json.products.length < 250) break;
    page += 1;
  }
  return { byHandle, byTitle };
}

function resolveHandle(product, byTitle) {
  const fromPath = handleFromProduct(product);
  if (fromPath) return fromPath;
  return byTitle.get(sanitizeTitle(product.name).toLowerCase()) ?? null;
}

async function downloadImages(handle, product, max = 3) {
  const urls = (product.images ?? [])
    .map((img) => img.src)
    .filter((src) => src && !SKIP_IMAGE.test(src))
    .slice(0, max);

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
      if (buf.length < 3000) continue;
      await fs.writeFile(dest, buf);
      files.push(name);
    } catch {
      /* skip */
    }
  }
  return files;
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

console.log("Fetching Shopify price map...");
const { byHandle, byTitle } = await fetchAllShopifyProducts();
console.log(`Loaded ${byHandle.size} Shopify products`);

const catalog = JSON.parse(await fs.readFile(CATALOG_JSON, "utf8"));
let priceFixed = 0;
let imagesFixed = 0;

for (const product of catalog) {
  const handle = resolveHandle(product, byTitle);
  if (!handle) continue;

  const cents = byHandle.get(handle);
  if (cents != null) {
    const msrp = shopifyCentsToMsrp(cents);
    if (msrp > 0 && product.price !== msrp) {
      product.price = msrp;
      priceFixed += 1;
    }
  }

  const thumbPath = product.thumbnail?.replace(/^\//, "");
  const absThumb = thumbPath ? path.join(ROOT, "public", thumbPath) : null;
  const missingThumb = !absThumb || !(await fileExists(absThumb));

  if (missingThumb || product.thumbnail?.includes("default.svg")) {
    const res = await fetch(
      `https://engineswapsupply.com/products/${handle}.json`,
      { headers: { "User-Agent": "DrivoraParts-Fix/1.0" } }
    );
    if (res.ok) {
      const { product: shopifyProduct } = await res.json();
      const files = await downloadImages(handle, shopifyProduct, 3);
      if (files.length) {
        product.thumbnail = `/product-media/ess-catalog/${handle}/${files[0]}`;
        product.images = files.map((f) => `/product-media/ess-catalog/${handle}/${f}`);
        imagesFixed += 1;
      }
    }
  }
}

await fs.writeFile(CATALOG_JSON, JSON.stringify(catalog, null, 2));
console.log(`Updated ${priceFixed} prices, repaired ${imagesFixed} image sets`);

const shirt = catalog.find((p) => /belraken/i.test(p.name));
console.log("BelRaken sample MSRP:", shirt?.price);
