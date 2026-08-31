/**
 * Art-directs and acquires the homepage photography.
 *
 *   node scripts/acquire-homepage-photography.mjs                 # plan
 *   PEXELS_API_KEY=<key> node scripts/... --apply
 *   PEXELS_API_KEY=<key> node scripts/... --apply --refresh
 *   ... --only hero,workhorse --debug
 *
 * ONE CAMPAIGN, NOT NINETEEN SEARCHES
 * The difference between a set of stock photos and a campaign is tonal
 * consistency, and Pexels exposes `avg_color` per photograph, so that is
 * something we can measure instead of hope for. Every editorial slot declares
 * a target luminance band; a candidate outside it is penalised even when its
 * subject is perfect. The result is a page that reads dark and filmic all the
 * way down rather than lurching between a moody workshop and a bright,
 * blown-out roadside snap.
 *
 * A QUALITY BAR, NOT A FILL RATE
 * A slot whose best candidate scores below MIN_SCORE is recorded as
 * "below-bar" and left empty on purpose. The components fall back to a
 * typographic treatment, which looks deliberate; a weak stock image does not.
 * Filling all nineteen slots is not the goal.
 *
 * WHY THE SOURCES DIFFER BY ROLE
 * Editorial slots prefer Pexels: it is shot as commercial photography and the
 * Pexels Licence permits commercial use with no attribution. Vehicle cards
 * prefer Wikimedia Commons, because Pexels alt text rarely names an exact
 * model and a correctly-identified Mazda BT-50 is worth more on a fitment
 * grid than a prettier unnamed ute.
 *
 * NOTHING IS HOTLINKED
 * Everything is downloaded, re-encoded to responsive WebP, and recorded in
 * homepage-photography.json with source, licence, creator and attribution.
 * The rendered page references only local files.
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

const argv = process.argv.slice(2);
const APPLY = argv.includes("--apply");
const REFRESH = argv.includes("--refresh");
const DEBUG = argv.includes("--debug");
const onlyIdx = argv.indexOf("--only");
const ONLY = onlyIdx > -1 ? new Set(argv[onlyIdx + 1].split(",")) : null;

const UA = "DrivoraParts-Editorial/1.0 (homepage photography; drivoraparts.com)";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Commercial reuse only. NC forbids it; ND forbids the crops the layout needs. */
const OK = /^(cc0|pdm|by|by-sa|pexels)$/i;

/** Below this, a slot is left empty for a typographic treatment. */
const MIN_SCORE = 3.0;

function normWiki(s = "") {
  const t = s.toLowerCase();
  if (/-nc|\bnc\b|-nd\b|\bnd\b|fair use|non-free/.test(t)) return "restricted";
  if (t.includes("public domain") || t.startsWith("pd") || t.includes("pd-")) return "pdm";
  if (t.includes("cc0")) return "cc0";
  if (/cc[ -]by[ -]sa/.test(t)) return "by-sa";
  if (/cc[ -]by/.test(t)) return "by";
  return null;
}

/* Never editorial photography, whatever the caption claims. Brand marks are in
 * here deliberately: a logo in frame is a trademark question on top of a
 * copyright one, and this page does not need that. */
const REJECT = /\b(logo|wordmark|emblem|diagram|schematic|blueprint|drawing|sketch|render|3d model|illustration|chart|graph|map|infographic|showroom|dealership|museum|toy|model car|scale model|miniature|lego|die-?cast|crash|accident|wreck|burnt|scrap|junkyard|abandoned|derelict|police|ambulance|fire truck|military|army|war|protest|funeral|advertisement|poster|banner|billboard|magazine cover|screenshot|watermark|stock photo)\b/i;

/**
 * The page's visual story, in order:
 *   vehicle -> build -> parts -> workshop -> performance -> finished machine
 *
 * tone: target luminance of the photograph's average colour, 0 (black) to 1.
 *       The band is narrow on purpose -- it is what makes nineteen separate
 *       searches read as one art-directed set.
 */
const DARK = { target: 0.13, band: 0.13 };   // moody, filmic
const MID = { target: 0.20, band: 0.16 };    // a little more open

const EDITORIAL = [
  {
    id: "hero",
    purpose: "Opening frame. A vehicle working hard, with sky for the headline.",
    pq: [
      "4x4 driving fast dirt road dust trail",
      "pickup truck in motion desert dust cloud",
      "suv driving through dust cinematic motion",
      "off road vehicle driving mud splash action",
    ],
    queries: ["4x4 desert landscape vehicle", "pickup truck mountain road"],
    must: [/\b(truck|4x4|4wd|off-?road|pickup|suv|vehicle)\b/i],
    // A liveried race truck is dramatic but it advertises its sponsors, and
    // this page cannot carry someone else's trademarks in its opening frame.
    reject: /\b(racing|race truck|rally|dakar|nascar|sponsor|livery|team|championship|trophy truck|decal|parked|stationary|showroom)\b/i,
    minWidth: 2400, landscape: true, minRatio: 1.5,
    widths: [640, 1024, 1600, 2400], tone: DARK,
  },
  {
    id: "workhorse",
    purpose: "THE WORKHORSE — a truck earning its keep.",
    pq: [
      "pickup truck bed loaded with cargo work",
      "truck towing horse trailer",
      "pickup truck hauling firewood farm",
      "worker loading pickup truck jobsite",
    ],
    queries: ["pickup truck farm", "ute towing trailer"],
    must: [/\b(pickup|ute|truck)\b/i],
    // A European tipper lorry is not this audience's workhorse.
    // "parked" is rejected here too: a truck earning its keep should be doing
    // something. It also filters out manufacturer press units, which are
    // photographed stationary and carry brand decals the caption never mentions.
    reject: /\b(dump truck|tipper|lorry|semi|articulated|excavator|crane|bus|racing|livery|press car|demo|showroom|parked|stationary)\b/i,
    minWidth: 1600, landscape: true, widths: [640, 1024, 1600], tone: MID,
  },
  {
    id: "tourer",
    purpose: "THE TOURER — a 4x4 a long way from anywhere.",
    pq: [
      "4x4 overland camping remote landscape dusk",
      "suv driving mountain road dramatic landscape",
      "off road vehicle desert horizon sunset",
      "4x4 roof tent outback",
    ],
    queries: ["Icelandic offroad vehicle", "Land Cruiser desert track"],
    must: [/\b(4x4|4wd|off-?road|suv|overland|expedition|vehicle|truck)\b/i],
    minWidth: 1600, landscape: true, widths: [640, 1024, 1600], tone: DARK,
  },
  {
    id: "offroader",
    purpose: "THE OFF-ROADER — genuinely off the blacktop.",
    pq: [
      "4x4 driving through deep mud off road",
      "jeep rock crawling trail obstacle",
      "off road vehicle water crossing splash",
      "4x4 sand dune driving action",
    ],
    queries: ["Jeep off-road trail vehicle", "Land Rover off-road course"],
    must: [/\b(jeep|4x4|4wd|off-?road|suv|truck|vehicle)\b/i],
    reject: /\b(river|creek|landscape only|national park)\b/i,
    minWidth: 1600, landscape: true, widths: [640, 1024, 1600], tone: MID,
  },
  {
    id: "performance",
    purpose: "THE PERFORMANCE BUILD — close-up mechanical detail, not a whole car.",
    pq: [
      "turbocharger close up mechanical detail dark",
      "engine internals pistons close up",
      "exhaust manifold detail macro dark",
      "engine block machined detail",
    ],
    queries: ["V8 engine bay muscle car", "turbocharged engine bay"],
    must: [/\b(engine|turbo|motor|mechanical|piston|cylinder|exhaust|manifold)\b/i],
    // A whole car in a car park is not a performance detail shot, and a
    // manufacturer wordmark on an engine cover is a trademark in frame.
    reject: /\b(parked|car park|street|showroom|dealership|traffic|srt|badge|emblem|nameplate|logo)\b/i,
    minWidth: 1600, landscape: true, widths: [640, 1024, 1600], tone: DARK,
  },
  {
    id: "project",
    purpose: "THE PROJECT — a real workshop, mid-build.",
    pq: [
      "mechanic working on car engine workshop dark",
      "car on lift in garage workshop",
      "auto repair workshop tools engine",
      "mechanic hands repairing engine close up",
    ],
    queries: ["car on lift workshop", "mechanic repairing engine"],
    must: [/\b(mechanic|workshop|garage|repair|engine|lift|tools|car)\b/i],
    reject: /\b(shop ?front|storefront|street|presentation|slide)\b/i,
    minWidth: 1400, landscape: true, widths: [640, 1024, 1600], tone: DARK,
  },
  {
    id: "shipping",
    purpose: "Worldwide delivery — road, distance, freight.",
    pq: [
      "long empty highway desert horizon",
      "freight truck highway sunset landscape",
      "cargo container port cranes dusk",
      "aerial desert road straight",
    ],
    queries: ["freight truck highway landscape", "container ship port cranes"],
    must: [/\b(road|highway|truck|freight|container|port|cargo)\b/i],
    minWidth: 1800, landscape: true, widths: [640, 1024, 1600, 2000], tone: MID,
  },
  {
    id: "closing",
    purpose: "The finished machine. Final CTA backdrop.",
    pq: [
      "4x4 silhouette sunset dramatic landscape",
      "pickup truck golden hour dramatic",
      "off road truck dust cloud backlit",
      "suv mountain road dusk cinematic",
    ],
    queries: ["Dakar Rally desert", "4x4 desert dunes vehicle"],
    must: [/\b(4x4|4wd|off-?road|truck|pickup|suv|vehicle)\b/i],
    minWidth: 2000, landscape: true, minRatio: 1.5,
    widths: [640, 1024, 1600, 2400], tone: DARK,
  },
];

/* Vehicle cards. Model accuracy beats mood here, so Commons leads and the
 * tone band is wide. */
const VEHICLES = [
  ["ford-ranger-4x4", "Ford Ranger", ["Ford Ranger pickup", "Ford Ranger 4x4"], /ford ranger/i],
  ["toyota-hilux-4x4", "Toyota HiLux", ["Toyota Hilux", "Toyota Hilux 4x4"], /hilux/i],
  ["isuzu-d-max-4x4", "Isuzu D-Max", ["Isuzu D-Max", "Isuzu DMax pickup"], /isuzu d.?max/i],
  ["mitsubishi-triton-4x4", "Mitsubishi Triton", ["Mitsubishi Triton pickup", "Mitsubishi L200 pickup"], /triton|l200/i],
  ["byd-shark-6-phev", "BYD Shark 6", ["BYD Shark pickup", "BYD Shark 6"], /byd shark/i],
  ["mazda-bt-50-4x4", "Mazda BT-50", ["Mazda BT-50", "Mazda BT50 pickup"], /bt.?50/i],
  // Must name the 70/75/76/78/79 series: a bare "Land Cruiser" match pulled in
  // a 100-series wagon, which is a different vehicle and misleads on fitment.
  ["toyota-landcruiser-70-series", "LandCruiser 70", ["Toyota Land Cruiser 70 series", "Toyota Land Cruiser 79 series"], /land ?cruiser\s*(7[0-9]|series 7)/i],
  ["nissan-navara-4x4", "Nissan Navara", ["Nissan Navara pickup", "Nissan Navara NP300"], /navara|np300/i],
  ["gwm-cannon", "GWM Cannon", ["Great Wall Cannon pickup", "GWM Poer pickup"], /\b(gwm|great wall|poer)\b/i],
  ["volkswagen-amarok-4x4", "VW Amarok", ["Volkswagen Amarok", "VW Amarok pickup"], /amarok/i],
  ["ford-obs-73-power-stroke", "Ford OBS F-250", ["Ford F-250 1996", "Ford F-350 1997 pickup"], /ford f.?[23]50|f.?series/i],
].map(([slug, vehicle, queries, must]) => ({
  id: `veh-${slug}`, vehicle, queries, pq: queries, must: [must],
  /* Commons' vehicle corpus is dominated by motor-show stands and liveried
   * fleet units. Both were explicitly out of scope: a show photo puts the
   * manufacturer's own signage in frame, and a security or dealer livery puts
   * a third party's branding on our homepage. */
  reject: /\b(interior|dashboard|cockpit|comparison|vs |artillery|historic|museum|motor ?show|auto ?show|salon|GIMS|IAA|expo|exhibition|stand|showroom|dealer|autohaus|security|police|taxi|ambulance|fleet|livery|BEV concept)\b/i,
  minWidth: 1200, landscape: true, widths: [480, 800, 1280],
  tone: { target: 0.25, band: 0.30 }, preferCommons: true,
}));

const SLOTS = [...EDITORIAL, ...VEHICLES];

/* ------------------------------------------------------------------ sources */
async function commons(q) {
  const u = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(q)}&gsrlimit=25&gsrnamespace=6&prop=imageinfo&iiprop=url%7Csize%7Cextmetadata&iiurlwidth=2560&format=json`;
  const r = await fetch(u, { headers: { "User-Agent": UA } });
  if (r.status === 429) throw new Error("RATE_LIMIT");
  if (!r.ok) return [];
  const j = await r.json();
  return Object.values((j.query && j.query.pages) || {}).map((v) => {
    const ii = (v.imageinfo || [{}])[0], em = ii.extmetadata || {};
    const raw = (em.LicenseShortName && em.LicenseShortName.value) || "";
    return {
      url: ii.thumburl || ii.url,
      title: String(v.title || "").replace(/^File:/, ""),
      creator: String((em.Artist && em.Artist.value) || "").replace(/<[^>]+>/g, "").trim().slice(0, 90),
      licence: normWiki(raw), licenceRaw: raw,
      licenceUrl: (em.LicenseUrl && em.LicenseUrl.value) || "",
      landing: `https://commons.wikimedia.org/wiki/${encodeURIComponent(v.title || "")}`,
      source: "Wikimedia Commons", w: ii.width || 0, h: ii.height || 0,
      avg: null,
    };
  }).filter((c) => c.url);
}

const PEXELS_KEY = process.env.PEXELS_API_KEY || "";
async function pexels(q) {
  if (!PEXELS_KEY) return [];
  const u = `https://api.pexels.com/v1/search?query=${encodeURIComponent(q)}&per_page=40&orientation=landscape&size=large`;
  const r = await fetch(u, { headers: { Authorization: PEXELS_KEY, "User-Agent": UA } });
  if (r.status === 429) throw new Error("RATE_LIMIT");
  if (!r.ok) return [];
  const j = await r.json();
  return (j.photos || []).map((p) => ({
    url: (p.src && (p.src.original || p.src.large2x)) || "",
    title: p.alt || q,
    creator: p.photographer || "",
    licence: "pexels", licenceRaw: "Pexels Licence",
    licenceUrl: "https://www.pexels.com/license/",
    landing: p.url || "", source: "Pexels",
    w: p.width || 0, h: p.height || 0,
    avg: p.avg_color || null,
  })).filter((c) => c.url);
}

/* ------------------------------------------------------------------ scoring */
function lumOfHex(hex) {
  if (!hex || !/^#[0-9a-f]{6}$/i.test(hex)) return null;
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}

function score(slot, c) {
  const why = (r) => { if (DEBUG) console.log(`      reject[${r}] ${String(c.title).slice(0, 44)}`); return null; };
  if (!c.licence || !OK.test(c.licence)) return why(`licence=${c.licence}`);

  const hay = `${c.title} ${c.landing}`;
  if (REJECT.test(hay)) return why("global");
  if (slot.reject && slot.reject.test(hay)) return why("slot");
  if (!slot.must.some((re) => re.test(hay))) return why("must");

  if (c.w && c.h) {
    if (c.w < slot.minWidth) return why(`width ${c.w}`);
    const ratio = c.w / c.h;
    if (slot.landscape && ratio < (slot.minRatio || 1.2)) return why(`ratio ${ratio.toFixed(2)}`);
  }

  let s = 0;
  // Resolution, with sharply diminishing returns past what we render.
  s += Math.min(3, (c.w || 1200) / 1600);
  // Licences needing no credit are worth a little more operationally.
  if (/^(cc0|pdm|pexels)$/i.test(c.licence)) s += 1;
  // Art direction: how close the photograph sits to the slot's tonal target.
  if (slot.tone && c.avg) {
    const l = lumOfHex(c.avg);
    if (l !== null) {
      const off = Math.abs(l - slot.tone.target);
      if (off > slot.tone.band) return why(`tone ${l.toFixed(2)} vs ${slot.tone.target}`);
      s += 3 * (1 - off / slot.tone.band);
    }
  } else if (slot.tone && !c.avg) {
    // Commons gives no average colour; neither reward nor punish it.
    s += 1.2;
  }
  if (slot.preferCommons && c.source === "Wikimedia Commons") s += 2.5;
  if (!slot.preferCommons && c.source === "Pexels") s += 1.5;
  return s;
}

/* -------------------------------------------------------------------- main */
const manifest = await fs.readFile(MANIFEST, "utf8").then(JSON.parse).catch(() => ({}));
/* "below-bar" is a decision, not a gap. Re-running must not quietly undo it by
 * picking the same weak image again -- only --refresh or an explicit --only
 * reopens such a slot. */
const settled = (id) => manifest[id]?.status === "ok" || manifest[id]?.status === "below-bar";
const todo = SLOTS.filter((s) => (!ONLY || ONLY.has(s.id)) && (REFRESH || !settled(s.id)));
const used = REFRESH && !ONLY
  ? new Set()
  : new Set(Object.values(manifest).filter((e) => e && e.sourceUrl).map((e) => e.sourceUrl));

console.log(`  slots        : ${SLOTS.length}`);
console.log(`  to acquire   : ${todo.length}`);
console.log(`  pexels key   : ${PEXELS_KEY ? "present" : "MISSING — editorial slots will be weak"}`);
if (!APPLY) { console.log("\n  plan only — pass --apply"); process.exit(0); }

await fs.mkdir(OUT, { recursive: true });
let got = 0, belowBar = 0, failed = 0;

for (const slot of todo) {
  const providers = slot.preferCommons ? [commons, pexels] : [pexels, commons];
  let best = null, bestScore = -1e9;

  for (const [qi, q] of slot.queries.entries()) {
    const cands = [];
    for (const fn of providers) {
      const term = fn === pexels && slot.pq ? slot.pq[Math.min(qi, slot.pq.length - 1)] : q;
      for (let attempt = 0; attempt < 3; attempt++) {
        try { cands.push(...(await fn(term))); break; }
        catch (e) {
          const transient = e.message === "RATE_LIMIT" || /ECONNRESET|ETIMEDOUT|EAI_AGAIN|socket|fetch failed/i.test(e.message);
          if (!transient) throw e;
          if (attempt === 2) { if (DEBUG) console.log(`      ${fn.name} unavailable`); }
          else await sleep(2500 * (attempt + 1));
        }
      }
    }
    await sleep(1100);
    for (const c of cands) {
      if (used.has(c.url)) continue;
      const s = score(slot, c);
      if (s !== null && s > bestScore) { bestScore = s; best = { ...c, query: q, score: s }; }
    }
    if (best && bestScore >= 6) break; // strong enough, stop spending calls
  }

  if (!best || bestScore < MIN_SCORE) {
    belowBar++;
    manifest[slot.id] = {
      slot: slot.id, status: "below-bar", purpose: slot.purpose,
      bestScore: best ? Number(bestScore.toFixed(2)) : null,
      note: "no candidate cleared the quality bar; the section renders a typographic treatment instead",
      checkedAt: new Date().toISOString(),
    };
    await fs.writeFile(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);
    console.log(`   ·  ${slot.id.padEnd(32)} below bar (${best ? bestScore.toFixed(1) : "no match"}) — typographic fallback`);
    continue;
  }

  let buf = null;
  for (let attempt = 0; attempt < 4 && !buf; attempt++) {
    try {
      const r = await fetch(best.url, { headers: { "User-Agent": UA, Accept: "image/*" }, redirect: "follow" });
      if (r.status === 429 || r.status >= 500) throw new Error(`HTTP ${r.status}`);
      if (!r.ok) throw new Error(`HTTP ${r.status} (fatal)`);
      buf = Buffer.from(await r.arrayBuffer());
    } catch (e) {
      if (/fatal/.test(e.message) || attempt === 3) { console.log(`   ✗  ${slot.id} download failed: ${e.message}`); break; }
      await sleep(4000 * (attempt + 1));
    }
  }
  if (!buf) { failed++; continue; }

  let meta;
  try { meta = await sharp(buf).metadata(); } catch { console.log(`   ✗  ${slot.id} undecodable`); failed++; continue; }
  if (!meta.width || meta.width < slot.minWidth) { console.log(`   ✗  ${slot.id} ${meta.width}px < ${slot.minWidth}`); failed++; continue; }

  used.add(best.url);
  const dir = path.join(OUT, slot.id);
  await fs.rm(dir, { recursive: true, force: true }); // drop variants from a previous pick
  await fs.mkdir(dir, { recursive: true });

  const variants = [];
  for (const w of slot.widths) {
    if (w > meta.width) continue;
    const out = path.join(dir, `${w}.webp`);
    await sharp(buf).resize({ width: w, withoutEnlargement: true }).webp({ quality: 78, effort: 5 }).toFile(out);
    variants.push({ width: w, file: `/homepage/${slot.id}/${w}.webp`, bytes: (await fs.stat(out)).size });
  }
  const largest = variants[variants.length - 1];

  manifest[slot.id] = {
    slot: slot.id, status: "ok", purpose: slot.purpose, vehicle: slot.vehicle || null,
    sourceName: best.source, sourceUrl: best.url, landingPage: best.landing,
    title: best.title, creator: best.creator || null,
    license: best.licence, licenseRaw: best.licenceRaw, licenseUrl: best.licenceUrl,
    attributionRequired: /^(by|by-sa)$/i.test(best.licence),
    avgColor: best.avg || null,
    toneLuminance: best.avg ? Number((lumOfHex(best.avg) ?? 0).toFixed(3)) : null,
    score: Number(bestScore.toFixed(2)),
    originalWidth: meta.width, originalHeight: meta.height,
    intrinsicWidth: largest.width,
    intrinsicHeight: Math.round((meta.height / meta.width) * largest.width),
    variants, sha256: createHash("sha256").update(buf).digest("hex").slice(0, 16),
    query: best.query, downloadedAt: new Date().toISOString(),
  };
  await fs.writeFile(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);
  got++;
  const tone = best.avg ? `${best.avg} l=${(lumOfHex(best.avg) ?? 0).toFixed(2)}` : "—".padEnd(15);
  console.log(`   ✓  ${slot.id.padEnd(32)} ${String(best.licence).padEnd(6)} s=${bestScore.toFixed(1).padStart(4)}  ${tone.padEnd(16)} ${best.title.slice(0, 40)}`);
}

console.log(`\n  acquired   : ${got}`);
console.log(`  below bar  : ${belowBar}  (typographic fallback)`);
console.log(`  failed     : ${failed}`);
