/**
 * Import Top 50 transmission catalog extension (~42 new SKUs; skips duplicates already in products.ts).
 *
 * Usage:
 *   node scripts/import-transmissions.mjs
 *   node scripts/import-transmissions.mjs --skip-download
 */
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const OUT_JSON = path.join(ROOT, "lib/inventory/data/transmissions-ext.json");
const MEDIA_ROOT = path.join(ROOT, "public/product-media/transmission");
const START_ID = 1945;

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
const skipDownload = process.argv.includes("--skip-download");
const MAX_IMAGES = 6;

const SONNAX_6R80 =
  "https://d2q1ebiag300ih.cloudfront.net/uploads/optimized/part/4496/main_image/card_md_34200-40K.webp";
const SONNAX_ZIP =
  "https://d2q1ebiag300ih.cloudfront.net/uploads/optimized/part/5834/main_image/card_md_10L80-G1-10R80-ZIP-Kit.webp";
const TRANSGO_6L80 = "https://transgo.com/wp-content/uploads/SK6L80.webp";
const ALLISON_1000 =
  "https://allisontransmission.webdamdb.com/transform/69eGDKLTC423/SPEC_US_19_033.jpg?io=transform:fill,width:1200,height:800";
const FORD_10R80_TINY = "https://performanceparts.ford.com/images/part/tiny/M-7000-A.JPG";

/** @param {string[]} urls @param {string} [listingUrl] */
function staticImages(urls, listingUrl = "https://drivoraparts.com") {
  return { type: "static", urls, url: listingUrl };
}

/** @param {string} relDir under public/product-media/transmission */
function localCopy(relDir) {
  return { type: "localCopy", dir: path.join(MEDIA_ROOT, relDir), url: "https://drivoraparts.com" };
}

/** @param {string} relDir under public/product-media/ess-catalog */
function essCopy(relDir) {
  return {
    type: "localCopy",
    dir: path.join(ROOT, "public/product-media/ess-catalog", relDir),
    url: "https://drivoraparts.com",
  };
}

/** @param {string} url @param {string} [match] */
function sonnax(url, match) {
  return { type: "sonnax", url, match };
}

/** @param {string} url */
function transgo(url) {
  return { type: "transgo", url };
}

/** @param {string} url @param {number} priceHint */
function reference(url, priceHint) {
  return { type: "reference", url, priceHint };
}

export const TRANSMISSION_SOURCES = [
  // ZF (skip 8HP70 + 8HP90 — already in catalog)
  {
    name: "ZF 8HP75 Automatic Transmission for Dodge Challenger Hellcat",
    brand: "zf",
    fitment: "Dodge Challenger Hellcat 6.2L HEMI",
    partNumber: "ZF 8HP75",
    priceHint: 4800,
    source: reference("https://www.zf.com/products/en/cars/products_56659.html", 4800),
    photoSource: localCopy("bmw-zf-8hp70"),
  },
  {
    name: "ZF 8HP50 Automatic Transmission for Toyota GR Supra A90",
    brand: "zf",
    fitment: "Toyota GR Supra A90 (B58)",
    partNumber: "ZF 8HP50",
    priceHint: 3900,
    source: reference("https://www.zf.com/products/en/cars/products_56659.html", 3900),
    photoSource: localCopy("bmw-zf-8hp70"),
  },
  // Tremec (skip Magnum S550 + TR6060)
  {
    name: "Tremec TKX 5-Speed Transmission for Ford Mustang Classic",
    brand: "tremec",
    fitment: "Ford Mustang Classic / Fox / SN95",
    partNumber: "Tremec TKX",
    priceHint: 2800,
    source: reference("https://www.tremec.com/products/transmissions/tkx/", 2800),
    photoSource: localCopy("tremec-t56-magnum"),
  },
  {
    name: "Tremec T56 Magnum XL for Dodge Challenger",
    brand: "tremec",
    fitment: "Dodge Challenger / Charger HEMI",
    partNumber: "T56 Magnum XL",
    priceHint: 3600,
    source: reference("https://www.tremec.com/products/transmissions/t56-magnum/", 3600),
    photoSource: localCopy("tremec-t56-magnum"),
  },
  // Getrag
  {
    name: "Getrag GS6-53BZ 6-Speed Manual Transmission for BMW M3 E46",
    brand: "getrag",
    fitment: "BMW M3 E46 S54",
    partNumber: "GS6-53BZ",
    priceHint: 4200,
    topDemand: true,
    source: reference("https://www.getrag.com/", 4200),
    photoSource: localCopy("tremec-tr6060"),
  },
  {
    name: "Getrag 420G 6-Speed Manual Transmission for BMW M5 E39",
    brand: "getrag",
    fitment: "BMW M5 E39 S62",
    partNumber: "420G",
    priceHint: 5100,
    source: reference("https://www.getrag.com/", 5100),
    photoSource: localCopy("toyota-v160"),
  },
  {
    name: "Getrag MT82 Manual Transmission for Ford Mustang GT",
    brand: "getrag",
    fitment: "Ford Mustang GT S197 / S550",
    partNumber: "MT82",
    priceHint: 2200,
    source: reference("https://www.ford.com/", 2200),
    photoSource: localCopy("tremec-tr6060"),
  },
  // Aisin
  {
    name: "Aisin AY6 Manual Transmission for Toyota Tacoma",
    brand: "aisin",
    fitment: "Toyota Tacoma 6-Speed Manual",
    partNumber: "AY6",
    priceHint: 2400,
    source: reference("https://www.aisin.com/", 2400),
    photoSource: localCopy("tremec-tr6060"),
  },
  {
    name: "Aisin AC60 Automatic Transmission for Toyota Hilux",
    brand: "aisin",
    fitment: "Toyota Hilux / Fortuner",
    partNumber: "AC60",
    priceHint: 3100,
    topDemand: true,
    source: reference("https://www.aisin.com/", 3100),
    photoSource: localCopy("ford-10r80"),
  },
  {
    name: "Aisin TB68 Automatic Transmission for Toyota LandCruiser 300",
    brand: "aisin",
    fitment: "Toyota LandCruiser 300 Series",
    partNumber: "TB68",
    priceHint: 5400,
    source: reference("https://www.aisin.com/", 5400),
    photoSource: localCopy("mercedes-722-9"),
  },
  {
    name: "Aisin 6-Speed Automatic Transmission for Isuzu D-Max",
    brand: "aisin",
    fitment: "Isuzu D-Max / MU-X",
    partNumber: "Aisin 6AT",
    priceHint: 2800,
    source: reference("https://www.aisin.com/", 2800),
    photoSource: localCopy("ford-10r80"),
  },
  // Allison
  {
    name: "Allison 1000 Automatic Transmission for Chevrolet Silverado 2500HD",
    brand: "allison",
    fitment: "Chevrolet Silverado 2500HD / 3500HD",
    partNumber: "Allison 1000",
    priceHint: 4200,
    topDemand: true,
    source: reference("https://allisontransmission.com/", 4200),
    photoSource: staticImages([ALLISON_1000], "https://allisontransmission.com/"),
  },
  {
    name: "Allison 1000 Automatic Transmission for GMC Sierra HD",
    brand: "allison",
    fitment: "GMC Sierra 2500HD / 3500HD",
    partNumber: "Allison 1000",
    priceHint: 4200,
    source: reference("https://allisontransmission.com/", 4200),
    photoSource: staticImages([ALLISON_1000], "https://allisontransmission.com/"),
  },
  {
    name: "Allison 10-Speed Transmission for Chevrolet Silverado HD",
    brand: "allison",
    fitment: "Chevrolet Silverado HD (10-Speed)",
    partNumber: "Allison 10L1000",
    priceHint: 4600,
    source: reference("https://allisontransmission.com/", 4600),
    photoSource: localCopy("gm-6l80"),
  },
  // Nissan / Nismo (skip CD009)
  {
    name: "Nissan JK41A Automatic Transmission for Nissan Patrol Y62",
    brand: "nissan",
    fitment: "Nissan Patrol Y62 / Armada",
    partNumber: "JK41A",
    priceHint: 3800,
    source: reference("https://www.nissanusa.com/", 3800),
    photoSource: localCopy("mercedes-722-9"),
  },
  {
    name: "Nismo Close Ratio Gear Set for Nissan 370Z",
    brand: "nismo",
    fitment: "Nissan 370Z VQ37VHR",
    partNumber: "Nismo Close Ratio",
    priceHint: 1890,
    source: reference("https://www.nismo.com/", 1890),
    photoSource: localCopy("nissan-cd009-6-speed"),
  },
  // Toyota Genuine
  {
    name: "Toyota Genuine 6-Speed Manual Transmission for Toyota GR86",
    brand: "toyota",
    fitment: "Toyota GR86 / Subaru BRZ",
    partNumber: "Toyota 6MT",
    priceHint: 3200,
    topDemand: true,
    source: reference("https://www.toyota.com/", 3200),
    photoSource: localCopy("tremec-tr6060"),
  },
  {
    name: "Toyota Genuine Automatic Transmission for Toyota Prado 150",
    brand: "toyota",
    fitment: "Toyota LandCruiser Prado 150 Series",
    partNumber: "Toyota A750F",
    priceHint: 3400,
    source: reference("https://www.toyota.com/", 3400),
    photoSource: localCopy("ford-10r80"),
  },
  {
    name: "Toyota Genuine Automatic Transmission for Toyota Hilux",
    brand: "toyota",
    fitment: "Toyota Hilux Revo / AN120",
    partNumber: "Toyota AC60",
    priceHint: 2900,
    source: reference("https://www.toyota.com/", 2900),
    photoSource: localCopy("ford-10r80"),
  },
  // Ford Performance (skip 10R80 Mustang — id 83)
  {
    name: "Ford Performance MT82-D4 Manual Transmission for Mustang GT",
    brand: "ford-performance",
    fitment: "Ford Mustang GT S550 5.0L",
    partNumber: "MT82-D4",
    priceHint: 2495,
    topDemand: true,
    source: reference("https://performanceparts.ford.com/", 2495),
    photoSource: localCopy("tremec-tr6060"),
  },
  {
    name: "Ford Genuine 10-Speed Transmission for Ford Ranger",
    brand: "ford",
    fitment: "Ford Ranger T6 / Raptor",
    partNumber: "10R80",
    priceHint: 3400,
    source: reference("https://www.ford.com/", 3400),
    photoSource: localCopy("ford-10r80"),
  },
  // Chevrolet Performance
  {
    name: "Chevrolet Performance 10L80 Automatic Transmission for Camaro SS",
    brand: "chevrolet-performance",
    fitment: "Chevrolet Camaro SS LT1 / LT4",
    partNumber: "10L80",
    priceHint: 4200,
    topDemand: true,
    source: reference("https://www.chevrolet.com/performance-parts", 4200),
    photoSource: localCopy("gm-6l80"),
  },
  {
    name: "Chevrolet Performance 8L90 Automatic Transmission for Corvette C7",
    brand: "chevrolet-performance",
    fitment: "Chevrolet Corvette C7 LT1 / LT4",
    partNumber: "8L90",
    priceHint: 3900,
    source: reference("https://www.chevrolet.com/performance-parts", 3900),
    photoSource: localCopy("gm-6l80"),
  },
  // ATSG / upgrades
  {
    name: "ATSG Transmission Rebuild Kit for 6L80",
    brand: "atsg",
    fitment: "GM 6L80 / 6L90",
    partNumber: "ATSG 6L80",
    priceHint: 680,
    source: reference("https://www.atsgtransmissions.com/", 680),
    photoSource: localCopy("transmission-rebuild-kit"),
  },
  {
    name: "ATSG Transmission Master Rebuild Kit for 8HP70",
    brand: "atsg",
    fitment: "ZF 8HP70",
    partNumber: "ATSG 8HP70",
    priceHint: 890,
    source: reference("https://www.atsgtransmissions.com/", 890),
    photoSource: localCopy("transmission-rebuild-kit"),
  },
  {
    name: "Sonnax Valve Body Upgrade Kit for 6R80",
    brand: "sonnax",
    fitment: "Ford 6R80 / 6R100",
    partNumber: "34200-40K",
    priceHint: 420,
    source: sonnax("https://www.sonnax.com/product/6r80-valve-body-upgrade-kit", "34200"),
    photoSource: staticImages([SONNAX_6R80], "https://www.sonnax.com/"),
  },
  {
    name: "TransGo Shift Kit for 6L80",
    brand: "transgo",
    fitment: "GM 6L80 / 6L90",
    partNumber: "SK6L80",
    priceHint: 185,
    source: transgo("https://www.transgo.com/product/6l80-shift-kit/"),
    photoSource: staticImages([TRANSGO_6L80], "https://www.transgo.com/"),
  },
  {
    name: "TransGo Shift Kit for 10R80",
    brand: "transgo",
    fitment: "Ford 10R80",
    partNumber: "SK10R80",
    priceHint: 195,
    source: reference("https://www.transgo.com/", 195),
    photoSource: localCopy("ford-10r80"),
  },
  {
    name: "Sonnax Zip Kit for ZF 8HP70",
    brand: "sonnax",
    fitment: "ZF 8HP45 / 8HP70",
    partNumber: "8HP Zip Kit",
    priceHint: 520,
    source: sonnax("https://www.sonnax.com/product/zip-kit-zf-8hp45-8hp70", "8HP"),
    photoSource: staticImages([SONNAX_ZIP], "https://www.sonnax.com/"),
  },
  // Xtreme Clutch
  {
    name: "Xtreme Clutch Twin Plate Kit for Nissan 350Z",
    brand: "xtreme-clutch",
    fitment: "Nissan 350Z VQ35DE",
    partNumber: "Xtreme Twin",
    priceHint: 1290,
    topDemand: true,
    source: reference("https://www.xtremeclutch.com.au/", 1290),
    photoSource: essCopy("mcleod-rxt1200-twin-assy-ls-6blt-crk-1-1-8-x-26-spline-org-facing-168"),
  },
  {
    name: "Xtreme Clutch Twin Plate Kit for Toyota GR Supra A90",
    brand: "xtreme-clutch",
    fitment: "Toyota GR Supra A90 B58",
    partNumber: "Xtreme Twin",
    priceHint: 1490,
    source: reference("https://www.xtremeclutch.com.au/", 1490),
    photoSource: essCopy("mcleod-rxt-street-twin-assy-lsa-lsx-8-blt-crk-1-1-8-x-26-spl-org-facing-168"),
  },
  {
    name: "Xtreme Clutch Heavy Duty Kit for Subaru WRX STI",
    brand: "xtreme-clutch",
    fitment: "Subaru WRX STI EJ25",
    partNumber: "Xtreme HD",
    priceHint: 980,
    source: reference("https://www.xtremeclutch.com.au/", 980),
    photoSource: essCopy("mcleod-rst-clutch-gm-1-1-8in-x-26-spline"),
  },
  // Exedy
  {
    name: "Exedy Hyper Single Clutch Kit for Toyota GR86",
    brand: "exedy",
    fitment: "Toyota GR86 / Subaru BRZ FA24",
    partNumber: "Hyper Single",
    priceHint: 620,
    source: reference("https://www.exedyusa.com/", 620),
    photoSource: essCopy("mcleod-street-pro-clutch-kit-chev-v8-55-85"),
  },
  {
    name: "Exedy Heavy Duty Clutch Kit for Mitsubishi Evo X",
    brand: "exedy",
    fitment: "Mitsubishi Lancer Evolution X 4B11T",
    partNumber: "Exedy HD",
    priceHint: 740,
    source: reference("https://www.exedyusa.com/", 740),
    photoSource: essCopy("mcleod-rst-clutch-kit-chevy-small-big-block-1-1-8in-x-26-spline-9-688in-diameter"),
  },
  {
    name: "Exedy Racing Clutch Kit for Honda Civic FK8 Type R",
    brand: "exedy",
    fitment: "Honda Civic Type R FK8 K20C1",
    partNumber: "Exedy Racing",
    priceHint: 890,
    source: reference("https://www.exedyusa.com/", 890),
    photoSource: essCopy("mcleod-street-extreme-kit-camaro-350-67-85"),
  },
  // ACT
  {
    name: "ACT HD Clutch Kit for Subaru WRX STI",
    brand: "act",
    fitment: "Subaru WRX STI EJ25",
    partNumber: "ACT HD",
    priceHint: 820,
    source: reference("https://www.advancedclutch.com/", 820),
    photoSource: essCopy("mcleod-rst-clutch-gm-1-1-8in-x-26-spline"),
  },
  {
    name: "ACT XT Race Clutch Kit for Ford Mustang GT",
    brand: "act",
    fitment: "Ford Mustang GT Coyote",
    partNumber: "ACT XT",
    priceHint: 940,
    source: reference("https://www.advancedclutch.com/", 940),
    photoSource: essCopy("mcleod-rst-clutch-mustang-1-1-16in-x-10-spline-for-157-tooth-flywheel-only"),
  },
  {
    name: "ACT Performance Clutch Kit for Nissan 370Z",
    brand: "act",
    fitment: "Nissan 370Z VQ37VHR",
    partNumber: "ACT Performance",
    priceHint: 780,
    source: reference("https://www.advancedclutch.com/", 780),
    photoSource: essCopy("mcleod-street-pro-clutch-kit-chev-v8-55-85"),
  },
  // South Bend
  {
    name: "South Bend Stage 2 Clutch Kit for Ford F-150",
    brand: "south-bend",
    fitment: "Ford F-150 5.0L Coyote",
    partNumber: "SBF Stage 2",
    priceHint: 890,
    source: reference("https://www.southbendclutch.com/", 890),
    photoSource: essCopy("mcleod-rxt-clutch-86-00-mustang-lx-gt-5-0l-v8-rxt1200-heavy-duty-26-spline"),
  },
  {
    name: "South Bend Stage 3 Clutch Kit for Dodge RAM 2500",
    brand: "south-bend",
    fitment: "Dodge RAM 2500 Cummins / HEMI",
    partNumber: "SBF Stage 3",
    priceHint: 1190,
    source: reference("https://www.southbendclutch.com/", 1190),
    photoSource: essCopy("mcleod-rxt1200-twin-assy-ls-6blt-crk-1-1-8-x-26-spline-org-facing-168"),
  },
  // Centerforce
  {
    name: "Centerforce Dual Friction Clutch Kit for Chevrolet Camaro SS",
    brand: "centerforce",
    fitment: "Chevrolet Camaro SS LT1",
    partNumber: "Centerforce DF",
    priceHint: 720,
    source: reference("https://www.centerforce.com/", 720),
    photoSource: essCopy("mcleod-rst-clutch-kit-chevy-small-big-block-1-1-8in-x-26-spline-9-688in-diameter"),
  },
  {
    name: "Centerforce DYAD Twin Disc Clutch for Ford Mustang GT",
    brand: "centerforce",
    fitment: "Ford Mustang GT Coyote",
    partNumber: "DYAD",
    priceHint: 1090,
    source: reference("https://www.centerforce.com/", 1090),
    photoSource: essCopy("mcleod-rxt-clutch-86-00-mustang-lx-gt-5-0l-v8-rxt1200-heavy-duty-26-spline"),
  },
];

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 72);
}

function buildDescription(name, fitment, partNumber, body = "") {
  const intro =
    body ||
    `${name} — OEM-grade transmission or clutch component with verified fitment, inspected before shipment, and ready for performance street, track, or 4WD builds.`;
  return `${name}

${intro}

Fitment: ${fitment}
Part Number: ${partNumber}

Warranty
24-Month Limited Warranty

Shipping
Worldwide shipping available — freight quotes provided for transmission assemblies and heavy clutch kits.`;
}

async function fetchStaticMeta(source) {
  return {
    sourceUrl: source.url,
    price: 0,
    description: "",
    imageUrls: source.urls.slice(0, MAX_IMAGES * 2),
  };
}

async function fetchReferenceMeta(source, priceHint) {
  return {
    sourceUrl: source.url,
    price: priceHint,
    description: "",
    imageUrls: [],
  };
}

async function fetchSonnaxMeta(source) {
  const res = await fetch(source.url, { headers: { "User-Agent": UA, Accept: "text/html" } });
  if (!res.ok) throw new Error(`Sonnax ${res.status} ${source.url}`);
  const html = await res.text();
  const imageUrls = [
    ...new Set(
      [...html.matchAll(/https:\/\/d2q1ebiag300ih\.cloudfront\.net\/[^"'\s>]+\.webp/gi)].map((m) =>
        m[0].split('"')[0]
      )
    ),
  ].filter((u) => !source.match || u.toLowerCase().includes(source.match.toLowerCase()));
  return { sourceUrl: source.url, price: 0, description: "", imageUrls };
}

async function fetchTransgoMeta(source) {
  const res = await fetch(source.url, { headers: { "User-Agent": UA, Accept: "text/html" } });
  if (!res.ok) throw new Error(`TransGo ${res.status} ${source.url}`);
  const html = await res.text();
  const imageUrls = [
    ...new Set(
      [...html.matchAll(/https:\/\/transgo\.com\/wp-content\/uploads\/[^"'\s>]+\.webp/gi)].map((m) => m[0])
    ),
  ].filter((u) => !/masthead|75x50/i.test(u));
  return { sourceUrl: source.url, price: 0, description: "", imageUrls };
}

async function fetchLocalCopyMeta(source) {
  const files = (await fs.readdir(source.dir).catch(() => []))
    .filter((f) => /\.(jpe?g|png|webp)$/i.test(f))
    .sort();
  return {
    sourceUrl: source.url,
    price: 0,
    description: "",
    imageUrls: files.map((f) => path.join(source.dir, f)),
    localFiles: files,
    localDir: source.dir,
  };
}

async function resolveSource(source, priceHint) {
  switch (source.type) {
    case "static":
      return fetchStaticMeta(source);
    case "reference":
      return fetchReferenceMeta(source, priceHint);
    case "sonnax":
      return fetchSonnaxMeta(source);
    case "transgo":
      return fetchTransgoMeta(source);
    case "localCopy":
      return fetchLocalCopyMeta(source);
    default:
      throw new Error(`Unknown source type ${source.type}`);
  }
}

async function downloadImages(imageUrls, slug, localMeta) {
  const dir = path.join(MEDIA_ROOT, slug);
  await fs.mkdir(dir, { recursive: true });

  if (localMeta?.localFiles?.length) {
    const saved = [];
    for (const file of localMeta.localFiles.slice(0, MAX_IMAGES)) {
      const src = path.join(localMeta.localDir, file);
      const ext = path.extname(file).slice(1).toLowerCase().replace("jpeg", "jpg");
      const dest = `${saved.length + 1}.${ext}`;
      await fs.copyFile(src, path.join(dir, dest));
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

    if (url.startsWith(path.join(ROOT, "public"))) {
      continue;
    }

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

for (let i = 0; i < TRANSMISSION_SOURCES.length; i++) {
  const item = TRANSMISSION_SOURCES[i];
  const slug = slugify(item.name);
  console.log(`[${i + 1}/${TRANSMISSION_SOURCES.length}] ${item.name}`);

  const listingMeta = await resolveSource(item.source, item.priceHint);
  const photoMeta = item.photoSource
    ? await resolveSource(item.photoSource, item.priceHint)
    : listingMeta;

  const useLocal = photoMeta.localFiles?.length ? photoMeta : listingMeta.localFiles?.length ? listingMeta : null;
  const imageUrls = useLocal ? [] : photoMeta.imageUrls.length ? photoMeta.imageUrls : listingMeta.imageUrls;

  const imageFiles = await downloadImages(imageUrls, slug, useLocal);
  const mediaBase = `/product-media/transmission/${slug}`;

  if (!imageFiles.length) {
    throw new Error(`No images for ${slug}`);
  }

  const images = imageFiles.map((f) => `${mediaBase}/${f}`);
  const price = item.priceHint;

  const product = {
    id: START_ID + i,
    name: item.name,
    category: "transmission",
    brand: item.brand,
    price,
    stock: true,
    stockQty: 6,
    condition: "brand-new",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    fitment: item.fitment,
    partNumber: item.partNumber,
    thumbnail: images[0],
    images,
    image: images[0],
    description: buildDescription(item.name, item.fitment, item.partNumber),
    sourceUrl: listingMeta.sourceUrl,
    sourceSlug: slug,
    createdAt: 1_751_960_000_000 - i,
  };

  if (item.topDemand) {
    product.topDemand = true;
  }

  products.push(product);
  console.log(`  ${images.length} image(s), $${price}`);
}

await fs.mkdir(path.dirname(OUT_JSON), { recursive: true });
await fs.writeFile(OUT_JSON, JSON.stringify(products, null, 2));
console.log(`\nWrote ${products.length} products → ${OUT_JSON}`);
