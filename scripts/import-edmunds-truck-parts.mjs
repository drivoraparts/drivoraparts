/**
 * Import truck parts catalog from edmundstruckparts.com (WooCommerce).
 * Rewrites titles/descriptions for DrivoraParts — no third-party branding.
 *
 * Usage:
 *   node scripts/import-edmunds-truck-parts.mjs
 *   node scripts/import-edmunds-truck-parts.mjs --skip-download
 *   node scripts/import-edmunds-truck-parts.mjs --limit=20
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const BASE = "https://edmundstruckparts.com";
const OUT_JSON = path.join(ROOT, "lib/inventory/data/edmunds-truck-parts.json");
const MEDIA_ROOT = path.join(ROOT, "public/product-media/truck-parts");
const START_ID = 1500;

const UA = "DrivoraParts-Import/1.0 (+https://drivoraparts.com)";

const args = process.argv.slice(2);
const skipDownload = args.includes("--skip-download");
const limitArg = args.find((a) => a.startsWith("--limit="));
const limit = limitArg ? parseInt(limitArg.split("=")[1], 10) : Infinity;
const MAX_IMAGES = 6;
const CONCURRENCY = 8;

function stripHtml(html = "") {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function sanitizeTitle(title) {
  return title
    .replace(/\bEdmunds Truck Parts\b/gi, "")
    .replace(/\bfor sale\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function slugFromUrl(url) {
  const match = url.match(/\/product\/([^/]+)\/?$/);
  return match?.[1]?.slice(0, 80) ?? "truck-part";
}

function resolveBrand(name, categories = []) {
  const hay = `${name} ${categories.join(" ")}`.toLowerCase();
  if (/\bgmc\b|\bsierra\b/.test(hay)) return "gmc";
  if (/\bchevy\b|\bchevrolet\b|\bsilverado\b/.test(hay)) return "chevrolet";
  if (/\bdodge\b|\bram\b/.test(hay)) return "dodge";
  if (/\bford\b|\bf-?150\b|\bf-?250\b|\bsuper\s*duty\b|\branger\b/.test(hay)) return "ford";
  if (/\btoyota\b|\bhilux\b|\btacoma\b/.test(hay)) return "toyota";
  if (/\bnissan\b/.test(hay)) return "nissan";
  return "universal";
}

function resolveCategory(name, categories = []) {
  const hay = `${name} ${categories.join(" ")}`.toLowerCase();
  if (/truck bed|tailgate|cab|door|fender|bumper|camper shell|topper|canopy|bed cap/i.test(hay)) {
    return "body-parts";
  }
  if (/transmission|differential|axle|driveshaft|transfer case/i.test(hay)) {
    return "transmission";
  }
  if (/engine|motor|drivetrain|turbo/i.test(hay)) {
    return "engine";
  }
  if (/light|tail light|headlight/i.test(hay)) {
    return "lighting";
  }
  if (/seat|interior|carpet|dash/i.test(hay)) {
    return "interior";
  }
  if (/exhaust|catalytic|muffler/i.test(hay)) {
    return "engine";
  }
  if (/tool|creeper|wrench/i.test(hay)) {
    return "aftermarket";
  }
  return "body-parts";
}

function extractFitment(name) {
  const yearRange = name.match(
    /(?:19|20)\d{2}\s*[–-]\s*(?:19|20)\d{2}|(?:19|20)\d{2}\s*[–-]\s*(?:19|20)\d{2}|\b\d{2,4}\s*[–-]\s*\d{2,4}\b/
  );
  if (yearRange) return yearRange[0].replace(/\s+/g, " ");
  return undefined;
}

function buildDescription(name, rawDescription, fitment) {
  const body = stripHtml(rawDescription).slice(0, 1200);
  const intro = body || `${name} — rust-free truck component inspected and photographed as the actual unit available.`;

  const fitmentLine = fitment
    ? `\nFitment: ${fitment}`
    : "\nFitment: Confirm year, bed length, and cab style at checkout.";

  return `${name}

${intro}${fitmentLine}

Condition notes: Inspected for structural integrity. Photos show the actual unit available.

Shipping
Freight / LTL shipping available on oversized truck beds, cabs, and shells — contact for a quote.`;
}

function parsePriceFromHtml(html) {
  const jsonLdMatch = html.match(
    /<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi
  );
  if (jsonLdMatch) {
    for (const block of jsonLdMatch) {
      try {
        const jsonText = block.replace(/<script[^>]*>/i, "").replace(/<\/script>/i, "");
        const data = JSON.parse(jsonText);
        const nodes = Array.isArray(data) ? data : [data];
        for (const node of nodes) {
          const offers = node.offers ?? node["@graph"]?.find((g) => g.offers)?.offers;
          const price =
            offers?.price ??
            offers?.[0]?.price ??
            node.price;
          const parsed = parseFloat(String(price));
          if (Number.isFinite(parsed) && parsed > 0) return Math.round(parsed);
        }
      } catch {
        // try next block
      }
    }
  }

  const wooPrice =
    html.match(/class="[^"]*woocommerce-Price-amount[^"]*"[^>]*>[\s\S]*?(\d[\d,]*(?:\.\d{2})?)/i) ??
    html.match(/"price"\s*:\s*"([\d.]+)"/i) ??
    html.match(/data-product-price="([\d.]+)"/i);

  if (wooPrice?.[1]) {
    const parsed = parseFloat(wooPrice[1].replace(/,/g, ""));
    if (Number.isFinite(parsed) && parsed > 0) return Math.round(parsed);
  }

  return 0;
}

function parseImagesFromHtml(html) {
  const urls = new Set();

  const og = html.match(/property="og:image" content="([^"]+)"/i);
  if (og?.[1]) urls.add(og[1].replace(/&amp;/g, "&"));

  for (const match of html.matchAll(/data-large_image="([^"]+)"/gi)) {
    urls.add(match[1].replace(/&amp;/g, "&"));
  }
  for (const match of html.matchAll(/data-src="(https:\/\/[^"]+\.(?:jpg|jpeg|png|webp)[^"]*)"/gi)) {
    urls.add(match[1].replace(/&amp;/g, "&"));
  }
  for (const match of html.matchAll(/src="(https:\/\/edmundstruckparts\.com\/wp-content\/uploads\/[^"]+\.(?:jpg|jpeg|png|webp)[^"]*)"/gi)) {
    urls.add(match[1].replace(/&amp;/g, "&"));
  }

  return [...urls].filter((u) => !/logo|icon|placeholder|avatar/i.test(u)).slice(0, MAX_IMAGES);
}

function parseTitleFromHtml(html) {
  const og = html.match(/property="og:title" content="([^"]+)"/i);
  if (og?.[1]) return sanitizeTitle(og[1].split(" - ")[0]);
  const h1 = html.match(/<h1[^>]*class="[^"]*product_title[^"]*"[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1?.[1]) return sanitizeTitle(stripHtml(h1[1]));
  return null;
}

function parseDescriptionFromHtml(html) {
  const tab = html.match(
    /woocommerce-Tabs-panel--description[\s\S]*?<div class="woocommerce-product-details__short-description"[^>]*>([\s\S]*?)<\/div>/i
  );
  if (tab?.[1]) return tab[1];
  const desc = html.match(/id="tab-description"[\s\S]*?<\/div>\s*<\/div>/i);
  return desc?.[0] ?? "";
}

async function fetchText(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "text/html,application/json" },
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
}

async function fetchAllProductUrls() {
  const urls = new Set();

  // WordPress REST (public on many WooCommerce stores)
  let page = 1;
  while (page <= 50) {
    const api = `${BASE}/wp-json/wp/v2/product?per_page=100&page=${page}&_fields=link,slug`;
    try {
      const res = await fetch(api, { headers: { "User-Agent": UA } });
      if (!res.ok) break;
      const rows = await res.json();
      if (!Array.isArray(rows) || rows.length === 0) break;
      for (const row of rows) {
        if (row.link) urls.add(row.link.replace(/\/$/, "") + "/");
      }
      if (rows.length < 100) break;
      page += 1;
    } catch {
      break;
    }
  }

  if (urls.size > 0) {
    console.log(`Discovered ${urls.size} products via WP REST`);
    return [...urls];
  }

  // Shop pagination fallback
  for (let shopPage = 1; shopPage <= 40; shopPage += 1) {
    const shopUrl =
      shopPage === 1 ? `${BASE}/shop/` : `${BASE}/shop/page/${shopPage}/`;
    let html;
    try {
      html = await fetchText(shopUrl);
    } catch {
      break;
    }
    const before = urls.size;
    for (const match of html.matchAll(/href="(https:\/\/edmundstruckparts\.com\/product\/[^"]+)"/gi)) {
      urls.add(match[1].replace(/\/$/, "") + "/");
    }
    if (urls.size === before) break;
  }

  console.log(`Discovered ${urls.size} products via shop crawl`);
  return [...urls];
}

function extFromUrl(url) {
  const base = url.split("?")[0];
  const ext = path.extname(base).toLowerCase();
  if (ext === ".jpeg") return ".jpg";
  if ([".jpg", ".webp", ".png", ".avif"].includes(ext)) return ext;
  return ".jpg";
}

async function downloadImages(imageUrls, slug) {
  if (skipDownload || imageUrls.length === 0) return [];

  const dir = path.join(MEDIA_ROOT, slug);
  await fs.mkdir(dir, { recursive: true });

  const files = [];
  for (let i = 0; i < imageUrls.length; i += 1) {
    const url = imageUrls[i];
    const ext = extFromUrl(url);
    const name = `${i + 1}${ext}`;
    try {
      const res = await fetch(url, { headers: { "User-Agent": UA } });
      if (!res.ok) continue;
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 4000) continue;
      await fs.writeFile(path.join(dir, name), buf);
      files.push(name);
    } catch {
      // skip bad image
    }
  }
  return files;
}

async function mapPool(items, concurrency, mapper) {
  const results = new Array(items.length);
  let index = 0;

  async function worker() {
    while (index < items.length) {
      const i = index++;
      results[i] = await mapper(items[i], i);
    }
  }

  await Promise.all(Array.from({ length: concurrency }, () => worker()));
  return results;
}

async function processProductUrl(productUrl) {
  const slug = slugFromUrl(productUrl);
  let html;
  try {
    html = await fetchText(productUrl);
  } catch (error) {
    console.warn(`Skip ${slug}: ${error.message}`);
    return null;
  }

  const name = parseTitleFromHtml(html);
  if (!name) return null;

  const price = parsePriceFromHtml(html);
  if (price <= 0) {
    console.warn(`Skip ${slug}: no price`);
    return null;
  }

  const rawDescription = parseDescriptionFromHtml(html);
  const categories = [...html.matchAll(/rel="tag"[^>]*>([^<]+)</gi)].map((m) => m[1]);
  const category = resolveCategory(name, categories);
  const brand = resolveBrand(name, categories);
  const fitment = extractFitment(name);

  const imageUrls = parseImagesFromHtml(html);
  const imageFiles = await downloadImages(imageUrls, slug);
  const images =
    imageFiles.length > 0
      ? imageFiles.map((f) => `/product-media/truck-parts/${slug}/${f}`)
      : ["/product-media/avatars/default.svg"];

  return {
    name,
    category,
    brand,
    price,
    stock: true,
    stockQty: 1,
    condition: "Used",
    warranty: "90-Day Functional Warranty",
    location: "USA Warehouse",
    fitment,
    thumbnail: images[0],
    images,
    description: buildDescription(name, rawDescription, fitment),
    sourceUrl: productUrl,
  };
}

console.log("Discovering Edmunds truck parts...");
const productUrls = (await fetchAllProductUrls()).slice(0, limit);
console.log(`Importing ${productUrls.length} products...`);

let done = 0;
const mapped = await mapPool(productUrls, CONCURRENCY, async (url) => {
  const result = await processProductUrl(url);
  done += 1;
  if (done % 10 === 0 || done === productUrls.length) {
    console.log(`Processed ${done}/${productUrls.length}`);
  }
  return result;
});

const products = mapped
  .filter(Boolean)
  .map((product, index) => ({
    ...product,
    id: START_ID + index,
    createdAt: 1_742_000_000_000 - index,
  }));

await fs.mkdir(path.dirname(OUT_JSON), { recursive: true });
await fs.writeFile(OUT_JSON, JSON.stringify(products, null, 2));

console.log(`Wrote ${products.length} products → ${OUT_JSON}`);
if (products.length) {
  console.log(`IDs ${products[0].id}–${products[products.length - 1].id}`);
}

/** Download images for products already in edmunds-truck-parts.json */
async function syncImagesFromCatalog() {
  const raw = JSON.parse(await fs.readFile(OUT_JSON, "utf8"));
  let ok = 0;
  for (const product of raw) {
    const slug = product.sourceSlug ?? slugFromUrl(product.sourceUrl ?? "");
    if (!slug) continue;
    const url = `${BASE}/product/${slug}/`;
    try {
      const html = await fetchText(url);
      const imageUrls = parseImagesFromHtml(html);
      const files = await downloadImages(imageUrls, slug);
      if (files.length) ok += 1;
    } catch {
      console.warn(`Image sync failed: ${slug}`);
    }
  }
  console.log(`Synced images for ${ok}/${raw.length} products`);
}

if (args.includes("--sync-images")) {
  await syncImagesFromCatalog();
}
