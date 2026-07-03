/**
 * Build truck parts JSON from scraped Edmunds shop catalog (45 products).
 * Run: node scripts/build-edmunds-catalog-from-seed.mjs
 * Then download images when site is reachable:
 *   node scripts/import-edmunds-truck-parts.mjs --images-only
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const OUT_JSON = path.join(ROOT, "lib/inventory/data/edmunds-truck-parts.json");
const START_ID = 1500;

/** Scraped from edmundstruckparts.com/shop (45 results, Feb 2026). */
const SEED = [
  { slug: "07-13-gmc-sierra-truck-bed-for-sale", name: "2007–2013 GMC Sierra 5'8\" Short Truck Bed", price: 1899 },
  { slug: "11-16-ford-f250-truck-bed-cap-shell-camper-topper", name: "2011–2016 Ford F250 Truck Bed Cap Shell Camper Topper", price: 1499 },
  { slug: "14-23-are-cover-camper-shell", name: "2014–2023 ARE Cover Camper Shell", price: 1599 },
  { slug: "ford-f250-camper-shell", name: "2014–2023 Ford F250 Camper Shell", price: 1599 },
  { slug: "1999-2007-gm-6-5-truck-bed", name: "1999–2007 GM 6.5 Truck Bed", price: 1799 },
  { slug: "1999-2007-gm-6-5ft-truck-bed", name: "1999–2007 GM 6.5ft Truck Bed", price: 1799 },
  { slug: "ford-super-duty-f250", name: "1999–2010 Ford Super Duty F250/F350 Long Bed", price: 1999 },
  { slug: "1999-2010-ford-superduty-6-5ft-truck-bed", name: "1999–2010 Ford Super Duty 6.5ft Truck Bed", price: 1899 },
  { slug: "1999-2010-ford-superduty-truck-bed", name: "1999–2010 Ford Super Duty Truck Bed", price: 1899 },
  { slug: "2007-2013-gmc-sierra-1500-58-truck-bed", name: "2007–2013 GMC Sierra 1500 5'8\" Short Truck Bed", price: 1899 },
  { slug: "2009-2014-ford-f150-6-5-foot-bed", name: "2009–2014 Ford F150 6.5 Foot Bed", price: 1799 },
  { slug: "2009-2014-ford-f150-6-5ft-truck-bed", name: "2009–2014 Ford F150 6.5ft Truck Bed", price: 1799 },
  { slug: "2009-2014-ford-f150-camper-shell-topper", name: "2009–2014 Ford F150 Camper Shell Topper", price: 1499 },
  { slug: "2011-ford-f-250-super-duty", name: "2011–2016 Ford F250/350 Super Duty Long Bed", price: 1999 },
  { slug: "ford-f-350-super-duty-pickup", name: "2011–2016 Ford F350 Super Duty Short Bed", price: 1899 },
  { slug: "2011-2016-ford-f250-super-duty-8ft-truck-bed", name: "2011–2016 Ford F250 Super Duty 8ft Truck Bed", price: 2099 },
  { slug: "2011-2016-ford-f250-super-duty-8ft-truck-bed-2", name: "2011–2016 Ford F250 Super Duty 8ft Truck Bed (Alt Listing)", price: 2099 },
  { slug: "2011-2016-ford-superduty-8ft-truck-bed", name: "2011–2016 Ford Super Duty 8ft Truck Bed", price: 2099 },
  { slug: "2014-2019-chevy-gmc-6-6-foot-bed", name: "2014–2019 Chevy/GMC 6.6 Foot Bed", price: 1899 },
  { slug: "2014-2019-gm-8ft-truck-bed", name: "2014–2019 GM 8ft Truck Bed", price: 1999 },
  { slug: "2014-2019-gmc-sierra-6-6-truck-bed", name: "2014–2019 GMC Sierra 6.6' Truck Bed", price: 1899 },
  { slug: "6-5-chevy-truck-bed-for-sale", name: "1999–2007 Chevy/GMC 6.5 Short Truck Bed", price: 1699 },
  { slug: "94-02-2nd-gen-dodge-ram-short-bed", name: "1994–2002 2nd Gen Dodge Ram Short Bed", price: 1799 },
  { slug: "99-06-chevy-silverado-truck-bed-for-sale", name: "1999–2006 Chevy Silverado Truck Bed", price: 1799 },
  { slug: "1999-2006-chevy-silverado-8ft-truck-bed", name: "1999–2006 Chevy Silverado 8ft Truck Bed", price: 1899 },
  { slug: "chevy-silverado-2500", name: "2007–2013 Chevy/GMC Long Truck Bed (Silverado 2500)", price: 1999 },
  { slug: "chevy-silverado-truck-bed", name: "2007–2013 Chevy/GMC Sierra Short Truck Bed", price: 2300 },
  { slug: "dodge-ram-truck-bed", name: "2009–2018 Dodge Ram 3500 Mega Cab Dually Truck Bed", price: 2199 },
  { slug: "dodge-ram-truck-bed-for-sale", name: "2002–2009 3rd Gen Dodge Ram Short Bed", price: 1799 },
  { slug: "dodge-ram-truck-bed-for-sale-2", name: "2019–2025 Dodge Ram 2500/3500 8' Long Truck Bed", price: 2299 },
  { slug: "dodge-ram-truck-beds-for-sale-near-me", name: "2019–2023 Dodge Ram 2500 8' Truck Bed", price: 2199 },
  { slug: "ford-f150-truck-bed", name: "1997–2003 Ford F150 Truck Bed", price: 1599 },
  { slug: "ford-f250-truck-bed-for-sale", name: "Ford F250 Truck Bed", price: 1899 },
  { slug: "ford-f250-truck-bed-replacement", name: "1999–2010 Ford F250/F350 Super Duty 8' Long Truck Bed", price: 1999 },
  { slug: "ford-f250-truck-bed-replacement-2", name: "2011–2016 Ford F250/350 Super Duty 8' Long Bed", price: 2099 },
  { slug: "ford-f350-truck-bed-for-sale", name: "2017–2024 Ford F250/F350 8' Long Truck Bed", price: 2299 },
  { slug: "gmc-sierra-truck-bed-replacement", name: "2007–2013 GMC Sierra Truck Bed Replacement", price: 1899 },
  { slug: "leer-ram-1500-6-5ft-fibreglass-box", name: "Leer RAM 1500 6.5ft Fiberglass Camper Box", price: 1399 },
  { slug: "pickup-sierra-gmc-truck-bed", name: "2007–2013 GMC Sierra Short Bed", price: 1899 },
  { slug: "a-premium-front-catalytic-converter", name: "A-Premium Front Catalytic Converter", price: 399 },
  { slug: "99-06-chevy-silverado-truck-bed-for-sale-2", name: "1999–2006 Chevy Silverado Truck Bed (Alt Listing)", price: 1799 },
  { slug: "long-car-and-truck-exhaust-pipes", name: "Long Car and Truck Exhaust Pipes", price: 329 },
  { slug: "seating-at-tractor-supply-co", name: "Truck Seating — Tractor Supply Style Bench", price: 499 },
  { slug: "torin-atr6300b-rolling-creeper-garage", name: "Torin ATR6300B Rolling Creeper", price: 149 },
  { slug: "led-tail-light-with-blind-spot-compatible", name: "LED Tail Light with Blind Spot Compatible", price: 435 },
];

function resolveBrand(name) {
  const hay = name.toLowerCase();
  if (/\bgmc\b|\bsierra\b/.test(hay)) return "gmc";
  if (/\bchevy\b|\bchevrolet\b|\bsilverado\b/.test(hay)) return "chevrolet";
  if (/\bdodge\b|\bram\b/.test(hay)) return "dodge";
  if (/\bford\b|\bf-?150\b|\bf-?250\b|\bf-?350\b|\bsuper duty\b/.test(hay)) return "ford";
  if (/\bleer\b/.test(hay)) return "leer";
  return "universal";
}

function resolveCategory(name) {
  const hay = name.toLowerCase();
  if (/catalytic|exhaust/.test(hay)) return "engine";
  if (/tail light|led/.test(hay)) return "lighting";
  if (/creeper|seating|bench/.test(hay)) return "aftermarket";
  if (/camper|shell|topper|fiberglass box|canopy/.test(hay)) return "aftermarket";
  return "body-parts";
}

function extractFitment(name) {
  const match = name.match(
    /(?:19|20)\d{2}[–-](?:19|20)\d{2}|(?:19|20)\d{2}[–-]\d{2}/
  );
  return match?.[0]?.replace(/-/g, "–") ?? undefined;
}

function buildDescription(name, fitment) {
  const fitmentLine = fitment
    ? `\nFitment: ${fitment}`
    : "\nFitment: Confirm year, bed length, and cab style at checkout.";

  return `${name}

Rust-free truck component sourced for DrivoraParts customers — inspected, photographed, and ready for freight or local pickup.${fitmentLine}

Condition notes: Actual unit shown in listing photos. Minor wear possible on used take-off beds and shells.

Shipping
Freight / LTL quotes available on truck beds, cabs, and camper shells — contact support for oversized shipping.`;
}

const products = SEED.map((item, index) => {
  const fitment = extractFitment(item.name);
  const category = resolveCategory(item.name);
  const brand = resolveBrand(item.name);
  const imageBase = `/product-media/truck-parts/${item.slug}`;

  return {
    id: START_ID + index,
    name: item.name,
    category,
    brand,
    price: item.price,
    stock: true,
    stockQty: 1,
    condition: "Used",
    warranty: "90-Day Functional Warranty",
    location: "USA Warehouse",
    fitment,
    thumbnail: `${imageBase}/1.jpg`,
    images: [`${imageBase}/1.jpg`],
    description: buildDescription(item.name, fitment),
    createdAt: 1_742_000_000_000 - index,
    sourceSlug: item.slug,
  };
});

await fs.mkdir(path.dirname(OUT_JSON), { recursive: true });
await fs.writeFile(OUT_JSON, JSON.stringify(products, null, 2));
console.log(`Wrote ${products.length} truck parts → ${OUT_JSON}`);
console.log(`IDs ${products[0].id}–${products[products.length - 1].id}`);
