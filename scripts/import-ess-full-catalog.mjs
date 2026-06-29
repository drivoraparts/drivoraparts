/**
 * Import Engine Swap Supply full catalog into DrivoraParts inventory JSON + media.
 * Rewrites titles/descriptions (no ESS branding). Skips already-imported engine handles.
 *
 * Usage: node scripts/import-ess-full-catalog.mjs [--skip-download] [--limit=N]
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const OUT_JSON = path.join(ROOT, "lib/inventory/data/ess-catalog.json");
const MEDIA_ROOT = path.join(ROOT, "public/product-media/ess-catalog");

const SKIP_HANDLES = new Set([
  "l86-6-2-engine",
  "l86-w-8l90-2wd",
  "l83-5-3-engine",
  "l83-5-3-engine-w-6l80-transmission-2wd",
  "l84-8l90-drivetrain",
  "lv3-6l80-drivetrain",
  "gen-3-coyote-drivetrain",
  "gen-2-coyote",
  "3-5-ecoboost",
  "2020-supercharged-l87-8l90-swap-ready-crate-lt-s-625-hp",
  "2019-l87-6-2-drivetrains",
  "lt-t-twin-turbo-drivetrain",
  "6-6-duramax",
  "ess-ltx-complete-swap-drivetrains",
  "ess-lt-r-complete-swap-drivetrains",
  "ls3-l99-drivetrains",
  "lsa-drivetrains",
  "l86-10r80-drivetrain",
  "gen-v-lt1-10-speed",
  "2020-ford-6-7-powerstroke-w-0-speed-transmission",
  "lt4-tr6060-wetsump-drivetrian",
  "new-gm-lt4-drivetrain-package",
  "coyote-gt-750-package",
  "coyote-gt-s-package-copy",
  "lt-t-twin-turbo-drivetrain-copy",
  "ess-427-ls7-drivetrain-package",
]);

const SKIP_IMAGE = /screenshot|instagram|nextiva|adsquare|adsqaure|ltsad|logo\.jpg/i;
const SKIP_TITLE = /^(ess\s|engine swap supply)/i;

const TYPE_TO_CATEGORY = [
  [/big brake|brake caliper|brake rotor|brake kit|brake master|brake fluid/i, "brakes"],
  [/turbocharger|turbine housing|super core|wastegate|blow off|intercooler|boost controller/i, "turbocharger"],
  [/coilover|control arm|sway bar|suspension|lowering spring|panhard|camber|strut bar|shock mount|leaf spring|tie rod|ball joint|skid plate|chassis brace|subframe|differential bushing|diff brace|air suspension/i, "suspension"],
  [/transmission|tr6060|10l80|8l90|6l80|10r80|clutch kit|flywheel|bell housing|slave cylinder|release bearing/i, "transmission"],
  [/programmer|tuner|ecm|wiring harness|gauge|haltech|hp tuners|msd|aem|electronics/i, "electronics"],
  [/headlight|tail light|lighting|led|morimoto|alpharex|oracle|baja/i, "lighting"],
  [/seat|racing seat|steering wheel|harness bar|floor mat|pedal cover|interior/i, "interior"],
  [/bumper|body|hood|fender|spoiler|carbon accessory/i, "body-parts"],
  [/header|exhaust|muffler|catback|axle back|catalytic|manifold/i, "engine"],
  [/engine|drivetrain|swap package|swap kit|motor mount|crossmember|radiator|fan shroud|fuel system|fuel pump|fuel tank|fuel filter|fuel regulator|fuel injector|supercharger|connecting rod|piston|oil filter|accessory drive/i, "engine"],
  [/battery|jump starter|charger/i, "electronics"],
  [/wheel/i, "aftermarket"],
];

const TITLE_BRAND = [
  [/\baeromotive\b/i, "aeromotive"],
  [/\bholley\b/i, "holley"],
  [/\bhaltech\b/i, "haltech"],
  [/\bhp tuners\b/i, "hp-tuners"],
  [/\baem\b/i, "aem"],
  [/\bmsd\b/i, "msd"],
  [/\bgarrett\b/i, "garrett"],
  [/\bborgwarner\b/i, "borgwarner"],
  [/\bprecision\b/i, "precision"],
  [/\bturbosmart\b/i, "turbosmart"],
  [/\bhks\b/i, "hks"],
  [/\bbrembo\b/i, "brembo-gt-kits"],
  [/\bwilwood\b/i, "wilwood-big-brake-kits"],
  [/\bebc\b/i, "ebc-rotors-pads"],
  [/\bbilstein\b/i, "bilstein"],
  [/\bkw\b/i, "kw-suspension"],
  [/\btein\b/i, "tein"],
  [/\btremec\b/i, "tremec"],
  [/\bchevrolet\b|\bgm\b|\bls\d|\blt\d|\bl83|\bl86|\bl87|\bduramax/i, "chevrolet"],
  [/\bford\b|\bcoyote\b|\bpowerstroke\b|\becoboost\b/i, "ford"],
  [/\bdodge\b|\bhellcat\b|\bcharger\b|\bchallenger\b/i, "dodge"],
  [/\btoyota\b|\b2jz|\b1jz/i, "toyota"],
  [/\bnissan\b|\brb26|\bsr20/i, "nissan"],
  [/\bbmw\b|\bn54|\bn55|\bb58/i, "bmw"],
  [/\bhonda\b|\bk20|\bk24/i, "honda"],
];

const DEFAULT_BRAND = {
  engine: "chevrolet",
  transmission: "gm",
  turbocharger: "universal",
  suspension: "universal",
  brakes: "universal",
  electronics: "universal",
  lighting: "universal",
  interior: "universal",
  "body-parts": "universal",
  aftermarket: "universal",
};

function sanitizeTitle(title) {
  return title
    .replace(/\bESS\b/gi, "")
    .replace(/\bEngine Swap Supply\b/gi, "")
    .replace(/\bLT\.S\b/g, "Supercharged LT Swap")
    .replace(/\bLT\.T\b/g, "Twin-Turbo LT")
    .replace(/\bLT\.R\b/g, "LT Road-Race")
    .replace(/\s+/g, " ")
    .trim();
}

function resolveCategory(product) {
  const hay = `${product.title} ${product.product_type ?? ""} ${product.tags?.join(" ") ?? ""}`;
  for (const [re, cat] of TYPE_TO_CATEGORY) {
    if (re.test(hay)) return cat;
  }
  return "aftermarket";
}

function resolveBrand(title, category) {
  for (const [re, slug] of TITLE_BRAND) {
    if (re.test(title)) return slug;
  }
  return DEFAULT_BRAND[category] ?? "universal";
}

function stripHtml(html = "") {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildDescription(name, productType, title) {
  const intro = `Swap-ready ${productType ? productType.toLowerCase() : "component"} for ${title.includes("Swap") || title.includes("swap") ? "custom engine conversion and performance builds" : "performance automotive applications"}. Sourced and inspected for DrivoraParts customers who need reliable fitment and fast freight options.`;

  return `${name}

${intro}

Specifications
• Part Type: ${productType || "Performance / Swap Component"}
• Application: Confirm vehicle fitment at checkout
• Condition: New or low-mile takeout (unit dependent)
• Supplier Tier: DrivoraParts performance catalog

Highlights
• Swap and performance oriented
• Quality-checked before shipment
• USA warehouse fulfillment
• Technical fitment support available

Warranty
24-Month Limited Warranty

Shipping
Worldwide shipping available — freight quotes provided for oversized items.`;
}

function msrpFromProduct(product) {
  const prices = product.variants.map((v) => parseFloat(v.price)).filter(Boolean);
  const min = Math.min(...prices);
  return Math.ceil(min / 10) * 10;
}

async function fetchAllProducts() {
  const all = [];
  let page = 1;
  while (true) {
    const url = `https://engineswapsupply.com/collections/all/products.json?limit=250&page=${page}`;
    const res = await fetch(url, { headers: { "User-Agent": "DrivoraParts-Import/1.0" } });
    if (!res.ok) throw new Error(`Fetch failed ${url}: ${res.status}`);
    const json = await res.json();
    if (!json.products?.length) break;
    all.push(...json.products);
    if (json.products.length < 250) break;
    page += 1;
  }
  return all;
}

function extFromUrl(url) {
  const base = url.split("?")[0];
  const ext = path.extname(base).toLowerCase();
  if (ext === ".jpeg") return ".jpg";
  if ([".jpg", ".webp", ".png", ".avif"].includes(ext)) return ext;
  return ".jpg";
}

async function downloadImages(product, slug, maxImages, skipDownload) {
  const urls = (product.images ?? [])
    .map((img) => img.src)
    .filter((src) => src && !SKIP_IMAGE.test(src))
    .slice(0, maxImages);

  if (skipDownload || urls.length === 0) return [];

  const dir = path.join(MEDIA_ROOT, slug);
  await fs.mkdir(dir, { recursive: true });

  const downloads = urls.map(async (url, index) => {
    const ext = extFromUrl(url);
    const name = `${index + 1}${ext}`;
    try {
      const res = await fetch(url, { headers: { "User-Agent": "DrivoraParts-Import/1.0" } });
      if (!res.ok) return null;
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 5000) return null;
      await fs.writeFile(path.join(dir, name), buf);
      return name;
    } catch {
      return null;
    }
  });

  const files = (await Promise.all(downloads)).filter(Boolean);
  return files.sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
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

async function processProduct(p) {
  const name = sanitizeTitle(p.title);
  if (!name || SKIP_TITLE.test(name)) return null;

  const category = resolveCategory(p);
  const brand = resolveBrand(name, category);
  const slug = p.handle.slice(0, 80);
  const price = msrpFromProduct(p);
  if (price <= 0) return null;

  const imageFiles = await downloadImages(p, slug, MAX_IMAGES, skipDownload);
  const images =
    imageFiles.length > 0
      ? imageFiles.map((f) => `/product-media/ess-catalog/${slug}/${f}`)
      : ["/product-media/avatars/default.svg"];

  return {
    name,
    category,
    brand,
    price,
    stock: true,
    condition: "brand-new",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    thumbnail: images[0],
    images,
    description: buildDescription(name, p.product_type, name),
  };
}

const args = process.argv.slice(2);
const skipDownload = args.includes("--skip-download");
const limitArg = args.find((a) => a.startsWith("--limit="));
const limit = limitArg ? parseInt(limitArg.split("=")[1], 10) : Infinity;

const START_ID = 212;
const MAX_IMAGES = 3;
const CONCURRENCY = 16;

console.log("Fetching ESS catalog...");
const raw = await fetchAllProducts();
console.log(`Fetched ${raw.length} products`);

const filtered = raw.filter((p) => !SKIP_HANDLES.has(p.handle));
console.log(`After skip list: ${filtered.length}`);

const slice = filtered.slice(0, limit);
console.log(`Importing ${slice.length} products (concurrency ${CONCURRENCY})...`);

let done = 0;
const mapped = await mapPool(slice, CONCURRENCY, async (p, i) => {
  const result = await processProduct(p);
  done += 1;
  if (done % 50 === 0 || done === slice.length) {
    console.log(`Processed ${done}/${slice.length}...`);
  }
  return result;
});

const products = mapped
  .filter(Boolean)
  .map((product, index) => {
    const id = START_ID + index;
    return { ...product, id, createdAt: 1_741_800_000_000 - id };
  });

await fs.mkdir(path.dirname(OUT_JSON), { recursive: true });
await fs.writeFile(OUT_JSON, JSON.stringify(products, null, 2));

console.log(`Wrote ${products.length} products to ${OUT_JSON}`);
if (products.length) {
  console.log(`IDs ${products[0].id}–${products[products.length - 1].id}`);
}
