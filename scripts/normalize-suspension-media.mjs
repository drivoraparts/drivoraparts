import fs from "node:fs";
import path from "node:path";

const ROOT = path.join(process.cwd(), "public", "product-media", "suspension");

const MAP = [
  ["Adjustable Front Control Arms", "adjustable-front-control-arms"],
  ["Air Lift Performance 3H Kit", "air-lift-performance-3h-kit"],
  ["Air Lift Performance 3P Kit", "air-lift-performance-3p-kit"],
  ["BC Racing BR Series Coilovers", "bc-racing-br-series-coilovers"],
  ["Bilstein B8 Shocks", "bilstein-b8-shocks"],
  ["Bilstein B16 Coilovers", "bilstein-b16-coilovers"],
  ["Camber Arm Kit", "camber-arm-kit"],
  ["Complete Air Ride Kit", "complete-air-ride-kit"],
  ["Eibach Pro Kit Springs", "eibach-pro-kit-springs"],
  ["Fortune Auto 500 Coilovers", "fortune-auto-500-coilovers"],
  ["KW Variant 3 Coilovers", "kw-variant-3-coilovers"],
  ["Suspension Rebuild Kit", "suspension-rebuild-kit"],
  ["Tein Flex Z Coilovers", "tein-flex-z-coilovers"],
  ["Whiteline Sway Bar Kit", "whiteline-sway-bar-kit"],
];

for (const [sourceName, slug] of MAP) {
  const sourceDir = path.join(ROOT, sourceName);
  const targetDir = path.join(ROOT, slug);

  if (!fs.existsSync(sourceDir)) {
    console.error(`Missing source folder: ${sourceName}`);
    process.exit(1);
  }

  fs.mkdirSync(targetDir, { recursive: true });

  const files = fs
    .readdirSync(sourceDir)
    .filter((f) => /\.(jpe?g|png|webp)$/i.test(f))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  files.forEach((file, index) => {
    const ext = path.extname(file).toLowerCase() === ".png" ? ".png" : ".jpg";
    const dest = path.join(targetDir, `${index + 1}${ext}`);
    if (!fs.existsSync(dest)) {
      fs.copyFileSync(path.join(sourceDir, file), dest);
    }
  });

  console.log(`✓ ${slug} (${files.length} images)`);
}
