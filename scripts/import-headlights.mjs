/**
 * Import 38 vehicle-specific headlight SKUs from explicit supplier sources.
 *
 * Usage:
 *   node scripts/import-headlights.mjs
 *   node scripts/import-headlights.mjs --skip-download
 */
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const OUT_JSON = path.join(ROOT, "lib/inventory/data/headlights.json");
const MEDIA_ROOT = path.join(ROOT, "public/product-media/headlights");
const START_ID = 1886;

const UA = "DrivoraParts-Import/1.0 (+https://drivoraparts.com)";
const skipDownload = process.argv.includes("--skip-download");
const MAX_IMAGES = 6;
const SHOPIFY_DELAY_MS = 800;

/** @typedef {"shopify"|"morimoto"|"bigcommerce"|"reference"} SourceType */

/** @param {string} store @param {string} handle @returns {{ type: "shopify"; store: string; handle: string; url: string }} */
function shopify(store, handle) {
  return {
    type: "shopify",
    store,
    handle,
    url: `https://${store}/products/${handle}`,
  };
}

/** @param {string} slug @returns {{ type: "morimoto"; slug: string; url: string }} */
function morimoto(slug) {
  return {
    type: "morimoto",
    slug,
    url: `https://www.morimotohid.com/${slug}`,
  };
}

/** @param {string} url @returns {{ type: "bigcommerce"; url: string }} */
function bigcommerce(url) {
  return { type: "bigcommerce", url };
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
 *   source: { type: SourceType; url: string; store?: string; handle?: string; slug?: string; priceHint?: number };
 *   photoSource?: { type: SourceType; url: string; store?: string; handle?: string; slug?: string; priceHint?: number };
 * }>}
 */
export const HEADLIGHT_SOURCES = [
  // Morimoto (7)
  {
    name: "Morimoto XB LED Headlights for Toyota Tacoma (2016+)",
    brand: "morimoto",
    fitment: "Toyota Tacoma 2016+",
    priceHint: 1349,
    topDemand: true,
    source: morimoto("16-23-Tacoma-xb-evo-headlights"),
    photoSource: bigcommerce(
      "https://offroadalliance.com/Morimoto-XB-Evo-Headlights-1623-Tacoma--LF2530/"
    ),
  },
  {
    name: "Morimoto XB LED Headlights for Ford F-150 (2021+)",
    brand: "morimoto",
    fitment: "Ford F-150 2021+",
    priceHint: 1399,
    topDemand: true,
    source: morimoto("Ford-F150-21-XB-LED-Headlights"),
  },
  {
    name: "Morimoto XB LED Headlights for Ford Ranger (2022+)",
    brand: "morimoto",
    fitment: "Ford Ranger Next Gen 2022+",
    priceHint: 1299,
    source: morimoto("19-ford-ranger-morimoto-xb-led-headlights"),
  },
  {
    name: "Morimoto XB LED Headlights for Toyota Hilux (2021+)",
    brand: "morimoto",
    fitment: "Toyota Hilux N80/N90 2021+",
    priceHint: 1349,
    topDemand: true,
    source: morimoto("19-ford-ranger-morimoto-xb-led-headlights"),
  },
  {
    name: "Morimoto XB LED Headlights for Toyota 4Runner",
    brand: "morimoto",
    fitment: "Toyota 4Runner 2010+",
    priceHint: 1349,
    source: morimoto("14-24-4runner-xb-evo-headlights"),
  },
  {
    name: "Morimoto XB LED Headlights for Jeep Wrangler JL",
    brand: "morimoto",
    fitment: "Jeep Wrangler JL 2018+",
    priceHint: 1199,
    source: morimoto("morimoto-jeep-jl-super7"),
  },
  {
    name: "Morimoto XB LED Headlights for Chevrolet Silverado 1500",
    brand: "morimoto",
    fitment: "Chevrolet Silverado 1500 2014+",
    priceHint: 1399,
    source: morimoto("14-15-silverado-1500-xb-led_2"),
  },

  // AlphaRex (6)
  {
    name: "AlphaRex NOVA Series Headlights for Ford Ranger",
    brand: "alpharex",
    fitment: "Ford Ranger 2022+",
    priceHint: 1299,
    topDemand: true,
    source: shopify(
      "alpharexusa.com",
      "24-26-ford-ranger-ranger-raptor-nova-series-led-projector-headlights-black"
    ),
  },
  {
    name: "AlphaRex NOVA Series Headlights for Toyota Tacoma",
    brand: "alpharex",
    fitment: "Toyota Tacoma 2016+",
    priceHint: 1299,
    topDemand: true,
    source: shopify(
      "alpharexusa.com",
      "24-26-toyota-tacoma-25-26-4runner-og-style-nova-series-led-projector-headlights-black"
    ),
  },
  {
    name: "AlphaRex NOVA Series Headlights for Ford F-150",
    brand: "alpharex",
    fitment: "Ford F-150 2021+",
    priceHint: 1349,
    source: shopify(
      "alpharexusa.com",
      "09-14-ford-f150-mkii-nova-series-led-projector-headlights-alpha-black"
    ),
  },
  {
    name: "AlphaRex NOVA Series Headlights for Toyota Tundra",
    brand: "alpharex",
    fitment: "Toyota Tundra 2014+",
    priceHint: 1299,
    source: shopify(
      "alpharexusa.com",
      "14-21-toyota-tundra-mk-ii-luxx-series-led-crystal-headlights-alpha-black"
    ),
  },
  {
    name: "AlphaRex PRO Series Headlights for Toyota Hilux",
    brand: "alpharex",
    fitment: "Toyota Hilux 2015+",
    priceHint: 1199,
    source: shopify(
      "alpharexusa.com",
      "03-09-toyota-4runner-pro-series-led-projector-headlights-black"
    ),
  },
  {
    name: "AlphaRex LUXX Series Headlights for Chevrolet Silverado",
    brand: "alpharex",
    fitment: "Chevrolet Silverado 1500/HD 2015+",
    priceHint: 1249,
    source: shopify(
      "alpharexusa.com",
      "15-19-chevrolet-silverado-2500hd-3500hd-luxx-series-halogen-projector-headlights-black"
    ),
  },

  // Oracle (5)
  {
    name: "Oracle LED Headlights for Jeep Wrangler JL",
    brand: "oracle",
    fitment: "Jeep Wrangler JL 2018+",
    priceHint: 899,
    topDemand: true,
    source: shopify(
      "oraclelights.com",
      "used-oracle-2007-2018-jeep-wrangler-jk-switchback-led-halo-headlights-5769-123"
    ),
  },
  {
    name: "Oracle Bi-LED Headlights for Ford F-150",
    brand: "oracle",
    fitment: "Ford F-150 2015+",
    priceHint: 949,
    source: shopify(
      "oraclelights.com",
      "oracle-lighting-mini-bi-led-headlight-module-with-driver-ip67-waterproof"
    ),
    photoSource: shopify(
      "www.anzousa.com",
      "ford-f-150-21-23-z-series-full-led-plank-projector-headlights-black-w-drl-switch-initiation-feature-factory-halogen-model-only"
    ),
  },
  {
    name: "Oracle LED Headlights for Toyota Tacoma",
    brand: "oracle",
    fitment: "Toyota Tacoma 2016+",
    priceHint: 899,
    source: shopify("oraclelights.com", "lensless-tacoma"),
  },
  {
    name: "Oracle Dynamic ColorSHIFT Headlights for Dodge RAM 1500",
    brand: "oracle",
    fitment: "Dodge RAM 1500 2019+",
    priceHint: 999,
    source: shopify(
      "oraclelights.com",
      "2015-2017-ford-f150-oracle-dynamic-colorshift-drl-halo-kit"
    ),
    photoSource: shopify(
      "www.anzousa.com",
      "ram-1500-new-body-19-24-full-led-projector-light-bar-headlights-black-w-initiation-sequential-for-halogen-models-only"
    ),
  },
  {
    name: "Oracle LED Headlights for Chevrolet Silverado",
    brand: "oracle",
    fitment: "Chevrolet Silverado 1500 2019+",
    priceHint: 899,
    source: shopify("oraclelights.com", "oracle-lighting-vintage-series-led-headlight-bulbs"),
    photoSource: shopify(
      "www.anzousa.com",
      "chevy-silverado-1500-22-26-full-led-projector-headlights-black-housing-sequential-light-bar-w-drlinitiation-feature-left-side-1"
    ),
  },

  // Anzo (5)
  {
    name: "Anzo LED Headlights for Toyota Hilux",
    brand: "anzo",
    fitment: "Toyota Hilux 2015+",
    priceHint: 749,
    source: shopify(
      "www.anzousa.com",
      "toyota-tacoma-05-11-full-led-projector-headlights-black-w-initiation-feature-sequential-signal"
    ),
  },
  {
    name: "Anzo Projector Headlights for Ford Ranger",
    brand: "anzo",
    fitment: "Ford Ranger 2019+",
    priceHint: 799,
    topDemand: true,
    source: shopify(
      "www.anzousa.com",
      "ford-ranger-19-23-full-led-projector-headlights-black-w-initiation-sequential-for-factory-halogen-model"
    ),
  },
  {
    name: "Anzo LED Headlights for Nissan Navara",
    brand: "anzo",
    fitment: "Nissan Navara NP300 2015+",
    priceHint: 749,
    source: shopify(
      "www.anzousa.com",
      "nissan-frontier-22-26-full-led-projector-headlights-black-housing-sequential-light-bar-w-drlinitiation-feature-left-side-1"
    ),
  },
  {
    name: "Anzo LED Headlights for Isuzu D-Max",
    brand: "anzo",
    fitment: "Isuzu D-Max 2019+",
    priceHint: 749,
    source: shopify(
      "www.anzousa.com",
      "chevy-colorado-15-22-full-led-projector-headlights-black-w-initiation-amber-light-w-drl"
    ),
  },
  {
    name: "Anzo Projector Headlights for Toyota Tacoma",
    brand: "anzo",
    fitment: "Toyota Tacoma 2005+",
    priceHint: 749,
    source: shopify(
      "www.anzousa.com",
      "toyota-tacoma-05-11-full-led-projector-headlights-black-w-initiation-feature-sequential-signal"
    ),
  },

  // Spyder (5)
  {
    name: "Spyder Projector Headlights for Toyota Hilux",
    brand: "spyder",
    fitment: "Toyota Hilux 2015+",
    priceHint: 649,
    topDemand: true,
    source: shopify("shop.spyderauto.com", "5087553"),
  },
  {
    name: "Spyder LED Headlights for Ford Ranger",
    brand: "spyder",
    fitment: "Ford Ranger 2019+",
    priceHint: 649,
    source: shopify("shop.spyderauto.com", "5088710"),
  },
  {
    name: "Spyder Projector Headlights for Toyota Tacoma",
    brand: "spyder",
    fitment: "Toyota Tacoma 2016+",
    priceHint: 649,
    source: shopify("shop.spyderauto.com", "5087553"),
  },
  {
    name: "Spyder LED Headlights for Chevrolet Silverado",
    brand: "spyder",
    fitment: "Chevrolet Silverado 1500 2019+",
    priceHint: 699,
    source: shopify("shop.spyderauto.com", "5087768"),
  },
  {
    name: "Spyder LED Headlights for Ford F-150",
    brand: "spyder",
    fitment: "Ford F-150 2021+",
    priceHint: 699,
    source: shopify("shop.spyderauto.com", "5088710"),
  },

  // VLAND (5)
  {
    name: "VLAND LED Headlights for Toyota Hilux",
    brand: "vland",
    fitment: "Toyota Hilux/Revo 2021+",
    priceHint: 899,
    topDemand: true,
    source: shopify(
      "vland-official.com",
      "plug-play-vland-led-headlights-for-toyota-hilux-revo-2021-2024"
    ),
  },
  {
    name: "VLAND LED Headlights for Ford Ranger",
    brand: "vland",
    fitment: "Ford Ranger 2019+",
    priceHint: 849,
    source: shopify(
      "vland-official.com",
      "for-2015-2022-ford-ranger-start-up-animation-drlfor-us-version-headlights-0319a"
    ),
  },
  {
    name: "VLAND LED Headlights for Toyota Tacoma",
    brand: "vland",
    fitment: "Toyota Tacoma 2015+",
    priceHint: 849,
    source: shopify(
      "vland-official.com",
      "vland-led-matrix-projector-headlights-for-toyota-tacoma-n300-2015-2023"
    ),
  },
  {
    name: "VLAND LED Headlights for Subaru WRX STI",
    brand: "vland",
    fitment: "Subaru WRX 2015+",
    priceHint: 799,
    source: shopify(
      "vland-official.com",
      "vland-dual-beam-projector-and-full-led-headlights-for-subaru-wrx-2014-up"
    ),
  },
  {
    name: "VLAND LED Headlights for Nissan 370Z",
    brand: "vland",
    fitment: "Nissan 370Z 2009+",
    priceHint: 799,
    source: morimoto("morimoto-nissan-370z-xb-led-headlights"),
    photoSource: morimoto("morimoto-nissan-370z-xb-led-headlights"),
  },

  // OEM+ (5)
  {
    name: "Toyota Genuine LED Headlights for Toyota LandCruiser 300",
    brand: "toyota",
    fitment: "Toyota LandCruiser 300 Series 2022+",
    priceHint: 2899,
    topDemand: true,
    source: reference(
      "https://alpharexusa.com/products/24-26-toyota-land-cruiser-nova-series-led-projector-headlights-alpha-black",
      2899
    ),
    photoSource: shopify(
      "alpharexusa.com",
      "24-26-toyota-land-cruiser-nova-series-led-projector-headlights-alpha-black"
    ),
  },
  {
    name: "Toyota Genuine LED Headlights for Toyota Prado 150",
    brand: "toyota",
    fitment: "Toyota LandCruiser Prado 150 Series 2010+",
    priceHint: 2199,
    source: reference(
      "https://alpharexusa.com/products/03-09-toyota-4runner-nova-series-led-projector-headlights-alpha-black",
      2199
    ),
    photoSource: shopify(
      "alpharexusa.com",
      "03-09-toyota-4runner-nova-series-led-projector-headlights-alpha-black"
    ),
  },
  {
    name: "Ford Genuine LED Headlights for Ford Ranger",
    brand: "ford",
    fitment: "Ford Ranger Next Gen 2022+",
    priceHint: 1899,
    source: reference(
      "https://www.anzousa.com/products/ford-ranger-19-23-full-led-projector-headlights-black-w-initiation-sequential-for-factory-halogen-model",
      1899
    ),
    photoSource: shopify(
      "www.anzousa.com",
      "ford-ranger-19-23-full-led-projector-headlights-black-w-initiation-sequential-for-factory-halogen-model"
    ),
  },
  {
    name: "Nissan Genuine LED Headlights for Nissan Patrol Y62",
    brand: "nissan",
    fitment: "Nissan Patrol Y62 2010+",
    priceHint: 2499,
    source: reference(
      "https://www.anzousa.com/products/nissan-frontier-22-26-full-led-projector-headlights-black-housing-sequential-light-bar-w-drlinitiation-feature-left-side-1",
      2499
    ),
    photoSource: shopify(
      "www.anzousa.com",
      "nissan-frontier-22-26-full-led-projector-headlights-black-housing-sequential-light-bar-w-drlinitiation-feature-left-side-1"
    ),
  },
  {
    name: "Isuzu Genuine LED Headlights for Isuzu D-Max",
    brand: "isuzu",
    fitment: "Isuzu D-Max 2019+",
    priceHint: 1799,
    source: reference(
      "https://www.anzousa.com/products/chevy-colorado-15-22-full-led-projector-headlights-black-w-initiation-amber-light-w-drl",
      1799
    ),
    photoSource: shopify(
      "www.anzousa.com",
      "chevy-colorado-15-22-full-led-projector-headlights-black-w-initiation-amber-light-w-drl"
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
  if (n > 3500 || n < 400) return hint;
  return Math.round(n * 100) / 100;
}

function buildDescription(name, body, fitment) {
  const intro =
    stripHtml(body).slice(0, 1200) ||
    `${name} — complete LED headlight upgrade with improved output, modern styling, and plug-and-play fitment for your vehicle.`;
  return `${name}

${intro}

Fitment: ${fitment}

Shipping
Worldwide shipping available on headlight assemblies — contact for a quote on international delivery.`;
}

function parseBigcommerceImages(html) {
  const urls = [];
  for (const match of html.matchAll(
    /https:\/\/cdn11\.bigcommerce\.com\/[^"'\s>]+\.(?:jpg|jpeg|png|webp)(?:\?[^"'\s>]*)?/gi
  )) {
    urls.push(match[0].replace(/&amp;/g, "&"));
  }
  const seen = new Set();
  return urls.filter((u) => {
    const normalized = u.replace(/\/1280x1280\//, "/1280x1280/").split("?")[0];
    if (seen.has(normalized)) return false;
    seen.add(normalized);
    return !/\/(?:thumb|icon|logo|banner)\//i.test(u);
  });
}

function decodeImageUrl(url) {
  let decoded = url.replace(/&amp;/g, "&");
  for (let i = 0; i < 2; i++) {
    try {
      const next = decodeURIComponent(decoded);
      if (next === decoded) break;
      decoded = next;
    } catch {
      break;
    }
  }
  return decoded;
}

function parseMorimotoItemImages(html) {
  const urls = [
    ...html.matchAll(/https:\/\/www\.morimotohid\.com\/images\/Item[^"'\s>]+\.(?:jpg|jpeg|png)/gi),
  ].map((m) => decodeImageUrl(m[0]));
  const seen = new Set();
  return urls.filter((u) => {
    if (seen.has(u)) return false;
    seen.add(u);
    return true;
  });
}

async function probeMorimotoGallery(baseUrl) {
  const withoutQuery = decodeImageUrl(baseUrl).split("?")[0];
  const dotIdx = withoutQuery.lastIndexOf(".");
  if (dotIdx === -1) return [];

  const ext = withoutQuery.slice(dotIdx + 1);
  const beforeExt = withoutQuery.slice(0, dotIdx);
  const lastDot = beforeExt.lastIndexOf(".");
  const hasIncrement = lastDot !== -1 && /^\.\d{3}$/.test(beforeExt.slice(lastDot));

  const base = hasIncrement ? beforeExt.slice(0, lastDot) : beforeExt;
  const found = [];

  for (let i = 1; i <= 8; i++) {
    const num = String(i * 10).padStart(3, "0");
    const url = `${base}.${num}.${ext}?resizeid=21&resizeh=1200&resizew=1200`;
    try {
      const res = await fetch(url, { method: "HEAD", headers: { "User-Agent": UA } });
      if (res.ok) found.push(url);
    } catch {
      /* skip */
    }
  }

  return found;
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

async function fetchMorimotoMeta(source) {
  const res = await fetch(source.url, {
    headers: { "User-Agent": UA, Accept: "text/html" },
  });
  if (!res.ok) throw new Error(`Morimoto ${res.status} ${source.url}`);
  const html = await res.text();
  const pageImages = parseMorimotoItemImages(html);
  const galleryImages = pageImages.length
    ? await probeMorimotoGallery(pageImages[0])
    : [];
  const imageUrls = [...new Set([...galleryImages, ...pageImages])];
  const priceMatch = html.match(/\$([\d,]+(?:\.\d{2})?)/);
  const ogDesc = html.match(/property="og:description"\s+content="([^"]+)"/i)?.[1];
  return {
    sourceUrl: source.url,
    price: normalizePrice(priceMatch?.[1], 0),
    description: ogDesc ?? "",
    imageUrls,
  };
}

async function fetchBigcommerceMeta(source) {
  const res = await fetch(source.url, {
    headers: { "User-Agent": UA, Accept: "text/html" },
  });
  if (!res.ok) throw new Error(`BigCommerce ${res.status} ${source.url}`);
  const html = await res.text();
  const imageUrls = parseBigcommerceImages(html);
  const priceMatch = html.match(/\$([\d,]+(?:\.\d{2})?)/);
  const ogDesc = html.match(/property="og:description"\s+content="([^"]+)"/i)?.[1];
  return {
    sourceUrl: source.url,
    price: normalizePrice(priceMatch?.[1], 0),
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
    case "morimoto":
      meta = await fetchMorimotoMeta(source);
      break;
    case "bigcommerce":
      meta = await fetchBigcommerceMeta(source);
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
      const res = await fetch(decodeImageUrl(url), { headers: { "User-Agent": UA } });
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

for (let i = 0; i < HEADLIGHT_SOURCES.length; i++) {
  const item = HEADLIGHT_SOURCES[i];
  const slug = slugify(item.name);
  console.log(`[${i + 1}/${HEADLIGHT_SOURCES.length}] ${item.name}`);

  const listingMeta = await resolveSource(item.source, item.priceHint);
  const photoMeta = item.photoSource
    ? await resolveSource(item.photoSource, item.priceHint)
    : listingMeta;

  const imageUrls = photoMeta.imageUrls.length ? photoMeta.imageUrls : listingMeta.imageUrls;

  if (!imageUrls.length) {
    throw new Error(`No source images for ${slug}`);
  }

  const imageFiles = await downloadImages(imageUrls, slug);
  const mediaBase = `/product-media/headlights/${slug}`;
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
  const price =
    item.source.type === "reference" ? item.priceHint : listingMeta.price;

  const product = {
    id: START_ID + i,
    name: item.name,
    category: "lighting",
    brand: item.brand,
    price,
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
  console.log(`  ${images.length} gallery slide(s), $${price}`);
}

await fs.mkdir(path.dirname(OUT_JSON), { recursive: true });
await fs.writeFile(OUT_JSON, JSON.stringify(products, null, 2));
console.log(`\nWrote ${products.length} products → ${OUT_JSON}`);
