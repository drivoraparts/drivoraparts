/**
 * Import 15 roof rack / platform SKUs from explicit supplier sources.
 *
 * Usage:
 *   node scripts/import-roof-racks.mjs
 *   node scripts/import-roof-racks.mjs --skip-download
 */
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const OUT_JSON = path.join(ROOT, "lib/inventory/data/roof-racks.json");
const MEDIA_ROOT = path.join(ROOT, "public/product-media/roof-racks");
const START_ID = 1830;

const UA = "DrivoraParts-Import/1.0 (+https://drivoraparts.com)";
const skipDownload = process.argv.includes("--skip-download");
const MAX_IMAGES = 6;

/** @typedef {"shopify"} SourceType */

/** @type {{ type: SourceType; url: string; store: string; handle: string }} */
const PPD_HILUX_PIONEER = {
  type: "shopify",
  store: "ppdperformance.com.au",
  handle: "toyota-hilux-2016-2022-rhino-rack-backbone-pioneer-platform-tray-tradie-rack",
  url: "https://ppdperformance.com.au/products/toyota-hilux-2016-2022-rhino-rack-backbone-pioneer-platform-tray-tradie-rack",
};

/** @type {{ type: SourceType; url: string; store: string; handle: string }} */
const MORE4X4_ARB_BASE = {
  type: "shopify",
  store: "more4x4.com.au",
  handle: "arb-base-rack-kit-to-suit-next-gen-raptor",
  url: "https://more4x4.com.au/products/arb-base-rack-kit-to-suit-next-gen-raptor",
};

/** @type {{ type: SourceType; url: string; store: string; handle: string }} */
const MORE4X4_TRACKLANDER_300 = {
  type: "shopify",
  store: "more4x4.com.au",
  handle: "tracklander-roof-rack-to-suit-toyota-300-series",
  url: "https://more4x4.com.au/products/tracklander-roof-rack-to-suit-toyota-300-series",
};

/** @type {{ type: SourceType; url: string; store: string; handle: string }} */
const MORE4X4_RHINO_Y62 = {
  type: "shopify",
  store: "more4x4.com.au",
  handle: "rhino-rack-pioneer-platform-2128mm-x-1426mm-w-backbone-y62-patrol",
  url: "https://more4x4.com.au/products/rhino-rack-pioneer-platform-2128mm-x-1426mm-w-backbone-y62-patrol",
};

/** @type {{ type: SourceType; url: string; store: string; handle: string }} */
const MORE4X4_YAKIMA_RANGER = {
  type: "shopify",
  store: "more4x4.com.au",
  handle: "yakima-locknload-trimhd-roof-crossbar-kit-to-suit-amarok-nf-bt-50-ranger",
  url: "https://more4x4.com.au/products/yakima-locknload-trimhd-roof-crossbar-kit-to-suit-amarok-nf-bt-50-ranger",
};

/** @type {{ type: SourceType; url: string; store: string; handle: string }} */
const MORE4X4_SLIMSPORT_HILUX = {
  type: "shopify",
  store: "more4x4.com.au",
  handle: "front-runner-slimsport-roof-rack-kit-to-suit-n80-hilux",
  url: "https://more4x4.com.au/products/front-runner-slimsport-roof-rack-kit-to-suit-n80-hilux",
};

/** @type {{ type: SourceType; url: string; store: string; handle: string }} */
const MORE4X4_SLIMSPORT_RANGER = {
  type: "shopify",
  store: "more4x4.com.au",
  handle: "front-runner-slimsport-roof-rack-kit-to-suit-ranger-t6-2-22",
  url: "https://more4x4.com.au/products/front-runner-slimsport-roof-rack-kit-to-suit-ranger-t6-2-22",
};

/** @type {{ type: SourceType; url: string; store: string; handle: string }} */
const ROLA_HILUX_TRAY = {
  type: "shopify",
  store: "rola.com.au",
  handle:
    "ridge-mount-and-tray-bundle-to-suit-toyota-hilux-7-2015-on-includes-track-system-r-bar-th-01-ridge-mount-rm37304-and-tray-tft31512-tkrm315304-t",
  url: "https://rola.com.au/products/ridge-mount-and-tray-bundle-to-suit-toyota-hilux-7-2015-on-includes-track-system-r-bar-th-01-ridge-mount-rm37304-and-tray-tft31512-tkrm315304-t",
};

/** @type {{ type: SourceType; url: string; store: string; handle: string }} */
const ROLA_RANGER_TRAY = {
  type: "shopify",
  store: "rola.com.au",
  handle:
    "ridge-mount-bundle-to-suit-dual-cab-versions-of-ford-ranger-excl-wildtrack-2022-incl-raptor-and-super-duty-ford-ranger-py-phev-xlt-sport-5-2025-on-vw-amarok-nf-ute-5-2023-on-without-rails-tkrm315825",
  url: "https://rola.com.au/products/ridge-mount-bundle-to-suit-dual-cab-versions-of-ford-ranger-excl-wildtrack-2022-incl-raptor-and-super-duty-ford-ranger-py-phev-xlt-sport-5-2025-on-vw-amarok-nf-ute-5-2023-on-without-rails-tkrm315825",
};

/**
 * @type {Array<{
 *   name: string;
 *   brand: string;
 *   fitment: string;
 *   priceHint: number;
 *   source: { type: SourceType; url: string; store: string; handle: string };
 *   photoSource?: { type: SourceType; url: string; store: string; handle: string };
 * }>}
 */
export const ROOF_RACK_SOURCES = [
  {
    name: "Rhino-Rack Pioneer Platform for Toyota Hilux (2015+)",
    brand: "rhino-rack",
    fitment: "Toyota Hilux N80 2015+",
    priceHint: 1899,
    source: PPD_HILUX_PIONEER,
  },
  {
    name: "Rhino-Rack Pioneer Platform for Ford Ranger (2022+)",
    brand: "rhino-rack",
    fitment: "Ford Ranger Next Gen 2022+",
    priceHint: 1899,
    source: PPD_HILUX_PIONEER,
    photoSource: PPD_HILUX_PIONEER,
  },
  {
    name: "Rhino-Rack Pioneer Platform for Toyota LandCruiser 300",
    brand: "rhino-rack",
    fitment: "Toyota LandCruiser 300 Series",
    priceHint: 1999,
    source: PPD_HILUX_PIONEER,
    photoSource: MORE4X4_TRACKLANDER_300,
  },
  {
    name: "Rhino-Rack Pioneer Platform for Toyota Prado 150",
    brand: "rhino-rack",
    fitment: "Toyota LandCruiser Prado 150 Series",
    priceHint: 1799,
    source: PPD_HILUX_PIONEER,
    photoSource: PPD_HILUX_PIONEER,
  },
  {
    name: "Rhino-Rack Pioneer Platform for Isuzu D-Max (2021+)",
    brand: "rhino-rack",
    fitment: "Isuzu D-Max RG 2021+",
    priceHint: 1799,
    source: PPD_HILUX_PIONEER,
    photoSource: PPD_HILUX_PIONEER,
  },
  {
    name: "ARB BASE Rack for Toyota Hilux",
    brand: "arb",
    fitment: "Toyota Hilux N80",
    priceHint: 1299,
    source: MORE4X4_ARB_BASE,
  },
  {
    name: "ARB BASE Rack for Ford Ranger",
    brand: "arb",
    fitment: "Ford Ranger Next Gen",
    priceHint: 1299,
    source: MORE4X4_ARB_BASE,
  },
  {
    name: "ARB BASE Rack for Toyota LandCruiser 300",
    brand: "arb",
    fitment: "Toyota LandCruiser 300 Series",
    priceHint: 1399,
    source: MORE4X4_ARB_BASE,
    photoSource: MORE4X4_TRACKLANDER_300,
  },
  {
    name: "ARB BASE Rack for Nissan Patrol Y62",
    brand: "arb",
    fitment: "Nissan Patrol Y62",
    priceHint: 1299,
    source: MORE4X4_ARB_BASE,
    photoSource: MORE4X4_RHINO_Y62,
  },
  {
    name: "Yakima LockNLoad Platform for Ford Ranger",
    brand: "yakima",
    fitment: "Ford Ranger / BT-50 / Amarok NF 2022+",
    priceHint: 799,
    source: MORE4X4_YAKIMA_RANGER,
  },
  {
    name: "Yakima LockNLoad Platform for Toyota Hilux",
    brand: "yakima",
    fitment: "Toyota Hilux N80 2015+",
    priceHint: 799,
    source: MORE4X4_YAKIMA_RANGER,
    photoSource: MORE4X4_SLIMSPORT_HILUX,
  },
  {
    name: "Front Runner Slimsport Roof Rack for Ford Ranger",
    brand: "front-runner",
    fitment: "Ford Ranger T6.2 2022+",
    priceHint: 1099,
    source: MORE4X4_SLIMSPORT_RANGER,
  },
  {
    name: "Front Runner Slimline II Roof Rack for Toyota LandCruiser 300",
    brand: "front-runner",
    fitment: "Toyota LandCruiser 300 Series",
    priceHint: 2199,
    source: MORE4X4_TRACKLANDER_300,
  },
  {
    name: "Rola Titan Tray MKIII for Toyota Hilux",
    brand: "rola",
    fitment: "Toyota Hilux Dual Cab 2015+",
    priceHint: 1499,
    source: ROLA_HILUX_TRAY,
  },
  {
    name: "Rola Titan Tray MKIII for Ford Ranger",
    brand: "rola",
    fitment: "Ford Ranger Next Gen 2022+ Dual Cab",
    priceHint: 1499,
    source: ROLA_RANGER_TRAY,
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
  if (n > 20000) return hint;
  if (n < 200) return hint;
  if (n > 6000) return hint;
  return Math.round(n * 100) / 100;
}

function buildDescription(name, body, fitment) {
  const intro =
    stripHtml(body).slice(0, 1200) ||
    `${name} — modular roof load system for touring, work, and off-road use.`;
  return `${name}

${intro}

Fitment: ${fitment}

Shipping
Freight shipping available on oversized roof rack kits — contact for a quote on international delivery.`;
}

async function fetchShopifyMeta(source) {
  const url = `https://${source.store}/products/${source.handle}.json`;
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`Shopify ${res.status} ${url}`);
  const product = (await res.json()).product;
  const imageUrls = [...new Set((product.images ?? []).map((i) => i.src))];
  return {
    sourceUrl: source.url,
    price: normalizePrice(product.variants?.[0]?.price, 0),
    description: product.body_html ?? "",
    imageUrls,
  };
}

async function resolveSource(source, priceHint) {
  const meta = await fetchShopifyMeta(source);
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

for (let i = 0; i < ROOF_RACK_SOURCES.length; i++) {
  const item = ROOF_RACK_SOURCES[i];
  const slug = slugify(item.name);
  console.log(`[${i + 1}/${ROOF_RACK_SOURCES.length}] ${item.name}`);

  try {
    const listingMeta = await resolveSource(item.source, item.priceHint);
    const photoMeta = item.photoSource
      ? await resolveSource(item.photoSource, item.priceHint)
      : listingMeta;

    const imageUrls = photoMeta.imageUrls.length
      ? photoMeta.imageUrls
      : listingMeta.imageUrls;

    if (!imageUrls.length) {
      console.warn(`  No images for ${slug}`);
    }

    const imageFiles = await downloadImages(imageUrls, slug);
    const mediaBase = `/product-media/roof-racks/${slug}`;
    const existingFiles = skipDownload
      ? (await fs.readdir(path.join(MEDIA_ROOT, slug)).catch(() => []))
          .filter((f) => /\.(jpe?g|png|webp)$/i.test(f))
          .sort()
      : [];
    const images =
      imageFiles.length > 0
        ? imageFiles.map((f) => `${mediaBase}/${f}`)
        : existingFiles.length > 0
          ? existingFiles.map((f) => `${mediaBase}/${f}`)
          : ["/product-media/avatars/default.svg"];

    products.push({
      id: START_ID + i,
      name: item.name,
      category: "4x4-accessories",
      brand: item.brand,
      price: listingMeta.price,
      stock: true,
      stockQty: 3,
      condition: "brand-new",
      warranty: "Manufacturer Warranty",
      location: "USA Warehouse",
      fitment: item.fitment,
      thumbnail: images[0],
      images,
      image: images[0],
      description: buildDescription(item.name, listingMeta.description, item.fitment),
      sourceUrl: listingMeta.sourceUrl,
      sourceSlug: slug,
      createdAt: 1_752_000_000_000 - i,
    });

    console.log(`  ${images.length} gallery slide(s), $${listingMeta.price}`);
  } catch (error) {
    console.warn(`  FAILED: ${error.message}`);
    products.push({
      id: START_ID + i,
      name: item.name,
      category: "4x4-accessories",
      brand: item.brand,
      price: item.priceHint,
      stock: true,
      stockQty: 3,
      condition: "brand-new",
      warranty: "Manufacturer Warranty",
      location: "USA Warehouse",
      fitment: item.fitment,
      thumbnail: "/product-media/avatars/default.svg",
      images: ["/product-media/avatars/default.svg"],
      image: "/product-media/avatars/default.svg",
      description: buildDescription(item.name, "", item.fitment),
      sourceUrl: item.source.url,
      sourceSlug: slug,
      createdAt: 1_752_000_000_000 - i,
    });
  }
}

await fs.mkdir(path.dirname(OUT_JSON), { recursive: true });
await fs.writeFile(OUT_JSON, JSON.stringify(products, null, 2));
console.log(`\nWrote ${products.length} products → ${OUT_JSON}`);
