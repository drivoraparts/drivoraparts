/**
 * Import 21 top tire SKUs (USA + Australia bestsellers).
 *
 * Usage:
 *   node scripts/import-tires.mjs
 *   node scripts/import-tires.mjs --skip-download
 */
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const OUT_JSON = path.join(ROOT, "lib/inventory/data/tires.json");
const MEDIA_ROOT = path.join(ROOT, "public/product-media/tires");
const START_ID = 1924;

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
const skipDownload = process.argv.includes("--skip-download");
const MAX_IMAGES = 6;

/** @typedef {"michelin-wedia"|"toyo"|"cooper"|"nitto"|"static"|"reference"} SourceType */

/** @param {string} url @returns {{ type: "michelin-wedia"; url: string }} */
function michelinWedia(url) {
  return { type: "michelin-wedia", url };
}

/** @param {string} slug @returns {{ type: "toyo"; slug: string; url: string }} */
function toyo(slug) {
  return {
    type: "toyo",
    slug,
    url: `https://www.toyotires.com/product/${slug}`,
  };
}

/** @param {string[]} urls @returns {{ type: "cooper"; urls: string[]; url: string }} */
function cooper(urls) {
  return {
    type: "cooper",
    urls,
    url: "https://www.coopertire.com/en_US/tires",
  };
}

/** @param {string} path @returns {{ type: "nitto"; path: string; url: string }} */
function nitto(path) {
  return {
    type: "nitto",
    path,
    url: `https://www.nittotire.com${path}`,
  };
}

/** @param {string[]} urls @param {string} [listingUrl] @returns {{ type: "static"; urls: string[]; url: string }} */
function staticImages(urls, listingUrl = "https://drivoraparts.com") {
  return { type: "static", urls, url: listingUrl };
}

/** @param {string} url @param {number} [priceHint] @returns {{ type: "reference"; url: string; priceHint?: number }} */
function reference(url, priceHint) {
  return { type: "reference", url, priceHint };
}

const COOPER_AT3 =
  "https://www.coopertire.com/dw/image/v2/BJQJ_PRD/on/demandware.static/-/Sites-goodyear-master-catalog/default/dwab6e94f0/images/large/Discoverer_AT3_XLT_24486.png";
const COOPER_STT =
  "https://www.coopertire.com/dw/image/v2/BJQJ_PRD/on/demandware.static/-/Sites-goodyear-master-catalog/default/dweb7f989b/images/large/Discoverer_STT_Pro_24494.png";
const YOKO_G015 = "https://ytc-bm.s3.us-east-2.amazonaws.com/Geolandar-White.png";

export const TIRE_SOURCES = [
  {
    name: "BFGoodrich All-Terrain T/A KO2 285/70R17",
    brand: "bfgoodrich",
    size: "285/70R17",
    segment: "All-Terrain / 4WD",
    priceHint: 329,
    topDemand: true,
    source: michelinWedia("https://www.bfgoodrichtires.com/auto/tires/all-terrain-t-a-ko2"),
  },
  {
    name: "BFGoodrich All-Terrain T/A KO2 265/65R17",
    brand: "bfgoodrich",
    size: "265/65R17",
    segment: "All-Terrain / 4WD",
    priceHint: 299,
    topDemand: true,
    source: michelinWedia("https://www.bfgoodrichtires.com/auto/tires/all-terrain-t-a-ko2"),
  },
  {
    name: "BFGoodrich Mud-Terrain T/A KM3 285/75R16",
    brand: "bfgoodrich",
    size: "285/75R16",
    segment: "All-Terrain / 4WD",
    priceHint: 349,
    source: michelinWedia("https://www.bfgoodrichtires.com/auto/tires/mud-terrain-t-a-km3"),
  },
  {
    name: "Toyo Open Country A/T III 265/65R17",
    brand: "toyo",
    size: "265/65R17",
    segment: "All-Terrain / 4WD",
    priceHint: 279,
    topDemand: true,
    source: toyo("open-country-at3/"),
  },
  {
    name: "Toyo Open Country R/T 285/70R17",
    brand: "toyo",
    size: "285/70R17",
    segment: "All-Terrain / 4WD",
    priceHint: 319,
    source: toyo("open-country-rt/"),
  },
  {
    name: "Toyo Proxes Sport 245/40R18",
    brand: "toyo",
    size: "245/40R18",
    segment: "Performance",
    priceHint: 219,
    source: toyo("proxes-sport/"),
  },
  {
    name: "Falken Wildpeak A/T3W 265/70R17",
    brand: "falken",
    size: "265/70R17",
    segment: "All-Terrain / 4WD",
    priceHint: 249,
    source: reference("https://www.falkentire.com/wildpeak/at3w", 249),
    photoSource: michelinWedia("https://www.bfgoodrichtires.com/auto/tires/all-terrain-t-a-ko2"),
  },
  {
    name: "Falken Wildpeak A/T4W 285/70R17",
    brand: "falken",
    size: "285/70R17",
    segment: "All-Terrain / 4WD",
    priceHint: 289,
    topDemand: true,
    source: reference("https://www.falkentire.com/wildpeak/at4w", 289),
    photoSource: michelinWedia("https://www.bfgoodrichtires.com/auto/tires/all-terrain-t-a-ko2"),
  },
  {
    name: "Falken Azenis FK510 255/35R19",
    brand: "falken",
    size: "255/35R19",
    segment: "Performance",
    priceHint: 239,
    source: reference("https://www.falkentire.com/azeins/fk510", 239),
    photoSource: michelinWedia("https://www.michelinman.com/auto/tires/michelin-pilot-sport-4s"),
  },
  {
    name: "Michelin Pilot Sport 4S 245/35ZR19",
    brand: "michelin",
    size: "245/35ZR19",
    segment: "Performance",
    priceHint: 389,
    topDemand: true,
    source: michelinWedia("https://www.michelinman.com/auto/tires/michelin-pilot-sport-4s"),
  },
  {
    name: "Michelin Pilot Sport 5 225/40R18",
    brand: "michelin",
    size: "225/40R18",
    segment: "Performance",
    priceHint: 329,
    source: michelinWedia("https://www.michelinman.com/auto/tires/michelin-pilot-sport-5"),
  },
  {
    name: "Michelin Defender LTX M/S 265/65R18",
    brand: "michelin",
    size: "265/65R18",
    segment: "Highway / SUV",
    priceHint: 279,
    topDemand: true,
    source: michelinWedia("https://www.michelinman.com/auto/tires/michelin-defender-ltx-m-s"),
  },
  {
    name: "Pirelli Scorpion All Terrain Plus 265/65R17",
    brand: "pirelli",
    size: "265/65R17",
    segment: "All-Terrain / 4WD",
    priceHint: 269,
    source: reference("https://www.pirelli.com/tires/en-us/car/catalog/scorpion-all-terrain-plus", 269),
    photoSource: michelinWedia("https://www.bfgoodrichtires.com/auto/tires/all-terrain-t-a-ko2"),
  },
  {
    name: "Pirelli P Zero 245/35ZR19",
    brand: "pirelli",
    size: "245/35ZR19",
    segment: "Performance",
    priceHint: 359,
    source: reference("https://www.pirelli.com/tires/en-us/car/catalog/p-zero", 359),
    photoSource: michelinWedia("https://www.michelinman.com/auto/tires/michelin-pilot-sport-4s"),
  },
  {
    name: "Nitto Ridge Grappler 285/70R17",
    brand: "nitto",
    size: "285/70R17",
    segment: "All-Terrain / 4WD",
    priceHint: 299,
    topDemand: true,
    source: nitto("/light-truck-tires/ridge-grappler-light-truck-tire/"),
  },
  {
    name: "Nitto Terra Grappler G2 265/70R17",
    brand: "nitto",
    size: "265/70R17",
    segment: "All-Terrain / 4WD",
    priceHint: 259,
    source: nitto("/tires/terra-grappler-g2"),
  },
  {
    name: "Nitto NT555 G2 275/35R20",
    brand: "nitto",
    size: "275/35R20",
    segment: "Performance",
    priceHint: 279,
    source: nitto("/car-tires/nt555-g2-ultra-high-performance-tire/"),
  },
  {
    name: "Cooper Discoverer AT3 XLT 265/70R17",
    brand: "cooper",
    size: "265/70R17",
    segment: "All-Terrain / 4WD",
    priceHint: 249,
    topDemand: true,
    source: cooper([COOPER_AT3]),
  },
  {
    name: "Cooper Discoverer STT Pro 285/75R16",
    brand: "cooper",
    size: "285/75R16",
    segment: "All-Terrain / 4WD",
    priceHint: 319,
    source: cooper([COOPER_STT]),
  },
  {
    name: "Yokohama Geolandar A/T G015 265/65R17",
    brand: "yokohama",
    size: "265/65R17",
    segment: "All-Terrain / 4WD",
    priceHint: 239,
    topDemand: true,
    source: staticImages([YOKO_G015], "https://www.yokohamatire.com/tire/geolandar-a-t-g015"),
  },
  {
    name: "Yokohama Advan Sport V107 255/35R19",
    brand: "yokohama",
    size: "255/35R19",
    segment: "Performance",
    priceHint: 329,
    source: reference("https://www.yokohamatire.com/tire/advan-sport-v107", 329),
    photoSource: toyo("proxes-sport/"),
  },
];

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 72);
}

function stripHtml(html = "") {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizePrice(raw, hint) {
  const n = typeof raw === "string" ? parseFloat(raw.replace(/,/g, "")) : raw;
  if (!n || Number.isNaN(n)) return hint;
  if (n > 800 || n < 150) return hint;
  return Math.round(n * 100) / 100;
}

function buildDescription(name, body, size, segment) {
  const intro =
    stripHtml(body).slice(0, 900) ||
    `${name} — premium ${segment.toLowerCase()} tire with proven tread design, strong wet traction, and durable construction for daily driving and adventure use.`;
  return `${name}

${intro}

Size: ${size}
Category: ${segment}

Shipping
Single-tire and full-set orders ship from USA inventory — contact for freight quotes on oversized LT/mud-terrain sizes and international delivery.`;
}

function parseWediaImages(html) {
  const urls = [
    ...new Set(
      [...html.matchAll(/https:\/\/dxm\.contentcenter\.michelin\.com\/api\/wedia\/dam\/transform\/[^"'\s>&]+\.webp/gi)].map(
        (m) => m[0].split("&quot;")[0].split('"')[0]
      )
    ),
  ];
  return urls.map((u) => (u.includes("?") ? u : `${u}?t=resize&width=1200`));
}

function parseNittoImages(html) {
  const urls = [
    ...html.matchAll(/https:\/\/www\.nittotire\.com\/(?:media|s3\/nitto-umbraco\/media)\/[^"'\s>]+\.(?:png|jpg|jpeg|webp)/gi),
  ].map((m) => m[0].replace(/&amp;/g, "&"));
  const rel = [
    ...html.matchAll(/\/media\/[a-z0-9]+\/[^"'\s?)>]+\.(?:png|jpg|jpeg|webp)/gi),
  ].map((m) => `https://www.nittotire.com${m[0]}`);
  return [...new Set([...urls, ...rel])].filter(
    (u) => !/logo|icon|menu|nav_|light-truck-tires\.png|car-tires\.png|competition_menu|heavyduty_menu|suv_cuv/i.test(u)
  );
}

async function fetchMichelinWediaMeta(source) {
  const res = await fetch(source.url, {
    headers: { "User-Agent": UA, Accept: "text/html" },
  });
  if (!res.ok) throw new Error(`Michelin/BFG ${res.status} ${source.url}`);
  const html = await res.text();
  const ogDesc = html.match(/property="og:description"\s+content="([^"]+)"/i)?.[1] ?? "";
  return {
    sourceUrl: source.url,
    price: 0,
    description: ogDesc,
    imageUrls: parseWediaImages(html).slice(0, MAX_IMAGES * 2),
  };
}

async function fetchToyoMeta(source) {
  const res = await fetch(source.url, {
    headers: { "User-Agent": UA, Accept: "text/html" },
  });
  if (!res.ok) throw new Error(`Toyo ${res.status} ${source.url}`);
  const html = await res.text();
  const imageUrls = [
    ...new Set(
      [...html.matchAll(/https:\/\/www\.toyotires\.com\/media\/[^"'\s>]+\.(?:jpg|jpeg|png|webp)/gi)].map((m) => m[0])
    ),
  ].filter((u) => !/404|error/i.test(u));
  const ogDesc = html.match(/property="og:description"\s+content="([^"]+)"/i)?.[1] ?? "";
  return {
    sourceUrl: source.url,
    price: 0,
    description: ogDesc,
    imageUrls,
  };
}

async function fetchCooperMeta(source) {
  return {
    sourceUrl: source.url,
    price: 0,
    description: "",
    imageUrls: source.urls.slice(0, MAX_IMAGES),
  };
}

async function fetchNittoMeta(source) {
  const res = await fetch(source.url, {
    headers: { "User-Agent": UA, Accept: "text/html" },
  });
  if (!res.ok) throw new Error(`Nitto ${res.status} ${source.url}`);
  const html = await res.text();
  const ogDesc = html.match(/property="og:description"\s+content="([^"]+)"/i)?.[1] ?? "";
  return {
    sourceUrl: source.url,
    price: 0,
    description: ogDesc,
    imageUrls: parseNittoImages(html).slice(0, MAX_IMAGES * 2),
  };
}

async function fetchStaticMeta(source) {
  return {
    sourceUrl: source.url,
    price: 0,
    description: "",
    imageUrls: source.urls.slice(0, MAX_IMAGES),
  };
}

async function fetchReferenceMeta(source, priceHint) {
  const res = await fetch(source.url, {
    headers: { "User-Agent": UA, Accept: "text/html" },
  }).catch(() => null);
  const ogDesc =
    res?.ok
      ? (await res.text()).match(/property="og:description"\s+content="([^"]+)"/i)?.[1] ?? ""
      : "";
  return {
    sourceUrl: source.url,
    price: source.priceHint ?? priceHint,
    description: ogDesc,
    imageUrls: [],
  };
}

async function resolveSource(source, priceHint) {
  let meta;
  switch (source.type) {
    case "michelin-wedia":
      meta = await fetchMichelinWediaMeta(source);
      break;
    case "toyo":
      meta = await fetchToyoMeta(source);
      break;
    case "cooper":
      meta = await fetchCooperMeta(source);
      break;
    case "nitto":
      meta = await fetchNittoMeta(source);
      break;
    case "static":
      meta = await fetchStaticMeta(source);
      break;
    case "reference":
      meta = await fetchReferenceMeta(source, priceHint);
      break;
    default:
      throw new Error(`Unknown source type ${source.type}`);
  }
  return {
    ...meta,
    price: meta.price > 0 ? meta.price : priceHint,
    imageUrls: meta.imageUrls.slice(0, MAX_IMAGES * 2),
  };
}

async function downloadImages(imageUrls, slug) {
  if (skipDownload || !imageUrls.length) return [];

  const dir = path.join(MEDIA_ROOT, slug);
  await fs.mkdir(dir, { recursive: true });

  const seenHashes = new Set();
  const saved = [];

  for (const url of imageUrls) {
    if (saved.length >= MAX_IMAGES) break;
    const extMatch = url.match(/\.(jpe?g|png|webp)(?:\?|$)/i);
    const ext = extMatch ? extMatch[1].toLowerCase().replace("jpeg", "jpg") : "jpg";

    try {
      const res = await fetch(url, { headers: { "User-Agent": UA } });
      if (!res.ok) continue;
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 800) continue;
      if (buf.length >= 24437 && buf.length <= 24637) continue;

      const hash = crypto.createHash("sha256").update(buf).digest("hex");
      if (seenHashes.has(hash)) continue;
      seenHashes.add(hash);

      const filename = `${saved.length + 1}.${ext}`;
      await fs.writeFile(path.join(dir, filename), buf);
      saved.push(filename);
    } catch {
      /* skip */
    }
  }

  return saved;
}

const products = [];

for (let i = 0; i < TIRE_SOURCES.length; i++) {
  const item = TIRE_SOURCES[i];
  const slug = slugify(item.name);
  console.log(`[${i + 1}/${TIRE_SOURCES.length}] ${item.name}`);

  const listingMeta = await resolveSource(item.source, item.priceHint);
  const photoMeta = item.photoSource
    ? await resolveSource(item.photoSource, item.priceHint)
    : listingMeta;

  const imageUrls = photoMeta.imageUrls.length ? photoMeta.imageUrls : listingMeta.imageUrls;

  if (!imageUrls.length) {
    throw new Error(`No source images for ${slug}`);
  }

  const imageFiles = await downloadImages(imageUrls, slug);
  const mediaBase = `/product-media/tires/${slug}`;
  const existingFiles = skipDownload
    ? (await fs.readdir(path.join(MEDIA_ROOT, slug)).catch(() => []))
        .filter((f) => /\.(jpe?g|png|webp)$/i.test(f))
        .sort()
    : [];

  const files = imageFiles.length > 0 ? imageFiles : existingFiles;
  if (!files.length) {
    throw new Error(`No images downloaded for ${slug}`);
  }

  const images = files.map((f) => `${mediaBase}/${f}`);
  const price = item.source.type === "reference" ? item.priceHint : listingMeta.price;

  const product = {
    id: START_ID + i,
    name: item.name,
    category: "wheels-tires",
    brand: item.brand,
    price,
    stock: true,
    stockQty: 8,
    condition: "brand-new",
    warranty: "Manufacturer Warranty",
    location: "USA Warehouse",
    fitment: item.size,
    thumbnail: images[0],
    images,
    image: images[0],
    description: buildDescription(
      item.name,
      listingMeta.description,
      item.size,
      item.segment
    ),
    sourceUrl: listingMeta.sourceUrl,
    sourceSlug: slug,
    createdAt: 1_751_950_000_000 - i,
  };

  if (item.topDemand) {
    product.topDemand = true;
  }

  products.push(product);
  console.log(`  ${images.length} gallery slide(s), $${price}`);
}

await fs.mkdir(path.dirname(OUT_JSON), { recursive: true });
await fs.writeFile(OUT_JSON, JSON.stringify(products, null, 2));
console.log(`\nWrote ${products.length} products → ${OUT_JSON}`);
