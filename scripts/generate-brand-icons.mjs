import sharp from "sharp";
import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const source = join(root, "spare pic", "IMG_4091.JPEG");
const publicDir = join(root, "public");

mkdirSync(join(publicDir, "brand"), { recursive: true });

const trimmed = await sharp(source).trim({ threshold: 12 }).png().toBuffer();
const meta = await sharp(trimmed).metadata();
const size = Math.max(meta.width ?? 512, meta.height ?? 512);

const square = await sharp(trimmed)
  .resize(size, size, {
    fit: "contain",
    background: { r: 255, g: 255, b: 255, alpha: 1 },
  })
  .png()
  .toBuffer();

const brandLogo = join(publicDir, "brand", "drivora-logo.png");
await sharp(square).png().toFile(brandLogo);

await sharp(square).resize(512, 512).png().toFile(join(publicDir, "favicon.png"));
await sharp(square).resize(180, 180).png().toFile(join(publicDir, "apple-touch-icon.png"));
await sharp(square).resize(32, 32).png().toFile(join(publicDir, "favicon-32.png"));
await sharp(square).resize(16, 16).png().toFile(join(publicDir, "favicon-16.png"));

copyFileSync(join(publicDir, "favicon-32.png"), join(publicDir, "favicon.ico"));

console.log("Generated brand icons from spare pic/IMG_4091.JPEG");
