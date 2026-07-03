/**
 * Download truck part images from edmunds-truck-parts.json external URLs
 * into public/product-media/truck-parts/{slug}/ and rewrite JSON to local paths.
 *
 * Run on a network that can reach edmundstruckparts.com (e.g. GitHub Actions):
 *   node scripts/download-truck-images-from-json.mjs
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const JSON_PATH = path.join(ROOT, "lib/inventory/data/edmunds-truck-parts.json");
const MEDIA_ROOT = path.join(ROOT, "public/product-media/truck-parts");
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

function extFromUrl(url) {
  const base = url.split("?")[0];
  const ext = path.extname(base).toLowerCase();
  if (ext === ".jpeg") return ".jpg";
  if ([".jpg", ".webp", ".png"].includes(ext)) return ext;
  return ".jpg";
}

async function downloadImages(imageUrls, slug) {
  const dir = path.join(MEDIA_ROOT, slug);
  await fs.mkdir(dir, { recursive: true });
  const files = [];

  for (let i = 0; i < Math.min(imageUrls.length, 6); i += 1) {
    const url = imageUrls[i];
    const ext = extFromUrl(url);
    const name = `${i + 1}${ext}`;
    const dest = path.join(dir, name);
    try {
      const res = await fetch(url, { headers: { "User-Agent": UA } });
      if (!res.ok) continue;
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 3000) continue;
      await fs.writeFile(dest, buf);
      files.push(name);
    } catch {
      // skip failed image
    }
  }

  return files;
}

const raw = JSON.parse(await fs.readFile(JSON_PATH, "utf8"));
let synced = 0;

for (const product of raw) {
  const slug = product.sourceSlug;
  if (!slug) continue;

  const external = (product.images ?? []).filter((src) =>
    /^https?:\/\//.test(src)
  );
  if (external.length === 0) continue;

  const files = await downloadImages(external, slug);
  if (files.length === 0) continue;

  product.images = files.map((f) => `/product-media/truck-parts/${slug}/${f}`);
  product.thumbnail = product.images[0];
  synced += 1;
}

await fs.writeFile(JSON_PATH, JSON.stringify(raw, null, 2));
console.log(`Localized images for ${synced}/${raw.length} truck products`);
