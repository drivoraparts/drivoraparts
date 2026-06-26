import sharp from "sharp";
import toIco from "to-ico";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const source = join(root, "spare pic", "IMG_4091.JPEG");
const publicDir = join(root, "public");
const brandDir = join(publicDir, "brand");

/** ~12% safe zone — similar to major app icons (logo uses most of width, not cropped). */
const PADDING_RATIO = 0.12;

mkdirSync(brandDir, { recursive: true });

/** Original brand look: red mark on white. */
const ICON_BG = { r: 255, g: 255, b: 255, alpha: 1 };

const trimmed = await sharp(source).trim({ threshold: 14 }).png().toBuffer();

async function iconBuffer(size, paddingRatio = PADDING_RATIO) {
  const pad = Math.max(1, Math.round(size * paddingRatio));
  const inner = size - pad * 2;

  let pipeline = sharp(trimmed).resize(inner, inner, {
    fit: "contain",
    background: ICON_BG,
  });

  if (size <= 48) {
    pipeline = pipeline.sharpen({ sigma: 0.5, m1: 0.5, m2: 0.25 });
  }

  const scaled = await pipeline.png().toBuffer();

  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: ICON_BG,
    },
  })
    .composite([{ input: scaled, gravity: "center" }])
    .png()
    .toBuffer();
}

const icon512 = await iconBuffer(512);
const icon192 = await iconBuffer(192);
const icon180 = await iconBuffer(180);
const icon64 = await iconBuffer(64);
const icon48 = await iconBuffer(48);
const icon32 = await iconBuffer(32);
const icon16 = await iconBuffer(16);

const faviconIco = await toIco([icon16, icon32, icon48]);

const brandCheckout = await sharp(trimmed)
  .resize(120, 120, {
    fit: "contain",
    background: ICON_BG,
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
      theme_color: "#ffffff",
      background_color: "#ffffff",
      display: "standalone",
    },
    null,
    2
  )}\n`
);

console.log("Generated red-on-white brand icons, favicon.ico, and site.webmanifest");
