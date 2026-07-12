/**
 * Download media + emit classic-euro-ext product entries (BMW classic + VW).
 * Run: node scripts/import-classic-euro.mjs
 */
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const MEDIA = path.join(ROOT, "public/product-media");
const OUT = path.join(ROOT, "lib/inventory/data/classic-euro-ext.json");
const UA = "DrivoraParts-Import/1.0 (+https://drivoraparts.com)";

async function fetchJson(url) {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
}

async function downloadImages(urls, dir, max = 6) {
  await fs.mkdir(dir, { recursive: true });
  const seen = new Set();
  const saved = [];
  for (const url of urls) {
    if (saved.length >= max) break;
    try {
      const res = await fetch(url, { headers: { "User-Agent": UA } });
      if (!res.ok) continue;
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 2000) continue;
      const hash = crypto.createHash("sha256").update(buf).digest("hex");
      if (seen.has(hash)) continue;
      seen.add(hash);
      let outBuf = buf;
      let ext = "jpg";
      const ct = res.headers.get("content-type") || "";
      if (ct.includes("webp") || /\.webp/i.test(url)) {
        outBuf = await sharp(buf).jpeg({ quality: 90 }).toBuffer();
        ext = "jpg";
      } else if (ct.includes("png") || /\.png/i.test(url)) {
        ext = "png";
      } else if (ct.includes("gif") || /\.gif/i.test(url)) {
        continue;
      }
      const name = `${saved.length + 1}.${ext}`;
      await fs.writeFile(path.join(dir, name), outBuf);
      saved.push(name);
      console.log("  saved", name, outBuf.length);
    } catch {
      /* skip */
    }
  }
  return saved;
}

function escapeXml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function catalogCard(dir, lines) {
  await fs.mkdir(dir, { recursive: true });
  const textLines = lines
    .map(
      (line, i) =>
        `<text x="500" y="${380 + i * 70}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="${i === 0 ? 44 : 30}" font-weight="${i === 0 ? 700 : 400}" fill="${i === 0 ? "#f5f5f5" : "#cccccc"}">${escapeXml(line)}</text>`
    )
    .join("\n");
  const svg = Buffer.from(`<svg width="1000" height="1000" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="#1a1a1a"/><stop offset="100%" stop-color="#2d2d2d"/>
  </linearGradient></defs>
  <rect width="1000" height="1000" fill="url(#g)"/>
  <rect x="60" y="60" width="880" height="880" fill="none" stroke="#555" stroke-width="4"/>
  ${textLines}
  <text x="500" y="820" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="22" fill="#777">DrivoraParts</text>
</svg>`);
  const out = path.join(dir, "1.jpg");
  await sharp(svg).jpeg({ quality: 92 }).toFile(out);
  return ["1.jpg"];
}

async function existingImages(dir) {
  try {
    const names = (await fs.readdir(dir))
      .filter((n) => /^\d+\.(jpe?g|png|webp)$/i.test(n))
      .sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
    return names;
  } catch {
    return [];
  }
}

function paths(folder, files) {
  return files.map((f) => `/product-media/${folder}/${f}`);
}

const now = Date.now();
const products = [];

// --- Forge MK5 R32 ---
{
  console.log("Forge FMIND5R32");
  const data = await fetchJson(
    "https://www.bmptuning.com/products/forge-induction-kit-vw-mk5-r32.json"
  );
  const p = data.product;
  const slug = "forge-motorsport-induction-kit-mk5-r32";
  const folder = `engine/intakes/${slug}`;
  const mediaDir = path.join(MEDIA, folder);
  let files = await existingImages(mediaDir);
  if (files.length < 1) {
    files = await downloadImages(
      (p.images || []).map((i) => i.src),
      mediaDir
    );
  } else {
    console.log("  reuse", files.length, "existing images");
  }
  const imgs = paths(folder, files);
  products.push({
    id: 2083,
    name: "Forge Motorsport Induction Kit for VW Golf Mk5 R32",
    category: "engine",
    brand: "forge-motorsport",
    platform: "intakes",
    price: 499,
    stock: true,
    stockQty: 4,
    condition: "brand-new",
    warranty: "Manufacturer Warranty",
    location: "UK Warehouse (High Wycombe area shipping)",
    fitment: "Volkswagen Golf Mk5 R32 3.2 V6 (2005-2009); Audi A3 8P 3.2 Quattro",
    partNumber: "FMIND5R32",
    thumbnail: imgs[0],
    images: imgs,
    image: imgs[0],
    description: `Forge Motorsport Induction Kit for VW Golf Mk5 R32

Carbon-fibre enclosed Pipercross foam filter induction kit (FMIND5R32) with application-specific inlet scoop and silicone couplers. Creates a true cold ram-air feed for the Mk5 R32 3.2 VR6 — dyno gains up to ~10 whp reported on Stage 2 cars.

Fitment: Volkswagen Golf Mk5 R32 3.2 V6 (2005-2009); Audi A3 8P 3.2 Quattro

Shipping
UK / EU / worldwide freight available — contact for a quote. Stock staged for High Wycombe / UK dispatch.`,
    sourceUrl:
      "https://www.forgemotorsport.com/Induction_Kit_for_R32_Mk5_Golf--product--1075.html",
    sourceSlug: slug,
    createdAt: now,
  });
}

// --- RCD 330 ---
{
  console.log("RCD 330");
  const data = await fetchJson(
    "https://naviradiostore.com/products/volkswagen-vw-rcd-330-carplay-and-android-car-navigation-system-multimedia-gps.json"
  );
  const p = data.product;
  const slug = "volkswagen-rcd-330-carplay-android-auto";
  const folder = `electronics/${slug}`;
  const mediaDir = path.join(MEDIA, folder);
  let files = await existingImages(mediaDir);
  if (files.length < 1) {
    files = await downloadImages(
      (p.images || []).map((i) => i.src),
      mediaDir
    );
  } else {
    console.log("  reuse", files.length, "existing images");
  }
  const imgs = paths(folder, files);
  products.push({
    id: 2082,
    name: "Volkswagen RCD 330 CarPlay & Android Auto Head Unit",
    category: "electronics",
    brand: "volkswagen",
    price: 399,
    stock: true,
    stockQty: 8,
    condition: "brand-new",
    warranty: "12-Month Limited Warranty",
    location: "EU / UK Warehouse",
    fitment:
      "VW PQ platform: Golf Mk5/Mk6, Passat B6/B7/CC, Polo 6R, Tiguan, Caddy, Scirocco, Touran, EOS, Sharan, T5.1, Amarok (verify connector)",
    partNumber: "RCD330 / 6RD035187B",
    thumbnail: imgs[0],
    images: imgs,
    image: imgs[0],
    description: `Volkswagen RCD 330 CarPlay & Android Auto Head Unit

OEM-style 6.5" MIB RCD330 head unit with Apple CarPlay and Android Auto, Bluetooth, USB, and reverse-camera ready. Plug-and-play upgrade for many VW PQ vehicles including Caddy Maxi / Caddy Mk3.

Fitment: VW Golf Mk5/Mk6, Passat B6/B7/CC, Polo, Tiguan, Caddy, Scirocco, Touran, EOS, Sharan, Transporter T5.1, Amarok (confirm harness)

Shipping
Worldwide shipping available — contact for a quote.`,
    sourceUrl:
      "https://naviradiostore.com/products/volkswagen-vw-rcd-330-carplay-and-android-car-navigation-system-multimedia-gps",
    sourceSlug: slug,
    createdAt: now + 1,
  });
}

// --- Classic BMW cards (supplier hotlinks unreliable) ---
async function bmwCard(id, slug, name, lines, extras) {
  console.log(name);
  const folder = extras.mediaFolder;
  const files = await catalogCard(path.join(MEDIA, folder), lines);
  const imgs = paths(folder, files);
  products.push({
    id,
    name,
    category: extras.category,
    brand: extras.brand,
    price: extras.price,
    stock: true,
    stockQty: extras.stockQty ?? 1,
    condition: extras.condition ?? "used",
    warranty: extras.warranty ?? "90-Day Functional Warranty",
    location: extras.location ?? "EU Warehouse",
    fitment: extras.fitment,
    partNumber: extras.partNumber,
    thumbnail: imgs[0],
    images: imgs,
    image: imgs[0],
    description: extras.description,
    sourceUrl: extras.sourceUrl,
    sourceSlug: slug,
    createdAt: extras.createdAt,
  });
}

await bmwCard(
  2078,
  "bmw-1972-automatic-transmission",
  "BMW 1972 Automatic Transmission (ZF 3HP)",
  ["BMW 1972", "Automatic Transmission", "ZF 3HP Era"],
  {
    mediaFolder: "transmission/bmw-1972-automatic-transmission",
    category: "transmission",
    brand: "bmw",
    price: 1899,
    fitment: "1972 BMW 2002 / Neue Klasse automatic applications (verify bellhousing)",
    partNumber: "ZF 3HP / BMW auto",
    description: `BMW 1972 Automatic Transmission (ZF 3HP)

Period automatic transmission for early-1970s BMW applications including 2002 automatic and related Neue Klasse drivetrains. Sold as a complete unit — inspect and verify ratio/bellhousing for your chassis before install.

Fitment: 1972 BMW automatic models (2002 / related NK) — confirm compatibility

What you see is what you get — exact unit as listed. Contact us for rebuild / shipping options.

Shipping
Freight quotes available on transmissions.`,
    sourceUrl: "https://www.2002ad.com/",
    createdAt: now + 2,
  }
);

await bmwCard(
  2079,
  "bmw-behr-original-ac-system",
  "Original Behr A/C System (Classic BMW)",
  ["BEHR", "Original A/C System", "Classic BMW"],
  {
    mediaFolder: "aftermarket/bmw-behr-original-ac-system",
    category: "aftermarket",
    brand: "behr",
    price: 2499,
    condition: "used",
    fitment: "Classic BMW 2002 / Neue Klasse era Behr air-conditioning systems",
    partNumber: "Behr OEM A/C",
    description: `Original Behr A/C System (Classic BMW)

Original-style Behr air-conditioning system components for classic BMW applications. Ideal for restoring factory A/C on period 02-series and Neue Klasse cars. Condition inspected; recharge and seal service recommended after install.

Fitment: Classic BMW Behr A/C applications (2002 / NK era) — verify evaporator/compressor fit

Shipping
Freight / crate shipping available — contact for a quote.`,
    sourceUrl: "https://www.2002ad.com/storeworks/category.cfm?id=20",
    createdAt: now + 3,
  }
);

await bmwCard(
  2080,
  "bmw-2000-nk-window-seals-front-rear",
  "BMW 2000 NK Front & Rear Window Seals (Rubber)",
  ["BMW 2000 NK", "Window Seals", "Front & Rear"],
  {
    mediaFolder: "bodyparts/bmw-2000-nk-window-seals",
    category: "body-parts",
    brand: "bmw",
    price: 389,
    condition: "brand-new",
    stockQty: 5,
    warranty: "12-Month Limited Warranty",
    fitment: "BMW 2000 Neue Klasse (NK) — front and rear window rubber seals",
    description: `BMW 2000 NK Front & Rear Window Seals (Rubber)

Replacement rubber window seals for BMW 2000 Neue Klasse — front and rear set. Restores weather sealing and glass seating on classic NK bodies.

Fitment: BMW 2000 Neue Klasse (NK)

Shipping
Worldwide shipping available on body seals.`,
    sourceUrl: "https://www.2002ad.com/storeworks/category.cfm?id=7",
    createdAt: now + 4,
  }
);

await bmwCard(
  2081,
  "bmw-2000-1967-chrome-trims-front-rear",
  "BMW 2000 1967 Chrome Trim Set (3 pcs Front & Rear)",
  ["BMW 2000 1967", "Chrome Trims", "3-Piece Set"],
  {
    mediaFolder: "bodyparts/bmw-2000-1967-chrome-trims",
    category: "body-parts",
    brand: "bmw",
    price: 749,
    condition: "used",
    stockQty: 1,
    fitment: "BMW 2000 (1967) — front and rear chrome trim set (3 pieces)",
    description: `BMW 2000 1967 Chrome Trim Set (3 pcs Front & Rear)

Three-piece chrome trim set for BMW 2000 (1967) — front and rear brightwork. Period parts for Neue Klasse restorations; polish and fitment check recommended.

Fitment: BMW 2000 1967

Shipping
Worldwide shipping available — contact for a quote on chrome trim sets.`,
    sourceUrl: "https://www.2002ad.com/storeworks/category.cfm?id=7",
    createdAt: now + 5,
  }
);

// --- Caddy Maxi products ---
{
  console.log("Caddy Maxi cards");
  const caddy = [
    {
      id: 2084,
      slug: "vw-caddy-maxi-aluminium-roof-rack",
      name: "Volkswagen Caddy Maxi Aluminium Roof Rack",
      lines: ["VW Caddy Maxi", "Aluminium Roof Rack", "2010-2021"],
      folder: "roof-racks/vw-caddy-maxi-aluminium-roof-rack",
      category: "4x4-accessories",
      brand: "volkswagen",
      price: 899,
      fitment: "Volkswagen Caddy Maxi 2010-2021 (twin rear doors / Maxi LWB)",
      description: `Volkswagen Caddy Maxi Aluminium Roof Rack

Commercial aluminium roof rack for VW Caddy Maxi long-wheelbase vans. Multi-bar platform with rear roller-style loading support — ideal for ladders, timber, and trade loads.

Fitment: Volkswagen Caddy Maxi 2010-2021

Shipping
Freight quotes available on van racks.`,
    },
    {
      id: 2085,
      slug: "vw-caddy-maxi-side-steps",
      name: "Volkswagen Caddy Maxi Side Steps / Running Boards",
      lines: ["VW Caddy Maxi", "Side Steps", "Running Boards"],
      folder: "bodyparts/vw-caddy-maxi-side-steps",
      category: "body-parts",
      brand: "volkswagen",
      price: 549,
      fitment: "Volkswagen Caddy Maxi / Caddy Mk3-Mk4 LWB (verify year)",
      description: `Volkswagen Caddy Maxi Side Steps / Running Boards

Heavy-duty side steps for VW Caddy Maxi — easier cab access and body protection for trade and family Maxi vans.

Fitment: Volkswagen Caddy Maxi (confirm generation)

Shipping
Worldwide shipping available — contact for a quote.`,
    },
    {
      id: 2086,
      slug: "vw-caddy-maxi-load-liner",
      name: "Volkswagen Caddy Maxi Load Area Liner",
      lines: ["VW Caddy Maxi", "Load Area Liner", "Cargo Protection"],
      folder: "interior/vw-caddy-maxi-load-liner",
      category: "interior",
      brand: "volkswagen",
      price: 329,
      fitment: "Volkswagen Caddy Maxi cargo area",
      description: `Volkswagen Caddy Maxi Load Area Liner

Durable load-bay liner for VW Caddy Maxi — protects floor and sidewalls from tools, materials, and daily trade use.

Fitment: Volkswagen Caddy Maxi

Shipping
Worldwide shipping available.`,
    },
  ];
  for (const item of caddy) {
    const files = await catalogCard(path.join(MEDIA, item.folder), item.lines);
    const imgs = paths(item.folder, files);
    products.push({
      id: item.id,
      name: item.name,
      category: item.category,
      brand: item.brand,
      price: item.price,
      stock: true,
      stockQty: 3,
      condition: "brand-new",
      warranty: "24-Month Limited Warranty",
      location: "UK / EU Warehouse",
      fitment: item.fitment,
      thumbnail: imgs[0],
      images: imgs,
      image: imgs[0],
      description: item.description,
      sourceSlug: item.slug,
      createdAt: now + item.id,
    });
  }
}

products.sort((a, b) => a.id - b.id);
await fs.writeFile(OUT, JSON.stringify(products, null, 2) + "\n");
console.log("Wrote", products.length, "products to", OUT);
