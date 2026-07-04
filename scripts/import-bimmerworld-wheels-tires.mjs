/**
 * Import Wheels & Tires from bimmerworld.com/Wheels-Tires/
 * Stores sourceUrl on each product for reference linking.
 *
 * Usage:
 *   node scripts/import-bimmerworld-wheels-tires.mjs
 *   node scripts/import-bimmerworld-wheels-tires.mjs --skip-download
 *   node scripts/import-bimmerworld-wheels-tires.mjs --limit=10
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const BASE = "https://www.bimmerworld.com";
const LISTING = `${BASE}/Wheels-Tires/`;
const OUT_JSON = path.join(ROOT, "lib/inventory/data/bimmerworld-wheels-tires.json");
const MEDIA_ROOT = path.join(ROOT, "public/product-media/wheels-tires");
const START_ID = 1600;

const UA = "DrivoraParts-Import/1.0 (+https://drivoraparts.com)";
const args = process.argv.slice(2);
const skipDownload = args.includes("--skip-download");
const limitArg = args.find((a) => a.startsWith("--limit="));
const limit = limitArg ? parseInt(limitArg.split("=")[1], 10) : Infinity;
const MAX_IMAGES = 6;
const CONCURRENCY = 6;

function stripHtml(html = "") {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#9733;/g, "★")
    .replace(/\s+/g, " ")
    .trim();
}

function slugFromPath(urlPath) {
  const file = urlPath.split("/").pop() ?? "wheel-product";
  return file.replace(/\.html$/i, "").slice(0, 80);
}

function resolveBrand(name) {
  const hay = name.toLowerCase();
  if (/bimmerworld|te:al|ta5r|ta8s|ta16|teal/i.test(hay)) return "bimmerworld";
  if (/\bapex\b/i.test(hay)) return "apex";
  if (/\bsonax\b/i.test(hay)) return "sonax";
  if (/\btoyo\b/i.test(hay)) return "toyo";
  if (/\bbmw\b/i.test(hay)) return "bmw";
  if (/\bh&r\b|\bhr\b/i.test(hay)) return "hr";
  if (/turner\s*motorsport/i.test(hay)) return "turner-motorsport";
  if (/motorsport\s*hardware/i.test(hay)) return "motorsport-hardware";
  return "universal";
}

function extractFitment(name, description) {
  const hay = `${name} ${description}`;
  const codes = [
    ...hay.matchAll(
      /\b(?:E\d{2,3}|F\d{2,3}|G\d{2}|Z3|Z4|5x\d{3})\b/gi
    ),
  ].map((m) => m[0].toUpperCase());
  const unique = [...new Set(codes)];
  if (unique.length) return unique.slice(0, 8).join(", ");
  const yearRange = hay.match(
    /(?:19|20)\d{2}\s*[–-]\s*(?:19|20)\d{2}/
  );
  return yearRange?.[0]?.replace(/\s+/g, " ");
}

function buildDescription(name, rawDescription, fitment) {
  const body = stripHtml(rawDescription).slice(0, 1400);
  const intro =
    body ||
    `${name} — BMW-focused wheel, tire, or wheel-care product sourced from our supplier network.`;

  const fitmentLine = fitment
    ? `\nFitment: ${fitment}`
    : "\nFitment: Confirm bolt pattern, diameter, and offset for your chassis before ordering.";

  return `${name}

${intro}${fitmentLine}

Shipping
Fast domestic fulfillment on in-stock wheels and accessories. Oversized wheel sets may ship freight — contact for a quote.`;
}

async function fetchText(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "text/html" },
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.text();
}

function parseListingUrls(html) {
  const urls = new Set();
  for (const match of html.matchAll(
    /href=['"](\/Wheels-Tires\/[^'"#?]+\.html)['"]/gi
  )) {
    urls.add(`${BASE}${match[1]}`);
  }
  return [...urls];
}

function parsePaginationUrls(html) {
  const urls = new Set([LISTING]);
  for (const match of html.matchAll(
    /href=['"](\/Wheels-Tires\/\?range=[^'"#]+)['"]/gi
  )) {
    urls.add(`${BASE}${match[1]}`);
  }
  return [...urls];
}

async function fetchAllProductUrls() {
  const firstHtml = await fetchText(LISTING);
  const listingPages = parsePaginationUrls(firstHtml);
  const productUrls = new Set(parseListingUrls(firstHtml));

  for (const pageUrl of listingPages) {
    if (pageUrl === LISTING) continue;
    try {
      const html = await fetchText(pageUrl);
      for (const url of parseListingUrls(html)) productUrls.add(url);
    } catch (error) {
      console.warn(`Listing page failed ${pageUrl}: ${error.message}`);
    }
  }

  return [...productUrls].sort();
}

function parseTitle(html) {
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1) return stripHtml(h1[1]);
  const og = html.match(/property="og:title"\s+content="([^"]+)"/i);
  return og?.[1]?.trim() ?? "";
}

function parsePrice(html) {
  const patterns = [
    /class="large-blue">\$([\d,]+\.\d{2})/,
    /var ppprice="\$([\d,]+\.\d{2})"/,
    /var itempricecheck="\$([\d,]+\.\d{2})"/,
    /"price"\s*:\s*\{\s*"list"\s*:\s*"\$([\d,]+\.\d{2})"/,
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) return parseFloat(match[1].replace(/,/g, ""));
  }
  return 0;
}

function parseDescription(html) {
  const ws = html.match(
    /<p class="ws-description">([\s\S]*?)<\/p>/i
  );
  if (ws) return ws[1];
  const og = html.match(/property="og:description"\s+content="([^"]+)"/i);
  return og?.[1] ?? "";
}

function absolutizeImageUrl(raw) {
  if (!raw || raw.startsWith("data:")) return null;
  const decoded = raw.replace(/&amp;/g, "&");
  if (decoded.startsWith("http")) return decoded;
  if (decoded.startsWith("//")) return `https:${decoded}`;
  return `${BASE}${decoded.startsWith("/") ? "" : "/"}${decoded}`;
}

function parseImages(html) {
  const urls = new Set();

  for (const match of html.matchAll(
    /data-(?:thumb|zoom)=["']([^"']+)["']/gi
  )) {
    const url = absolutizeImageUrl(match[1]);
    if (url) urls.add(url);
  }

  for (const match of html.matchAll(
    /(?:src|href)=["'](\/core\/media\/media\.nl[^"']+)["']/gi
  )) {
    const url = absolutizeImageUrl(match[1]);
    if (url) urls.add(url);
  }

  for (const match of html.matchAll(
    /(?:src|href)=["'](\/[^"'?]+\.(?:jpg|jpeg|png|webp))["']/gi
  )) {
    const pathPart = match[1].toLowerCase();
    if (
      pathPart.includes("/images/") ||
      pathPart.includes("nav/") ||
      pathPart.includes("-sm.") ||
      pathPart.includes("_tn.")
    ) {
      continue;
    }
    const url = absolutizeImageUrl(match[1]);
    if (url) urls.add(url);
  }

  return [...urls].slice(0, MAX_IMAGES);
}

async function downloadImages(imageUrls, slug) {
  if (skipDownload || !imageUrls.length) return [];

  const dir = path.join(MEDIA_ROOT, slug);
  await fs.mkdir(dir, { recursive: true });
  const saved = [];

  for (let i = 0; i < imageUrls.length; i++) {
    const url = imageUrls[i];
    const extMatch = url.match(/\.(jpe?g|png|webp)(?:\?|$)/i);
    const ext = extMatch ? extMatch[1].toLowerCase().replace("jpeg", "jpg") : "jpg";
    const filename = `${i + 1}.${ext}`;

    try {
      const res = await fetch(url, { headers: { "User-Agent": UA } });
      if (!res.ok) continue;
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 800) continue;
      await fs.writeFile(path.join(dir, filename), buf);
      saved.push(filename);
    } catch {
      /* skip bad image */
    }
  }

  return saved;
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
  const slug = slugFromPath(new URL(productUrl).pathname);
  let html;
  try {
    html = await fetchText(productUrl);
  } catch (error) {
    console.warn(`Skip ${slug}: ${error.message}`);
    return null;
  }

  const name = parseTitle(html);
  if (!name) {
    console.warn(`Skip ${slug}: no title`);
    return null;
  }

  const price = parsePrice(html);
  if (price <= 0) {
    console.warn(`Skip ${slug}: no price`);
    return null;
  }

  const rawDescription = parseDescription(html);
  const brand = resolveBrand(name);
  const fitment = extractFitment(name, stripHtml(rawDescription));

  const imageUrls = parseImages(html);
  const imageFiles = await downloadImages(imageUrls, slug);
  const images =
    imageFiles.length > 0
      ? imageFiles.map((f) => `/product-media/wheels-tires/${slug}/${f}`)
      : imageUrls.length > 0
        ? imageUrls.slice(0, MAX_IMAGES)
        : ["/product-media/avatars/default.svg"];

  return {
    name,
    category: "wheels-tires",
    brand,
    price,
    stock: true,
    stockQty: 4,
    condition: "brand-new",
    warranty: "Manufacturer Warranty",
    location: "USA Warehouse",
    fitment,
    thumbnail: images[0],
    images,
    description: buildDescription(name, rawDescription, fitment),
    sourceUrl: productUrl,
    sourceSlug: slug,
  };
}

console.log("Discovering BimmerWorld wheels & tires...");
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
    createdAt: 1_751_600_000_000 - index,
  }));

await fs.mkdir(path.dirname(OUT_JSON), { recursive: true });
await fs.writeFile(OUT_JSON, JSON.stringify(products, null, 2));

console.log(`Wrote ${products.length} products → ${OUT_JSON}`);
if (products.length) {
  console.log(`IDs ${products[0].id}–${products[products.length - 1].id}`);
}
