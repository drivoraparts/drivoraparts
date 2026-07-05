/**
 * Import 15 snorkel SKUs from explicit supplier sources.
 *
 * Usage:
 *   node scripts/import-snorkels.mjs
 *   node scripts/import-snorkels.mjs --skip-download
 */
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const OUT_JSON = path.join(ROOT, "lib/inventory/data/snorkels.json");
const MEDIA_ROOT = path.join(ROOT, "public/product-media/snorkels");
const START_ID = 1815;

const UA = "DrivoraParts-Import/1.0 (+https://drivoraparts.com)";
const skipDownload = process.argv.includes("--skip-download");
const MAX_IMAGES = 6;

/** @typedef {"shopify"|"arb-aem"|"magento"} SourceType */

/**
 * Explicit source map — no fuzzy matching.
 * `photoSource` overrides image fetch when the listing URL has poor/generic media.
 * @type {Array<{
 *   name: string;
 *   brand: string;
 *   fitment: string;
 *   priceHint: number;
 *   source: { type: SourceType; url: string; store?: string; handle?: string; sku?: string };
 *   photoSource?: { type: SourceType; url: string; store?: string; handle?: string; sku?: string };
 * }>}
 */
export const SNORKEL_SOURCES = [
  {
    name: "Safari ARMAX Snorkel for Toyota Hilux (2015+)",
    brand: "safari",
    fitment: "Toyota Hilux N80 2015+",
    priceHint: 899,
    source: {
      type: "shopify",
      store: "www.ironman4x4.com.au",
      handle: "safari-snorkel-armax-for-toyota-hilux-n80-2015-2025-ss123hp",
      url: "https://www.ironman4x4.com.au/products/safari-snorkel-armax-for-toyota-hilux-n80-2015-2025-ss123hp",
    },
    photoSource: {
      type: "shopify",
      store: "offroad-developments.com",
      handle: "safari-by-arb-snorkel-for-toyota-hilux-15-2-8l-2-4l-narrow-body-only",
      url: "https://offroad-developments.com/products/safari-by-arb-snorkel-for-toyota-hilux-15-2-8l-2-4l-narrow-body-only",
    },
  },
  {
    name: "Safari ARMAX Snorkel for Ford Ranger (2022+)",
    brand: "safari",
    fitment: "Ford Ranger / Everest Next Gen 2022+",
    priceHint: 899,
    source: {
      type: "shopify",
      store: "more4x4.com.au",
      handle: "safari-armax-snorkel-to-suit-next-gen-ranger-everest-ss987hpd",
      url: "https://more4x4.com.au/products/safari-armax-snorkel-to-suit-next-gen-ranger-everest-ss987hpd",
    },
  },
  {
    name: "Safari ARMAX Snorkel for Toyota LandCruiser 79 Series",
    brand: "safari",
    fitment: "Toyota LandCruiser 76/78/79 Series",
    priceHint: 949,
    source: {
      type: "arb-aem",
      url: "https://www.arb.com.au/product/ss79hpv-safari-armax-snorkel-toyota-landcruiser-70-series",
    },
  },
  {
    name: "Safari ARMAX Snorkel for Toyota LandCruiser 300 Series",
    brand: "safari",
    fitment: "Toyota LandCruiser 300 Series 2022+",
    priceHint: 949,
    source: {
      type: "shopify",
      store: "www.ironman4x4.com.au",
      handle: "safari-snorkel-armax-for-toyota-landcruiser-300-series-2022-on-ss98hp",
      url: "https://www.ironman4x4.com.au/products/safari-snorkel-armax-for-toyota-landcruiser-300-series-2022-on-ss98hp",
    },
    photoSource: {
      type: "shopify",
      store: "more4x4.com.au",
      handle: "safari-armax-snorkel-to-suit-70-series-my24-v8",
      url: "https://more4x4.com.au/products/safari-armax-snorkel-to-suit-70-series-my24-v8",
    },
  },
  {
    name: "Safari ARMAX Snorkel for Toyota Prado 150",
    brand: "safari",
    fitment: "Toyota LandCruiser Prado 150 Series",
    priceHint: 899,
    source: {
      type: "shopify",
      store: "www.ironman4x4.com.au",
      handle: "safari-snorkel-armax-for-toyota-prado-250-series-2024-on-ss191hp",
      url: "https://www.ironman4x4.com.au/products/safari-snorkel-armax-for-toyota-prado-250-series-2024-on-ss191hp",
    },
    photoSource: {
      type: "shopify",
      store: "offroad-developments.com",
      handle: "safari-by-arb-snorkel-for-toyota-hilux-15-2-8l-2-4l-narrow-body-only",
      url: "https://offroad-developments.com/products/safari-by-arb-snorkel-for-toyota-hilux-15-2-8l-2-4l-narrow-body-only",
    },
  },
  {
    name: "Safari ARMAX Snorkel for Isuzu D-Max (2021+)",
    brand: "safari",
    fitment: "Isuzu D-Max RG 2019+",
    priceHint: 899,
    source: {
      type: "shopify",
      store: "www.ironman4x4.com.au",
      handle: "safari-snorkel-armax-for-isuzu-d-max-rg-2019-on-ss177hp",
      url: "https://www.ironman4x4.com.au/products/safari-snorkel-armax-for-isuzu-d-max-rg-2019-on-ss177hp",
    },
    photoSource: {
      type: "shopify",
      store: "more4x4.com.au",
      handle: "safari-armax-snorkel-to-suit-next-gen-ranger-everest-ss987hpd",
      url: "https://more4x4.com.au/products/safari-armax-snorkel-to-suit-next-gen-ranger-everest-ss987hpd",
    },
  },
  {
    name: "Safari ARMAX Snorkel for Nissan Patrol Y62",
    brand: "safari",
    fitment: "Nissan Patrol Y62",
    priceHint: 849,
    source: {
      type: "shopify",
      store: "www.ironman4x4.com.au",
      handle: "safari-snorkel-v-spec-for-nissan-patrol-y62-2010-2019-ss62hf",
      url: "https://www.ironman4x4.com.au/products/safari-snorkel-v-spec-for-nissan-patrol-y62-2010-2019-ss62hf",
    },
    photoSource: {
      type: "shopify",
      store: "offroad-developments.com",
      handle: "safari-by-arb-snorkel-for-ford-ranger-not-raptor-23-2l-d-3l-d",
      url: "https://offroad-developments.com/products/safari-by-arb-snorkel-for-ford-ranger-not-raptor-23-2l-d-3l-d",
    },
  },
  {
    name: "Safari ARMAX Snorkel for Nissan Navara NP300",
    brand: "safari",
    fitment: "Nissan Navara NP300 (D23)",
    priceHint: 849,
    source: {
      type: "shopify",
      store: "www.ironman4x4.com.au",
      handle: "safari-snorkel-v-spec-for-nissan-navara-np300-2020-2025-ss742hf",
      url: "https://www.ironman4x4.com.au/products/safari-snorkel-v-spec-for-nissan-navara-np300-2020-2025-ss742hf",
    },
    photoSource: {
      type: "shopify",
      store: "more4x4.com.au",
      handle: "safari-armax-snorkel-to-suit-next-gen-ranger-everest-ss987hpd",
      url: "https://more4x4.com.au/products/safari-armax-snorkel-to-suit-next-gen-ranger-everest-ss987hpd",
    },
  },
  {
    name: "Safari ARMAX Snorkel for Mitsubishi Triton MV",
    brand: "safari",
    fitment: "Mitsubishi Triton MV 2024+",
    priceHint: 849,
    source: {
      type: "shopify",
      store: "www.ironman4x4.com.au",
      handle: "safari-snorkel-v-spec-for-mitsubishi-triton-mv-2024-on-ss664hf",
      url: "https://www.ironman4x4.com.au/products/safari-snorkel-v-spec-for-mitsubishi-triton-mv-2024-on-ss664hf",
    },
    photoSource: {
      type: "shopify",
      store: "more4x4.com.au",
      handle: "safari-armax-snorkel-to-suit-next-gen-ranger-everest-ss987hpd",
      url: "https://more4x4.com.au/products/safari-armax-snorkel-to-suit-next-gen-ranger-everest-ss987hpd",
    },
  },
  {
    name: "Safari ARMAX Snorkel for Mazda BT-50",
    brand: "safari",
    fitment: "Mazda BT-50 2020+",
    priceHint: 849,
    source: {
      type: "shopify",
      store: "www.ironman4x4.com.au",
      handle: "safari-snorkel-v-spec-for-mazda-bt-50-2020-on-ss178hf",
      url: "https://www.ironman4x4.com.au/products/safari-snorkel-v-spec-for-mazda-bt-50-2020-on-ss178hf",
    },
    photoSource: {
      type: "shopify",
      store: "more4x4.com.au",
      handle: "safari-armax-snorkel-to-suit-next-gen-ranger-everest-ss987hpd",
      url: "https://more4x4.com.au/products/safari-armax-snorkel-to-suit-next-gen-ranger-everest-ss987hpd",
    },
  },
  {
    name: "ARB Safari Snorkel for Toyota Hilux",
    brand: "arb",
    fitment: "Toyota Hilux 2015+ (N80 narrow body)",
    priceHint: 799,
    source: {
      type: "shopify",
      store: "offroad-developments.com",
      handle: "safari-by-arb-snorkel-for-toyota-hilux-15-2-8l-2-4l-narrow-body-only",
      url: "https://offroad-developments.com/products/safari-by-arb-snorkel-for-toyota-hilux-15-2-8l-2-4l-narrow-body-only",
    },
  },
  {
    name: "ARB Safari Snorkel for Ford Ranger",
    brand: "arb",
    fitment: "Ford Ranger Next Gen 2023+ (non-Raptor)",
    priceHint: 799,
    source: {
      type: "shopify",
      store: "offroad-developments.com",
      handle: "safari-by-arb-snorkel-for-ford-ranger-not-raptor-23-2l-d-3l-d",
      url: "https://offroad-developments.com/products/safari-by-arb-snorkel-for-ford-ranger-not-raptor-23-2l-d-3l-d",
    },
  },
  {
    name: "ARB Safari Snorkel for Toyota Prado",
    brand: "arb",
    fitment: "Toyota LandCruiser Prado 150 Series",
    priceHint: 799,
    source: {
      type: "shopify",
      store: "offroad-developments.com",
      handle: "safari-by-arb-snorkel-for-toyota-hilux-15-2-8l-2-4l-narrow-body-only",
      url: "https://offroad-developments.com/products/safari-by-arb-snorkel-for-toyota-hilux-15-2-8l-2-4l-narrow-body-only",
    },
  },
  {
    name: "TJM Airtec Snorkel for Toyota Hilux",
    brand: "tjm",
    fitment: "Toyota Hilux N80 2015+",
    priceHint: 649,
    source: {
      type: "magento",
      url: "https://www.tjmusa.com/airtec-snorkel-wedgetail-polyethylene-black-kit-011satw0187d.html",
      sku: "011satw0187d",
    },
    photoSource: {
      type: "magento",
      url: "https://www.tjmusa.com/airtec-snorkel-polyethylene-black-kit-011sat0188l.html",
      sku: "011sat0188l",
    },
  },
  {
    name: "TJM Airtec Snorkel for Ford Ranger",
    brand: "tjm",
    fitment: "Ford Ranger Next Gen 2022+",
    priceHint: 649,
    source: {
      type: "magento",
      url: "https://www.tjmusa.com/airtec-snorkel-polyethylene-black-kit-011sat0120a.html",
      sku: "011sat0120a",
    },
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
  if (n > 1500) return hint;
  if (n > 8000) return Math.round(n * 0.65);
  return Math.round(n * 100) / 100;
}

function buildDescription(name, body, fitment) {
  const intro =
    stripHtml(body).slice(0, 1200) ||
    `${name} — raised air intake for cleaner, cooler air in dusty and wet conditions.`;
  return `${name}

${intro}

Fitment: ${fitment}

Shipping
Freight shipping available on oversized snorkel kits — contact for a quote on international delivery.`;
}

function parseArbAemImages(html) {
  const urls = [];
  for (const match of html.matchAll(/hiresUrl\\":\\"(https:[^\\"]+)\\"/g)) {
    urls.push(match[1].replace(/\\u0026/g, "&"));
  }
  for (const match of html.matchAll(
    /https:\/\/delivery-p144166-e1487989\.adobeaemcloud\.com\/adobe\/assets\/urn:aaid:aem:[^"'\s]+?\/as\/image\.jpg\?width=1000&(?:amp;)?quality=90/gi
  )) {
    urls.push(match[0].replace(/&amp;/g, "&"));
  }
  const seen = new Set();
  return urls.filter((u) => {
    if (seen.has(u)) return false;
    seen.add(u);
    return true;
  });
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

const TJM_FULL_CACHE = "a81546991b8814ae920d56873a8ce88b";

function tjmGalleryUrls(html, sku, folder = "0/1") {
  const refs = [
    ...new Set(
      [...html.matchAll(new RegExp(`${sku}-[0-9]{2}-[0-9]{3}\\.(?:jpg|jpeg|webp|png)`, "gi"))].map(
        (m) => m[0]
      )
    ),
  ];
  return refs.map(
    (ref) =>
      `https://www.tjmusa.com/media/catalog/product/cache/${TJM_FULL_CACHE}/${folder}/${ref}`
  );
}

async function fetchMagentoMeta(source) {
  const res = await fetch(source.url, {
    headers: { "User-Agent": "Mozilla/5.0", Accept: "text/html" },
  });
  if (!res.ok) throw new Error(`Magento ${res.status} ${source.url}`);
  const html = await res.text();
  const sku = source.sku.toLowerCase();
  const imageUrls = [
    ...tjmGalleryUrls(html, sku),
    ...[
      ...html.matchAll(
        /https:\/\/www\.tjmusa\.com\/media\/catalog\/product\/[^"'\s]+\.(?:jpg|jpeg|png|webp)/gi
      ),
    ]
      .map((m) => m[0])
      .filter((u) => u.toLowerCase().includes(sku.slice(0, 8))),
  ];

  const og = html.match(/property="og:image"\s+content="([^"]+)"/i)?.[1];
  if (og) imageUrls.push(og);

  const officialUrl = source.url
    .replace("www.tjmusa.com/airtec-snorkel-wedgetail-polyethylene-black-kit-", "www.tjm.com.au/airtec-snorkel-wedgetail-polyethylene-black-kit-")
    .replace("www.tjmusa.com/airtec-snorkel-polyethylene-black-kit-", "www.tjm.com.au/airtec-snorkel-polyethylene-black-kit-")
    .replace(/\.html$/i, "");

  return {
    sourceUrl: officialUrl,
    price: 0,
    description: html.match(/property="og:description"\s+content="([^"]+)"/i)?.[1] ?? "",
    imageUrls: [...new Set(imageUrls)],
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
    case "magento":
      meta = await fetchMagentoMeta(source);
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

for (let i = 0; i < SNORKEL_SOURCES.length; i++) {
  const item = SNORKEL_SOURCES[i];
  const slug = slugify(item.name);
  console.log(`[${i + 1}/${SNORKEL_SOURCES.length}] ${item.name}`);

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
    const mediaBase = `/product-media/snorkels/${slug}`;
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
      createdAt: 1_751_900_000_000 - i,
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
      createdAt: 1_751_900_000_000 - i,
    });
  }
}

await fs.mkdir(path.dirname(OUT_JSON), { recursive: true });
await fs.writeFile(OUT_JSON, JSON.stringify(products, null, 2));
console.log(`\nWrote ${products.length} products → ${OUT_JSON}`);
