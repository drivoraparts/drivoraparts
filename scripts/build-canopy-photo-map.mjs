/**
 * Build per-SKU canopy photo URL map from supplier / retailer pages.
 * Output: lib/inventory/data/canopy-photo-urls.json
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { CANOPY_SOURCES } from "./canopy-sources.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "lib/inventory/data/canopy-photo-urls.json");

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

/** @type {Record<string, string|string[]>} */
const PAGE_OVERRIDES = {
  "ARB Ascent Canopy": [
    "https://www.arb.com.au/product/ascent-canopy/",
    "https://www.arb.com.au/product/ac20c-arb-ascent-canopy-2-lift-up-windows-toyota-hilux-2026",
  ],
  "ARB Classic Canopy": [
    "https://www.arb.com.au/product/classic-canopy/",
    "https://www.arb.com.au/content/dam/arb/production/products/ute-canopies---lids/canopies/classic-canopy/CLS76B_v2.jpg",
  ],
  "ARB Commercial Canopy": "https://www.arb.com.au/product/commercial-canopy-without-side-windows/",
  "ARB Pinnacle Canopy": "https://www.arb.com.au/product/pinnacle-canopy/",
  "RSI SmartCap EVO Adventure": "https://www.campway.com/products/rsi-smartcap-evoa-adventure/",
  "RSI SmartCap EVO Sport": "https://www.campway.com/products/rsi-smartcap-evo-sport/",
  "RSI SmartCap EVO Commercial": "https://www.campway.com/products/rsi-smartcap-evo-commercial/",
  "SmartCap EVO Defender Canopy": "https://www.campway.com/products/rsi-smartcap-evo-defender/",
  "Alu-Cab Explorer Canopy": "https://alucabworld.com/products/alu-cab-explorer-canopy/",
  "Alu-Cab Canopy Camper": "https://alucabworld.com/products/alu-cab-canopy-camper/",
  "Aeroklas Premium Canopy": "https://www.aeroklas.com.au/premium-canopy",
  "Aeroklas Stylish Canopy": "https://www.aeroklas.com.au/stylish-canopy",
  "Aeroklas Commercial Canopy": "https://www.aeroklas.com.au/commercial-canopy",
  "EGR Premium Canopy": "https://www.egr.com.au/product/premium-canopy/",
  "EGR Fleet Canopy": "https://www.egr.com.au/product/fleet-canopy/",
  "EGR Commercial Canopy": "https://www.egr.com.au/product/commercial-canopy/",
  "Carryboy S560 Canopy": "https://www.carryboythailand.com/en/product/s560/",
  "Carryboy S6 Canopy": "https://www.carryboythailand.com/en/product/s6/",
  "Carryboy Workman Canopy": "https://www.carryboythailand.com/en/product/workman/",
  "Carryboy G3 Canopy": "https://www.carryboythailand.com/en/product/g3/",
  "Flexiglass Premium Canopy": "https://www.flexiglass.net.au/products/premium-canopy",
  "Flexiglass Tradesman Canopy": "https://www.flexiglass.net.au/products/tradesman-canopy",
  "Flexiglass Sports Canopy": "https://www.flexiglass.net.au/products/sports-canopy",
  "Norweld Aluminium Canopy": "https://www.norweld.com.au/aluminium-canopies/",
  "Norweld Deluxe Canopy": "https://www.norweld.com.au/deluxe-canopy/",
  "Boss Aluminium Canopy": "https://www.bossaluminium.com.au/aluminium-canopies/",
  "Boss Premium Canopy": "https://www.bossaluminium.com.au/premium-canopy/",
  "MRT Aluminium Canopy": "https://www.mrt.com.au/aluminium-canopies/",
  "HSP Premium Canopy": "https://www.hsp.net.au/product/premium-canopy/",
  "HSP Roll R Cover Canopy": "https://www.hsp.net.au/product/roll-r-cover/",
  "Razorback Aluminium Canopy": "https://razorbackcanopies.com.au/",
  "TJM Premium Canopy": "https://www.tjm.com.au/4x4-accessories/canopies",
  "TJM Touring Canopy": "https://www.tjm.com.au/4x4-accessories/canopies/touring",
  "Mountain Top Adventure Canopy": "https://www.mountaintop.com/en-us/products/adventure-canopy",
  "Truck Covers USA Hard Canopy": "https://www.truckcoversusa.com/hard-covers/",
  "LEER 100XR Canopy": "https://www.leer.com/truck-caps/100xr/",
  "LEER 100XL Canopy": "https://www.leer.com/truck-caps/100xl/",
  "LEER 180 Canopy": "https://www.leer.com/truck-caps/180/",
  "SnugTop Rebel Canopy": "https://www.snugtop.com/truck-caps/rebel-truck-cap/",
  "SnugTop Hi-Liner Canopy": "https://www.snugtop.com/truck-caps/hi-liner-truck-cap/",
  "A.R.E. CX Classic Canopy": "https://www.4are.com/truck-caps/cx-classic/",
  "A.R.E. MX Series Canopy": "https://www.4are.com/truck-caps/mx-series/",
  "A.R.E. Z2 Series Canopy": "https://www.4are.com/truck-caps/z2-series/",
  "Century Ultra Canopy": "https://www.century.com.au/ultra-canopy/",
  "Century High-C Sport Canopy": "https://www.century.com.au/high-c-sport-canopy/",
  "Jason Trek Canopy": "https://www.jasoncanopies.com.au/trek-canopy/",
  "Jason Commercial Canopy": "https://www.jasoncanopies.com.au/commercial-canopy/",
  "Ranch Icon Canopy": "https://www.ranchcovers.com/icon-truck-cap/",
  "Ranch Sierra Canopy": "https://www.ranchcovers.com/sierra-truck-cap/",
  "Front Runner Canopy System": "https://www.frontrunneroutfitters.com/en/au/slimline-ii-canopy-kit",
};

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 72);
}

function scoreUrl(url) {
  let score = 0;
  if (/width=(?:8|9|10|12|16|20)\d{2,3}/i.test(url)) score += 40;
  if (/realtruck\.com\/production/i.test(url)) score += 35;
  if (/adobeaemcloud\.com/i.test(url)) score += 35;
  if (/arb\.com\.au\/content\/dam/i.test(url)) score += 30;
  if (/cdn\.shopify\.com.*\/products\//i.test(url)) score += 28;
  if (/cdn\.campway\.com/i.test(url)) score += 28;
  if (/wp-content\/uploads/i.test(url)) score += 22;
  if (/leer\.com\/cache\/images/i.test(url)) score += 20;
  if (/aeroklas\.com\.au\/media\/catalog/i.test(url)) score += 18;
  if (/resize200x200/i.test(url)) score -= 30;
  if (/icon|logo|sprite|badge|payment|avatar|map|location|404|menu/i.test(url)) score -= 50;
  if (/\.svg(\?|$)/i.test(url)) score -= 40;
  return score;
}

function extractImages(input, baseUrl) {
  const urls = new Set();

  if (/^https?:\/\/.+\.(jpe?g|png|webp)(\?|$)/i.test(input)) {
    urls.add(input);
    return [...urls];
  }

  const html = input;
  const og = html.match(/property="og:image"\s+content="([^"]+)"/i)?.[1];
  if (og) urls.add(og);

  for (const m of html.matchAll(/(?:src|data-src|content|href)="([^"]+)"/gi)) {
    let u = m[1].split(/\s+/)[0];
    if (!/\.(jpe?g|png|webp)(\?|$)/i.test(u) && !/cdn\.shopify|adobeaemcloud|realtruck|wp-content|content\/dam/i.test(u)) {
      continue;
    }
    if (/icon|logo|sprite|badge|payment|avatar|1x1|placeholder|favicon/i.test(u)) continue;
    if (u.startsWith("//")) u = `https:${u}`;
    else if (u.startsWith("/")) u = new URL(u, baseUrl).href;
    urls.add(u.replace(/&amp;/g, "&"));
  }

  return [...urls].sort((a, b) => scoreUrl(b) - scoreUrl(a)).slice(0, 6);
}

async function resolvePage(url) {
  if (/^https?:\/\/.+\.(jpe?g|png|webp)(\?|$)/i.test(url)) {
    return extractImages(url, url);
  }
  const res = await fetch(url, { headers: { "User-Agent": UA }, redirect: "follow" });
  const html = await res.text();
  return extractImages(html, res.url);
}

const map = {};
const usedPrimary = new Set();

for (const item of CANOPY_SOURCES) {
  const slug = slugify(item.name);
  const pages = PAGE_OVERRIDES[item.name] ?? [item.url];
  const pageList = Array.isArray(pages) ? pages : [pages];
  const collected = [];

  for (const page of pageList) {
    try {
      collected.push(...(await resolvePage(page)));
    } catch (err) {
      console.warn(`WARN ${item.name}: ${page} → ${err.message}`);
    }
  }

  const unique = [...new Set(collected)];
  let primary = unique.find((u) => !usedPrimary.has(u));
  if (!primary && unique.length) primary = unique[0];
  if (primary) usedPrimary.add(primary);

  map[slug] = {
    name: item.name,
    urls: unique.length ? unique : [],
    primary,
  };

  console.log(`${item.name}: ${unique.length} url(s)${primary ? "" : " MISSING"}`);
  if (primary) console.log(`  → ${primary.slice(0, 100)}...`);
}

await fs.writeFile(OUT, JSON.stringify(map, null, 2));
console.log(`\nWrote ${OUT}`);
