/**
 * Fix TJM products stuck on "Image Coming Soon" placeholders.
 *
 * Usage: node scripts/fix-tjm-missing-images.mjs
 */
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const UA = "DrivoraParts-Import/1.0 (+https://drivoraparts.com)";
const COMING_SOON_SIZE = 24537;

/** @type {Record<string, { json: string; mediaDir: string; urls: string[] }>} */
const FIXES = {
  "TJM Outback Bull Bar for Ford Ranger": {
    json: "lib/inventory/data/bull-bars.json",
    mediaDir: "public/product-media/bull-bars/tjm-outback-bull-bar-for-ford-ranger",
    urls: [
      "https://www.tjmusa.com/media/catalog/product/cache/a81546991b8814ae920d56873a8ce88b/0/7/070sb13n21w-02-768.jpg",
      "https://www.tjmusa.com/media/catalog/product/cache/a81546991b8814ae920d56873a8ce88b/0/7/070sb13n21w-03-725.jpg",
      "https://www.tjmusa.com/media/catalog/product/cache/a81546991b8814ae920d56873a8ce88b/0/7/070sb13n21w-04-212.jpg",
      "https://www.tjmusa.com/media/catalog/product/cache/a81546991b8814ae920d56873a8ce88b/0/7/070sb13n21w-05-612.jpg",
      "https://www.tjmusa.com/media/catalog/product/cache/a81546991b8814ae920d56873a8ce88b/0/7/070sb13n21w-06-672.jpg",
      "https://www.tjmusa.com/media/catalog/product/cache/a81546991b8814ae920d56873a8ce88b/0/7/070sb13n21w-07-460.jpg",
    ],
  },
  "TJM Airtec Snorkel for Toyota Hilux": {
    json: "lib/inventory/data/snorkels.json",
    mediaDir: "public/product-media/snorkels/tjm-airtec-snorkel-for-toyota-hilux",
    urls: [
      "https://www.tjmusa.com/media/catalog/product/cache/a81546991b8814ae920d56873a8ce88b/0/1/011sat0188l-01-222.jpg",
      "https://www.tjmusa.com/media/catalog/product/cache/a81546991b8814ae920d56873a8ce88b/0/1/011sat0188l-02-365.jpg",
      "https://www.tjmusa.com/media/catalog/product/cache/a81546991b8814ae920d56873a8ce88b/0/1/011sat0188l-03-225.jpg",
    ],
  },
  "TJM Airtec Snorkel for Ford Ranger": {
    json: "lib/inventory/data/snorkels.json",
    mediaDir: "public/product-media/snorkels/tjm-airtec-snorkel-for-ford-ranger",
    urls: [
      "https://www.tjmusa.com/media/catalog/product/cache/a81546991b8814ae920d56873a8ce88b/0/1/011sat0120a-01-969.jpg",
      "https://www.tjmusa.com/media/catalog/product/cache/a81546991b8814ae920d56873a8ce88b/0/1/011sat0120a-02-507.jpg",
      "https://www.tjmusa.com/media/catalog/product/cache/a81546991b8814ae920d56873a8ce88b/0/1/011sat0120a-03-796.jpg",
      "https://www.tjmusa.com/media/catalog/product/cache/a81546991b8814ae920d56873a8ce88b/0/1/011sat0120a-04-717.jpg",
      "https://www.tjmusa.com/media/catalog/product/cache/a81546991b8814ae920d56873a8ce88b/0/1/011sat0120a-05-514.jpg",
    ],
  },
};

async function downloadImages(urls, dir) {
  await fs.mkdir(dir, { recursive: true });
  const existing = await fs.readdir(dir).catch(() => []);
  await Promise.all(existing.map((file) => fs.unlink(path.join(dir, file)).catch(() => {})));

  const seenHashes = new Set();
  const saved = [];

  for (const url of urls) {
    const res = await fetch(url, { headers: { "User-Agent": UA } });
    if (!res.ok) {
      console.warn(`  skip ${res.status} ${url}`);
      continue;
    }

    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length >= COMING_SOON_SIZE - 100 && buf.length <= COMING_SOON_SIZE + 100) {
      console.warn(`  skip coming-soon ${url}`);
      continue;
    }
    if (buf.length < 8000) {
      console.warn(`  skip tiny ${buf.length} ${url}`);
      continue;
    }

    const hash = crypto.createHash("sha256").update(buf).digest("hex");
    if (seenHashes.has(hash)) continue;
    seenHashes.add(hash);

    const extMatch = url.match(/\.(jpe?g|png|webp)(?:\?|$)/i);
    const ext = extMatch ? extMatch[1].toLowerCase().replace("jpeg", "jpg") : "jpg";
    const filename = `${saved.length + 1}.${ext}`;
    await fs.writeFile(path.join(dir, filename), buf);
    saved.push(filename);
    console.log(`  saved ${filename} (${buf.length} bytes)`);
  }

  return saved;
}

for (const [name, fix] of Object.entries(FIXES)) {
  console.log(`\n${name}`);
  const files = await downloadImages(fix.urls, path.join(ROOT, fix.mediaDir));
  if (!files.length) {
    console.warn("  No images saved — leaving catalog unchanged.");
    continue;
  }

  const mediaBase = `/${fix.mediaDir.replace(/^public\//, "")}`;
  const images = files.map((file) => `${mediaBase}/${file}`);

  const jsonPath = path.join(ROOT, fix.json);
  const catalog = JSON.parse(await fs.readFile(jsonPath, "utf8"));
  const product = catalog.find((p) => p.name === name);
  if (!product) {
    console.warn(`  Product not found in ${fix.json}`);
    continue;
  }

  product.thumbnail = images[0];
  product.image = images[0];
  product.images = images;
  await fs.writeFile(jsonPath, JSON.stringify(catalog, null, 2));
  console.log(`  updated ${fix.json}`);
}

console.log("\nDone.");
