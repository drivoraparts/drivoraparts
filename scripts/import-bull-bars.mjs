/**
 * Import 15 bull bar SKUs from explicit supplier sources.
 *
 * Usage:
 *   node scripts/import-bull-bars.mjs
 *   node scripts/import-bull-bars.mjs --skip-download
 */
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const OUT_JSON = path.join(ROOT, "lib/inventory/data/bull-bars.json");
const MEDIA_ROOT = path.join(ROOT, "public/product-media/bull-bars");
const START_ID = 1800;

const UA = "DrivoraParts-Import/1.0 (+https://drivoraparts.com)";
const skipDownload = process.argv.includes("--skip-download");
const MAX_IMAGES = 6;

/** @typedef {"shopify"|"arb-aem"|"ecb"|"magento"|"static"} SourceType */

/**
 * Explicit source map — no fuzzy matching.
 * @type {Array<{
 *   name: string;
 *   brand: string;
 *   fitment: string;
 *   priceHint: number;
 *   source: { type: SourceType; url: string; store?: string; handle?: string; images?: string[] };
 * }>}
 */
export const BULL_BAR_SOURCES = [
  {
    name: "ARB Summit Bull Bar for Toyota Hilux (2021+)",
    brand: "arb",
    fitment: "Toyota Hilux 2021+ (N80)",
    priceHint: 2899,
    source: {
      type: "arb-aem",
      url: "https://www.arb.com.au/product/3414680-arb-summit-mkii-bull-bar-with-matt-black-finish-winch-compatible-toyota-hilux",
    },
  },
  {
    name: "ARB Summit Bull Bar for Ford Ranger (2023+)",
    brand: "arb",
    fitment: "Ford Ranger 2023+ (Next Gen)",
    priceHint: 2899,
    source: {
      type: "shopify",
      store: "offroad-developments.com",
      handle: "arb-summit-winchbumper-for-ford-ford-ranger-23-with-camera-6-sensors",
      url: "https://offroad-developments.com/products/arb-summit-winchbumper-for-ford-ford-ranger-23-with-camera-6-sensors",
    },
  },
  {
    name: "ARB Deluxe Bull Bar for Toyota LandCruiser 79 Series",
    brand: "arb",
    fitment: "Toyota LandCruiser 79 Series",
    priceHint: 3199,
    source: {
      type: "shopify",
      store: "ultimate4wd.com.au",
      handle: "arb-deluxe-bull-bar-landcruiser-70-2007-2022-models-without-flares",
      url: "https://ultimate4wd.com.au/products/arb-deluxe-bull-bar-landcruiser-70-2007-2022-models-without-flares",
    },
  },
  {
    name: "ARB Summit Bull Bar for Isuzu D-Max (2021+)",
    brand: "arb",
    fitment: "Isuzu D-Max 2021+ (RG)",
    priceHint: 2799,
    source: {
      type: "arb-aem",
      url: "https://www.arb.com.au/product/3448620-arb-summit-bull-bar-with-matt-black-finish-isuzu-mu-x",
    },
  },
  {
    name: "ARB Summit Bull Bar for Toyota Prado 150",
    brand: "arb",
    fitment: "Toyota LandCruiser Prado 150 Series",
    priceHint: 2799,
    source: {
      type: "arb-aem",
      url: "https://www.arb.com.au/product/3448620-arb-summit-bull-bar-with-matt-black-finish-isuzu-mu-x",
    },
  },
  {
    name: "TJM Outback Bull Bar for Ford Ranger",
    brand: "tjm",
    fitment: "Ford Ranger",
    priceHint: 1899,
    source: {
      type: "magento",
      url: "https://www.tjmusa.com/tjm-outback-heavy-duty-bumper-black-steel-070sb13n21w.html",
      sku: "070sb13n21w",
    },
  },
  {
    name: "TJM Outback Bull Bar for Toyota Hilux",
    brand: "tjm",
    fitment: "Toyota Hilux",
    priceHint: 1899,
    source: {
      type: "magento",
      url: "https://www.tjmusa.com/tjm-outback-heavy-duty-bumper-black-steel-070sb13n87j.html",
      sku: "070sb13n87j",
    },
  },
  {
    name: "TJM Outback Bull Bar for Nissan Navara",
    brand: "tjm",
    fitment: "Nissan Navara",
    priceHint: 1899,
    source: {
      type: "magento",
      url: "https://www.tjmusa.com/tjm-outback-heavy-duty-bumper-black-steel-070sb13n10s.html",
      sku: "070sb13n10s",
    },
  },
  {
    name: "Ironman Raid Bull Bar for Toyota Hilux",
    brand: "ironman-4x4",
    fitment: "Toyota Hilux N80 2020+",
    priceHint: 1699,
    source: {
      type: "shopify",
      store: "www.ironman4x4.com.au",
      handle: "toyota-hilux-n80-2020-2025-bull-bar-raid-bbr076",
      url: "https://www.ironman4x4.com.au/products/toyota-hilux-n80-2020-2025-bull-bar-raid-bbr076",
    },
  },
  {
    name: "Ironman Raid Bull Bar for Ford Ranger",
    brand: "ironman-4x4",
    fitment: "Ford Ranger PX3 / Next Gen",
    priceHint: 1699,
    source: {
      type: "shopify",
      store: "www.ironman4x4.com.au",
      handle: "ford-px3-ranger-no-hoop-bull-bar-raid",
      url: "https://www.ironman4x4.com.au/products/ford-px3-ranger-no-hoop-bull-bar-raid",
    },
  },
  {
    name: "ECB Big Tube Bull Bar for Toyota Hilux",
    brand: "ecb",
    fitment: "Toyota Hilux SR/SR5 Wide Cab 2009–2024",
    priceHint: 1599,
    source: {
      type: "ecb",
      url: "https://portal.ecb.com.au/products/toyota-hilux-sr-sr5-wide-cab-bullbar-with-bumper-lights-09-20-02-24-eat223sy",
      code: "EAT223SY",
    },
  },
  {
    name: "ECB Big Tube Bull Bar for Isuzu D-Max",
    brand: "ecb",
    fitment: "Isuzu D-Max 2020–2024",
    priceHint: 1599,
    source: {
      type: "ecb",
      url: "https://portal.ecb.com.au/products/isuzu-d-max-2wd-4wd-bullbar-07-20-04-24-eaiz76sy",
      code: "EAIZ76SY",
    },
  },
  {
    name: "AFN Premium Bull Bar for Toyota LandCruiser 300 Series",
    brand: "afn",
    fitment: "Toyota LandCruiser 300 Series",
    priceHint: 2499,
    source: {
      type: "shopify",
      store: "www.ironman4x4.com.au",
      handle: "toyota-300-series-landcruiser-no-hoop-bull-bar-raid",
      url: "https://www.ironman4x4.com.au/products/toyota-300-series-landcruiser-no-hoop-bull-bar-raid",
    },
  },
  {
    name: "AFN Premium Bull Bar for Nissan Patrol Y62",
    brand: "afn",
    fitment: "Nissan Patrol Y62",
    priceHint: 2499,
    source: {
      type: "shopify",
      store: "www.ironman4x4.com.au",
      handle: "nissan-y62-patrol-no-hoop-bull-bar-raid",
      url: "https://www.ironman4x4.com.au/products/nissan-y62-patrol-no-hoop-bull-bar-raid",
    },
  },
  {
    name: "ARB Summit Bull Bar for Mitsubishi Triton (MV)",
    brand: "arb",
    fitment: "Mitsubishi Triton MV (2024+)",
    priceHint: 2799,
    source: {
      type: "shopify",
      store: "more4x4.com.au",
      handle: "arb-summit-mkii-bull-bar-to-suit-300-series-land-cruiser",
      url: "https://www.arb.com.au/mitsubishi/triton/mv/2024-present/bull-bars/",
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
  if (n < 1500) return hint;
  if (n > 8000) return Math.round(n * 0.65);
  return Math.round(n * 100) / 100;
}

function buildDescription(name, body, fitment) {
  const intro =
    stripHtml(body).slice(0, 1200) ||
    `${name} — heavy-duty frontal protection for touring and off-road use.`;
  return `${name}

${intro}

Fitment: ${fitment}

Shipping
Freight shipping available on oversized bull bars — contact for a quote on international delivery.`;
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

async function fetchEcbMeta(source) {
  const res = await fetch(source.url, {
    headers: { "User-Agent": UA, Accept: "text/html" },
  });
  if (!res.ok) throw new Error(`ECB ${res.status} ${source.url}`);
  const html = await res.text();
  const code = source.code ?? html.match(/product=([A-Z0-9.]+)/i)?.[1]?.replace(/\.\d+$/, "");
  const imageUrls = [];
  if (code) {
    imageUrls.push(`https://lilac.ecb.com.au/mainimage?product=${code}`);
    for (let i = 0; i < 12; i++) {
      imageUrls.push(`https://lilac.ecb.com.au/otherimage?product=${code}.1&i=${i}`);
    }
  }
  const priceMatch = html.match(/\$([\d,]+(?:\.\d{2})?)/);
  return {
    sourceUrl: source.url,
    price: normalizePrice(priceMatch?.[1], 0),
    description: stripHtml(html).slice(0, 800),
    imageUrls,
  };
}

async function fetchMagentoMeta(source) {
  const res = await fetch(source.url, {
    headers: { "User-Agent": "Mozilla/5.0", Accept: "text/html" },
  });
  if (!res.ok) throw new Error(`Magento ${res.status} ${source.url}`);
  const html = await res.text();
  const sku = source.sku.toLowerCase();
  const imageUrls = [
    ...html.matchAll(
      /https:\/\/www\.tjmusa\.com\/media\/catalog\/product\/[^"'\s]+\.(?:jpg|jpeg|png|webp)/gi
    ),
  ]
    .map((m) => m[0])
    .filter((u) => u.toLowerCase().includes(sku.slice(0, 12)));

  const og = html.match(/property="og:image"\s+content="([^"]+)"/i)?.[1];
  if (og && !imageUrls.length) imageUrls.push(og);

  if (!imageUrls.length) {
    imageUrls.push(
      `https://www.tjmusa.com/media/catalog/product/cache/625cd0e0b480e44a884822eb6c6df62f/0/7/${sku}-01-590.jpg`
    );
  }

  const cloudfrontBySku = {
    "070sb13n87j": "https://dqh5gwkalhnqo.cloudfront.net/media/wysiwyg/aus-b2c/vehicle/hilux/bullbars/outback.webp",
    "070sb13n21w": "https://dqh5gwkalhnqo.cloudfront.net/media/wysiwyg/aus-b2c/vehicle/ranger/bullbars/outback.webp",
    "070sb13n10s": "https://dqh5gwkalhnqo.cloudfront.net/media/wysiwyg/aus-b2c/vehicle/navara/bullbars/outback.webp",
    "070sb13n10r": "https://dqh5gwkalhnqo.cloudfront.net/media/wysiwyg/aus-b2c/vehicle/navara/bullbars/outback.webp",
  };
  const hero = cloudfrontBySku[sku];
  if (hero) imageUrls.push(hero);

  const officialUrl = source.url
    .replace("www.tjmusa.com/tjm-outback-heavy-duty-bumper-black-steel-", "www.tjm.com.au/tjm-outback-bull-bar-black-steel-")
    .replace(/n(\d+[a-z])\.html$/i, "a$1");

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
    case "ecb":
      meta = await fetchEcbMeta(source);
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

for (let i = 0; i < BULL_BAR_SOURCES.length; i++) {
  const item = BULL_BAR_SOURCES[i];
  const slug = slugify(item.name);
  console.log(`[${i + 1}/${BULL_BAR_SOURCES.length}] ${item.name}`);

  try {
    const meta = await resolveSource(item.source, item.priceHint);
    if (!meta.imageUrls.length) {
      console.warn(`  No images for ${slug}`);
    }

    const imageFiles = await downloadImages(meta.imageUrls, slug);
    const mediaBase = `/product-media/bull-bars/${slug}`;
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
      price: meta.price,
      stock: true,
      stockQty: 3,
      condition: "brand-new",
      warranty: "Manufacturer Warranty",
      location: "USA Warehouse",
      fitment: item.fitment,
      thumbnail: images[0],
      images,
      image: images[0],
      description: buildDescription(item.name, meta.description, item.fitment),
      sourceUrl: meta.sourceUrl,
      sourceSlug: slug,
      createdAt: 1_751_800_000_000 - i,
    });

    console.log(`  ${images.length} gallery slide(s), $${meta.price}`);
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
      createdAt: 1_751_800_000_000 - i,
    });
  }
}

await fs.mkdir(path.dirname(OUT_JSON), { recursive: true });
await fs.writeFile(OUT_JSON, JSON.stringify(products, null, 2));
console.log(`\nWrote ${products.length} products → ${OUT_JSON}`);
