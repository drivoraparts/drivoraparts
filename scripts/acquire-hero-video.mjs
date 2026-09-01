/**
 * Acquires and encodes the homepage hero video.
 *
 *   PEXELS_API_KEY=<key> node scripts/acquire-hero-video.mjs            # plan
 *   PEXELS_API_KEY=<key> node scripts/acquire-hero-video.mjs --apply
 *
 * A looping muted clip is what the reference site runs behind its hero, and a
 * moving vehicle sells "we understand vehicles" faster than any still can.
 *
 * WHAT THIS GUARDS AGAINST
 * A hero video is the single heaviest thing a homepage can ship, so the
 * encode is deliberately mean: trimmed to a short loop, capped at 1600px,
 * stripped of audio, and CRF-compressed until it lands near the budget below.
 * A poster frame is extracted from the clip itself so the first paint matches
 * the video rather than flashing a different photograph, and the still hero
 * image remains the fallback for reduced-motion and for browsers that refuse
 * to autoplay.
 *
 * Sourced from Pexels, whose licence permits commercial use without
 * attribution, and downloaded — the page never points at their CDN.
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
const MANIFEST = path.join(ROOT, "lib/content/homepage-photography.json");

const APPLY = process.argv.includes("--apply");
/* --id pins a specific Pexels video. Metadata cannot tell you how large the
 * vehicle sits in frame, and most "4x4 driving" clips turn out to be aerial
 * drone shots where it is a speck -- the first pick here was one. So the
 * candidates get eyeballed from their preview stills and the winner is pinned
 * by id, which also makes the choice reproducible. */
const idIdx = process.argv.indexOf("--id");
const PIN = idIdx > -1 ? String(process.argv[idIdx + 1]) : null;
const KEY = process.env.PEXELS_API_KEY || "";
const UA = "DrivoraParts-Editorial/1.0 (homepage hero; drivoraparts.com)";

/** Hard ceiling. Past this the hero costs more than it earns on mobile. */
const MAX_BYTES = 3_800_000;
const LOOP_SECONDS = 10;
const WIDTH = 1600;

const QUERIES = [
  "4x4 truck driving dust offroad",
  "pickup truck driving dirt road dust",
  "off road vehicle desert driving",
  "suv driving mountain dirt road",
];

/* The clip must show a vehicle in motion. Landscape only -- it sits behind a
 * full-bleed hero -- and long enough that a 10s loop is not the whole file
 * played twice. */
const MUST = /\b(truck|pickup|4x4|4wd|off-?road|suv|jeep|vehicle|car|driving)\b/i;
const REJECT = /\b(racing|rally|sponsor|livery|logo|crash|drone shot of city|traffic jam)\b/i;

async function search(q) {
  const u = `https://api.pexels.com/videos/search?query=${encodeURIComponent(q)}&per_page=40&orientation=landscape&size=large`;
  const r = await fetch(u, { headers: { Authorization: KEY, "User-Agent": UA } });
  if (!r.ok) return [];
  const j = await r.json();
  return (j.videos || []).map((v) => {
    // Prefer a rendition at or just above our target width: downscaling a
    // 4K master to 1600 costs minutes of CPU for no visible gain.
    const files = (v.video_files || []).filter((f) => f.width && f.link);
    const pick =
      files.filter((f) => f.width >= WIDTH && f.width <= 2048).sort((a, b) => a.width - b.width)[0] ||
      files.sort((a, b) => b.width - a.width)[0];
    return {
      id: v.id,
      url: pick?.link,
      pickWidth: pick?.width,
      w: v.width, h: v.height, duration: v.duration,
      author: (v.user && v.user.name) || "",
      authorUrl: (v.user && v.user.url) || "",
      landing: v.url || "",
      alt: v.alt || q,
      query: q,
    };
  }).filter((c) => c.url);
}

function score(c) {
  const hay = `${c.alt} ${c.landing}`;
  if (REJECT.test(hay)) return null;
  if (!MUST.test(hay)) return null;
  if (c.duration < LOOP_SECONDS + 2) return null; // need room to pick a segment
  if (c.duration > 90) return null;               // huge masters, slow to fetch
  let s = 2;
  if (c.pickWidth >= WIDTH) s += 2;
  if (c.duration >= 12 && c.duration <= 40) s += 2; // easy to find a clean loop
  if (/dust|dirt|desert|mud|sand|gravel/i.test(hay)) s += 3;
  if (/aerial|drone|from above|birds eye/i.test(hay)) s -= 4; // vehicle reads too small
  return s;
}

if (!KEY) { console.log("  PEXELS_API_KEY not set"); process.exit(1); }

const seen = new Set();
const cands = [];
for (const q of QUERIES) {
  for (const c of await search(q)) {
    if (seen.has(c.id)) continue;
    seen.add(c.id);
    const s = score(c);
    if (s !== null) cands.push({ ...c, score: s });
  }
  await new Promise((r) => setTimeout(r, 900));
}
cands.sort((a, b) => b.score - a.score);
if (PIN) {
  const hit = cands.filter((c) => String(c.id) === PIN);
  if (!hit.length) { console.log(`  --id ${PIN} not among candidates`); process.exit(1); }
  cands.length = 0;
  cands.push(...hit);
}

console.log(`  candidates: ${cands.length}`);
for (const c of cands.slice(0, 8)) {
  console.log(`   s=${c.score}  ${String(c.duration + "s").padEnd(5)} ${String(c.pickWidth + "p").padEnd(6)} ${c.alt.slice(0, 46)}`);
}
if (!APPLY) { console.log("\n  plan only — pass --apply"); process.exit(0); }
if (!cands.length) { console.log("  no usable candidate"); process.exit(1); }

await fs.mkdir(OUT, { recursive: true });
const tmp = path.join(OUT, "_src.mp4");

for (const cand of cands.slice(0, 4)) {
  console.log(`\n  trying #${cand.id} (${cand.duration}s, ${cand.pickWidth}p) — ${cand.alt.slice(0, 50)}`);
  const r = await fetch(cand.url, { headers: { "User-Agent": UA } });
  if (!r.ok) { console.log(`   download failed HTTP ${r.status}`); continue; }
  await fs.writeFile(tmp, Buffer.from(await r.arrayBuffer()));

  // Skip the first second: clips often open mid-cut or on a title card.
  const start = Math.min(1, Math.max(0, cand.duration - LOOP_SECONDS - 1));
  const mp4 = path.join(OUT, "hero.mp4");

  // Two passes at increasing compression until the budget is met, rather than
  // guessing one CRF and shipping whatever it produces.
  let ok = false;
  for (const crf of ["30", "34"]) {
    await run("ffmpeg", [
      "-y", "-ss", String(start), "-t", String(LOOP_SECONDS), "-i", tmp,
      "-an",                                   // no audio track at all
      "-vf", `scale=${WIDTH}:-2:flags=lanczos`,
      "-c:v", "libx264", "-preset", "slow", "-crf", crf,
      "-profile:v", "high", "-pix_fmt", "yuv420p",
      "-movflags", "+faststart",               // start playing before fully loaded
      mp4,
    ], { maxBuffer: 1 << 26 });
    const size = (await fs.stat(mp4)).size;
    console.log(`   crf ${crf}: ${(size / 1e6).toFixed(2)} MB`);
    if (size <= MAX_BYTES) { ok = true; break; }
  }
  if (!ok) { console.log("   still over budget — next candidate"); continue; }

  // Poster from the clip itself, so first paint matches the video.
  const poster = path.join(OUT, "poster.webp");
  await run("ffmpeg", ["-y", "-ss", "1", "-i", mp4, "-frames:v", "1",
    "-vf", `scale=${WIDTH}:-2`, "-q:v", "72", poster], { maxBuffer: 1 << 26 });

  const buf = await fs.readFile(mp4);
  const manifest = JSON.parse(await fs.readFile(MANIFEST, "utf8"));
  manifest["hero-video"] = {
    slot: "hero-video",
    status: "ok",
    purpose: "Looping muted hero clip. The still `hero` frame remains the poster fallback.",
    sourceName: "Pexels",
    sourceUrl: cand.url,
    landingPage: cand.landing,
    originalId: String(cand.id),
    title: cand.alt,
    creator: cand.author,
    creatorUrl: cand.authorUrl,
    license: "pexels",
    licenseRaw: "Pexels Licence",
    licenseUrl: "https://www.pexels.com/license/",
    attributionRequired: false,
    file: "/homepage/hero-video/hero.mp4",
    poster: "/homepage/hero-video/poster.webp",
    bytes: buf.length,
    width: WIDTH,
    durationSeconds: LOOP_SECONDS,
    sourceDuration: cand.duration,
    sha256: createHash("sha256").update(buf).digest("hex").slice(0, 16),
    query: cand.query,
    downloadedAt: new Date().toISOString(),
  };
  await fs.writeFile(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);
  await fs.rm(tmp, { force: true });

  console.log(`\n  ✓ hero.mp4  ${(buf.length / 1e6).toFixed(2)} MB  ${LOOP_SECONDS}s  ${WIDTH}px`);
  console.log(`    poster.webp extracted`);
  console.log(`    ${cand.landing}`);
  process.exit(0);
}

await fs.rm(tmp, { force: true });
console.log("\n  no candidate met the budget");
process.exit(1);
