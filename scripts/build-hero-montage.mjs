/**
 * Builds the homepage hero montage from several licensed clips.
 *
 *   PEXELS_API_KEY=<key> node scripts/build-hero-montage.mjs --apply
 *
 * WHY A MONTAGE AND NOT ONE LONGER CLIP
 * The reference site runs 60 seconds behind its hero, and it holds attention
 * because it cuts between locations and weather -- red dust, alpine ridge in
 * cloud, tropical scrub -- with a differently-kitted vehicle in each. One
 * continuous shot of one vehicle reads as short however long it actually is,
 * which is what happened with the single 10s clip this replaces.
 *
 * SHOT LIST
 * Each entry is a real Pexels video id, chosen by eye from preview stills
 * because metadata cannot tell you how large a vehicle sits in frame or
 * whether the camera is a drone 200m up. Ids are pinned so the montage is
 * reproducible rather than "whatever the search returns today".
 *
 * BUDGET
 * Every clip is normalised to the same size, framerate and pixel format
 * before concatenation -- ffmpeg's concat demuxer produces silent corruption
 * if they differ. The result is encoded to fit MAX_BYTES; overshooting on a
 * hero video costs mobile visitors real money.
 */
import fs from "node:fs/promises";
import { createHash } from "node:crypto";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";
import { fileURLToPath } from "node:url";

const run = promisify(execFile);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "public/homepage/hero-video");
const WORK = path.join(OUT, "_work");
const MANIFEST = path.join(ROOT, "lib/content/homepage-photography.json");

const APPLY = process.argv.includes("--apply");
const KEY = process.env.PEXELS_API_KEY || "";
const UA = "DrivoraParts-Editorial/1.0 (homepage hero; drivoraparts.com)";

const WIDTH = 1600;
const HEIGHT = 900;
const FPS = 24;
const MAX_BYTES = 5_200_000;

/**
 * seconds: how long this shot runs in the cut.
 * start:   where to take it from; most clips open mid-move or on a slate.
 */
const SHOTS = [
  { id: 10981175, label: "red desert dust", start: 2, seconds: 5 },
  { id: 27363070, label: "river crossing", start: 2, seconds: 5 },
  { id: 12839189, label: "ridge at dusk", start: 3, seconds: 5 },
  { id: 34054945, label: "snow mountain", start: 4, seconds: 5 },
  /* Closes on a wheel churning mud: tight, mechanical, and about the parts
     rather than the lifestyle. The shot it replaced was a caravan being towed
     across a car park, which read as recreation, not work. */
  { id: 11794068, label: "wheel in mud", start: 1, seconds: 5 },
];

async function fetchMeta(id) {
  const r = await fetch(`https://api.pexels.com/videos/videos/${id}`, {
    headers: { Authorization: KEY, "User-Agent": UA },
  });
  if (!r.ok) throw new Error(`pexels ${id}: HTTP ${r.status}`);
  const v = await r.json();
  const files = (v.video_files || []).filter((f) => f.width && f.link);
  const pick =
    files.filter((f) => f.width >= WIDTH && f.width <= 2200).sort((a, b) => a.width - b.width)[0] ||
    files.sort((a, b) => b.width - a.width)[0];
  return {
    id,
    url: pick.link,
    pickWidth: pick.width,
    duration: v.duration,
    author: (v.user && v.user.name) || "",
    authorUrl: (v.user && v.user.url) || "",
    landing: v.url || "",
    alt: v.alt || "",
  };
}

if (!KEY) { console.log("  PEXELS_API_KEY not set"); process.exit(1); }

const metas = [];
for (const shot of SHOTS) {
  const m = await fetchMeta(shot.id);
  metas.push({ ...shot, ...m });
  console.log(`  ${String(shot.label).padEnd(17)} ${String(m.duration + "s").padEnd(5)} ${m.pickWidth}p  ${m.author}`);
  await new Promise((r) => setTimeout(r, 400));
}
const total = SHOTS.reduce((a, s) => a + s.seconds, 0);
console.log(`\n  montage: ${SHOTS.length} shots, ${total}s, ${WIDTH}x${HEIGHT} @${FPS}fps`);
if (!APPLY) { console.log("\n  plan only — pass --apply"); process.exit(0); }

await fs.rm(WORK, { recursive: true, force: true });
await fs.mkdir(WORK, { recursive: true });

// Normalise every shot identically before concatenation.
const parts = [];
for (const [i, m] of metas.entries()) {
  const raw = path.join(WORK, `raw${i}.mp4`);
  const norm = path.join(WORK, `norm${i}.mp4`);
  console.log(`  [${i + 1}/${metas.length}] ${m.label} — downloading`);
  const r = await fetch(m.url, { headers: { "User-Agent": UA } });
  if (!r.ok) { console.log(`   HTTP ${r.status}, skipped`); continue; }
  await fs.writeFile(raw, Buffer.from(await r.arrayBuffer()));

  const start = Math.min(m.start, Math.max(0, m.duration - m.seconds));
  await run("ffmpeg", [
    "-y", "-ss", String(start), "-t", String(m.seconds), "-i", raw,
    "-an",
    // Cover-crop to a common frame: scale up to fill, then centre-crop, so
    // clips of differing aspect ratios do not letterbox against each other.
    "-vf", `scale=${WIDTH}:${HEIGHT}:force_original_aspect_ratio=increase,crop=${WIDTH}:${HEIGHT},fps=${FPS},format=yuv420p`,
    "-c:v", "libx264", "-preset", "medium", "-crf", "20",
    norm,
  ], { maxBuffer: 1 << 26 });
  parts.push({ file: norm, meta: m });
  await fs.rm(raw, { force: true });
}

if (parts.length < 2) { console.log("  not enough shots survived"); process.exit(1); }

const listFile = path.join(WORK, "list.txt");
await fs.writeFile(listFile, parts.map((p) => `file '${p.file.replace(/\\/g, "/")}'`).join("\n"));

const mp4 = path.join(OUT, "hero.mp4");
let finalSize = 0;
for (const crf of ["30", "33", "36"]) {
  await run("ffmpeg", [
    "-y", "-f", "concat", "-safe", "0", "-i", listFile,
    "-an",
    "-c:v", "libx264", "-preset", "slow", "-crf", crf,
    "-profile:v", "high", "-pix_fmt", "yuv420p",
    "-movflags", "+faststart",
    mp4,
  ], { maxBuffer: 1 << 26 });
  finalSize = (await fs.stat(mp4)).size;
  console.log(`  crf ${crf}: ${(finalSize / 1e6).toFixed(2)} MB`);
  if (finalSize <= MAX_BYTES) break;
}

// Poster from the opening shot so the still matches first paint.
const poster = path.join(OUT, "poster.webp");
await run("ffmpeg", ["-y", "-ss", "1.5", "-i", mp4, "-frames:v", "1",
  "-vf", `scale=${WIDTH}:-2`, "-q:v", "72", poster], { maxBuffer: 1 << 26 });

const buf = await fs.readFile(mp4);
const manifest = JSON.parse(await fs.readFile(MANIFEST, "utf8"));
manifest["hero-video"] = {
  slot: "hero-video",
  status: "ok",
  purpose: "Looping muted hero montage. The `hero` still remains the poster fallback.",
  sourceName: "Pexels",
  license: "pexels",
  licenseRaw: "Pexels Licence",
  licenseUrl: "https://www.pexels.com/license/",
  attributionRequired: false,
  file: "/homepage/hero-video/hero.mp4",
  poster: "/homepage/hero-video/poster.webp",
  bytes: buf.length,
  width: WIDTH,
  height: HEIGHT,
  durationSeconds: parts.reduce((a, p) => a + p.meta.seconds, 0),
  shots: parts.map((p) => ({
    label: p.meta.label,
    originalId: String(p.meta.id),
    landingPage: p.meta.landing,
    creator: p.meta.author,
    creatorUrl: p.meta.authorUrl,
    sourceUrl: p.meta.url,
    seconds: p.meta.seconds,
  })),
  sha256: createHash("sha256").update(buf).digest("hex").slice(0, 16),
  downloadedAt: new Date().toISOString(),
};
await fs.writeFile(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);
await fs.rm(WORK, { recursive: true, force: true });

console.log(`\n  ✓ hero.mp4  ${(buf.length / 1e6).toFixed(2)} MB  ${manifest["hero-video"].durationSeconds}s  ${parts.length} shots`);
for (const p of parts) console.log(`    ${p.meta.label.padEnd(17)} ${p.meta.landing}`);
