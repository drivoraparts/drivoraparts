import fs from "node:fs";
import path from "node:path";

const ROOT = path.join(process.cwd(), "public", "product-media", "bodyparts");

const MAP = [
  ["BMW G20", "bmw-g20"],
  ["BMW G20 3 Series", "bmw-g20-3-series"],
  ["Carbon Fiber Hood", "carbon-fiber-hood"],
  ["Ford F-150", "ford-f-150"],
  ["Ford Mustang S550", "ford-mustang-s550"],
  ["Ford Ranger", "ford-ranger"],
  ["Honda Civic FK8", "honda-civic-fk8"],
  ["Honda Civic FK8 Type R", "honda-civic-fk8-type-r"],
  ["Nissan 370Z", "nissan-370z"],
  ["Subaru WRX STI", "subaru-wrx-sti"],
  ["Toyota GR Supra A90", "toyota-gr-supra-a90"],
];

let missing = 0;

for (const [sourceName, slug] of MAP) {
  const sourceDir = path.join(ROOT, sourceName);
  const targetDir = path.join(ROOT, slug);

  if (!fs.existsSync(sourceDir)) {
    console.warn(`⚠ Skipping missing source folder: ${sourceName}`);
    missing++;
    continue;
  }

  fs.mkdirSync(targetDir, { recursive: true });

  const files = fs
    .readdirSync(sourceDir)
    .filter((f) => /\.(jpe?g|png|webp|avif)$/i.test(f))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  files.forEach((file, index) => {
    const ext = path.extname(file).toLowerCase();
    const normalizedExt =
      ext === ".png" ? ".png" : ext === ".webp" || ext === ".avif" ? ext : ".jpg";
    const dest = path.join(targetDir, `${index + 1}${normalizedExt}`);
    if (!fs.existsSync(dest)) {
      fs.copyFileSync(path.join(sourceDir, file), dest);
    }
  });

  console.log(`✓ ${slug} (${files.length} images)`);
}

if (missing > 0) {
  console.warn(`\n${missing} folder(s) missing — copy media to ${ROOT} and re-run.`);
  process.exitCode = 1;
}
