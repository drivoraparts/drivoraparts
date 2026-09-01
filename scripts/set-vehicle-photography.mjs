/**
 * Replaces the "Start with what you drive" vehicle photography with a pinned
 * set of specified images.
 *
 *   node scripts/set-vehicle-photography.mjs            # plan
 *   node scripts/set-vehicle-photography.mjs --apply
 *
 * WHY EVERY SOURCE IS PINNED
 * Search returned mostly motor-show floor shots — technically the right model,
 * photographed beside a stand banner. These were chosen by hand for terrain and
 * presence instead. Pinning the URL per slug also removes the failure this
 * section is most exposed to: a vehicle showing another vehicle's photograph.
 * Slug and source sit on the same object and are never matched by a query.
 *
 * ATTRIBUTION
 * The Wikimedia files are CC BY-SA 4.0, which requires the creator, a licence
 * link, a source link and a note that the work was modified — every image here
 * is resized and re-encoded, so it is. Those four render through the existing
 * PhotoCredits block. The Unsplash Licence asks for none of that; the
 * photographer is still recorded so the audit stays complete.
 */
import fs from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "public/homepage");
const MANIFEST = path.join(ROOT, "lib/content/homepage-photography.json");
const APPLY = process.argv.includes("--apply");
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122 Safari/537.36";
const WIDTHS = [480, 800, 1280];

/** slug -> the one photograph that belongs to it. */
const PINNED = [
  {
    slug: "ford-ranger-4x4",
    subject: "Ranger Wildtrak on a rocky trail, Queensland",
    src: "https://images.unsplash.com/photo-1767566927815-04cf0631bfed?q=90&fm=jpg",
    landing: "https://unsplash.com/photos/black-pickup-truck-driving-up-a-rocky-wooded-hill-NlYX8KHKleY",
    id: "NlYX8KHKleY",
    creator: "4Wheelhouse",
    creatorUrl: "https://unsplash.com/@4wheelhouse",
    sourceName: "Unsplash",
    license: "unsplash",
    licenseRaw: "Unsplash License",
    licenseUrl: "https://unsplash.com/license",
    attributionRequired: false,
  },
  {
    slug: "toyota-hilux-4x4",
    subject: "HiLux crossing savanna, Botswana",
    src: "https://images.unsplash.com/photo-1759131384820-c710de76997c?q=90&fm=jpg",
    landing: "https://unsplash.com/photos/white-pickup-truck-driving-through-dry-grassy-savanna-JwoibPDe7NA",
    id: "JwoibPDe7NA",
    creator: "Ed Wingate",
    creatorUrl: "https://unsplash.com/@edwingate",
    sourceName: "Unsplash",
    license: "unsplash",
    licenseRaw: "Unsplash License",
    licenseUrl: "https://unsplash.com/license",
    attributionRequired: false,
  },
  {
    slug: "toyota-landcruiser-70-series",
    subject: "Built 70 Series on K'gari beach",
    src: "https://images.unsplash.com/photo-1770096145024-eefc88311851?q=90&fm=jpg",
    landing: "https://unsplash.com/photos/off-road-vehicle-parked-on-a-sandy-beach-near-ocean-J9mwMmjLsww",
    id: "J9mwMmjLsww",
    creator: "4Wheelhouse",
    creatorUrl: "https://unsplash.com/@4wheelhouse",
    sourceName: "Unsplash",
    license: "unsplash",
    licenseRaw: "Unsplash License",
    licenseUrl: "https://unsplash.com/license",
    attributionRequired: false,
  },
  {
    slug: "isuzu-d-max-4x4",
    subject: "D-Max configured for camping",
    commons: "ISUZU D-MAX (SECOND GENERATION, FACELIFT) CAMPING CAR IN CHINA (9).jpg",
  },
  {
    slug: "mitsubishi-triton-4x4",
    subject: "Triton/Strada Athlete 4x4, 2025",
    commons: "Mitsubishi Strada Triton 4x4 Athlete 2025 (1).jpg",
  },
  {
    slug: "byd-shark-6-phev",
    subject: "Shark 6 DMO Premium, 2025",
    commons: "BYD Shark 6 DMO Premium 2025.jpg",
  },
  {
    slug: "mazda-bt-50-4x4",
    subject: "BT-50 4x4 Premium Pangolin, 2025",
    commons: "Mazda BT50 4x4 Premium Pangolin 2025 (5).jpg",
  },
];

const strip = (s) => String(s || "").replace(/<[^>]+>/g, "").trim();

async function resolveCommons(title) {
  const u = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(`File:${title}`)}&prop=imageinfo&iiprop=url%7Csize%7Cextmetadata&format=json`;
  const r = await fetch(u, { headers: { "User-Agent": UA } });
  const j = await r.json();
  const p = Object.values((j.query && j.query.pages) || {})[0];
  if (!p || p.missing !== undefined) throw new Error(`Commons file not found: ${title}`);
  const ii = (p.imageinfo || [{}])[0];
  const em = ii.extmetadata || {};
  return {
    src: ii.url,
    landing: `https://commons.wikimedia.org/wiki/${encodeURIComponent(`File:${title}`)}`,
    id: title,
    creator: strip(em.Artist && em.Artist.value).slice(0, 90) || "Unknown",
    creatorUrl: null,
    sourceName: "Wikimedia Commons",
    license: "by-sa",
    licenseRaw: strip(em.LicenseShortName && em.LicenseShortName.value) || "CC BY-SA 4.0",
    licenseUrl: strip(em.LicenseUrl && em.LicenseUrl.value) || "https://creativecommons.org/licenses/by-sa/4.0/",
    attributionRequired: true,
  };
}

const manifest = JSON.parse(await fs.readFile(MANIFEST, "utf8"));

console.log(`  ${PINNED.length} vehicles to replace\n`);
for (const p of PINNED) {
  console.log(`   veh-${p.slug.padEnd(30)} ${p.subject}`);
}
if (!APPLY) { console.log("\n  plan only — pass --apply"); process.exit(0); }
console.log("");

const srgb = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };

for (const pin of PINNED) {
  const meta = pin.commons ? await resolveCommons(pin.commons) : pin;
  const slot = `veh-${pin.slug}`;

  const res = await fetch(meta.src, { headers: { "User-Agent": UA, Accept: "image/*" } });
  if (!res.ok) { console.log(`   ✗ ${slot}: HTTP ${res.status}`); continue; }
  const buf = Buffer.from(await res.arrayBuffer());

  const info = await sharp(buf).metadata();
  const st = await sharp(buf).stats();
  const lumin =
    0.2126 * srgb(st.channels[0].mean) +
    0.7152 * srgb(st.channels[1].mean) +
    0.0722 * srgb(st.channels[2].mean);

  const dir = path.join(OUT, slot);
  await fs.rm(dir, { recursive: true, force: true });
  await fs.mkdir(dir, { recursive: true });

  const variants = [];
  for (const w of WIDTHS) {
    if (w > info.width) continue;
    const file = path.join(dir, `${w}.webp`);
    await sharp(buf).resize({ width: w, withoutEnlargement: true }).webp({ quality: 76, effort: 6 }).toFile(file);
    variants.push({ width: w, file: `/homepage/${slot}/${w}.webp`, bytes: (await fs.stat(file)).size });
  }
  const largest = variants[variants.length - 1];

  manifest[slot] = {
    slot,
    status: "ok",
    purpose: "Vehicle platform card — Start with what you drive.",
    vehicle: pin.subject,
    sourceName: meta.sourceName,
    sourceUrl: meta.src,
    landingPage: meta.landing,
    originalId: meta.id,
    title: pin.subject,
    creator: meta.creator,
    creatorUrl: meta.creatorUrl,
    license: meta.license,
    licenseRaw: meta.licenseRaw,
    licenseUrl: meta.licenseUrl,
    attributionRequired: meta.attributionRequired,
    grade: "none",
    toneLuminance: Number(lumin.toFixed(3)),
    originalWidth: info.width,
    originalHeight: info.height,
    intrinsicWidth: largest.width,
    intrinsicHeight: Math.round((info.height / info.width) * largest.width),
    variants,
    sha256: createHash("sha256").update(buf).digest("hex").slice(0, 16),
    downloadedAt: new Date().toISOString(),
  };
  await fs.writeFile(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);

  console.log(`   ✓ ${slot.padEnd(34)} ${String(info.width + "x" + info.height).padEnd(12)} l=${lumin.toFixed(2)}  ${meta.licenseRaw}`);
  await new Promise((r) => setTimeout(r, 600));
}

console.log("\n  done");
