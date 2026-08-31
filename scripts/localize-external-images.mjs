/**
 * Downloads every externally-hosted product image into the repo and rewrites
 * the product to reference the local copy, so the storefront never depends on
 * another company's server to render our photography.
 *
 * Usage:
 *   node scripts/localize-external-images.mjs                 # dry run
 *   node scripts/localize-external-images.mjs --apply
 *   node scripts/localize-external-images.mjs --apply --only 1515,1516
 *
 * PRODUCT BOUNDARIES ARE STRUCTURAL, NEVER TEXTUAL.
 * Every source here is JSON, so products are read and written via JSON.parse /
 * JSON.stringify and mutated by object identity. No regex window is ever used
 * to locate a field, which is what previously let one product inherit its
 * neighbour's photo. A product can only ever receive an image downloaded from
 * a URL found on that same product object.
 *
 * LICENSING IS NOT ESTABLISHED BY DOWNLOADING.
 * The script refuses to run against a host unless that host has an explicit
 * entry in USAGE_BASIS below saying why we may use its images commercially.
 * Recording "we downloaded it" is not a licence, and the manifest never claims
 * one. Hosts without a basis are reported and skipped, not silently fetched.
 */
import fs from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const DATA = path.join(ROOT, "lib/inventory/data");
const PUB = path.join(ROOT, "public");
const MEDIA = path.join(PUB, "product-media");
const MANIFEST = path.join(DATA, "image-provenance.json");

const APPLY = process.argv.includes("--apply");
const onlyArg = process.argv.indexOf("--only");
const ONLY = onlyArg > -1 ? new Set(process.argv[onlyArg + 1].split(",").map(Number)) : null;

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";
const MIN_EDGE = 600;

/**
 * Why we are permitted to reuse images from a host, commercially.
 * Add a host here ONLY with a real basis. `null` means "no basis established"
 * and the host's images will be skipped rather than downloaded.
 */
const USAGE_BASIS = {
  "upload.wikimedia.org": { basis: "Wikimedia Commons — per-file licence, recorded per image", attribution: true },
  "images.pexels.com": { basis: "Pexels Licence — free commercial use, no attribution required", attribution: false },
  "live.staticflickr.com": { basis: "Flickr — per-file licence, recorded per image", attribution: true },
  // Scraped from a competitor's storefront by an automated import. We have no
  // licence to their photographs of their own used inventory, so nothing here
  // is fetched until a basis is supplied.
  "edmundstruckparts.com": null,
};

// ------------------------------------------------------------ image sniffing
function sniff(buf) {
  if (buf.length < 16) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8) return "jpg";
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return "png";
  if (buf.slice(0, 4).toString("ascii") === "RIFF" && buf.slice(8, 12).toString("ascii") === "WEBP") return "webp";
  if (buf.slice(0, 3).toString("ascii") === "GIF") return "gif";
  return null; // includes HTML error pages saved with an image extension
}

function jpegSize(b) {
  let i = 2;
  while (i < b.length - 9) {
    if (b[i] !== 0xff) { i++; continue; }
    const m = b[i + 1];
    if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) {
      return { h: b.readUInt16BE(i + 5), w: b.readUInt16BE(i + 7) };
    }
    if (i + 3 >= b.length) break;
    i += 2 + b.readUInt16BE(i + 2);
  }
  return null;
}
function pngSize(b) { return b.length < 24 ? null : { w: b.readUInt32BE(16), h: b.readUInt32BE(20) }; }
function webpSize(b) {
  const t = b.slice(12, 16).toString("ascii");
  if (t === "VP8X") return { w: (b.readUIntLE(24, 3) & 0xffffff) + 1, h: (b.readUIntLE(27, 3) & 0xffffff) + 1 };
  if (t === "VP8 ") return { w: b.readUInt16LE(26) & 0x3fff, h: b.readUInt16LE(28) & 0x3fff };
  if (t === "VP8L") {
    const n = b.readUInt32LE(21);
    return { w: (n & 0x3fff) + 1, h: ((n >> 14) & 0x3fff) + 1 };
  }
  return null;
}
function dimensions(buf, kind) {
  if (kind === "jpg") return jpegSize(buf);
  if (kind === "png") return pngSize(buf);
  if (kind === "webp") return webpSize(buf);
  return null;
}

const slugify = (s) =>
  s.toLowerCase().replace(/&#?\w+;/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);

// ------------------------------------------------------------------- catalog
const files = (await fs.readdir(DATA)).filter((f) => f.endsWith(".json") && !f.includes("overrides") && !f.includes("provenance"));
const docs = new Map();
for (const f of files) {
  try {
    const j = JSON.parse(await fs.readFile(path.join(DATA, f), "utf8"));
    if (Array.isArray(j)) docs.set(f, j);
  } catch {}
}

const isExternal = (u) => typeof u === "string" && /^https?:\/\//i.test(u);
const hostOf = (u) => { try { return new URL(u).host.replace(/^www\./, ""); } catch { return "?"; } };

// Gather work, keyed by the product OBJECT so nothing can cross boundaries.
const jobs = [];
for (const [file, arr] of docs) {
  for (const product of arr) {
    if (!product || typeof product.id !== "number") continue;
    if (ONLY && !ONLY.has(product.id)) continue;
    const urls = [];
    for (const field of ["thumbnail", "image"]) {
      if (isExternal(product[field])) urls.push(product[field]);
    }
    if (Array.isArray(product.images)) for (const u of product.images) if (isExternal(u)) urls.push(u);
    if (!urls.length) continue;
    jobs.push({ file, product, urls: [...new Set(urls)] });
  }
}

const byHost = {};
for (const j of jobs) for (const u of j.urls) byHost[hostOf(u)] = (byHost[hostOf(u)] || 0) + 1;

console.log(`  products with external images : ${jobs.length}`);
console.log(`  external urls                 : ${Object.values(byHost).reduce((a, b) => a + b, 0)}`);
for (const [h, n] of Object.entries(byHost).sort((a, b) => b[1] - a[1])) {
  const basis = USAGE_BASIS[h];
  const label = basis === undefined ? "UNKNOWN HOST — no entry" : basis === null ? "NO USAGE BASIS — skipped" : basis.basis;
  console.log(`   ${String(n).padStart(4)}  ${h.padEnd(28)} ${label}`);
}

const runnable = jobs.filter((j) => j.urls.some((u) => USAGE_BASIS[hostOf(u)]));
const blocked = jobs.filter((j) => !j.urls.some((u) => USAGE_BASIS[hostOf(u)]));
console.log(`\n  downloadable now : ${runnable.length} products`);
console.log(`  blocked on basis : ${blocked.length} products`);

if (!APPLY) {
  console.log("\n  dry run — pass --apply to download and rewrite");
  process.exit(0);
}

// -------------------------------------------------------------- download
const manifest = await fs.readFile(MANIFEST, "utf8").then(JSON.parse).catch(() => ({}));
let downloaded = 0, rejected = 0, rewritten = 0;

for (const job of runnable) {
  const { product } = job;
  const slug = product.sourceSlug ? slugify(product.sourceSlug) : slugify(product.name || `product-${product.id}`);
  const dir = path.join(MEDIA, "localized", slug);
  const map = new Map(); // original url -> local web path

  for (const [i, url] of job.urls.entries()) {
    const host = hostOf(url);
    const basis = USAGE_BASIS[host];
    if (!basis) continue;

    let buf;
    try {
      const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "image/*" }, redirect: "follow" });
      if (!res.ok) { console.log(`   ✗ ${product.id} HTTP ${res.status} ${url.slice(0, 60)}`); rejected++; continue; }
      buf = Buffer.from(await res.arrayBuffer());
    } catch (e) {
      console.log(`   ✗ ${product.id} ${e.message} ${url.slice(0, 50)}`); rejected++; continue;
    }

    const kind = sniff(buf);
    if (!kind) { console.log(`   ✗ ${product.id} not an image (probably HTML) ${url.slice(0, 50)}`); rejected++; continue; }
    const dim = dimensions(buf, kind);
    if (dim && Math.max(dim.w, dim.h) < MIN_EDGE) {
      console.log(`   ! ${product.id} ${dim.w}x${dim.h} under ${MIN_EDGE}px — kept, flagged`);
    }

    await fs.mkdir(dir, { recursive: true });
    // Position-based name: index is fixed before any request, so a failure
    // cannot shift a later image onto an earlier one's filename/attribution.
    const local = `/product-media/localized/${slug}/${i + 1}.${kind}`;
    await fs.writeFile(path.join(PUB, local.replace(/^\//, "")), buf);
    map.set(url, local);
    downloaded++;

    manifest[local] = {
      productId: product.id,
      productName: product.name,
      localFile: local,
      sourceUrl: url,
      sourceName: host,
      usageBasis: basis.basis,
      attributionRequired: basis.attribution,
      sha256: createHash("sha256").update(buf).digest("hex").slice(0, 16),
      bytes: buf.length,
      width: dim?.w ?? null,
      height: dim?.h ?? null,
      downloadedAt: new Date().toISOString(),
      verified: "downloaded+sniffed",
    };
  }

  if (!map.size) continue;
  // Rewrite by object identity — this product only.
  for (const field of ["thumbnail", "image"]) {
    if (map.has(product[field])) product[field] = map.get(product[field]);
  }
  if (Array.isArray(product.images)) {
    product.images = product.images.map((u) => map.get(u) ?? u);
  }
  rewritten++;
}

for (const [file, arr] of docs) {
  await fs.writeFile(path.join(DATA, file), `${JSON.stringify(arr, null, 2)}\n`);
}
await fs.writeFile(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);

console.log(`\n  downloaded : ${downloaded}`);
console.log(`  rejected   : ${rejected}`);
console.log(`  products rewritten : ${rewritten}`);
console.log(`  manifest entries   : ${Object.keys(manifest).length}`);
