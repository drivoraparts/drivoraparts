import sharp from "sharp";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const source = join(root, "spare pic", "IMG_4091.JPEG");
const publicDir = join(root, "public");
const appDir = join(root, "app");
const brandDir = join(publicDir, "brand");

mkdirSync(brandDir, { recursive: true });

const trimmed = await sharp(source).trim({ threshold: 14 }).png().toBuffer();

async function iconBuffer(size, paddingRatio = 0.1) {
  const pad = Math.round(size * paddingRatio);
  const inner = size - pad * 2;

  const logo = await sharp(trimmed)
    .resize(inner, inner, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: logo, gravity: "center" }])
    .png()
    .toBuffer();
}

const icon512 = await iconBuffer(512, 0.08);
const icon180 = await iconBuffer(180, 0.1);
const icon64 = await iconBuffer(64, 0.06);
const icon32 = await iconBuffer(32, 0.08);
const icon16 = await iconBuffer(16, 0.1);

const brandCheckout = await sharp(trimmed)
  .resize(120, 120, {
    fit: "contain",
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  })
  .png()
  .toBuffer();

const outputs = [
  [join(publicDir, "favicon.png"), icon512],
  [join(publicDir, "apple-touch-icon.png"), icon180],
  [join(publicDir, "favicon-32.png"), icon32],
  [join(publicDir, "favicon-16.png"), icon16],
  [join(publicDir, "favicon.ico"), icon32],
  [join(publicDir, "brand", "drivora-logo.png"), icon512],
  [join(publicDir, "brand", "drivora-icon.png"), icon64],
  [join(brandDir, "drivora-checkout.png"), brandCheckout],
  [join(appDir, "icon.png"), icon512],
  [join(appDir, "apple-icon.png"), icon180],
  [join(appDir, "favicon.ico"), icon32],
];

for (const [path, buffer] of outputs) {
  await sharp(buffer).toFile(path);
}

console.log("Generated transparent brand icons and favicon set");
