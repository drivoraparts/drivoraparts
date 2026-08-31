/**
 * Film grades for the homepage editorial photography.
 *
 * WHY NOT JUST DESATURATE
 * A plain black-and-white filter reads as cold and cheap, and five of them in
 * a row reads as one repeated image. These grades keep a trace of colour,
 * lift the blacks to charcoal rather than crushing them, and warm the
 * highlights only -- so sunlight stays emotionally visible even in the
 * near-monochrome frames.
 *
 * WHY THE WARMTH IS A SOFT-LIGHT COMPOSITE, NOT A TINT
 * sharp's .tint() multiplies the whole image toward one colour, which is
 * exactly how a photograph turns sepia. Compositing a warm layer in
 * `soft-light` instead pushes the bright end warm and leaves the shadows
 * near-neutral, which is what a golden-hour grade actually does.
 *
 * Grain is real noise composited at low opacity, not a texture asset: it
 * breaks up webp banding in the big flat skies and keeps the frames from
 * looking digitally clean.
 */
import sharp from "sharp";

/** A solid RGBA layer, used for the warm highlight pass. */
async function warmLayer(width, height, rgb, alpha) {
  return sharp({
    create: {
      width, height, channels: 4,
      background: { r: rgb[0], g: rgb[1], b: rgb[2], alpha },
    },
  }).png().toBuffer();
}

/** Monochrome noise, composited in `overlay` for film grain. */
async function grainLayer(width, height, strength) {
  const px = Buffer.allocUnsafe(width * height * 4);
  for (let i = 0; i < width * height; i += 1) {
    // Centred noise so it neither brightens nor darkens the frame overall.
    const v = 128 + Math.round((Math.random() - 0.5) * 255);
    const c = v < 0 ? 0 : v > 255 ? 255 : v;
    px[i * 4] = c; px[i * 4 + 1] = c; px[i * 4 + 2] = c;
    px[i * 4 + 3] = Math.round(255 * strength);
  }
  return sharp(px, { raw: { width, height, channels: 4 } }).png().toBuffer();
}

/**
 * saturation  how much colour survives (1 = untouched)
 * contrast    multiplier on the linear ramp
 * lift        added to every channel; raises blacks toward charcoal
 * warm        [r,g,b] and alpha for the soft-light highlight pass
 * grain       0 for none
 */
export const GRADES = {
  /* THE WORKHORSE — warm monochrome, dusty afternoon. Practical, not pretty. */
  "warm-mono": { saturation: 0.18, contrast: 1.03, lift: 11, warm: [255, 206, 140], warmAlpha: 0.20, grain: 0.045 },

  /* THE OFF-ROADER — monochrome but harder, with strong sun. More contrast,
     less lift, so the shadows stay dramatic under the dust. */
  "warm-mono-hard": { saturation: 0.15, contrast: 1.12, lift: 7, warm: [255, 198, 128], warmAlpha: 0.24, grain: 0.05 },

  /* THE TOURER — muted natural colour at golden hour. Colour stays, because
     the landscape is the point. */
  "warm-color": { saturation: 0.88, contrast: 1.04, lift: 8, warm: [255, 214, 158], warmAlpha: 0.14, grain: 0.03 },

  /* THE PERFORMANCE BUILD — full colour, technical and aggressive. No warm
     wash: metal should read as metal, and directional light does the work. */
  "full-color": { saturation: 1.06, contrast: 1.10, lift: -2, warm: null, warmAlpha: 0, grain: 0.022 },

  /* THE PROJECT — warm film. Lifted blacks and visible grain for the
     nostalgic workshop feel, without tipping into sepia. */
  "film-warm": { saturation: 0.70, contrast: 1.08, lift: 7, warm: [255, 202, 146], warmAlpha: 0.20, grain: 0.055 },

  /* Untouched — hero, shipping, closing and every vehicle card. */
  none: null,
};

/**
 * Applies a grade and returns a webp buffer at `width`.
 * `gradeName` of "none" (or unknown) returns a straight resize.
 */
export async function gradeToWebp(input, width, gradeName, quality = 78) {
  const g = GRADES[gradeName];
  if (!g) {
    return sharp(input).resize({ width, withoutEnlargement: true }).webp({ quality, effort: 5 }).toBuffer();
  }

  /* Materialise the resized, tone-mapped frame before building the overlays.
   *
   * The composite layers must match the output exactly. sharp's .metadata()
   * on a pipeline reports the SOURCE image, and computing the height from the
   * source aspect ratio rounds differently from sharp's own resize -- both
   * failed with "Image to composite must have same dimensions". Reading the
   * real dimensions off the rendered buffer is the only reliable way. */
  const base = await sharp(input)
    .resize({ width, withoutEnlargement: true })
    .modulate({ saturation: g.saturation })
    .linear(g.contrast, g.lift)
    .toBuffer({ resolveWithObject: true });

  const { width: w, height: h } = base.info;
  const layers = [];

  if (g.warm && g.warmAlpha > 0) {
    layers.push({ input: await warmLayer(w, h, g.warm, g.warmAlpha), blend: "soft-light" });
  }
  if (g.grain > 0) {
    layers.push({ input: await grainLayer(w, h, g.grain), blend: "overlay" });
  }

  let pipe = sharp(base.data);
  if (layers.length) pipe = pipe.composite(layers);
  return pipe.webp({ quality, effort: 5 }).toBuffer();
}
