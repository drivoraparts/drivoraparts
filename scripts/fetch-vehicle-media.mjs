/**
 * One-off sourcing script for the vehicle platform hub imagery.
 *
 * Every image comes from Wikimedia Commons under a CC BY-SA licence. Those
 * licences permit commercial use but REQUIRE attribution, so this script also
 * writes an attribution manifest next to the files. The hub page renders that
 * manifest as a visible credit line — without it, using these images would not
 * be licensed, it would just be uncredited copying.
 *
 * Images are downloaded at a fixed width and otherwise left unmodified, so
 * nothing here is a derivative work.
 *
 * Re-run with: node scripts/fetch-vehicle-media.mjs
 */
import fs from "fs";
import path from "path";

const UA = "DrivoraParts-catalog/1.0 (vehicle platform hub imagery)";
const WIDTH = 1600;
const OUT_ROOT = path.join(process.cwd(), "public", "vehicle-media");

/** slug -> ordered Commons file titles (no "File:" prefix). */
const SOURCES = {
  "ford-ranger-4x4": [
    "Ford Ranger (T6, P703) Wildtrak IMG 7320.jpg",
    "Ford Ranger (T6, P703) Wildtrak IMG 7323.jpg",
  ],
  "toyota-hilux-4x4": [
    "2024 Toyota HiLux GR Sport front.jpg",
    "2024 Toyota HiLux GR Sport rear.jpg",
  ],
  "isuzu-d-max-4x4": [
    "2025 Isuzu D-Max X-Rider front.jpg",
    "2025 Isuzu D-Max X-Rider rear.jpg",
    "Isuzu D-Max RG01 FL 3.0 LS-E 4x2 interior.jpg",
  ],
  "mitsubishi-triton-4x4": [
    "Mitsubishi Triton LC 2.4 Athlete 4WD Yamabuki Orange Metallic 01.jpg",
    "Mitsubishi Triton LC 2.4 Athlete 4WD Yamabuki Orange Metallic 02.jpg",
  ],
  "byd-shark-6-phev": [
    "2025 BYD Shark 6 front.jpg",
    "2025 BYD Shark 6 rear.jpg",
    "BYD Shark 6 DMO AWD interior.jpg",
  ],
  "mazda-bt-50-4x4": [
    "2022 Mazda BT-50 3.0d Turbo 4x4 (Chile) front view.jpg",
    "2021 Mazda BT-50 Hi-Racer Double-Cab 1.9 SP.jpg",
  ],
  "toyota-landcruiser-70-series": [
    "2018 Toyota Land Cruiser LC70 Curtin Desert Fireball.jpg",
    "Farmer's ute, Toyota Land Cruiser, Emerald, Queensland.jpg",
    "Toyota Land Cruiser 70 003 (cropped).JPG",
  ],
  "nissan-navara-4x4": [
    "2021 Nissan Navara facelift (cropped).jpg",
    "2017 Nissan Navara Tekna DCi 2.3 Front.jpg",
  ],
  "gwm-cannon": [
    "Great Wall Pao IMG001.jpg",
    "Great Wall Pao IMG007.jpg",
    "Great Wall Pao IMG008.jpg",
  ],
  "volkswagen-amarok-4x4": [
    "VW Amarok 3.0 TDI 4Motion Style (II) – f 05072025.jpg",
    "Volkswagen Amarok Mk2 1X7A0852.jpg",
  ],
};

/** Licences we accept. Anything else is skipped rather than used on a shop. */
const ALLOWED = /^(CC BY|CC BY-SA|CC0|Public domain)/i;

const strip = (html) =>
  String(html || "")
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Commons rate-limits bulk downloads aggressively (429). Space requests out and
 * back off rather than hammering it — being a good client is the price of using
 * a free archive.
 */
async function download(url, label) {
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    const res = await fetch(url, { headers: { "User-Agent": UA } });

    if (res.ok) return Buffer.from(await res.arrayBuffer());

    if (res.status === 429 || res.status >= 500) {
      const wait = 2000 * attempt;
      console.warn(`    …${res.status} on ${label}, retrying in ${wait / 1000}s`);
      await sleep(wait);
      continue;
    }

    console.warn(`  ! download failed ${res.status}: ${label}`);
    return null;
  }

  console.warn(`  ! gave up after retries: ${label}`);
  return null;
}

async function commonsInfo(titles) {
  const url =
    "https://commons.wikimedia.org/w/api.php?action=query&format=json" +
    "&prop=imageinfo&iiprop=url%7Cextmetadata&iiurlwidth=" +
    WIDTH +
    "&titles=" +
    encodeURIComponent(titles.map((t) => `File:${t}`).join("|"));

  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`Commons API ${res.status}`);

  const json = await res.json();
  const out = new Map();

  // The API returns pages keyed by id and may normalise titles (spaces to
  // underscores), so map results back by their returned title.
  for (const page of Object.values(json.query?.pages || {})) {
    if (page.missing !== undefined) continue;
    const info = page.imageinfo?.[0];
    if (!info) continue;
    const meta = info.extmetadata || {};
    out.set(page.title.replace(/^File:/, ""), {
      downloadUrl: info.thumburl || info.url,
      licence: strip(meta.LicenseShortName?.value) || "unknown",
      author: strip(meta.Artist?.value) || "unknown",
      descriptionUrl: info.descriptionurl,
    });
  }

  return out;
}

async function main() {
  const manifest = {};
  let downloaded = 0;
  let skipped = 0;

  for (const [slug, titles] of Object.entries(SOURCES)) {
    const info = await commonsInfo(titles);
    const dir = path.join(OUT_ROOT, slug);
    fs.mkdirSync(dir, { recursive: true });

    const entries = [];

    // File names are pinned to the title's position in SOURCES, never to a
    // running counter. A failed download must leave a gap rather than shift
    // later files down, or a re-run would attach one image's attribution to a
    // different image — which for CC BY-SA is a licensing failure, not a typo.
    for (const [position, title] of titles.entries()) {
      const index = position + 1;
      // Match on the normalised title the API echoed back.
      const key =
        [...info.keys()].find(
          (k) => k.replace(/_/g, " ") === title.replace(/_/g, " ")
        ) || null;
      const found = key ? info.get(key) : null;

      if (!found) {
        console.warn(`  ! not found on Commons: ${title}`);
        skipped += 1;
        continue;
      }

      if (!ALLOWED.test(found.licence)) {
        console.warn(`  ! licence not usable (${found.licence}): ${title}`);
        skipped += 1;
        continue;
      }

      const file = `${index}.jpg`;
      const dest = path.join(dir, file);

      // Resumable: Commons rate-limits hard, so a re-run must not re-download
      // what already landed.
      if (fs.existsSync(dest) && fs.statSync(dest).size > 0) {
        entries.push({
          src: `/vehicle-media/${slug}/${file}`,
          author: found.author,
          licence: found.licence,
          sourceUrl: found.descriptionUrl,
        });
        console.log(`  = ${slug}/${file}  (already present)`);
        continue;
      }

      const buffer = await download(found.downloadUrl, title);
      if (!buffer) {
        skipped += 1;
        continue;
      }

      fs.writeFileSync(dest, buffer);

      entries.push({
        src: `/vehicle-media/${slug}/${file}`,
        author: found.author,
        licence: found.licence,
        sourceUrl: found.descriptionUrl,
      });

      downloaded += 1;
      console.log(`  ✓ ${slug}/${file}  ${found.licence} — ${found.author}`);

      // Deliberate pacing between downloads.
      await sleep(1200);
    }

    manifest[slug] = entries;
  }

  // The manifest lives in data/ rather than public/ so it can be imported by
  // the page and reviewed in diffs. The images stay in public/ where they are
  // served from.
  fs.writeFileSync(
    path.join(process.cwd(), "data", "vehicle-media.json"),
    `${JSON.stringify(manifest, null, 2)}\n`
  );

  console.log(`\n  downloaded ${downloaded}, skipped ${skipped}`);
  console.log(`  attribution manifest: data/vehicle-media.json`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
