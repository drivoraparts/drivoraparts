/**
 * Merge WooCommerce store API dumps → edmunds-truck-parts.json + download images.
 *
 * 1. Fetch dumps (when site reachable):
 *    curl -o scripts/.edmunds-wc-page1.json "https://edmundstruckparts.com/wp-json/wc/store/v1/products?per_page=10&page=1"
 *    ... repeat pages 2–5
 *
 * 2. Or place WebFetch output JSON files in scripts/.edmunds-dumps/
 *
 * 3. Run: node scripts/merge-edmunds-wc-dump.mjs
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const DUMP_DIR = path.join(__dirname, ".edmunds-dumps");
const OUT_JSON = path.join(ROOT, "lib/inventory/data/edmunds-truck-parts.json");
const MEDIA_ROOT = path.join(ROOT, "public/product-media/truck-parts");
const START_ID = 1500;
const args = process.argv.slice(2);
const skipDownload = args.includes("--skip-download");

const AGENT_DUMP_FILES = [
  "C:/Users/solution info/.cursor/projects/c-Users-solution-info-Desktop-drivoraparts/agent-tools/d5e86568-7407-4c20-ba86-fbc1dae53f15.txt",
  "C:/Users/solution info/.cursor/projects/c-Users-solution-info-Desktop-drivoraparts/agent-tools/94411128-c330-49c7-b68d-5b4bed1ac780.txt",
  "C:/Users/solution info/.cursor/projects/c-Users-solution-info-Desktop-drivoraparts/agent-tools/12c15015-8d9c-498a-9c6b-00b234523d7b.txt",
  "C:/Users/solution info/.cursor/projects/c-Users-solution-info-Desktop-drivoraparts/agent-tools/dd7af6c1-eaaa-4a24-9579-645292a02c71.txt",
  "C:/Users/solution info/.cursor/projects/c-Users-solution-info-Desktop-drivoraparts/agent-tools/71919b87-c431-4f14-880d-6ca81fe53ebf.txt",
];

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

function wcPriceToUsd(prices) {
  if (!prices?.price) return 0;
  const minor = Number(prices.price);
  if (!Number.isFinite(minor)) return 0;
  return Math.round(minor / 100);
}

function resolveBrand(name, brands = []) {
  const hay = `${name} ${brands.join(" ")}`.toLowerCase();
  if (/\bgmc\b|\bsierra\b/.test(hay)) return "gmc";
  if (/\bchevy\b|\bchevrolet\b|\bsilverado\b/.test(hay)) return "chevrolet";
  if (/\bdodge\b|\bram\b/.test(hay)) return "dodge";
  if (/\bford\b|\bf-?150\b|\bf-?250\b|\bf-?350\b|\bsuper duty\b/.test(hay)) return "ford";
  if (/\bleer\b/.test(hay)) return "leer";
  if (/\bare\b/.test(hay)) return "universal";
  return "universal";
}

function resolveCategory(name, categories = []) {
  const hay = `${name} ${categories.map((c) => c.name).join(" ")}`.toLowerCase();
  if (/catalytic|exhaust|drivetrain|engine/i.test(hay)) return "engine";
  if (/tail light|lighting|led/i.test(hay)) return "lighting";
  if (/creeper|seating|tool|automotive tools/i.test(hay)) return "aftermarket";
  if (/camper|shell|topper|fiberglass|canopy|tailgate/i.test(hay)) return "aftermarket";
  return "body-parts";
}

function stripHtml(html = "") {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildDescription(name, html, fitment) {
  const body = stripHtml(html).slice(0, 1400);
  const fitmentLine = fitment
    ? `\nFitment: ${fitment}`
    : "\nFitment: Confirm year, bed length, and cab style at checkout.";

  return `${name}

${body || `${name} — rust-free truck component inspected and ready for install.`}${fitmentLine}

What you see is what you get — exact item, as pictured. Want it upgraded? Contact us — we can refurbish it to your spec.

Shipping
Freight / LTL quotes available on oversized truck beds and shells.`;
}

function extractFitment(name, tags = []) {
  const fromName = name.match(/(?:19|20)\d{2}[–-](?:19|20)\d{2}/);
  if (fromName) return fromName[0];
  const tag = tags.find((t) => /(?:19|20)\d{2}/.test(t.name));
  return tag?.name;
}

function extFromUrl(url) {
  const base = url.split("?")[0];
  const ext = path.extname(base).toLowerCase();
  if (ext === ".jpeg") return ".jpg";
  if ([".jpg", ".webp", ".png"].includes(ext)) return ext;
  return ".jpg";
}

function isPlaceholderUrl(url = "") {
  return /placeholder\.(jpe?g|png|webp)/i.test(url);
}

function normalizeImageUrls(images = []) {
  const unique = [];
  for (const img of images) {
    const url = typeof img === "string" ? img : img?.src;
    if (!url || isPlaceholderUrl(url)) continue;
    if (!unique.includes(url)) unique.push(url);
  }
  return unique;
}

async function downloadImages(imageUrls, slug) {
  if (skipDownload) return [];
  const dir = path.join(MEDIA_ROOT, slug);
  await fs.mkdir(dir, { recursive: true });
  const files = [];

  for (let i = 0; i < Math.min(imageUrls.length, 6); i += 1) {
    const url = imageUrls[i];
    const ext = extFromUrl(url);
    const name = `${i + 1}${ext}`;
    try {
      const res = await fetch(url, { headers: { "User-Agent": UA } });
      if (!res.ok) continue;
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 3000) continue;
      await fs.writeFile(path.join(dir, name), buf);
      files.push(name);
    } catch {
      // skip
    }
  }
  return files;
}

async function loadDumpFiles() {
  const bySlug = new Map();

  async function ingestFile(filePath) {
    try {
      const raw = await fs.readFile(filePath, "utf8");
      const rows = JSON.parse(raw);
      if (!Array.isArray(rows)) return;
      for (const row of rows) {
        if (row.slug) bySlug.set(row.slug, row);
      }
    } catch {
      // ignore missing
    }
  }

  for (const file of AGENT_DUMP_FILES) {
    await ingestFile(file);
  }

  try {
    const localFiles = await fs.readdir(DUMP_DIR);
    for (const file of localFiles) {
      if (file.endsWith(".json")) {
        await ingestFile(path.join(DUMP_DIR, file));
      }
    }
  } catch {
    // no dump dir
  }

  return [...bySlug.values()];
}

const wcProducts = await loadDumpFiles();
console.log(`Loaded ${wcProducts.length} unique WC products`);

const products = [];

for (let index = 0; index < wcProducts.length; index += 1) {
  const row = wcProducts[index];
  const name = stripHtml(row.name) || row.slug;
  const price = wcPriceToUsd(row.prices);
  if (price <= 0) continue;

  const slug = row.slug;
  const imageUrls = normalizeImageUrls(row.images ?? []);
  const files = skipDownload ? [] : await downloadImages(imageUrls, slug);
  const images =
    files.length > 0
      ? files.map((f) => `/product-media/truck-parts/${slug}/${f}`)
      : imageUrls.length > 0
        ? imageUrls.slice(0, 6)
        : ["/product-media/avatars/default.svg"];

  const fitment = extractFitment(name, row.tags ?? []);

  products.push({
    id: START_ID + index,
    name,
    category: resolveCategory(name, row.categories ?? []),
    brand: resolveBrand(name, (row.brands ?? []).map((b) => b.name)),
    price,
    stock: row.is_in_stock !== false,
    stockQty: 1,
    condition: "Used",
    warranty: "90-Day Functional Warranty",
    location: "USA Warehouse",
    fitment,
    thumbnail: images[0],
    images,
    description: buildDescription(name, row.description || row.short_description, fitment),
    createdAt: 1_742_000_000_000 - index,
    sourceSlug: slug,
  });
}

products.sort((a, b) => a.name.localeCompare(b.name));
products.forEach((p, i) => {
  p.id = START_ID + i;
});

await fs.mkdir(path.dirname(OUT_JSON), { recursive: true });
await fs.writeFile(OUT_JSON, JSON.stringify(products, null, 2));

console.log(`Wrote ${products.length} products → ${OUT_JSON}`);
if (products.length) {
  console.log(`IDs ${products[0].id}–${products[products.length - 1].id}`);
}
