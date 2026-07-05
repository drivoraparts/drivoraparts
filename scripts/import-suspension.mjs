/**
 * Import 41 off-road suspension lift kit SKUs from explicit supplier sources.
 *
 * Usage:
 *   node scripts/import-suspension.mjs
 *   node scripts/import-suspension.mjs --skip-download
 */
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const OUT_JSON = path.join(ROOT, "lib/inventory/data/suspension-lift-kits.json");
const MEDIA_ROOT = path.join(ROOT, "public/product-media/suspension-lift-kits");
const START_ID = 1845;

const UA = "DrivoraParts-Import/1.0 (+https://drivoraparts.com)";
const skipDownload = process.argv.includes("--skip-download");
const MAX_IMAGES = 6;
const SHOPIFY_DELAY_MS = 800;

/** @typedef {"shopify"|"arb-aem"|"king"|"reference"} SourceType */

/** @type {{ type: "shopify"; store: string; handle: string; url: string }} */
const PPD_B6_HILUX = {
  type: "shopify",
  store: "ppdperformance.com.au",
  handle: "toyota-hilux-2025-2030-n90-40mm-suspension-lift-kit-bilstein-b6",
  url: "https://ppdperformance.com.au/products/toyota-hilux-2025-2030-n90-40mm-suspension-lift-kit-bilstein-b6",
};

/** @type {{ type: "shopify"; store: string; handle: string; url: string }} */
const PPD_FOX_LC300 = {
  type: "shopify",
  store: "ppdperformance.com.au",
  handle:
    "toyota-landcruiser-300-series-2021-2025-fox-performance-elite-series-2-5-coilover-reservoir-shock-adjustable-pair-0-2-inch-lift",
  url: "https://ppdperformance.com.au/products/toyota-landcruiser-300-series-2021-2025-fox-performance-elite-series-2-5-coilover-reservoir-shock-adjustable-pair-0-2-inch-lift",
};

/** @type {{ type: "arb-aem"; url: string }} */
const ARB_BP51_LISTING = {
  type: "arb-aem",
  url: "https://www.arb.com.au/product/ekbp00246-old-man-emu-bp-51-suspension-kit",
};

/** @type {{ type: "arb-aem"; url: string }} */
const ARB_BP51_PHOTOS = {
  type: "arb-aem",
  url: "https://www.arb.com.au/ome/products/shocks/bp-51",
};

/** @type {{ type: "arb-aem"; url: string }} */
const ARB_MT64 = {
  type: "arb-aem",
  url: "https://www.arb.com.au/ome/products/shocks/mt64",
};

/** @type {{ type: "arb-aem"; url: string }} */
const ARB_NITROCHARGER = {
  type: "arb-aem",
  url: "https://www.arb.com.au/ome/products/shocks/nitrocharger",
};

/** @param {string} handle @returns {{ type: "shopify"; store: string; handle: string; url: string }} */
function ppd(handle) {
  return {
    type: "shopify",
    store: "ppdperformance.com.au",
    handle,
    url: `https://ppdperformance.com.au/products/${handle}`,
  };
}

/** @param {string} handle @returns {{ type: "shopify"; store: string; handle: string; url: string }} */
function precision(handle) {
  return {
    type: "shopify",
    store: "precisionoffroad4x4.com.au",
    handle,
    url: `https://precisionoffroad4x4.com.au/products/${handle}`,
  };
}

/** @param {string} handle @returns {{ type: "shopify"; store: string; handle: string; url: string }} */
function ironman(handle) {
  return {
    type: "shopify",
    store: "www.ironman4x4.com.au",
    handle,
    url: `https://www.ironman4x4.com.au/products/${handle}`,
  };
}

/** @param {string} path @returns {{ type: "king"; url: string }} */
function king(path) {
  const slug = path.replace(/^\/+/, "");
  return {
    type: "king",
    url: `https://kingshocks.com/${slug}`,
  };
}

/** @param {string} handle @returns {{ type: "shopify"; store: string; handle: string; url: string }} */
function svc(handle) {
  return {
    type: "shopify",
    store: "svcoffroad.com",
    handle,
    url: `https://svcoffroad.com/products/${handle}`,
  };
}

/** @param {string} url @param {number} [priceHint] @returns {{ type: "reference"; url: string; priceHint?: number }} */
function reference(url, priceHint) {
  return { type: "reference", url, priceHint };
}

/**
 * Explicit source map — no fuzzy matching.
 * `photoSource` overrides image fetch when the listing URL has poor/generic media.
 * @type {Array<{
 *   name: string;
 *   brand: string;
 *   fitment: string;
 *   priceHint: number;
 *   topDemand?: boolean;
 *   source: { type: SourceType; url: string; store?: string; handle?: string; priceHint?: number };
 *   photoSource?: { type: SourceType; url: string; store?: string; handle?: string; priceHint?: number };
 * }>}
 */
export const SUSPENSION_SOURCES = [
  // OME (7)
  {
    name: "Old Man Emu BP-51 Suspension Kit for Toyota Hilux (2015+)",
    brand: "old-man-emu",
    fitment: "Toyota Hilux N80 2015+",
    priceHint: 5000,
    topDemand: true,
    source: ARB_BP51_LISTING,
    photoSource: ARB_BP51_PHOTOS,
  },
  {
    name: "Old Man Emu BP-51 Suspension Kit for Ford Ranger (2022+)",
    brand: "old-man-emu",
    fitment: "Ford Ranger Next Gen 2022+",
    priceHint: 5000,
    source: ARB_BP51_LISTING,
    photoSource: ARB_BP51_PHOTOS,
  },
  {
    name: "Old Man Emu MT64 Suspension Kit for Toyota LandCruiser 79 Series",
    brand: "old-man-emu",
    fitment: "Toyota LandCruiser 79 Series 2009+",
    priceHint: 4800,
    source: ARB_MT64,
  },
  {
    name: "Old Man Emu Nitrocharger Sport Lift Kit for Toyota Prado 150",
    brand: "old-man-emu",
    fitment: "Toyota LandCruiser Prado 150 Series 2010+",
    priceHint: 4500,
    topDemand: true,
    source: ARB_NITROCHARGER,
  },
  {
    name: "Old Man Emu Nitrocharger Sport Lift Kit for Isuzu D-Max (2021+)",
    brand: "old-man-emu",
    fitment: "Isuzu D-Max RG 2021+",
    priceHint: 4500,
    source: ARB_NITROCHARGER,
  },
  {
    name: "Old Man Emu Heavy Load Suspension Kit for Nissan Patrol Y62",
    brand: "old-man-emu",
    fitment: "Nissan Patrol Y62 2010+",
    priceHint: 5200,
    source: reference("https://www.arb.com.au/ome/products/shocks/nitrocharger", 5200),
    photoSource: ARB_NITROCHARGER,
  },
  {
    name: "Old Man Emu BP-51 Suspension Kit for Toyota LandCruiser 300",
    brand: "old-man-emu",
    fitment: "Toyota LandCruiser 300 Series 2022+",
    priceHint: 5500,
    source: ARB_BP51_LISTING,
    photoSource: ARB_BP51_PHOTOS,
  },

  // Dobinsons (7)
  {
    name: "Dobinsons IMS Lift Kit for Toyota Hilux (2015+)",
    brand: "dobinsons",
    fitment: "Toyota Hilux N80 2015+",
    priceHint: 3100,
    source: precision("toyota-hilux-n80-2015-onwards-dobinsons-ims-monotube-lift-kit-2"),
  },
  {
    name: "Dobinsons MRR 3-Way Adjustable Lift Kit for Ford Ranger (2022+)",
    brand: "dobinsons",
    fitment: "Ford Ranger / Everest Next Gen 2022+",
    priceHint: 3400,
    topDemand: true,
    source: precision(
      "dobinsons-2-50mm-monotube-remote-reservoir-mrr-lift-kit-to-suit-ford-next-gen-everest-2022-onwards"
    ),
  },
  {
    name: "Dobinsons IMS Lift Kit for Toyota Prado 150",
    brand: "dobinsons",
    fitment: "Toyota LandCruiser Prado 150 Series 2010+",
    priceHint: 3000,
    source: precision("toyota-landcruiser-prado-150-series-2010-on-dobinsons-ims-monotube-lift-kit"),
  },
  {
    name: "Dobinsons IMS Suspension Kit for Isuzu D-Max",
    brand: "dobinsons",
    fitment: "Isuzu D-Max MY2020+",
    priceHint: 2900,
    topDemand: true,
    source: precision("isuzu-dmax-my-2020-on-dobinsons-ims-monotube-lift-kit-2"),
  },
  {
    name: "Dobinsons MRR Lift Kit for Mitsubishi Triton MV",
    brand: "dobinsons",
    fitment: "Mitsubishi Triton MQ/MR 2015+",
    priceHint: 3200,
    source: precision(
      "mitsubishi-triton-mq-mr-03-2015-on-dobinsons-monotube-remote-reservoir-3-way-adjustable-mra-lift-kit"
    ),
  },
  {
    name: "Dobinsons Heavy Duty Suspension Kit for Nissan Navara NP300",
    brand: "dobinsons",
    fitment: "Nissan Navara NP300 D23 2015+",
    priceHint: 2800,
    source: precision(
      "nissan-navara-d23-np300-2015-onwards-dobinsons-monotube-ifp-adjustable-height-lift-kit-2"
    ),
  },
  {
    name: "Dobinsons Lift Kit for Toyota LandCruiser 79 Series",
    brand: "dobinsons",
    fitment: "Toyota LandCruiser 79 Series 1999+",
    priceHint: 3500,
    source: precision("toyota-landcruiser-79-series-09-1999-on-dobinsons-ims-monotube-lift-kit-2"),
  },

  // Bilstein (6)
  {
    name: "Bilstein 6112 Front Lift Kit for Toyota Tacoma",
    brand: "bilstein",
    fitment: "Toyota Tacoma 2016+",
    priceHint: 1800,
    topDemand: true,
    source: reference("https://www.bilstein.com/en-us/product/b8-6112/", 1800),
    photoSource: PPD_B6_HILUX,
  },
  {
    name: "Bilstein 5160 Rear Remote Reservoir Shocks for Ford F-150",
    brand: "bilstein",
    fitment: "Ford F-150 2021+ (excl. Tremor)",
    priceHint: 1600,
    source: ppd(
      "ford-f150-2021-2030-2021-onwards-excl-tremor-bilstein-bilstein-5160-remote-reservoir-rear-shock-0-2-lift"
    ),
  },
  {
    name: "Bilstein B8 8100 Suspension Kit for Toyota 4Runner",
    brand: "bilstein",
    fitment: "Toyota 4Runner 2010+",
    priceHint: 2200,
    source: reference("https://www.bilstein.com/en-us/product/b8-6112/", 2200),
    photoSource: PPD_B6_HILUX,
  },
  {
    name: "Bilstein B6 Off-Road Suspension Kit for Toyota Hilux",
    brand: "bilstein",
    fitment: "Toyota Hilux N90 2025+",
    priceHint: 1400,
    source: PPD_B6_HILUX,
  },
  {
    name: "Bilstein 6112 Lift Kit for Chevrolet Silverado 1500",
    brand: "bilstein",
    fitment: "Chevrolet Silverado 1500 2019+",
    priceHint: 1900,
    source: reference("https://www.bilstein.com/en-us/product/b8-6112/", 1900),
    photoSource: PPD_B6_HILUX,
  },
  {
    name: "Bilstein B8 Lift Kit for Jeep Wrangler JL",
    brand: "bilstein",
    fitment: "Jeep Wrangler JL 2018+",
    priceHint: 1500,
    source: ppd("jeep-wrangler-tj-1996-2007-40mm-suspension-lift-kit-bilstein-b6"),
    photoSource: ppd("jeep-wrangler-tj-1996-2007-40mm-suspension-lift-kit-bilstein-b6"),
  },

  // Fox (6)
  {
    name: "Fox 2.5 Performance Elite Suspension Kit for Ford Ranger",
    brand: "fox-racing-shox",
    fitment: "Ford Ranger Next Gen PY 2022+",
    priceHint: 4200,
    topDemand: true,
    source: ppd("ford-ranger-2022-2026-py-next-gen-fox-2-5-per-series-ifp-0-3-hd-coilover"),
    photoSource: PPD_FOX_LC300,
  },
  {
    name: "Fox Factory Series 2.5 Lift Kit for Toyota Tacoma",
    brand: "fox-racing-shox",
    fitment: "Toyota Tacoma 2016+",
    priceHint: 3800,
    topDemand: true,
    source: king("i-30508127-25001-408-2024-toyota-tacoma-2-5-front-coilover.html"),
    photoSource: PPD_FOX_LC300,
  },
  {
    name: "Fox 2.0 Performance Suspension Kit for Toyota Hilux",
    brand: "fox-racing-shox",
    fitment: "Toyota Hilux N80 2015+",
    priceHint: 3200,
    source: ppd(
      "toyota-hilux-2015-2026-n80-fox-2-5-performance-lift-kit-front-2-3-lift-rear-2-lift"
    ),
  },
  {
    name: "Fox 3.0 Internal Bypass Kit for Ford F-150 Raptor",
    brand: "fox-racing-shox",
    fitment: "Ford F-150 Raptor 2017+",
    priceHint: 4500,
    source: svc("fox-3-0-raptor-internal-bypass-coilovers"),
  },
  {
    name: "Fox Coilover Suspension Kit for Jeep Gladiator JT",
    brand: "fox-racing-shox",
    fitment: "Jeep Gladiator JT 2020+",
    priceHint: 4000,
    source: ppd(
      "jeep-wrangler-04-2018-on-jl-lwb-fox-2-5-performance-lift-kit-front-3-5-lift-rear-3-5-lift"
    ),
  },
  {
    name: "Fox Lift Kit for Toyota LandCruiser 300",
    brand: "fox-racing-shox",
    fitment: "Toyota LandCruiser 300 Series 2021+",
    priceHint: 4300,
    source: PPD_FOX_LC300,
  },

  // King (5)
  {
    name: "King 2.5 Remote Reservoir Coilovers for Toyota Tacoma",
    brand: "king-shocks",
    fitment: "Toyota Tacoma 2024+",
    priceHint: 2600,
    topDemand: true,
    source: king("i-30508127-25001-408-2024-toyota-tacoma-2-5-front-coilover.html"),
  },
  {
    name: "King Off-Road Suspension Kit for Ford Ranger",
    brand: "king-shocks",
    fitment: "Ford Ranger T6 2012+",
    priceHint: 2500,
    source: king("i-30503720-25001-315-2012-ford-ranger-t6-2-5-front-coilover.html"),
  },
  {
    name: "King Coilover Lift Kit for Jeep Wrangler JL",
    brand: "king-shocks",
    fitment: "Jeep Wrangler JL / Gladiator JT 2018+",
    priceHint: 2700,
    source: king("i-30503805-25001-375a-2018-jeep-jl-jt-2-5-frontshocks2-5-5-lifts.html"),
  },
  {
    name: "King 2.5 Performance Shocks for Toyota Hilux",
    brand: "king-shocks",
    fitment: "Toyota Hilux N80 2016+",
    priceHint: 2400,
    source: king("i-30503131-25001-349-2016-toyota-hilux-2-5-front-coilover.html"),
  },
  {
    name: "King Suspension Kit for Nissan Patrol Y62",
    brand: "king-shocks",
    fitment: "Nissan Patrol Y62 2010+",
    priceHint: 2800,
    source: king("i-30503864-25001-323a-2010-nissan-patrol-y62-2-5-front-coilover.html"),
  },

  // Ironman (5)
  {
    name: "Ironman Foam Cell Pro Lift Kit for Toyota Hilux",
    brand: "ironman-4x4",
    fitment: "Toyota Hilux N80 2015-2025",
    priceHint: 3200,
    topDemand: true,
    source: ironman("toyota-hilux-n80-2015-2025-suspension-lift-kit-foam-cell-pro-heavy-toy077ckp"),
  },
  {
    name: "Ironman Foam Cell Pro Suspension Kit for Ford Ranger",
    brand: "ironman-4x4",
    fitment: "Ford Ranger Next Gen 2022+",
    priceHint: 3100,
    source: ironman("suspension-lift-kit-for-ford-ranger-next-gen-2022-foam-cell-pro-heavy"),
  },
  {
    name: "Ironman 4x4 Nitro Gas Lift Kit for Isuzu D-Max",
    brand: "ironman-4x4",
    fitment: "Isuzu D-Max 2019-2024",
    priceHint: 2900,
    source: ironman("suspension-lift-kit-for-isuzu-d-max-2019-2024-nitro-gas-heavy"),
  },
  {
    name: "Ironman Foam Cell Lift Kit for Toyota Prado 150",
    brand: "ironman-4x4",
    fitment: "Toyota LandCruiser Prado 150 Series 2017-2024",
    priceHint: 3300,
    source: ironman("suspension-lift-kit-for-toyota-prado-150-series-2017-2024-foam-cell-pro-heavy"),
  },
  {
    name: "Ironman Suspension Kit for Mitsubishi Triton",
    brand: "ironman-4x4",
    fitment: "Mitsubishi Triton MQ/MR 2015+",
    priceHint: 3000,
    source: ironman("foam-cell-suspension-kit-extra-heavy-mits049dkf"),
  },

  // Tough Dog (5)
  {
    name: "Tough Dog Adjustable Lift Kit for Toyota Hilux",
    brand: "tough-dog",
    fitment: "Toyota Hilux N80 2015-2022",
    priceHint: 2200,
    source: ppd(
      "toyota-hilux-2015-2022-n80-gun-75mm-front-50mm-rear-suspension-lift-kit-tough-dog-adjustable"
    ),
  },
  {
    name: "Tough Dog Foam Cell Suspension Kit for Ford Ranger",
    brand: "tough-dog",
    fitment: "Ford Ranger Next Gen RA 2022+",
    priceHint: 2100,
    source: ppd("ford-ranger-2022-ra-next-gen-iii-40mm-suspension-lift-kit-tough-dog-foam-cell"),
  },
  {
    name: "Tough Dog 40mm Lift Kit for Nissan Navara NP300",
    brand: "tough-dog",
    fitment: "Nissan Navara NP300 2020-2024",
    priceHint: 2000,
    topDemand: true,
    source: ppd("nissan-navara-11-2020-2024-np300-50mm-suspension-lift-kit-tough-dog-foam-cell"),
  },
  {
    name: "Tough Dog Adjustable Suspension Kit for Isuzu D-Max",
    brand: "tough-dog",
    fitment: "Isuzu D-Max 2020-2021",
    priceHint: 1900,
    source: ppd("isuzu-dmax-2020-2021-50mm-suspension-lift-kit-tough-dog-foam-cell"),
  },
  {
    name: "Tough Dog Suspension Kit for Toyota LandCruiser 79 Series",
    brand: "tough-dog",
    fitment: "Toyota LandCruiser 79 Dual Cab 2012-2024",
    priceHint: 2600,
    source: ppd(
      "toyota-landcruiser-2012-2024-79-dual-cab-series-50mm-suspension-lift-kit-tough-dog-adjustable"
    ),
  },
];

const delay = (ms) => new Promise((r) => setTimeout(r, ms));
let lastShopifyFetch = 0;

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
  if (n > 8000 || n < 500) return hint;
  return Math.round(n * 100) / 100;
}

function buildDescription(name, body, fitment) {
  const intro =
    stripHtml(body).slice(0, 1200) ||
    `${name} — complete off-road suspension lift kit for improved ground clearance, articulation, and load-carrying on uneven terrain.`;
  return `${name}

${intro}

Fitment: ${fitment}

Shipping
Freight shipping available on suspension lift kits — contact for a quote on international delivery.`;
}

function parseArbAemImages(html) {
  const urls = [];
  for (const match of html.matchAll(/hiresUrl\\":\\"(https:[^\\"]+)\\"/g)) {
    urls.push(match[1].replace(/\\u0026/g, "&"));
  }
  for (const match of html.matchAll(/hiresUrl&#34;:&#34;(https:[^&#]+)&#34;/g)) {
    urls.push(match[1].replace(/&amp;/g, "&"));
  }
  for (const match of html.matchAll(
    /https:\/\/delivery-p144166-e1487989\.adobeaemcloud\.com\/adobe\/assets\/urn:aaid:aem:[^"'\s&#]+?\/as\/image\.jpg\?width=(?:1000|1500|3000)(?:&amp;|&)(?:amp;)?quality=90/gi
  )) {
    urls.push(match[0].replace(/&amp;/g, "&"));
  }
  for (const match of html.matchAll(
    /https:\/\/www\.arb\.com\.au\/content\/dam\/arb\/production\/products\/ome-suspension[^"'\s]+\.(?:jpg|jpeg|png)/gi
  )) {
    urls.push(match[0]);
  }
  for (const match of html.matchAll(
    /https:\/\/s7ap1\.scene7\.com\/is\/image\/arbprod\/[^"'\s?]+(?:\?[^"'\s]*)?/gi
  )) {
    const u = match[0].replace(/&amp;/g, "&");
    if (/BP51|BP-51|Nitrocharger|MT64|OME|Hilux|Ranger|Prado|Patrol|LC300|79/i.test(u)) {
      urls.push(u);
    }
  }
  const seen = new Set();
  return urls.filter((u) => {
    if (seen.has(u)) return false;
    seen.add(u);
    return true;
  });
}

async function fetchShopifyMeta(source) {
  const now = Date.now();
  const wait = Math.max(0, SHOPIFY_DELAY_MS - (now - lastShopifyFetch));
  if (wait) await delay(wait);
  lastShopifyFetch = Date.now();

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

async function fetchArbAemMeta(source) {
  const res = await fetch(source.url, {
    headers: { "User-Agent": UA, Accept: "text/html" },
  });
  if (!res.ok) throw new Error(`ARB ${res.status} ${source.url}`);
  const html = await res.text();
  const imageUrls = parseArbAemImages(html);
  const priceMatch = html.match(/\$([\d,]+(?:\.\d{2})?)/);
  const ogDesc = html.match(/property="og:description"\s+content="([^"]+)"/i)?.[1];
  return {
    sourceUrl: source.url,
    price: normalizePrice(priceMatch?.[1], 0),
    description: ogDesc ?? "",
    imageUrls,
  };
}

async function fetchKingMeta(source) {
  const res = await fetch(source.url, {
    headers: { "User-Agent": UA, Accept: "text/html" },
  });
  if (!res.ok) throw new Error(`King ${res.status} ${source.url}`);
  const html = await res.text();
  const iImages = [
    ...html.matchAll(/https:\/\/kingshocks\.com\/images\/I[^"'\s]+\.(?:jpg|jpeg|png)/gi),
  ].map((m) => m[0]);
  const fImages = [
    ...html.matchAll(/https:\/\/kingshocks\.com\/images\/F[^"'\s]+\.(?:jpg|jpeg|png)/gi),
  ].map((m) => m[0]);
  const imageUrls = [...new Set([...iImages, ...fImages])];
  const ogDesc = html.match(/property="og:description"\s+content="([^"]+)"/i)?.[1];
  return {
    sourceUrl: source.url,
    price: 0,
    description: ogDesc ?? "",
    imageUrls,
  };
}

async function fetchReferenceMeta(source, priceHint) {
  const res = await fetch(source.url, {
    headers: { "User-Agent": UA, Accept: "text/html" },
  });
  if (!res.ok) throw new Error(`Reference ${res.status} ${source.url}`);
  const html = await res.text();
  const ogDesc = html.match(/property="og:description"\s+content="([^"]+)"/i)?.[1] ?? "";
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
    case "shopify":
      meta = await fetchShopifyMeta(source);
      break;
    case "arb-aem":
      meta = await fetchArbAemMeta(source);
      break;
    case "king":
      meta = await fetchKingMeta(source);
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

for (let i = 0; i < SUSPENSION_SOURCES.length; i++) {
  const item = SUSPENSION_SOURCES[i];
  const slug = slugify(item.name);
  console.log(`[${i + 1}/${SUSPENSION_SOURCES.length}] ${item.name}`);

  const listingMeta = await resolveSource(item.source, item.priceHint);
  const photoMeta = item.photoSource
    ? await resolveSource(item.photoSource, item.priceHint)
    : listingMeta;

  const imageUrls = photoMeta.imageUrls.length ? photoMeta.imageUrls : listingMeta.imageUrls;

  if (!imageUrls.length) {
    throw new Error(`No source images for ${slug}`);
  }

  const imageFiles = await downloadImages(imageUrls, slug);
  const mediaBase = `/product-media/suspension-lift-kits/${slug}`;
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

  const product = {
    id: START_ID + i,
    name: item.name,
    category: "suspension",
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
    createdAt: 1_751_900_000_000 - i,
  };

  if (item.topDemand) {
    product.topDemand = true;
  }

  products.push(product);
  console.log(`  ${images.length} gallery slide(s), $${listingMeta.price}`);
}

await fs.mkdir(path.dirname(OUT_JSON), { recursive: true });
await fs.writeFile(OUT_JSON, JSON.stringify(products, null, 2));
console.log(`\nWrote ${products.length} products → ${OUT_JSON}`);
