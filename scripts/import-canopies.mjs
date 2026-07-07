/**
 * Import Top 50 high-demand canopy SKUs (USA + Australia).
 *
 * Usage:
 *   node scripts/import-canopies.mjs
 *   node scripts/import-canopies.mjs --skip-download
 */
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const OUT_JSON = path.join(ROOT, "lib/inventory/data/canopies-ext.json");
const MEDIA_ROOT = path.join(ROOT, "public/product-media/canopy");
const AFTERMARKET_MEDIA = path.join(ROOT, "public/product-media/aftermarket");
const START_ID = 2026;

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
const skipDownload = process.argv.includes("--skip-download");
const MAX_IMAGES = 6;

const PHOTO_DIRS = {
  arb: path.join(
    AFTERMARKET_MEDIA,
    "ARB classic plus Canopy for 2016 Toyota Hilux Dual Cab"
  ),
  leer: path.join(AFTERMARKET_MEDIA, "leer-100xr"),
  "leer-shell": path.join(AFTERMARKET_MEDIA, "leer-camper-shell"),
  snugtop: path.join(AFTERMARKET_MEDIA, "camper-shell-snugtop"),
  alloy: path.join(AFTERMARKET_MEDIA, "alloy-ute-canopy"),
  generic: path.join(MEDIA_ROOT, "BRAND NEW CANOPY - TOYOTA LC79"),
};

function reference(url, priceHint) {
  return { type: "reference", url, priceHint };
}

function localCopy(dirKey, url = "https://drivoraparts.com") {
  return { type: "localCopy", dir: PHOTO_DIRS[dirKey] ?? PHOTO_DIRS.generic, url };
}

/** @type {Array<{name:string,brand:string,fitment:string,price:number,topDemand?:boolean,photo?:keyof PHOTO_DIRS,url?:string}>} */
export const CANOPY_SOURCES = [
  { name: "ARB Ascent Canopy", brand: "arb", fitment: "Toyota Hilux / Ford Ranger dual cab", price: 4699, topDemand: true, photo: "arb", url: "https://www.arb.com.au/" },
  { name: "ARB Classic Canopy", brand: "arb", fitment: "Toyota Hilux dual cab", price: 3899, topDemand: true, photo: "arb", url: "https://www.arb.com.au/" },
  { name: "ARB Commercial Canopy", brand: "arb", fitment: "Ford Ranger / Isuzu D-Max dual cab", price: 3599, topDemand: true, photo: "arb", url: "https://www.arb.com.au/" },
  { name: "ARB Pinnacle Canopy", brand: "arb", fitment: "Toyota LandCruiser 300 dual cab", price: 5299, topDemand: true, photo: "arb", url: "https://www.arb.com.au/" },
  { name: "RSI SmartCap EVO Adventure", brand: "rsi-smartcap", fitment: "Ford F-150 / RAM 1500", price: 4299, topDemand: true, photo: "generic", url: "https://www.rsicap.com/" },
  { name: "RSI SmartCap EVO Sport", brand: "rsi-smartcap", fitment: "Toyota Tacoma / Chevrolet Colorado", price: 3999, topDemand: true, photo: "generic", url: "https://www.rsicap.com/" },
  { name: "RSI SmartCap EVO Commercial", brand: "rsi-smartcap", fitment: "Ford F-250 / RAM 2500", price: 4499, topDemand: true, photo: "generic", url: "https://www.rsicap.com/" },
  { name: "Alu-Cab Explorer Canopy", brand: "alu-cab", fitment: "Toyota Hilux / Ford Ranger", price: 5899, topDemand: true, photo: "alloy", url: "https://alucab.com/" },
  { name: "Alu-Cab Canopy Camper", brand: "alu-cab", fitment: "Toyota LandCruiser 79 / 300", price: 7499, topDemand: true, photo: "alloy", url: "https://alucab.com/" },
  { name: "Aeroklas Premium Canopy", brand: "aeroklas", fitment: "Ford Ranger / Toyota Hilux", price: 3299, topDemand: true, photo: "generic", url: "https://www.aeroklas.com.au/" },
  { name: "Aeroklas Stylish Canopy", brand: "aeroklas", fitment: "Isuzu D-Max / Mitsubishi Triton", price: 2999, photo: "generic", url: "https://www.aeroklas.com.au/" },
  { name: "Aeroklas Commercial Canopy", brand: "aeroklas", fitment: "Ford Ranger PX3 / Next Gen", price: 2799, photo: "generic", url: "https://www.aeroklas.com.au/" },
  { name: "EGR Premium Canopy", brand: "egr", fitment: "Toyota Hilux N80 dual cab", price: 2899, photo: "generic", url: "https://www.egrgroup.com.au/" },
  { name: "EGR Fleet Canopy", brand: "egr", fitment: "Ford Ranger dual cab", price: 2699, photo: "generic", url: "https://www.egrgroup.com.au/" },
  { name: "EGR Commercial Canopy", brand: "egr", fitment: "Isuzu D-Max / Mazda BT-50", price: 2499, photo: "generic", url: "https://www.egrgroup.com.au/" },
  { name: "Carryboy S560 Canopy", brand: "carryboy", fitment: "Toyota Hilux dual cab", price: 2799, photo: "generic", url: "https://www.carryboy.com.au/" },
  { name: "Carryboy S6 Canopy", brand: "carryboy", fitment: "Ford Ranger dual cab", price: 2599, photo: "generic", url: "https://www.carryboy.com.au/" },
  { name: "Carryboy Workman Canopy", brand: "carryboy", fitment: "Isuzu D-Max tradesman dual cab", price: 2399, photo: "generic", url: "https://www.carryboy.com.au/" },
  { name: "Carryboy G3 Canopy", brand: "carryboy", fitment: "Mitsubishi Triton dual cab", price: 2499, photo: "generic", url: "https://www.carryboy.com.au/" },
  { name: "Flexiglass Premium Canopy", brand: "flexiglass", fitment: "Toyota Hilux / Ford Ranger", price: 2699, photo: "generic", url: "https://www.flexiglass.net.au/" },
  { name: "Flexiglass Tradesman Canopy", brand: "flexiglass", fitment: "Isuzu D-Max / Nissan Navara", price: 2299, photo: "generic", url: "https://www.flexiglass.net.au/" },
  { name: "Flexiglass Sports Canopy", brand: "flexiglass", fitment: "Ford Ranger / Toyota Hilux", price: 2499, photo: "generic", url: "https://www.flexiglass.net.au/" },
  { name: "Norweld Aluminium Canopy", brand: "norweld", fitment: "Toyota LandCruiser 79 dual cab", price: 4899, photo: "alloy", url: "https://norweld.com.au/" },
  { name: "Norweld Deluxe Canopy", brand: "norweld", fitment: "Ford Ranger / Toyota Hilux", price: 4599, photo: "alloy", url: "https://norweld.com.au/" },
  { name: "Boss Aluminium Canopy", brand: "boss-aluminium", fitment: "Toyota Hilux dual cab", price: 3799, photo: "alloy", url: "https://bossaluminium.com.au/" },
  { name: "Boss Premium Canopy", brand: "boss-aluminium", fitment: "Ford Ranger dual cab", price: 3999, photo: "alloy", url: "https://bossaluminium.com.au/" },
  { name: "MRT Aluminium Canopy", brand: "mrt", fitment: "Toyota Hilux / Ford Ranger", price: 3499, photo: "alloy", url: "https://www.mrt.com.au/" },
  { name: "HSP Premium Canopy", brand: "hsp", fitment: "Ford Ranger / Isuzu D-Max", price: 2199, photo: "generic", url: "https://www.hsp.net.au/" },
  { name: "HSP Roll R Cover Canopy", brand: "hsp", fitment: "Toyota Hilux dual cab", price: 2399, photo: "generic", url: "https://www.hsp.net.au/" },
  { name: "Razorback Aluminium Canopy", brand: "razorback", fitment: "Toyota LandCruiser 79 / Hilux", price: 4299, photo: "alloy", url: "https://razorbackcanopies.com.au/" },
  { name: "TJM Premium Canopy", brand: "tjm", fitment: "Toyota Hilux / Ford Ranger", price: 3199, photo: "generic", url: "https://www.tjm.com.au/" },
  { name: "TJM Touring Canopy", brand: "tjm", fitment: "Toyota LandCruiser 300 / Prado", price: 3499, photo: "generic", url: "https://www.tjm.com.au/" },
  { name: "Mountain Top Adventure Canopy", brand: "mountain-top", fitment: "Ford Ranger / Toyota Hilux", price: 3699, photo: "generic", url: "https://www.mountaintop.com/" },
  { name: "Truck Covers USA Hard Canopy", brand: "truck-covers-usa", fitment: "Ford F-150 / Chevrolet Silverado 1500", price: 2199, photo: "generic", url: "https://www.truckcoversusa.com/" },
  { name: "LEER 100XR Canopy", brand: "leer", fitment: "Full-size truck 6.5 ft bed", price: 2499, photo: "leer", url: "https://www.leer.com/" },
  { name: "LEER 100XL Canopy", brand: "leer", fitment: "Full-size truck extended cab", price: 2699, photo: "leer", url: "https://www.leer.com/" },
  { name: "LEER 180 Canopy", brand: "leer", fitment: "Mid-size truck 5 ft / 6 ft bed", price: 2299, photo: "leer-shell", url: "https://www.leer.com/" },
  { name: "SnugTop Rebel Canopy", brand: "snugtop", fitment: "Ford F-150 / RAM 1500", price: 2799, photo: "snugtop", url: "https://www.snugtop.com/" },
  { name: "SnugTop Hi-Liner Canopy", brand: "snugtop", fitment: "Full-size truck cab-high applications", price: 2999, photo: "snugtop", url: "https://www.snugtop.com/" },
  { name: "A.R.E. CX Classic Canopy", brand: "are-covers", fitment: "Ford F-150 / Chevrolet Silverado", price: 2199, photo: "leer-shell", url: "https://www.4are.com/" },
  { name: "A.R.E. MX Series Canopy", brand: "are-covers", fitment: "Mid-size truck 5 ft bed", price: 2399, photo: "leer-shell", url: "https://www.4are.com/" },
  { name: "A.R.E. Z2 Series Canopy", brand: "are-covers", fitment: "Ford F-150 / RAM 1500", price: 2599, photo: "leer-shell", url: "https://www.4are.com/" },
  { name: "Century Ultra Canopy", brand: "century", fitment: "Toyota Hilux / Ford Ranger (AU)", price: 2899, photo: "generic", url: "https://www.century.com.au/" },
  { name: "Century High-C Sport Canopy", brand: "century", fitment: "Isuzu D-Max / Mitsubishi Triton", price: 2699, photo: "generic", url: "https://www.century.com.au/" },
  { name: "Jason Trek Canopy", brand: "jason", fitment: "Toyota Hilux / Ford Ranger touring builds", price: 3199, photo: "generic", url: "https://www.jasoncanopies.com.au/" },
  { name: "Jason Commercial Canopy", brand: "jason", fitment: "Isuzu D-Max / Nissan Navara fleet", price: 2799, photo: "generic", url: "https://www.jasoncanopies.com.au/" },
  { name: "Ranch Icon Canopy", brand: "ranch", fitment: "Ford F-150 5.5 ft / 6.5 ft bed", price: 2099, photo: "leer-shell", url: "https://www.ranchcovers.com/" },
  { name: "Ranch Sierra Canopy", brand: "ranch", fitment: "Chevrolet Silverado / GMC Sierra", price: 2199, photo: "leer-shell", url: "https://www.ranchcovers.com/" },
  { name: "SmartCap EVO Defender Canopy", brand: "rsi-smartcap", fitment: "Toyota LandCruiser 70 / 300", price: 4799, photo: "generic", url: "https://www.rsicap.com/" },
  { name: "Front Runner Canopy System", brand: "front-runner", fitment: "Toyota Hilux / Ford Ranger overland builds", price: 4199, photo: "generic", url: "https://www.frontrunneroutfitters.com/" },
];

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 72);
}

function buildDescription(name, fitment, body = "") {
  const intro =
    body ||
    `${name} — lock-ready aluminium or composite ute/truck canopy engineered for secure cargo storage, roof load capacity, and clean OEM-style fitment.`;
  return `${name}

${intro}

Fitment: ${fitment}

Warranty
Manufacturer Warranty

Shipping
Freight shipping available on oversized canopies — contact for international delivery quotes.`;
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
  if (source.type === "reference") return fetchReferenceMeta(source, priceHint);
  if (source.type === "localCopy") return fetchLocalCopyMeta(source);
  throw new Error(`Unknown source ${source.type}`);
}

async function downloadImages(slug, localMeta) {
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

  return [];
}

const products = [];

for (let i = 0; i < CANOPY_SOURCES.length; i++) {
  const item = CANOPY_SOURCES[i];
  const slug = slugify(item.name);
  console.log(`[${i + 1}/${CANOPY_SOURCES.length}] ${item.name}`);

  const listingSource = reference(item.url ?? "https://drivoraparts.com", item.price);
  const photoSource = localCopy(item.photo ?? "generic", item.url);
  const listingMeta = await resolveSource(listingSource, item.price);
  const photoMeta = await resolveSource(photoSource, item.price);
  const imageFiles = await downloadImages(slug, photoMeta);
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
    sourceUrl: listingMeta.sourceUrl,
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
