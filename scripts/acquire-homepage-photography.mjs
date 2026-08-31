/**
 * Acquires the homepage's editorial photography under licences that actually
 * permit commercial reuse, stores it locally, and derives responsive WebP.
 *
 *   node scripts/acquire-homepage-photography.mjs            # plan
 *   node scripts/acquire-homepage-photography.mjs --apply
 *   node scripts/acquire-homepage-photography.mjs --apply --only hero,workhorse
 *
 * WHY THESE SOURCES
 * Every source here returns a machine-readable licence per result, so "we may
 * use this commercially" is a field we read rather than a claim we invent.
 * Scraping a stock site's pages instead would mean taking images without
 * reading their terms -- the exact mistake the Edmunds hotlinks were.
 *
 * Pexels is tried first and only works when PEXELS_API_KEY is set. It is worth
 * the key: Commons is an encyclopedia, so its vehicle photography is
 * documentary ("car parked in a street") and its landscapes often contain no
 * vehicle at all. Without the key this script still runs, but the editorial
 * slots fall back to Commons and read as documentation rather than campaign.
 *
 *   PEXELS_API_KEY=<key> node scripts/acquire-homepage-photography.mjs --apply --refresh
 *
 * NOTHING IS EVER HOTLINKED
 * Every accepted photograph is downloaded, verified, re-encoded locally and
 * recorded in homepage-photography.json with its source URL, licence,
 * creator and whether attribution is required. The rendered page references
 * only local files, so no third party can take the homepage down.
 *
 * SLOTS, NOT A PILE OF STOCK
 * Each image has a job. A slot declares what it must depict, the orientation
 * and resolution the layout needs, and the words that must appear in the
 * candidate's own title for it to qualify. A photo that cannot prove it shows
 * the right subject is rejected rather than used as filler.
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
const onlyIdx = argv.indexOf("--only");
const ONLY = onlyIdx > -1 ? new Set(argv[onlyIdx + 1].split(",")) : null;
/* Re-acquire slots that already succeeded. Used when a better source becomes
   available (a Pexels key) and the existing Commons picks should be replaced. */
const REFRESH = argv.includes("--refresh");

const UA = "DrivoraParts-Editorial/1.0 (homepage photography; drivoraparts.com)";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* Commercial reuse only. NC forbids it; ND forbids the crops we need. */
const OK = /^(cc0|pdm|by|by-sa|pexels)$/i;
function normWiki(s = "") {
  const t = s.toLowerCase();
  if (/-nc|\bnc\b|-nd\b|\bnd\b|fair use|non-free/.test(t)) return "restricted";
  if (t.includes("public domain") || t.startsWith("pd") || t.includes("pd-")) return "pdm";
  if (t.includes("cc0")) return "cc0";
  if (/cc[ -]by[ -]sa/.test(t)) return "by-sa";
  if (/cc[ -]by/.test(t)) return "by";
  return null;
}

/* Never acceptable as editorial photography, whatever the title says. */
const REJECT = /\b(logo|wordmark|emblem|badge close|diagram|schematic|blueprint|drawing|sketch|chart|map|graph|assembly line|factory floor|showroom|dealership|museum|toy|model car|scale model|miniature|lego|die-?cast|crash|accident|wreck|burnt|fire|police|ambulance|funeral|cemetery|protest|war|military|patent|advertisement|poster|magazine cover|screenshot|interior of|dashboard|odometer|engine bay detail)\b/i;

/**
 * Each slot: what it depicts, how the layout will use it, and the tokens a
 * candidate's title must contain to prove it shows the right thing.
 */
const SLOTS = [
  {
    id: "hero",
    purpose: "Full-bleed opening frame. Needs negative space for the headline.",
    queries: ["Dakar Rally truck", "rally raid truck desert", "Australian road train outback", "off-road racing truck dust"],
    // Convoy-and-dunes language, because the opening frame needs vehicles in
    // motion against open sky -- the sky is where the headline sits.
    pq: ["off road vehicles convoy desert dunes","4x4 driving sand dunes sunset","offroad truck desert landscape","pickup truck dirt road mountains"],
    must: [/\b(rally|dakar|road train|truck|4x4|4wd|off-?road)\b/i],
    minWidth: 2000, landscape: true, widths: [640, 1024, 1600, 2400],
  },
  {
    id: "workhorse",
    purpose: "THE WORKHORSE — a truck doing real work.",
    queries: ["Australian road train headed", "road train outback highway", "mining haul truck", "logging truck road"],
    pq: ["pickup truck construction site work","truck towing trailer","farm truck field work","heavy duty truck jobsite"],
    must: [/\b(road train|truck|haul|logging|mining)\b/i],
    minWidth: 1400, landscape: true, widths: [640, 1024, 1600],
  },
  {
    id: "tourer",
    purpose: "THE TOURER — a 4x4 crossing a dramatic landscape.",
    queries: ["Icelandic offroad vehicle", "4x4 desert crossing expedition", "Land Cruiser desert track", "4wd mountain pass gravel"],
    pq: ["4x4 camping overland desert","suv driving mountain road","offroad vehicle remote landscape","roof tent 4x4 outback"],
    must: [/\b(offroad|off-?road|4x4|4wd|land ?cruiser|desert|track|expedition)\b/i],
    minWidth: 1400, landscape: true, widths: [640, 1024, 1600],
  },
  {
    id: "offroader",
    purpose: "THE OFF-ROADER — a vehicle genuinely off-road.",
    // "crossing" matched a photograph of an empty river with no vehicle in it,
    // so the title must name a vehicle rather than the terrain.
    queries: ["Jeep off-road trail vehicle", "Land Rover off-road course", "4x4 vehicle driving mud", "SUV off-road obstacle course"],
    pq: ["4x4 offroad mud driving","jeep rock crawling trail","offroad vehicle splashing water","suv sand dune driving"],
    must: [/\b(jeep|land rover|toyota|4x4|4wd|suv|truck|vehicle|car)\b/i],
    reject: /\b(crossing|river|creek|stream|waterfall|landscape|national park)\b/i,
    minWidth: 1400, landscape: true, widths: [640, 1024, 1600],
  },
  {
    id: "performance",
    purpose: "THE PERFORMANCE BUILD — power and intent.",
    queries: ["V8 engine bay muscle car", "race car pit lane", "motorsport car cornering", "turbocharged engine bay"],
    pq: ["muscle car engine bay","sports car motion blur road","performance car race track","turbo engine closeup"],
    // Commons names files after the subject; Pexels alt text is a sentence
    // ("Red sports car on a road"), so plain vehicle nouns have to qualify too.
    must: [/\b(engine|v8|race|motorsport|rally|turbo|muscle|sports? car|car|vehicle)\b/i],
    minWidth: 1400, landscape: true, widths: [640, 1024, 1600],
  },
  {
    id: "project",
    purpose: "THE PROJECT — a build in a workshop.",
    queries: ["car on lift workshop", "engine rebuild workbench", "vehicle restoration workshop", "mechanic repairing engine", "auto repair shop interior", "classic car restoration garage"],
    pq: ["mechanic working on car engine","car workshop garage repair","auto repair shop lift","engine rebuild workbench"],
    // "restoration" alone matched a slide deck about restoring a Korean
    // stream, so the subject noun must be a vehicle, not the activity.
    must: [/\b(car|vehicle|auto|automobile|engine|garage|workshop|mechanic)\b/i],
    reject: /\b(shop ?front|storefront|services,|stream|river|creek|presentation|slide|poster|conference)\b/i,
    // Lower floor than the other editorial slots: good workshop interiors are
    // scarce on Commons, and this image renders in a half-width column.
    minWidth: 1100, landscape: true, widths: [640, 1024, 1600],
  },
  {
    id: "shipping",
    purpose: "Worldwide delivery — road and distance.",
    queries: ["Australian road train highway", "freight truck highway landscape", "container ship port cranes", "long haul truck desert road"],
    pq: ["long empty highway horizon","freight truck highway sunset","cargo containers port","desert road aerial"],
    must: [/\b(road train|freight|truck|container|port|highway)\b/i],
    minWidth: 1600, landscape: true, widths: [640, 1024, 1600, 2000],
  },
  {
    id: "closing",
    purpose: "Final CTA backdrop.",
    queries: ["Dakar Rally 2011 desert", "4x4 desert dunes vehicle", "off-road truck dust cloud", "rally truck sand"],
    pq: ["pickup truck golden hour landscape","4x4 sunset silhouette desert","offroad truck dust cloud","truck mountain road dusk"],
    must: [/\b(rally|dakar|4x4|4wd|off-?road|truck|dune|desert)\b/i],
    reject: /\b(abandoned|derelict|rust|wreck|scrap)\b/i,
    minWidth: 1800, landscape: true, widths: [640, 1024, 1600, 2400],
  },
  /* One per catalogue vehicle platform. Must name the actual model. */
  { id: "veh-ford-ranger-4x4", vehicle: "Ford Ranger", queries: ["Ford Ranger pickup", "Ford Ranger 4x4"], must: [/ford ranger/i] },
  { id: "veh-toyota-hilux-4x4", vehicle: "Toyota HiLux", queries: ["Toyota Hilux", "Toyota Hilux 4x4"], must: [/hilux/i] },
  { id: "veh-isuzu-d-max-4x4", vehicle: "Isuzu D-Max", queries: ["Isuzu D-Max", "Isuzu DMax pickup"], must: [/isuzu d.?max/i] },
  { id: "veh-mitsubishi-triton-4x4", vehicle: "Mitsubishi Triton", queries: ["Mitsubishi Triton pickup exterior", "Mitsubishi L200 pickup", "Mitsubishi Triton 4x4"], must: [/triton|l200/i], reject: /\b(interior|dashboard|cockpit|engine bay|rear seats)\b/i },
  { id: "veh-byd-shark-6-phev", vehicle: "BYD Shark 6", queries: ["BYD Shark pickup", "BYD Shark 6"], must: [/byd shark/i] },
  { id: "veh-mazda-bt-50-4x4", vehicle: "Mazda BT-50", queries: ["Mazda BT-50", "Mazda BT50 pickup"], must: [/bt.?50/i] },
  { id: "veh-toyota-landcruiser-70-series", vehicle: "LandCruiser 70", queries: ["Toyota Land Cruiser 70 series", "Toyota Landcruiser 79"], must: [/land ?cruiser/i] },
  { id: "veh-nissan-navara-4x4", vehicle: "Nissan Navara", queries: ["Nissan Navara pickup", "Nissan Navara NP300", "Nissan Frontier pickup"], must: [/navara|frontier|np300/i], reject: /\b(interior|dashboard|comparison|vs |shopfront)\b/i },
  // "cannon" on its own matched a field of historic artillery, so the marque
// has to appear -- the model name alone is not evidence of a vehicle.
{ id: "veh-gwm-cannon", vehicle: "GWM Cannon", queries: ["Great Wall Cannon pickup", "GWM Cannon ute", "GWM Poer pickup"], must: [/\b(gwm|great wall|haval|poer)\b/i], reject: /\b(artillery|historic|museum|fort|war|napoleon|civil war)\b/i },
  { id: "veh-volkswagen-amarok-4x4", vehicle: "VW Amarok", queries: ["Volkswagen Amarok", "VW Amarok pickup"], must: [/amarok/i] },
  { id: "veh-ford-obs-73-power-stroke", vehicle: "Ford OBS F-250", queries: ["Ford F-250 1996", "Ford F-350 1997 pickup", "Ford F-Series ninth generation"], must: [/ford f.?[23]50|f.?series/i] },
];
for (const s of SLOTS) {
  if (!s.minWidth) s.minWidth = 1000;
  if (s.landscape === undefined) s.landscape = true;
  if (!s.widths) s.widths = [480, 800, 1280];
}

/* ------------------------------------------------------------------ search */
async function commons(q) {
  const u = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(q)}&gsrlimit=25&gsrnamespace=6&prop=imageinfo&iiprop=url%7Csize%7Cextmetadata&iiurlwidth=2560&format=json`;
  const r = await fetch(u, { headers: { "User-Agent": UA } });
  if (!r.ok) return [];
  const j = await r.json();
  return Object.values((j.query && j.query.pages) || {}).map((v) => {
    const ii = (v.imageinfo || [{}])[0], em = ii.extmetadata || {};
    const raw = (em.LicenseShortName && em.LicenseShortName.value) || "";
    return {
      // Prefer the pre-scaled rendition: a 16000px original is throttled and
      // wasted, since nothing here renders wider than 2400.
      url: ii.thumburl || ii.url, fullUrl: ii.url,
      title: String(v.title || "").replace(/^File:/, ""),
      creator: String((em.Artist && em.Artist.value) || "").replace(/<[^>]+>/g, "").trim().slice(0, 90),
      licence: normWiki(raw), licenceRaw: raw,
      licenceUrl: (em.LicenseUrl && em.LicenseUrl.value) || "",
      landing: `https://commons.wikimedia.org/wiki/${encodeURIComponent(v.title || "")}`,
      source: "Wikimedia Commons", w: ii.width || 0, h: ii.height || 0,
    };
  }).filter((c) => c.url);
}
async function openverse(q) {
  const u = `https://api.openverse.org/v1/images/?q=${encodeURIComponent(q)}&page_size=25&license_type=commercial&size=large`;
  const r = await fetch(u, { headers: { "User-Agent": UA } });
  if (!r.ok) return [];
  const j = await r.json();
  return (j.results || []).map((x) => ({
    url: x.url, title: x.title || "", creator: x.creator || "",
    licence: (x.license || "").toLowerCase(), licenceRaw: `${x.license} ${x.license_version || ""}`.trim(),
    licenceUrl: x.license_url || "", landing: x.foreign_landing_url || "",
    source: x.source === "flickr" ? "Flickr" : (x.source || "Openverse"),
    w: x.width || 0, h: x.height || 0,
  })).filter((c) => c.url);
}

/**
 * Pexels. Only active when PEXELS_API_KEY is set.
 *
 * Preferred over the other two when available: Commons is an encyclopedia, so
 * its vehicle photography is documentary ("car parked in a street") and its
 * landscapes rarely feature a vehicle at all -- fine for Wikipedia, wrong for
 * a brand campaign. Pexels is shot as commercial photography, and the Pexels
 * Licence permits commercial use with no attribution required.
 */
const PEXELS_KEY = process.env.PEXELS_API_KEY || "";
async function pexels(q) {
  if (!PEXELS_KEY) return [];
  const u = `https://api.pexels.com/v1/search?query=${encodeURIComponent(q)}&per_page=30&orientation=landscape&size=large`;
  const r = await fetch(u, { headers: { Authorization: PEXELS_KEY, "User-Agent": UA } });
  if (r.status === 429) throw new Error("RATE_LIMIT");
  if (!r.ok) return [];
  const j = await r.json();
  return (j.photos || []).map((p) => ({
    // large2x is ~1880px wide and plenty for a 1600px render; original can be
    // enormous and is not worth the transfer.
    url: (p.src && (p.src.original || p.src.large2x)) || "",
    title: p.alt || q,
    creator: p.photographer || "",
    licence: "pexels",
    licenceRaw: "Pexels Licence",
    licenceUrl: "https://www.pexels.com/license/",
    landing: p.url || "",
    source: "Pexels",
    w: p.width || 0, h: p.height || 0,
  })).filter((c) => c.url);
}

const DEBUG = argv.includes("--debug");
function score(slot, c) {
  const why = (r) => { if (DEBUG) console.log(`      reject[${r}] ${String(c.title).slice(0, 46)}`); return null; };
  if (!c.licence || !OK.test(c.licence)) return why("licence=" + c.licence);
  const hay = `${c.title} ${c.landing}`;
  if (REJECT.test(hay)) return why("global");
  if (slot.reject && slot.reject.test(hay)) return why("slot");
  if (!slot.must.some((re) => re.test(hay))) return why("must");
  if (c.w && c.h) {
    if (c.w < slot.minWidth) return why("width " + c.w);
    if (slot.landscape && c.w / c.h < 1.2) return why("portrait");
  }
  // Prefer bigger, and prefer a cinematic ratio for full-bleed slots.
  const ratio = c.w && c.h ? c.w / c.h : 1.5;
  const cine = slot.minWidth >= 1600 ? -Math.abs(ratio - 1.85) * 40 : 0;
  return c.w / 1000 + cine + (c.licence === "cc0" || c.licence === "pdm" ? 3 : 0);
}

/* ------------------------------------------------------------------- main */
const manifest = await fs.readFile(MANIFEST, "utf8").then(JSON.parse).catch(() => ({}));
const used = REFRESH ? new Set() : new Set(Object.values(manifest).filter((e) => e && e.sourceUrl).map((e) => e.sourceUrl));
const todo = SLOTS.filter((s) => (!ONLY || ONLY.has(s.id)) && (REFRESH || !(manifest[s.id] && manifest[s.id].status === "ok")));

console.log(`  slots        : ${SLOTS.length}`);
console.log(`  already done : ${SLOTS.length - todo.length}`);
console.log(`  to acquire   : ${todo.length}`);
if (!APPLY) { console.log("\n  plan only — pass --apply"); process.exit(0); }

await fs.mkdir(OUT, { recursive: true });
let got = 0, missed = 0;

for (const slot of todo) {
  let best = null, bestScore = -1e9;
  for (const [qi, q] of slot.queries.entries()) {
    let cands = [];
    for (const fn of [pexels, commons, openverse]) {
      // Each source gets the phrasing it actually responds to.
      const term = fn === pexels && slot.pq ? slot.pq[Math.min(qi, slot.pq.length - 1)] : q;
      try { cands.push(...(await fn(term))); }
      catch (e) { if (!/RATE|ECONN|ETIMED|fetch failed/i.test(e.message)) throw e; }
    }
    await sleep(1400);
    for (const c of cands) {
      if (used.has(c.url)) continue;
      const s = score(slot, c);
      if (s !== null && s > bestScore) { bestScore = s; best = { ...c, query: q }; }
    }
    if (best && bestScore > 2.2) break;
  }

  if (!best) {
    missed++;
    manifest[slot.id] = { slot: slot.id, status: "no-match", purpose: slot.purpose, searched: slot.queries, checkedAt: new Date().toISOString() };
    console.log(`   –  ${slot.id.padEnd(32)} no licensed match`);
    await fs.writeFile(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);
    continue;
  }

  // upload.wikimedia.org throttles rapid pulls of multi-megabyte originals,
  // so back off and retry rather than losing the slot to one 429.
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
  if (!buf) { missed++; continue; }

  let meta;
  try { meta = await sharp(buf).metadata(); }
  catch { console.log(`   ✗  ${slot.id} not a decodable image`); missed++; continue; }
  if (!meta.width || meta.width < slot.minWidth) { console.log(`   ✗  ${slot.id} ${meta.width}px < ${slot.minWidth}`); missed++; continue; }

  // Claim this photograph before writing it. Without this the set was seeded
  // at startup and never updated, so two slots in the same run could pick the
  // identical image -- the hero and the closing CTA did exactly that.
  used.add(best.url);

  const dir = path.join(OUT, slot.id);
  await fs.mkdir(dir, { recursive: true });
  const variants = [];
  for (const w of slot.widths) {
    if (w > meta.width) continue;
    const out = path.join(dir, `${w}.webp`);
    await sharp(buf).resize({ width: w, withoutEnlargement: true }).webp({ quality: 78, effort: 5 }).toFile(out);
    const st = await fs.stat(out);
    variants.push({ width: w, file: `/homepage/${slot.id}/${w}.webp`, bytes: st.size });
  }
  const largest = variants[variants.length - 1];
  const h = Math.round((meta.height / meta.width) * largest.width);

  manifest[slot.id] = {
    slot: slot.id, status: "ok", purpose: slot.purpose, vehicle: slot.vehicle || null,
    sourceName: best.source, sourceUrl: best.url, landingPage: best.landing,
    title: best.title, creator: best.creator || null,
    license: best.licence, licenseRaw: best.licenceRaw, licenseUrl: best.licenceUrl,
    attributionRequired: /^(by|by-sa)$/i.test(best.licence), // Pexels/CC0/PDM need none

    originalWidth: meta.width, originalHeight: meta.height,
    intrinsicWidth: largest.width, intrinsicHeight: h,
    variants, sha256: createHash("sha256").update(buf).digest("hex").slice(0, 16),
    query: best.query, downloadedAt: new Date().toISOString(),
  };
  await fs.writeFile(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);
  got++;
  console.log(`   ✓  ${slot.id.padEnd(32)} ${String(best.licence).padEnd(6)} ${meta.width}x${meta.height}  ${best.title.slice(0, 42)}`);
}

console.log(`\n  acquired : ${got}`);
console.log(`  missed   : ${missed}`);
console.log(`  manifest : ${MANIFEST}`);
