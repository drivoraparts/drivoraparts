import sharp from "sharp";
import toIco from "to-ico";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const source = join(root, "spare pic", "IMG_4091.JPEG");
const publicDir = join(root, "public");
const brandDir = join(publicDir, "brand");

mkdirSync(brandDir, { recursive: true });

/** Matches site background so icons read clearly on light and dark browser chrome. */
const BRAND_BG = { r: 10, g: 10, b: 10, alpha: 1 };

async function removeWhiteBackground(inputBuffer) {
  const { data, info } = await sharp(inputBuffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    if (r > 228 && g > 228 && b > 228) {
      data[i + 3] = 0;
    }
  }

  return sharp(data, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4,
    },
  })
    .png()
    .toBuffer();
}

const trimmed = await sharp(source).trim({ threshold: 14 }).png().toBuffer();
const logoSource = await removeWhiteBackground(trimmed);

async function iconBuffer(size, paddingRatio = 0.04) {
  const pad = Math.max(1, Math.round(size * paddingRatio));
  const inner = size - pad * 2;

  const scaled = await sharp(logoSource)
    .resize(inner, inner, {
      fit: "cover",
      position: "centre",
    })
    .png()
    .toBuffer();

  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: BRAND_BG,
    },
  })
    .composite([{ input: scaled, gravity: "center" }])
    .png()
    .toBuffer();
}

const icon512 = await iconBuffer(512, 0.02);
const icon192 = await iconBuffer(192, 0.02);
const icon180 = await iconBuffer(180, 0.02);
const icon64 = await iconBuffer(64, 0.02);
const icon48 = await iconBuffer(48, 0.02);
const icon32 = await iconBuffer(32, 0.02);
const icon16 = await iconBuffer(16, 0.02);

const faviconIco = await toIco([icon16, icon32, icon48]);

const brandCheckout = await sharp(logoSource)
  .resize(120, 120, {
    fit: "contain",
    background: BRAND_BG,
  })
  .png()
  .toBuffer();

const pngOutputs = [
  [join(publicDir, "favicon.png"), icon512],
  [join(publicDir, "favicon-192.png"), icon192],
  [join(publicDir, "apple-touch-icon.png"), icon180],
  [join(publicDir, "favicon-32.png"), icon32],
  [join(publicDir, "favicon-16.png"), icon16],
  [join(publicDir, "brand", "drivora-logo.png"), icon512],
  [join(publicDir, "brand", "drivora-icon.png"), icon64],
  [join(brandDir, "drivora-checkout.png"), brandCheckout],
];

for (const [path, buffer] of pngOutputs) {
  await sharp(buffer).toFile(path);
}

writeFileSync(join(publicDir, "favicon.ico"), faviconIco);

writeFileSync(
  join(publicDir, "site.webmanifest"),
  `${JSON.stringify(
    {
      name: "DrivoraParts",
      short_name: "DrivoraParts",
      icons: [
        {
          src: "/favicon-192.png",
          sizes: "192x192",
          type: "image/png",
          purpose: "any",
        },
        {
          src: "/favicon.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "any",
        },
        {
          src: "/apple-touch-icon.png",
          sizes: "180x180",
          type: "image/png",
          purpose: "any",
        },
      ],
      theme_color: "#0a0a0a",
      background_color: "#0a0a0a",
      display: "standalone",
    },
    null,
    2
  )}\n`
);

console.log("Generated full-bleed brand icons, favicon.ico, and site.webmanifest");
