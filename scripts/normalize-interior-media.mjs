import fs from "node:fs";
import path from "node:path";

const ROOT = path.join(process.cwd(), "public", "product-media", "interior");

const MAP = [
  ["Ford F-150", "ford-f-150"],
  ["Ford Mustang S550", "ford-mustang-s550"],
  ["Ford Ranger", "ford-ranger"],
  ["Honda Civic FK8", "honda-civic-fk8"],
  ["Honda Civic FK8 Type R", "honda-civic-fk8-type-r"],
  ["Nissan 350Z", "nissan-350z"],
  ["Nissan 370Z", "nissan-370z"],
  ["Subaru WRX STI", "subaru-wrx-sti"],
  ["Toyota GR Supra A90", "toyota-gr-supra-a90"],
  ["Toyota Hilux", "toyota-hilux"],
  ["Toyota Tacoma", "toyota-tacoma"],
  ["Volkswagen Golf GTI MK7", "volkswagen-golf-gti-mk7"],
];

function collectImages(dir) {
  const results = [];

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectImages(full));
    } else if (/\.(jpe?g|png|webp|avif)$/i.test(entry.name)) {
      results.push(full);
    }
  }

  return results.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}

let missing = 0;

for (const [sourceName, slug] of MAP) {
  const sourceDir = path.join(ROOT, sourceName);
  const targetDir = path.join(ROOT, slug);

  if (!fs.existsSync(sourceDir)) {
    console.warn(`⚠ Skipping missing source folder: ${sourceName}`);
    missing++;
    continue;
  }

  const files = collectImages(sourceDir);
  if (files.length === 0) {
    console.warn(`⚠ No images found in: ${sourceName}`);
    missing++;
    continue;
  }

  fs.mkdirSync(targetDir, { recursive: true });

  files.forEach((file, index) => {
    const ext = path.extname(file).toLowerCase();
    const normalizedExt =
      ext === ".png"
        ? ".png"
        : ext === ".webp" || ext === ".avif"
          ? ext
          : ".jpg";
    const dest = path.join(targetDir, `${index + 1}${normalizedExt}`);
    if (!fs.existsSync(dest)) {
      fs.copyFileSync(file, dest);
    }
  });

  console.log(`✓ ${slug} (${files.length} images)`);
}

if (missing > 0) {
  console.warn(`\n${missing} folder(s) missing or empty — add media and re-run.`);
  process.exitCode = 1;
}
