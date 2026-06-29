/**
 * Downloads product photos for GM/Ford swap engine listings.
 * Skips marketing overlays and screenshot assets.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const OUT_ROOT = path.join(ROOT, "public/product-media/engine/swap-packages");

const SKIP = /screenshot|instagram|nextiva|adsquare|adsqaure|ltsad|logo\.jpg|\.png$/i;

/** handle -> local folder slug, max photos */
const MAP = {
  "l86-6-2-engine": { slug: "gm-l86-6-2-engine", max: 4 },
  "l86-w-8l90-2wd": { slug: "gm-l86-8l90-drivetrain", max: 5 },
  "l83-5-3-engine": { slug: "gm-l83-5-3-engine", max: 4 },
  "l83-5-3-engine-w-6l80-transmission-2wd": { slug: "gm-l83-8l90-drivetrain", max: 4 },
  "l84-8l90-drivetrain": { slug: "gm-l84-8l90-drivetrain", max: 4 },
  "lv3-6l80-drivetrain": { slug: "gm-lv3-6l80-drivetrain", max: 3 },
  "gen-3-coyote-drivetrain": { slug: "ford-gen3-coyote-drivetrain", max: 5 },
  "gen-2-coyote": { slug: "ford-gen2-coyote", max: 5 },
  "3-5-ecoboost": { slug: "ford-ecoboost-3-5", max: 4 },
  "2020-supercharged-l87-8l90-swap-ready-crate-lt-s-625-hp": {
    slug: "gm-lt4-supercharged-swap-crate",
    max: 6,
  },
  "2019-l87-6-2-drivetrains": { slug: "gm-gen-v-6-2-package", max: 6 },
  "lt-t-twin-turbo-drivetrain": { slug: "gm-lt-twin-turbo-drivetrain", max: 5 },
  "6-6-duramax": { slug: "gm-duramax-6-6", max: 5 },
  "ess-ltx-complete-swap-drivetrains": { slug: "gm-ltx-complete-swap", max: 5 },
  "ess-lt-r-complete-swap-drivetrains": { slug: "gm-lt-r-complete-swap", max: 5 },
  "ls3-l99-drivetrains": { slug: "gm-ls3-l99-drivetrain", max: 4 },
  "lsa-drivetrains": { slug: "gm-lsa-drivetrain", max: 3 },
  "l86-10r80-drivetrain": { slug: "gm-l86-10l80-drivetrain", max: 4 },
  "gen-v-lt1-10-speed": { slug: "gm-lt1-10l80-drivetrain", max: 4 },
  "2020-ford-6-7-powerstroke-w-0-speed-transmission": {
    slug: "ford-powerstroke-6-7-drivetrain",
    max: 5,
  },
  "lt4-tr6060-wetsump-drivetrian": { slug: "gm-lt4-tr6060-drivetrain", max: 4 },
  "new-gm-lt4-drivetrain-package": { slug: "gm-lt4-new-drivetrain", max: 5 },
  "coyote-gt-750-package": { slug: "ford-coyote-gt-s", max: 4 },
  "coyote-gt-s-package-copy": { slug: "ford-coyote-gt-t", max: 4 },
  "lt-t-twin-turbo-drivetrain-copy": { slug: "gm-lt-s-max", max: 6 },
  "ess-427-ls7-drivetrain-package": { slug: "gm-ls7-427-drivetrain", max: 4 },
};

async function fetchJson(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": "DrivoraParts-Import/1.0" },
  });
  if (!res.ok) throw new Error(`${url} -> ${res.status}`);
  return res.json();
}

function extFromUrl(url) {
  const base = url.split("?")[0];
  const ext = path.extname(base).toLowerCase();
  if (ext === ".jpeg" || ext === ".jpg" || ext === ".webp" || ext === ".png") {
    return ext === ".jpeg" ? ".jpg" : ext;
  }
  return ".jpg";
}

async function download(url, dest) {
  const res = await fetch(url, {
    headers: { "User-Agent": "DrivoraParts-Import/1.0" },
  });
  if (!res.ok) throw new Error(`download ${url} -> ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await fs.writeFile(dest, buf);
}

const data = await fetchJson(
  "https://engineswapsupply.com/collections/engines-drivetrains/products.json?limit=50"
);

const summary = [];

for (const product of data.products) {
  const cfg = MAP[product.handle];
  if (!cfg) continue;

  const dir = path.join(OUT_ROOT, cfg.slug);
  await fs.mkdir(dir, { recursive: true });

  const urls = product.images
    .map((img) => img.src)
    .filter((src) => !SKIP.test(src))
    .slice(0, cfg.max);

  const files = [];
  let i = 1;
  for (const url of urls) {
    const ext = extFromUrl(url);
    const name = `${i}${ext}`;
    await download(url, path.join(dir, name));
    files.push(name);
    i += 1;
  }

  summary.push({ slug: cfg.slug, files, title: product.title });
  console.log(`OK ${cfg.slug}: ${files.length} images`);
}

await fs.writeFile(
  path.join(ROOT, "scripts/.ess-engine-import-summary.json"),
  JSON.stringify(summary, null, 2)
);

console.log(`Done — ${summary.length} products`);
