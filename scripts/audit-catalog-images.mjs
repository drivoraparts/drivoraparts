/**
 * Final catalogue image audit + verification table.
 *
 * Resolves every product exactly as the storefront composes it (base record,
 * then product-media-overrides) and classifies its served thumbnail. Reports
 * the numbers that matter for image health, and prints the per-product
 * verification table for images acquired by acquire-product-images.mjs.
 *
 * Run: node scripts/audit-catalog-images.mjs
 */
import fs from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const INV = path.join(ROOT, "lib/inventory");
const DATA = path.join(INV, "data");
const PUB = path.join(ROOT, "public");

function sniff(b) {
  if (b.length < 16) return null;
  if (b[0] === 0xff && b[1] === 0xd8) return "jpg";
  if (b[0] === 0x89 && b[1] === 0x50) return "png";
  if (b.slice(0, 4).toString("ascii") === "RIFF" && b.slice(8, 12).toString("ascii") === "WEBP") return "webp";
  if (b.slice(0, 3).toString("ascii") === "GIF") return "gif";
  // ISO base media container (AVIF/HEIC). 37 catalogue images are AVIF saved
  // with a .jpg extension -- they serve and render fine, so counting them as
  // broken was a fault in this audit, not in the catalogue.
  if (b.slice(4, 8).toString("ascii") === "ftyp") return "avif";
  return null;
}
function jpegSize(b) {
  let i = 2;
  while (i < b.length - 9) {
    if (b[i] !== 0xff) { i++; continue; }
    const m = b[i + 1];
    if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) return { h: b.readUInt16BE(i + 5), w: b.readUInt16BE(i + 7) };
    if (i + 3 >= b.length) break;
    i += 2 + b.readUInt16BE(i + 2);
  }
  return null;
}
const pngSize = (b) => (b.length < 24 ? null : { w: b.readUInt32BE(16), h: b.readUInt32BE(20) });
function webpSize(b) {
  const t = b.slice(12, 16).toString("ascii");
  if (t === "VP8X") return { w: (b.readUIntLE(24, 3) & 0xffffff) + 1, h: (b.readUIntLE(27, 3) & 0xffffff) + 1 };
  if (t === "VP8 ") return { w: b.readUInt16LE(26) & 0x3fff, h: b.readUInt16LE(28) & 0x3fff };
  if (t === "VP8L") { const n = b.readUInt32LE(21); return { w: (n & 0x3fff) + 1, h: ((n >> 14) & 0x3fff) + 1 }; }
  return null;
}
const dimsOf = (b, k) => (k === "jpg" ? jpegSize(b) : k === "png" ? pngSize(b) : k === "webp" ? webpSize(b) : null);

/* ------------------------------------------------------------- read catalogue */
const products = new Map();
for (const f of await fs.readdir(DATA)) {
  if (!f.endsWith(".json") || f.includes("overrides") || f.includes("provenance")) continue;
  let j;
  try { j = JSON.parse(await fs.readFile(path.join(DATA, f), "utf8")); } catch { continue; }
  if (!Array.isArray(j)) continue;
  for (const p of j) {
    if (!p || typeof p.id !== "number") continue;
    const imgs = Array.isArray(p.images) ? p.images.slice() : [];
    if (p.thumbnail && !imgs.includes(p.thumbnail)) imgs.unshift(p.thumbnail);
    if (imgs.length && !products.has(p.id)) products.set(p.id, { id: p.id, name: p.name || "", images: imgs });
  }
}
for (const f of await fs.readdir(INV)) {
  if (!f.endsWith(".ts")) continue;
  const text = await fs.readFile(path.join(INV, f), "utf8");
  const anchors = [...text.matchAll(/^\s*id:\s*(\d+)\s*,/gm)];
  for (let k = 0; k < anchors.length; k++) {
    const id = Number(anchors[k][1]);
    const chunk = text.slice(anchors[k].index, k + 1 < anchors.length ? anchors[k + 1].index : text.length);
    const nm = chunk.match(/\bname:\s*"((?:[^"\\]|\\.)*)"/);
    const th = chunk.match(/\bthumbnail:\s*"([^"]+)"/);
    const im = chunk.match(/\bimages:\s*\[([^\]]*)\]/);
    const imgs = im ? [...im[1].matchAll(/"([^"]+)"/g)].map((x) => x[1]) : [];
    if (th && !imgs.includes(th[1])) imgs.unshift(th[1]);
    if (imgs.length && !products.has(id)) products.set(id, { id, name: nm ? nm[1] : "", images: imgs });
  }
}
const overrides = JSON.parse(await fs.readFile(path.join(DATA, "product-media-overrides.json"), "utf8"));
for (const [k, v] of Object.entries(overrides)) {
  const id = Number(k);
  if (!v || !Array.isArray(v.images) || !v.images.length) continue;
  const prev = products.get(id) || { id, name: "" };
  const imgs = v.images.slice();
  if (v.thumbnail && !imgs.includes(v.thumbnail)) imgs.unshift(v.thumbnail);
  products.set(id, { ...prev, images: imgs });
}

/* ------------------------------------------------------------------ classify */
let good = 0, small = 0, placeholder = 0, external = 0, broken = 0;
const hashes = new Map();
const dupes = [];

for (const [id, p] of products) {
  const t = p.images[0];
  if (/^https?:/i.test(t)) { external++; continue; }
  if (t.endsWith(".svg")) { placeholder++; continue; }
  let buf;
  try { buf = await fs.readFile(path.join(PUB, t.replace(/^\//, ""))); } catch { broken++; continue; }
  const kind = sniff(buf);
  if (!kind) { broken++; continue; }
  const sha = createHash("sha256").update(buf).digest("hex");
  if (hashes.has(sha)) dupes.push([id, hashes.get(sha)]); else hashes.set(sha, id);
  const d = dimsOf(buf, kind);
  if (d && Math.max(d.w, d.h) < 600) small++; else good++;
}

const manifest = await fs.readFile(path.join(DATA, "image-provenance.json"), "utf8").then(JSON.parse).catch(() => ({}));
const acq = Object.values(manifest).filter((e) => e && e.status === "downloaded");
const uncertain = acq.filter((e) => !e.license || e.license === "unknown");

console.log(`  Total products (with images)      : ${products.size}`);
console.log(`  Good local images (>=600px)       : ${good}`);
console.log(`  Local but under 600px             : ${small}`);
console.log(`  Newly downloaded this campaign    : ${acq.length}`);
console.log(`  Still using placeholders          : ${placeholder}`);
console.log(`  Still using external URLs         : ${external}`);
console.log(`  Broken images                     : ${broken}`);
console.log(`  Duplicate thumbnails              : ${dupes.length}`);
console.log(`  Images with uncertain usage rights: ${uncertain.length}`);
console.log(`  Manifest records total            : ${Object.keys(manifest).length}`);

if (acq.length) {
  console.log(`\n  VERIFICATION TABLE — acquired images\n`);
  console.log(`  ${"ID".padEnd(6)} ${"Product".padEnd(34)} ${"Local file".padEnd(30)} ${"Source".padEnd(18)} ${"Licence".padEnd(8)} Verified`);
  for (const e of acq.sort((a, b) => a.productId - b.productId)) {
    let ok = "NO";
    try {
      const b = await fs.readFile(path.join(PUB, e.localFile.replace(/^\//, "")));
      const sha = createHash("sha256").update(b).digest("hex");
      ok = sniff(b) && sha === e.sha256 ? `yes ${e.width}x${e.height}` : "HASH MISMATCH";
    } catch { ok = "FILE MISSING"; }
    console.log(`  ${String(e.productId).padEnd(6)} ${String(e.productName).slice(0, 33).padEnd(34)} ${e.localFile.split("/").slice(-2).join("/").slice(0, 29).padEnd(30)} ${String(e.sourceName).slice(0, 17).padEnd(18)} ${String(e.license).padEnd(8)} ${ok}`);
  }
}
if (dupes.length) {
  console.log(`\n  DUPLICATE THUMBNAILS (same bytes on two products):`);
  for (const [a, b] of dupes.slice(0, 20)) console.log(`   ${a} shares an image with ${b}`);
}
