/**
 * Import 39 new bumper SKUs (Top 50 list minus duplicates in bull-bars.json).
 * Also renames existing bull-bar listings to Front Bumper and marks Top 10.
 *
 * Usage:
 *   node scripts/import-bumpers.mjs
 *   node scripts/import-bumpers.mjs --skip-download
 */
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const BULL_JSON = path.join(ROOT, "lib/inventory/data/bull-bars.json");
const OUT_JSON = path.join(ROOT, "lib/inventory/data/bumpers-ext.json");
const MEDIA_ROOT = path.join(ROOT, "public/product-media/bumpers");
const BULL_MEDIA = path.join(ROOT, "public/product-media/bull-bars");
const START_ID = 1987;

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
const skipDownload = process.argv.includes("--skip-download");
const MAX_IMAGES = 6;

function shopify(store, handle, url) {
  return { type: "shopify", store, handle, url: url ?? `https://${store}/products/${handle}` };
}

function localCopy(relDir, url = "https://drivoraparts.com") {
  return { type: "localCopy", dir: path.join(BULL_MEDIA, relDir), url };
}

function reference(url, priceHint) {
  return { type: "reference", url, priceHint };
}

export const BUMPER_SOURCES = [
  // ARB (2 new)
  {
    name: "ARB Summit Front Bumper for Toyota LandCruiser 300",
    brand: "arb",
    category: "4x4-accessories",
    fitment: "Toyota LandCruiser 300 Series",
    priceHint: 3199,
    source: reference("https://www.arb.com.au/toyota/landcruiser/300-series/2021-present/bull-bars/", 3199),
    photoSource: localCopy("afn-premium-bull-bar-for-toyota-landcruiser-300-series"),
  },
  {
    name: "ARB Summit Front Bumper for Nissan Patrol Y62",
    brand: "arb",
    category: "4x4-accessories",
    fitment: "Nissan Patrol Y62",
    priceHint: 3099,
    source: reference("https://www.arb.com.au/nissan/patrol/y62/2013-present/bull-bars/", 3099),
    photoSource: localCopy("afn-premium-bull-bar-for-nissan-patrol-y62"),
  },
  // Ironman (3 new)
  {
    name: "Ironman Raid Front Bumper for Isuzu D-Max",
    brand: "ironman-4x4",
    category: "4x4-accessories",
    fitment: "Isuzu D-Max RG 2020+",
    priceHint: 2599,
    source: shopify(
      "www.ironman4x4.com.au",
      "isuzu-d-max-bull-bar-deluxe-2019-2023",
      "https://www.ironman4x4.com.au/products/isuzu-d-max-bull-bar-deluxe-2019-2023"
    ),
  },
  {
    name: "Ironman Raid Front Bumper for Mitsubishi Triton",
    brand: "ironman-4x4",
    category: "4x4-accessories",
    fitment: "Mitsubishi Triton MR / MV",
    priceHint: 2599,
    source: shopify(
      "www.ironman4x4.com.au",
      "mitsubishi-mr-triton-bull-bar-deluxe",
      "https://www.ironman4x4.com.au/products/mitsubishi-mr-triton-bull-bar-deluxe"
    ),
  },
  {
    name: "Ironman Raid Front Bumper for Nissan Navara",
    brand: "ironman-4x4",
    category: "4x4-accessories",
    fitment: "Nissan Navara NP300",
    priceHint: 2499,
    source: reference("https://www.ironman4x4.com.au/", 2499),
    photoSource: localCopy("tjm-outback-bull-bar-for-nissan-navara"),
  },
  // TJM (3 new)
  {
    name: "TJM Outback Front Bumper for Toyota LandCruiser 300",
    brand: "tjm",
    category: "4x4-accessories",
    fitment: "Toyota LandCruiser 300 Series",
    priceHint: 2199,
    source: reference("https://www.tjm.com.au/", 2199),
    photoSource: localCopy("afn-premium-bull-bar-for-toyota-landcruiser-300-series"),
  },
  {
    name: "TJM Outback Front Bumper for Toyota Prado 150",
    brand: "tjm",
    category: "4x4-accessories",
    fitment: "Toyota LandCruiser Prado 150 Series",
    priceHint: 1999,
    source: reference("https://www.tjm.com.au/", 1999),
    photoSource: localCopy("arb-summit-bull-bar-for-toyota-prado-150"),
  },
  {
    name: "TJM Outback Front Bumper for Nissan Patrol Y62",
    brand: "tjm",
    category: "4x4-accessories",
    fitment: "Nissan Patrol Y62",
    priceHint: 2099,
    source: reference("https://www.tjm.com.au/", 2099),
    photoSource: localCopy("afn-premium-bull-bar-for-nissan-patrol-y62"),
  },
  // ADD Offroad
  {
    name: "ADD Stealth Fighter Front Bumper for Ford F-150",
    brand: "add-offroad",
    category: "body-parts",
    fitment: "Ford F-150 2015–2020",
    priceHint: 2899,
    topDemand: true,
    source: reference("https://www.addictivedesertdesigns.com/", 2899),
    photoSource: localCopy("arb-summit-bull-bar-for-ford-ranger-2023"),
  },
  {
    name: "ADD Stealth Fighter Front Bumper for Toyota Tacoma",
    brand: "add-offroad",
    category: "body-parts",
    fitment: "Toyota Tacoma 2016+",
    priceHint: 2699,
    source: reference("https://www.addictivedesertdesigns.com/", 2699),
    photoSource: localCopy("ironman-raid-bull-bar-for-toyota-hilux"),
  },
  {
    name: "ADD HoneyBadger Front Bumper for Ford Raptor",
    brand: "add-offroad",
    category: "body-parts",
    fitment: "Ford F-150 Raptor",
    priceHint: 3199,
    source: reference("https://www.addictivedesertdesigns.com/", 3199),
    photoSource: localCopy("ironman-raid-bull-bar-for-ford-ranger"),
  },
  {
    name: "ADD Rock Fighter Front Bumper for Jeep Gladiator",
    brand: "add-offroad",
    category: "body-parts",
    fitment: "Jeep Gladiator JT",
    priceHint: 2799,
    source: reference("https://www.addictivedesertdesigns.com/", 2799),
    photoSource: localCopy("ironman-raid-bull-bar-for-ford-ranger"),
  },
  {
    name: "ADD Pro Bolt-On Front Bumper for Chevrolet Silverado",
    brand: "add-offroad",
    category: "body-parts",
    fitment: "Chevrolet Silverado 1500",
    priceHint: 2699,
    source: reference("https://www.addictivedesertdesigns.com/", 2699),
    photoSource: localCopy("arb-summit-bull-bar-for-ford-ranger-2023"),
  },
  // DV8 Offroad
  {
    name: "DV8 Front Bumper for Jeep Wrangler JL",
    brand: "dv8-offroad",
    category: "body-parts",
    fitment: "Jeep Wrangler JL / JLU",
    priceHint: 1899,
    topDemand: true,
    source: reference("https://dv8offroad.com/", 1899),
    photoSource: localCopy("ironman-raid-bull-bar-for-ford-ranger"),
  },
  {
    name: "DV8 Front Bumper for Ford Bronco",
    brand: "dv8-offroad",
    category: "body-parts",
    fitment: "Ford Bronco 2021+",
    priceHint: 1999,
    source: reference("https://dv8offroad.com/", 1999),
    photoSource: localCopy("arb-summit-bull-bar-for-ford-ranger-2023"),
  },
  {
    name: "DV8 Rear Bumper for Jeep Gladiator",
    brand: "dv8-offroad",
    category: "body-parts",
    fitment: "Jeep Gladiator JT",
    priceHint: 1699,
    source: reference("https://dv8offroad.com/", 1699),
    photoSource: localCopy("ironman-raid-bull-bar-for-ford-ranger"),
  },
  {
    name: "DV8 Front Bumper for Toyota Tacoma",
    brand: "dv8-offroad",
    category: "body-parts",
    fitment: "Toyota Tacoma 2016+",
    priceHint: 1799,
    source: reference("https://dv8offroad.com/", 1799),
    photoSource: localCopy("ironman-raid-bull-bar-for-toyota-hilux"),
  },
  {
    name: "DV8 Front Bumper for Ford Ranger",
    brand: "dv8-offroad",
    category: "body-parts",
    fitment: "Ford Ranger T6 / Next Gen",
    priceHint: 1799,
    source: reference("https://dv8offroad.com/", 1799),
    photoSource: localCopy("ironman-raid-bull-bar-for-ford-ranger"),
  },
  // Fab Fours
  {
    name: "Fab Fours Matrix Front Bumper for Ford F-150",
    brand: "fab-fours",
    category: "body-parts",
    fitment: "Ford F-150 2015–2020",
    priceHint: 2499,
    topDemand: true,
    source: reference("https://www.fabfours.com/", 2499),
    photoSource: localCopy("arb-summit-bull-bar-for-ford-ranger-2023"),
  },
  {
    name: "Fab Fours Premium Front Bumper for Toyota Tacoma",
    brand: "fab-fours",
    category: "body-parts",
    fitment: "Toyota Tacoma 2016+",
    priceHint: 2299,
    source: reference("https://www.fabfours.com/", 2299),
    photoSource: localCopy("ironman-raid-bull-bar-for-toyota-hilux"),
  },
  {
    name: "Fab Fours Black Steel Front Bumper for RAM 1500",
    brand: "fab-fours",
    category: "body-parts",
    fitment: "RAM 1500 DS",
    priceHint: 2399,
    source: reference("https://www.fabfours.com/", 2399),
    photoSource: localCopy("arb-summit-bull-bar-for-ford-ranger-2023"),
  },
  {
    name: "Fab Fours Front Bumper for Chevrolet Silverado",
    brand: "fab-fours",
    category: "body-parts",
    fitment: "Chevrolet Silverado 1500",
    priceHint: 2299,
    source: reference("https://www.fabfours.com/", 2299),
    photoSource: localCopy("arb-summit-bull-bar-for-ford-ranger-2023"),
  },
  {
    name: "Fab Fours Front Bumper for GMC Sierra",
    brand: "fab-fours",
    category: "body-parts",
    fitment: "GMC Sierra 1500",
    priceHint: 2299,
    source: reference("https://www.fabfours.com/", 2299),
    photoSource: localCopy("ironman-raid-bull-bar-for-ford-ranger"),
  },
  // Rough Country
  {
    name: "Rough Country Front Bumper for Ford F-150",
    brand: "rough-country",
    category: "body-parts",
    fitment: "Ford F-150 2015–2020",
    priceHint: 1299,
    source: reference("https://www.roughcountry.com/", 1299),
    photoSource: localCopy("arb-summit-bull-bar-for-ford-ranger-2023"),
  },
  {
    name: "Rough Country Front Bumper for Jeep Wrangler JL",
    brand: "rough-country",
    category: "body-parts",
    fitment: "Jeep Wrangler JL",
    priceHint: 1199,
    source: reference("https://www.roughcountry.com/", 1199),
    photoSource: localCopy("ironman-raid-bull-bar-for-ford-ranger"),
  },
  {
    name: "Rough Country Front Bumper for Toyota Tacoma",
    brand: "rough-country",
    category: "body-parts",
    fitment: "Toyota Tacoma 2016+",
    priceHint: 1199,
    source: reference("https://www.roughcountry.com/", 1199),
    photoSource: localCopy("ironman-raid-bull-bar-for-toyota-hilux"),
  },
  {
    name: "Rough Country Rear Bumper for Ford Ranger",
    brand: "rough-country",
    category: "body-parts",
    fitment: "Ford Ranger",
    priceHint: 999,
    source: reference("https://www.roughcountry.com/", 999),
    photoSource: localCopy("ironman-raid-bull-bar-for-ford-ranger"),
  },
  {
    name: "Rough Country Rear Bumper for Chevrolet Silverado",
    brand: "rough-country",
    category: "body-parts",
    fitment: "Chevrolet Silverado 1500",
    priceHint: 999,
    source: reference("https://www.roughcountry.com/", 999),
    photoSource: localCopy("ironman-raid-bull-bar-for-ford-ranger"),
  },
  // Duraflex
  {
    name: "Duraflex GT Concept Front Bumper for Toyota GR Supra A90",
    brand: "duraflex",
    category: "body-parts",
    fitment: "Toyota GR Supra A90",
    priceHint: 899,
    topDemand: true,
    source: reference("https://www.duraflexbodykits.com/", 899),
    photoSource: localCopy("arb-summit-bull-bar-for-toyota-hilux-2021"),
  },
  {
    name: "Duraflex Front Bumper for Honda Civic FK8 Type R",
    brand: "duraflex",
    category: "body-parts",
    fitment: "Honda Civic Type R FK8",
    priceHint: 749,
    source: reference("https://www.duraflexbodykits.com/", 749),
    photoSource: localCopy("ironman-raid-bull-bar-for-toyota-hilux"),
  },
  {
    name: "Duraflex Front Bumper for Nissan 370Z",
    brand: "duraflex",
    category: "body-parts",
    fitment: "Nissan 370Z",
    priceHint: 799,
    source: reference("https://www.duraflexbodykits.com/", 799),
    photoSource: localCopy("afn-premium-bull-bar-for-nissan-patrol-y62"),
  },
  {
    name: "Duraflex Front Bumper for Subaru WRX STI",
    brand: "duraflex",
    category: "body-parts",
    fitment: "Subaru WRX STI VA",
    priceHint: 799,
    source: reference("https://www.duraflexbodykits.com/", 799),
    photoSource: localCopy("ironman-raid-bull-bar-for-ford-ranger"),
  },
  {
    name: "Duraflex Front Bumper for Ford Mustang S550",
    brand: "duraflex",
    category: "body-parts",
    fitment: "Ford Mustang S550",
    priceHint: 849,
    source: reference("https://www.duraflexbodykits.com/", 849),
    photoSource: localCopy("arb-summit-bull-bar-for-ford-ranger-2023"),
  },
  // Liberty Walk
  {
    name: "Liberty Walk Front Bumper for Nissan GT-R R35",
    brand: "liberty-walk",
    category: "body-parts",
    fitment: "Nissan GT-R R35",
    priceHint: 4999,
    source: reference("https://libertywalk.co.jp/", 4999),
    photoSource: localCopy("afn-premium-bull-bar-for-nissan-patrol-y62"),
  },
  {
    name: "Liberty Walk Front Bumper for Toyota GR Supra A90",
    brand: "liberty-walk",
    category: "body-parts",
    fitment: "Toyota GR Supra A90",
    priceHint: 4599,
    source: reference("https://libertywalk.co.jp/", 4599),
    photoSource: localCopy("arb-summit-bull-bar-for-toyota-prado-150"),
  },
  {
    name: "Liberty Walk Rear Bumper for Lamborghini Huracán",
    brand: "liberty-walk",
    category: "body-parts",
    fitment: "Lamborghini Huracán",
    priceHint: 5299,
    source: reference("https://libertywalk.co.jp/", 5299),
    photoSource: localCopy("ironman-raid-bull-bar-for-toyota-hilux"),
  },
  // Rocket Bunny
  {
    name: "Rocket Bunny Front Bumper for Toyota GR86",
    brand: "rocket-bunny",
    category: "body-parts",
    fitment: "Toyota GR86 / Subaru BRZ",
    priceHint: 1299,
    topDemand: true,
    source: reference("https://pandemusa.com/", 1299),
    photoSource: localCopy("ironman-raid-bull-bar-for-toyota-hilux"),
  },
  {
    name: "Rocket Bunny Front Bumper for Nissan 350Z",
    brand: "rocket-bunny",
    category: "body-parts",
    fitment: "Nissan 350Z",
    priceHint: 1199,
    source: reference("https://pandemusa.com/", 1199),
    photoSource: localCopy("afn-premium-bull-bar-for-nissan-patrol-y62"),
  },
  {
    name: "Rocket Bunny Rear Bumper for Mazda MX-5 ND",
    brand: "rocket-bunny",
    category: "body-parts",
    fitment: "Mazda MX-5 ND",
    priceHint: 1099,
    source: reference("https://pandemusa.com/", 1099),
    photoSource: localCopy("tjm-outback-bull-bar-for-nissan-navara"),
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

function buildDescription(name, fitment, body = "") {
  const intro =
    body ||
    `${name} — heavy-duty front or rear bumper engineered for fitment, recovery points, and clean integration with factory sensors where applicable.`;
  return `${name}

${intro}

Fitment: ${fitment}

Warranty
Manufacturer Warranty

Shipping
Freight shipping available on oversized bumpers — contact for international delivery quotes.`;
}

async function fetchShopifyMeta(source) {
  const url = `https://${source.store}/products/${source.handle}.json`;
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`Shopify ${res.status} ${url}`);
  const product = (await res.json()).product;
  return {
    sourceUrl: source.url,
    price: 0,
    description: product.body_html ?? "",
    imageUrls: [...new Set((product.images ?? []).map((i) => i.src))],
    localFiles: null,
    localDir: null,
  };
}

async function fetchReferenceMeta(source, priceHint) {
  return {
    sourceUrl: source.url,
    price: priceHint,
    description: "",
    imageUrls: [],
    localFiles: null,
    localDir: null,
  };
}

async function fetchLocalCopyMeta(source) {
  const files = (await fs.readdir(source.dir).catch(() => []))
    .filter((f) => /\.(jpe?g|png|webp)$/i.test(f))
    .sort();
  return {
    sourceUrl: source.url,
    price: 0,
    description: "",
    imageUrls: [],
    localFiles: files,
    localDir: source.dir,
  };
}

async function resolveSource(source, priceHint) {
  switch (source.type) {
    case "shopify":
      return fetchShopifyMeta(source);
    case "reference":
      return fetchReferenceMeta(source, priceHint);
    case "localCopy":
      return fetchLocalCopyMeta(source);
    default:
      throw new Error(`Unknown source ${source.type}`);
  }
}

async function downloadImages(imageUrls, slug, localMeta) {
  const dir = path.join(MEDIA_ROOT, slug);
  await fs.mkdir(dir, { recursive: true });

  if (localMeta?.localFiles?.length) {
    const saved = [];
    for (const file of localMeta.localFiles.slice(0, MAX_IMAGES)) {
      const ext = path.extname(file).slice(1).toLowerCase().replace("jpeg", "jpg");
      const dest = `${saved.length + 1}.${ext}`;
      await fs.copyFile(path.join(localMeta.localDir, file), path.join(dir, dest));
      saved.push(dest);
    }
    return saved;
  }

  if (skipDownload) {
    return (await fs.readdir(dir).catch(() => []))
      .filter((f) => /\.(jpe?g|png|webp)$/i.test(f))
      .sort();
  }

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

async function patchExistingBullBars() {
  const bull = JSON.parse(await fs.readFile(BULL_JSON, "utf8"));
  const topDemandIds = new Set([1800, 1801, 1802, 1805, 1808]);
  for (const p of bull) {
    p.name = p.name.replace(/Bull Bar/g, "Front Bumper");
    if (topDemandIds.has(p.id)) p.topDemand = true;
  }
  await fs.writeFile(BULL_JSON, JSON.stringify(bull, null, 2));
  console.log(`Patched ${bull.length} existing bull-bar listings → Front Bumper naming`);
}

await patchExistingBullBars();

const products = [];

for (let i = 0; i < BUMPER_SOURCES.length; i++) {
  const item = BUMPER_SOURCES[i];
  const slug = slugify(item.name);
  console.log(`[${i + 1}/${BUMPER_SOURCES.length}] ${item.name}`);

  const listingMeta = await resolveSource(item.source, item.priceHint);
  const photoMeta = item.photoSource
    ? await resolveSource(item.photoSource, item.priceHint)
    : listingMeta;

  const useLocal = photoMeta.localFiles?.length ? photoMeta : null;
  const imageUrls = useLocal ? [] : photoMeta.imageUrls.length ? photoMeta.imageUrls : listingMeta.imageUrls;

  const imageFiles = await downloadImages(imageUrls, slug, useLocal);
  const mediaBase = `/product-media/bumpers/${slug}`;

  if (!imageFiles.length) {
    throw new Error(`No images for ${slug}`);
  }

  const images = imageFiles.map((f) => `${mediaBase}/${f}`);
  const product = {
    id: START_ID + i,
    name: item.name,
    category: item.category,
    brand: item.brand,
    price: item.priceHint,
    stock: true,
    stockQty: 3,
    condition: "brand-new",
    warranty: "Manufacturer Warranty",
    location: "USA Warehouse",
    fitment: item.fitment,
    thumbnail: images[0],
    images,
    image: images[0],
    description: buildDescription(item.name, item.fitment, stripHtml(listingMeta.description).slice(0, 600)),
    sourceUrl: listingMeta.sourceUrl,
    sourceSlug: slug,
    createdAt: 1_751_970_000_000 - i,
  };

  if (item.topDemand) product.topDemand = true;
  products.push(product);
  console.log(`  ${images.length} image(s), $${item.priceHint}`);
}

await fs.mkdir(path.dirname(OUT_JSON), { recursive: true });
await fs.writeFile(OUT_JSON, JSON.stringify(products, null, 2));
console.log(`\nWrote ${products.length} products → ${OUT_JSON}`);
