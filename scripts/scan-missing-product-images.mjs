/**
 * Scan all inventory sources for missing product-media files on disk.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const PUBLIC = path.join(ROOT, "public");

const SOURCES = [
  path.join(ROOT, "lib/inventory/data/ess-catalog.json"),
];

async function fileOk(webPath) {
  if (!webPath || webPath.includes("default.svg")) return false;
  try {
    const stat = await fs.stat(path.join(PUBLIC, webPath.replace(/^\//, "")));
    return stat.isFile() && stat.size > 1000;
  } catch {
    return false;
  }
}

function collectPaths(obj, out = new Set()) {
  if (typeof obj === "string" && obj.startsWith("/product-media/")) out.add(obj);
  else if (Array.isArray(obj)) obj.forEach((v) => collectPaths(v, out));
  else if (obj && typeof obj === "object") Object.values(obj).forEach((v) => collectPaths(v, out));
  return out;
}

const badProducts = [];
const badPaths = new Set();

for (const src of SOURCES) {
  const catalog = JSON.parse(await fs.readFile(src, "utf8"));
  const list = Array.isArray(catalog) ? catalog : [catalog];
  for (const p of list) {
    const thumb = p.thumbnail ?? "";
    const ok = await fileOk(thumb);
    if (!ok) badProducts.push({ id: p.id, name: p.name, thumbnail: thumb, source: path.basename(src) });
  }
}

// Scan TS product modules for broken image paths
const tsFiles = [
  "lib/inventory/products.ts",
  "lib/inventory/interior-products.ts",
  "lib/inventory/lighting-products.ts",
  "lib/inventory/electronics-products.ts",
];

for (const rel of tsFiles) {
  const text = await fs.readFile(path.join(ROOT, rel), "utf8");
  const paths = [...text.matchAll(/\/product-media\/[^"'`\s]+/g)].map((m) => m[0]);
  for (const webPath of new Set(paths)) {
    if (!(await fileOk(webPath))) badPaths.add(webPath);
  }
}

console.log(`ESS catalog products with bad thumbnail: ${badProducts.length}`);
for (const b of badProducts) console.log(`  #${b.id} ${b.thumbnail} — ${b.name}`);

console.log(`\nBroken paths referenced in TS modules: ${badPaths.size}`);
for (const p of [...badPaths].sort()) console.log(`  ${p}`);
