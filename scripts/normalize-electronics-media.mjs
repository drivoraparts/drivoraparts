import fs from "node:fs";
import path from "node:path";

const ROOT = path.join(process.cwd(), "public", "product-media", "electronics");

const MAP = [
  ["AEM Wideband AFR Gauge", "aem-wideband-afr-gauge"],
  ["COBB Accessport", "cobb-accessport"],
  ["Dash Camera", "dash-camera"],
  ["Digital Dash Display", "digital-dash-display"],
  ["Electronic Boost Controller", "electronic-boost-controller"],
  ["Flex Fuel Sensor Kit", "flex-fuel-sensor-kit"],
  ["Haltech Elite ECU", "haltech-elite-ecu"],
  ["Haltech Nexus ECU", "haltech-nexus-ecu"],
  ["HP Tuners MPVI3", "hp-tuners-mpvi3"],
  ["MSD Ignition System", "msd-ignition-system"],
  ["Performance Data Logger", "performance-data-logger"],
  ["Professional OBD2 Scan Tool", "professional-obd2-scan-tool"],
  ["Shift Light Kit", "shift-light-kit"],
  ["TPMS Kit", "tpms-kit"],
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
