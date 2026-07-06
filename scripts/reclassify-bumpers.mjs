/**
 * Move bumper listings out of body-parts / 4x4-accessories into bumper.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const DATA_DIR = path.join(ROOT, "lib/inventory/data");

/** Brands that only sell bumpers in this catalog. */
const BUMPER_ONLY_BRANDS = new Set([
  "add-offroad",
  "dv8-offroad",
  "fab-fours",
  "rough-country",
  "duraflex",
  "liberty-walk",
  "rocket-bunny",
  "ecb",
  "afn",
]);

function isBumperProduct(name, description = "", brand = "") {
  const hay = `${name} ${description}`.toLowerCase();

  if (/snorkel|roof rack|base rack|cross bar|platform rack|thule|yakima|rhino-rack|rola|front runner/i.test(hay)) {
    return false;
  }

  if (/widebody|aero kit|body kit|truck bed|carbon fiber hood|fender flare/i.test(hay)) {
    return false;
  }

  const nameLooksLikeBumper =
    /\b(front|rear)\s+(bumper|bar)\b/.test(hay) ||
    /\bbull\s*bar\b|\bbullbar\b|\bwinch\s*bumper\b/.test(hay) ||
    /part type:\s*bumper/i.test(hay);

  if (BUMPER_ONLY_BRANDS.has(brand)) return true;
  return nameLooksLikeBumper;
}

const files = (await fs.readdir(DATA_DIR)).filter((f) => f.endsWith(".json"));
let changed = 0;

for (const file of files) {
  const jsonPath = path.join(DATA_DIR, file);
  const products = JSON.parse(await fs.readFile(jsonPath, "utf8"));
  if (!Array.isArray(products)) continue;

  let fileChanged = false;
  for (const product of products) {
    if (product.category !== "body-parts" && product.category !== "4x4-accessories") {
      continue;
    }
    if (!isBumperProduct(product.name, product.description, product.brand)) continue;

    console.log(`${file} #${product.id}: ${product.category} → bumper | ${product.name}`);
    product.category = "bumper";
    changed++;
    fileChanged = true;
  }

  if (fileChanged) {
    await fs.writeFile(jsonPath, `${JSON.stringify(products, null, 2)}\n`);
  }
}

console.log(`\nReclassified ${changed} bumper listing(s).`);
