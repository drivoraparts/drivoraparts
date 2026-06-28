import sharp from "sharp";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const source = join(root, "spare pic", "IMG_4091.JPEG");
const outDir = join(homedir(), "Downloads", "drivora-cryptomus-logos");

const SIZE = 512;
const PADDING_RATIO = 0.12;
const MAX_BYTES = 30 * 1024;

mkdirSync(outDir, { recursive: true });

const trimmed = await sharp(source).trim({ threshold: 14 }).png().toBuffer();

async function squareLogoPng(background) {
  const pad = Math.max(1, Math.round(SIZE * PADDING_RATIO));
  const inner = SIZE - pad * 2;

  const scaled = await sharp(trimmed)
    .resize(inner, inner, {
      fit: "contain",
      background,
    })
    .png({ compressionLevel: 9, palette: false })
    .toBuffer();

  return sharp({
    create: {
      width: SIZE,
      height: SIZE,
      channels: 4,
      background,
    },
  })
    .composite([{ input: scaled, gravity: "center" }])
    .png({ compressionLevel: 9 })
    .toBuffer();
}

async function pngToSvg(rasterBuffer, backgroundColor, mime = "image/png") {
  let qualitySteps =
    mime === "image/jpeg"
      ? [
          { size: 384, quality: 82 },
          { size: 320, quality: 78 },
          { size: 256, quality: 72 },
          { size: 224, quality: 68 },
          { size: 192, quality: 64 },
          { size: 160, quality: 60 },
          { size: 128, quality: 55 },
        ]
      : [
          { size: 320, quality: 9 },
          { size: 256, quality: 9 },
          { size: 192, quality: 9 },
          { size: 160, quality: 9 },
          { size: 128, quality: 9 },
        ];

  for (const step of qualitySteps) {
    let raster = rasterBuffer;
    if (mime === "image/jpeg") {
      raster = await sharp(rasterBuffer)
        .resize(step.size, step.size)
        .jpeg({ quality: step.quality, mozjpeg: true })
        .toBuffer();
    } else {
      raster = await sharp(rasterBuffer)
        .resize(step.size, step.size)
        .png({ compressionLevel: step.quality })
        .toBuffer();
    }

    const bgRect = backgroundColor
      ? `<rect width="512" height="512" fill="${backgroundColor}"/>`
      : "";

    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512" width="512" height="512" role="img" aria-label="DrivoraParts">
${bgRect}
<image xlink:href="data:${mime};base64,${raster.toString("base64")}" x="0" y="0" width="512" height="512"/>
</svg>`;

    const bytes = Buffer.byteLength(svg, "utf8");
    if (bytes <= MAX_BYTES) {
      return { svg, bytes, rasterSize: step.size };
    }
  }

  throw new Error("Could not build SVG under 30KB limit");
}

const lightPng = await squareLogoPng({ r: 255, g: 255, b: 255, alpha: 1 });
const darkPng = await squareLogoPng({ r: 10, g: 10, b: 10, alpha: 1 });
const universalPng = lightPng;

const files = [
  ["drivora-cryptomus-logo-universal.svg", universalPng, "#ffffff"],
  ["drivora-cryptomus-logo-light.svg", lightPng, "#ffffff"],
  ["drivora-cryptomus-logo-dark.svg", darkPng, "#0a0a0a"],
];

for (const [name, png, bg] of files) {
  const { svg, bytes, rasterSize } = await pngToSvg(
    png,
    bg,
    "image/jpeg"
  );
  const path = join(outDir, name);
  writeFileSync(path, svg);
  console.log(
    `${name}: ${(bytes / 1024).toFixed(1)} KB (embedded ${rasterSize}px)`
  );
}

console.log(`\nSaved to: ${outDir}`);
