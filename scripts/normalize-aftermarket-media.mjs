import fs from "node:fs";
import path from "node:path";

const ROOT = path.join(process.cwd(), "public", "product-media", "aftermarket");

const MAP = [
  ["1500 mm aluminium canopy", "1500-mm-aluminum-canopy"],
  ["Alloy Ute canopy", "alloy-ute-canopy"],
  ["Aluminium Canopy", "aluminum-canopy"],
  ["Camper shell Snugtop", "camper-shell-snugtop"],
  ["Canopy", "truck-bed-canopy"],
  ["EOI 1200 black canopy", "eoi-1200-black-canopy"],
  ["Leer 100XR", "leer-100xr"],
  ["Leer Camper Shell", "leer-camper-shell"],
  [
    "Metal Camper Shell Topper Canopy Bed Cap For F150 5.5 Ft 2015 to 2020",
    "f150-5-5ft-camper-shell-canopy",
  ],
  ["Ute Canopy", "ute-canopy"],
  ["WHITE LEER CAB HIGH CAB 100XR SHELL", "white-leer-100xr-high-cab-shell"],
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
