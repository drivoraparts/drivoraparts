import fs from "node:fs";
import path from "node:path";

const ROOT = path.join(process.cwd(), "public", "product-media", "lights");

const MAP = [
  ["AlphaRex NOVA LED Headlights", "alpharex-nova-led-headlights"],
  ["Baja Designs OnX6 LED Light Bar", "baja-designs-onx6-led-light-bar"],
  ["Baja Designs Squadron Pro", "baja-designs-squadron-pro"],
  ["Diode Dynamics SS3 Fog Lights", "diode-dynamics-ss3-fog-lights"],
  ["Govee RGB Interior Lights", "govee-rgb-interior-lights"],
  ["LED Side Marker Lights", "led-side-marker-lights"],
  ["Morimoto XB LED Headlights", "morimoto-xb-led-headlights"],
  ["Morimoto XB LED Tail Lights", "morimoto-xb-led-tail-lights"],
  ["OPT7 Aura Underglow Kit", "opt7-aura-underglow-kit"],
  ["Oracle Halo Headlights", "oracle-halo-headlights"],
  ["Osram Night Breaker Laser", "osram-night-breaker-laser"],
  ["Philips Ultinon Pro9000", "philips-ultinon-pro9000"],
  ["Rigid Industries E-Series Light Bar", "rigid-industries-e-series-light-bar"],
  ["Sequential LED Turn Signal Kit", "sequential-led-turn-signal-kit"],
  ["XK Glow Rock Lights", "xk-glow-rock-lights"],
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
