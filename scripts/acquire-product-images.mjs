/**
 * Automated product-image acquisition.
 *
 *   product record -> search queries -> licensed candidates -> relevance gate
 *   -> download -> verify -> store locally -> rewrite product -> manifest
 *
 * Usage:
 *   node scripts/acquire-product-images.mjs                    # plan only
 *   node scripts/acquire-product-images.mjs --apply
 *   node scripts/acquire-product-images.mjs --apply --limit 20
 *   node scripts/acquire-product-images.mjs --apply --only 2117,2118
 *
 * WHY ONLY OPENVERSE AND WIKIMEDIA COMMONS
 * Both return a machine-readable licence per result, so "usage rights" is a
 * field we read rather than a claim we invent. A general image search returns
 * no licence at all, and downloading from one would mean asserting a permission
 * nobody granted. Every accepted image here carries its licence into the
 * manifest verbatim; anything whose licence forbids commercial use, or that
 * carries no licence, is rejected before download.
 *
 * WHY MOST PRODUCTS WILL NOT GET AN IMAGE
 * A relevance gate (see scoreCandidate) requires the candidate's own title to
 * contain the product's distinctive tokens -- a part number, an engine code, a
 * model designation. A photo of *a* turbocharger does not qualify as a photo of
 * a *TP38* turbocharger. Freely-licensed libraries hold very few photographs of
 * specific aftermarket parts, so a low hit rate is the correct outcome: the
 * alternative is dressing a listing with a part the customer will not receive.
 *
 * PRODUCT BOUNDARIES ARE STRUCTURAL
 * Records are located and mutated by object identity after JSON.parse. There is
 * no text-window replacement anywhere in this file, so an image downloaded for
 * product A cannot land on product B: the local path is written to the very
 * object whose fields produced the search query.
 *
 * RESUMABILITY
 * Every attempt -- success, rejection, or exhausted search -- is written to the
 * manifest keyed by product id, with the image hash and dimensions. A rerun
 * skips any product already resolved, so a rate-limit or a crash costs only the
 * in-flight product.
 */
import fs from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const INV = path.join(ROOT, "lib/inventory");
const DATA = path.join(INV, "data");
const PUB = path.join(ROOT, "public");
const MANIFEST = path.join(DATA, "image-provenance.json");
const OVERRIDES = path.join(DATA, "product-media-overrides.json");

const argv = process.argv.slice(2);
const APPLY = argv.includes("--apply");
const flag = (n, d) => { const i = argv.indexOf(n); return i > -1 ? argv[i + 1] : d; };
const LIMIT = Number(flag("--limit", "0")) || Infinity;
const ONLY = flag("--only") ? new Set(flag("--only").split(",").map(Number)) : null;

const UA = "DrivoraParts-CatalogBot/1.0 (product reference imagery; contact via drivoraparts.com)";
const MIN_EDGE = 600;
const MAX_RATIO = 2.0;      // reject banners
const PAUSE_MS = 1100;      // be polite to both APIs

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ------------------------------------------------------------------ licences
 * Only licences that permit commercial reuse. NC forbids it outright. ND is
 * excluded because we resize and crop for the grid, which it does not allow.
 */
const OK_LICENCE = /^(cc0|pdm|by|by-sa)$/i;
function normaliseWikiLicence(s = "") {
  const t = s.toLowerCase();
  if (t.includes("public domain") || t.includes("pd-")) return "pdm";
  if (t.includes("cc0")) return "cc0";
  const m = t.match(/cc[ -]by[ -]sa/) ? "by-sa" : t.match(/cc[ -]by/) ? "by" : null;
  if (t.includes("-nc") || t.includes(" nc") || t.includes("-nd") || t.includes(" nd")) return "restricted";
  return m;
}

/* ------------------------------------------------------------------- sniffing */
function sniff(b) {
  if (b.length < 16) return null;
  if (b[0] === 0xff && b[1] === 0xd8) return "jpg";
  if (b[0] === 0x89 && b[1] === 0x50) return "png";
  if (b.slice(0, 4).toString("ascii") === "RIFF" && b.slice(8, 12).toString("ascii") === "WEBP") return "webp";
  if (b.slice(0, 3).toString("ascii") === "GIF") return "gif";
  return null;
}
function jpegSize(b) {
  let i = 2;
  while (i < b.length - 9) {
    if (b[i] !== 0xff) { i++; continue; }
    const m = b[i + 1];
    if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) return { h: b.readUInt16BE(i + 5), w: b.readUInt16BE(i + 7) };
    if (i + 3 >= b.length) break;
    i += 2 + b.readUInt16BE(i + 2);
  }
  return null;
}
const pngSize = (b) => (b.length < 24 ? null : { w: b.readUInt32BE(16), h: b.readUInt32BE(20) });
function webpSize(b) {
  const t = b.slice(12, 16).toString("ascii");
  if (t === "VP8X") return { w: (b.readUIntLE(24, 3) & 0xffffff) + 1, h: (b.readUIntLE(27, 3) & 0xffffff) + 1 };
  if (t === "VP8 ") return { w: b.readUInt16LE(26) & 0x3fff, h: b.readUInt16LE(28) & 0x3fff };
  if (t === "VP8L") { const n = b.readUInt32LE(21); return { w: (n & 0x3fff) + 1, h: ((n >> 14) & 0x3fff) + 1 }; }
  return null;
}
const dimsOf = (b, k) => (k === "jpg" ? jpegSize(b) : k === "png" ? pngSize(b) : k === "webp" ? webpSize(b) : null);

/* ------------------------------------------------------------------ catalogue */
const jsonDocs = new Map();
for (const f of await fs.readdir(DATA)) {
  if (!f.endsWith(".json") || f.includes("overrides") || f.includes("provenance")) continue;
  try {
    const j = JSON.parse(await fs.readFile(path.join(DATA, f), "utf8"));
    if (Array.isArray(j)) jsonDocs.set(f, j);
  } catch {}
}

// TypeScript products are read-only here: we record the chosen image in the
// overrides file rather than rewriting source, which is what that file is for.
const tsProducts = new Map();
for (const f of await fs.readdir(INV)) {
  if (!f.endsWith(".ts")) continue;
  const text = await fs.readFile(path.join(INV, f), "utf8");
  const anchors = [...text.matchAll(/^\s*id:\s*(\d+)\s*,/gm)];
  for (let k = 0; k < anchors.length; k++) {
    const id = Number(anchors[k][1]);
    const chunk = text.slice(anchors[k].index, k + 1 < anchors.length ? anchors[k + 1].index : text.length);
    const g = (re) => { const m = chunk.match(re); return m ? m[1] : ""; };
    if (!tsProducts.has(id)) {
      tsProducts.set(id, {
        id,
        name: g(/\bname:\s*"((?:[^"\\]|\\.)*)"/),
        brand: g(/\bbrand:\s*"([^"]*)"/),
        category: g(/\bcategory:\s*"([^"]*)"/),
        partNumber: g(/\bpartNumber:\s*"([^"]*)"/),
        fitment: g(/\bfitment:\s*"((?:[^"\\]|\\.)*)"/),
        thumbnail: g(/\bthumbnail:\s*"([^"]+)"/),
        __ts: f,
      });
    }
  }
}

const overrides = JSON.parse(await fs.readFile(OVERRIDES, "utf8"));
const manifest = await fs.readFile(MANIFEST, "utf8").then(JSON.parse).catch(() => ({}));

/* --------------------------------------------------- which products need work */
const servedThumb = (p) => {
  const o = overrides[String(p.id)];
  return (o && o.thumbnail) || p.thumbnail || (Array.isArray(p.images) && p.images[0]) || "";
};
async function edgeOf(webPath) {
  if (!webPath || /^https?:/.test(webPath)) return 0;
  if (webPath.endsWith(".svg")) return -1; // placeholder
  try {
    const b = await fs.readFile(path.join(PUB, webPath.replace(/^\//, "")));
    const d = dimsOf(b, sniff(b));
    return d ? Math.max(d.w, d.h) : Infinity;
  } catch { return 0; }
}

const all = [];
for (const [file, arr] of jsonDocs) for (const p of arr) if (p && typeof p.id === "number") all.push({ ...p, __file: file, __obj: p });
for (const p of tsProducts.values()) all.push(p);

const targets = [];
for (const p of all) {
  if (ONLY && !ONLY.has(p.id)) continue;
  const prev = manifest[`acq-${p.id}`];
  if (prev && prev.status === "downloaded") continue;            // resume: already done
  if (prev && prev.status === "no-licensed-match" && !ONLY) continue; // don't re-search fruitlessly
  const edge = await edgeOf(servedThumb(p));
  if (edge === -1 || (edge > 0 && edge < MIN_EDGE)) targets.push({ p, reason: edge === -1 ? "placeholder" : `${edge}px` });
}
targets.sort((a, b) => a.p.id - b.p.id);
const work = targets.slice(0, LIMIT === Infinity ? undefined : LIMIT);

console.log(`  catalogue products      : ${all.length}`);
console.log(`  needing better imagery  : ${targets.length}`);
console.log(`  processing this run     : ${work.length}`);
if (!APPLY) {
  for (const t of work.slice(0, 25)) console.log(`   ${String(t.p.id).padEnd(6)} ${t.reason.padEnd(12)} ${(t.p.name || "").slice(0, 58)}`);
  console.log("\n  plan only — pass --apply to search and download");
  process.exit(0);
}

/* ----------------------------------------------------------- query building */
const STOP = new Set(["for", "sale", "with", "and", "the", "new", "used", "oem", "kit", "set", "pair", "assembly", "replacement", "near", "me", "genuine", "premium"]);

/* Category nouns. Present in almost every candidate title in the category, so
 * matching one proves nothing about product identity. */
const GENERIC = new Set([
  "engine", "turbo", "turbocharger", "pump", "pistons", "piston", "manifold", "crossmember",
  "transmission", "gearbox", "wastegate", "wastegates", "truck", "shell", "cover", "camper",
  "topper", "short", "long", "front", "rear", "left", "right", "upper", "lower", "inline",
  "universal", "compatible", "series", "system", "install", "installation", "connecting",
  "beam", "light", "lights", "seal", "seals", "pipe", "pipes", "exhaust", "intake", "filter",
  "brake", "brakes", "clutch", "flywheel", "bearing", "gasket", "injector", "injectors",
  "alternator", "starter", "radiator", "cooler", "sensor", "switch", "valve", "cylinder",
  "diesel", "petrol", "power", "steering", "suspension", "spring", "shock", "strut", "wheel",
  "wheels", "tire", "tires", "bumper", "grille", "fender", "hood", "door", "mirror", "glass",
  "window", "windows", "visor", "liner", "rack", "bars", "stainless", "steel", "aluminum",
  "billet", "forged", "black", "chrome", "silver", "blue", "green", "white", "stock", "super",
  "duty", "heavy", "light", "medium", "complete", "rebuild", "remanufactured", "performance",
  "racing", "street", "sport", "motor", "vehicle", "vehicles", "automotive", "parts", "part",
]);
function identityTokens(p) {
  const bag = [];
  if (p.partNumber) for (const t of String(p.partNumber).split(/[^A-Za-z0-9.-]+/)) if (t.length >= 4) bag.push(t);
  const name = String(p.name || "");
  for (const t of name.split(/[^A-Za-z0-9.]+/)) {
    const l = t.toLowerCase();
    if (t.length >= 3 && !STOP.has(l) && !/^\d{1,2}$/.test(t)) bag.push(t);
  }
  return [...new Set(bag)];
}
function queriesFor(p) {
  const qs = [];
  const name = String(p.name || "").replace(/&#?\w+;/g, " ").replace(/\s+/g, " ").trim();
  const pn = String(p.partNumber || "").split(/[\s(·]/)[0];
  if (pn && pn.length >= 5) qs.push(pn);
  if (p.brand && pn && pn.length >= 5) qs.push(`${p.brand} ${pn}`);
  qs.push(name.slice(0, 70));
  if (p.brand) qs.push(`${p.brand} ${name.split(/[—(]/)[0].trim()}`.slice(0, 70));
  return [...new Set(qs.filter(Boolean))];
}

/* ------------------------------------------------------------ search adapters */
async function searchOpenverse(q) {
  const u = `https://api.openverse.org/v1/images/?q=${encodeURIComponent(q)}&page_size=12&license_type=commercial`;
  const r = await fetch(u, { headers: { "User-Agent": UA } });
  if (r.status === 429) throw new Error("RATE_LIMIT");
  if (!r.ok) return [];
  const j = await r.json();
  return (j.results || []).map((x) => ({
    url: x.url, title: x.title || "", creator: x.creator || "", creatorUrl: x.creator_url || "",
    licence: (x.license || "").toLowerCase(), licenceUrl: x.license_url || "",
    landing: x.foreign_landing_url || "", source: x.source || "openverse", via: "openverse",
    w: x.width || null, h: x.height || null,
  }));
}
async function searchCommons(q) {
  const u = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(q)}&gsrlimit=12&gsrnamespace=6&prop=imageinfo&iiprop=url%7Csize%7Cextmetadata&format=json`;
  const r = await fetch(u, { headers: { "User-Agent": UA } });
  if (r.status === 429) throw new Error("RATE_LIMIT");
  if (!r.ok) return [];
  const j = await r.json();
  const pages = (j.query && j.query.pages) || {};
  return Object.values(pages).map((v) => {
    const ii = (v.imageinfo || [{}])[0], em = ii.extmetadata || {};
    const raw = (em.LicenseShortName && em.LicenseShortName.value) || "";
    return {
      url: ii.url, title: v.title || "", creator: String((em.Artist && em.Artist.value) || "").replace(/<[^>]+>/g, "").slice(0, 90),
      creatorUrl: "", licence: normaliseWikiLicence(raw) || "unknown", licenceRaw: raw,
      licenceUrl: (em.LicenseUrl && em.LicenseUrl.value) || "",
      landing: `https://commons.wikimedia.org/wiki/${encodeURIComponent(v.title || "")}`,
      source: "wikimedia commons", via: "commons", w: ii.width || null, h: ii.height || null,
    };
  }).filter((c) => c.url);
}

/* ------------------------------------------------------------ relevance gate */

/* The candidate must read as a vehicle component or a vehicle.
 * Leading \b only, deliberately: Commons runs words together, and the one
 * correct match we had ("Turboexternalgate.jpg") fails a trailing \b. Short
 * ambiguous stems (car, van, head, gate, belt) are left out -- they match
 * cargo, vanity, headland and gateway, and a brand token plus a false
 * corroboration is exactly how the drone and the office block got through. */
const AUTOMOTIVE = /\b(engine|motor|turbo|wastegate|transmission|gearbox|clutch|flywheel|piston|crankshaft|camshaft|manifold|injector|injection|carburet|fuelpump|pump|radiator|alternator|starter|brake|caliper|suspension|shock absorber|strut|axle|differential|driveshaft|exhaust|muffler|catalytic|intercooler|valve|cylinder|gasket|bearing|diesel|petrol|automobile|automotive|vehicle|truck|pickup|lorry|chassis|drivetrain|powertrain|fender|bumper|tailgate|wheel|tyre|tire|steering|sprocket|pulley|camshaft|throttle|supercharger|differential)/i;

/* Subjects a company name reliably drags in that are never a part photo. */
const OFF_DOMAIN = /\b(headquarters|head office|building|tower|factory|plant exterior|campus|museum|aircraft|airplane|aeroplane|drone|uav|helicopter|missile|rocket|satellite|ship|vessel|locomotive|railway station|stadium|logo|wordmark|signage|billboard|advertisement|portrait|ceremony|conference|exhibition stand|share certificate|banknote|map|flag|coat of arms)\b/i;
function scoreCandidate(cand, tokens, product) {
  if (!OK_LICENCE.test(cand.licence)) return { ok: false, why: `licence ${cand.licence || "unknown"}` };
  if (cand.w && cand.h) {
    if (Math.max(cand.w, cand.h) < MIN_EDGE) return { ok: false, why: `${cand.w}x${cand.h} too small` };
    const ratio = Math.max(cand.w, cand.h) / Math.min(cand.w, cand.h);
    if (ratio > MAX_RATIO) return { ok: false, why: `banner ${cand.w}x${cand.h}` };
  }
  const hay = `${cand.title} ${cand.landing}`.toLowerCase();

  /* A brand name alone is not identification. "Aisin" matched the Aisin
   * Corporation HEADQUARTERS BUILDING for a transmission listing, and
   * "Alliant" matched an Alliant Techsystems DRONE for a diesel IPR valve --
   * both downloaded and published before this gate existed. So a candidate
   * must also read as an automotive component, and must not read as one of
   * the classic off-domain subjects a company name drags in. */
  if (OFF_DOMAIN.test(hay)) return { ok: false, why: `off-domain subject: "${cand.title.slice(0, 40)}"` };
  if (!AUTOMOTIVE.test(hay)) return { ok: false, why: `not corroborated as a part: "${cand.title.slice(0, 40)}"` };
  // Distinctive tokens carry product identity. Two kinds qualify: an
  // alphanumeric code (part number, engine code -- "F90000267", "TP38"), and a
  // proper name that is not a generic category noun ("Coyote", "Walbro").
  // GENERIC alone can never justify a match: a photo of *a* turbocharger is not
  // a photo of *this* turbocharger, which is the substitution to avoid.
  const distinctive = tokens.filter(
    (t) => (/\d/.test(t) && t.length >= 4) || (t.length >= 5 && !GENERIC.has(t.toLowerCase()))
  );
  const hitsD = distinctive.filter((t) => hay.includes(t.toLowerCase()));
  const hitsA = tokens.filter((t) => hay.includes(t.toLowerCase()));
  if (!hitsD.length) return { ok: false, why: `no identifying token in "${cand.title.slice(0, 40)}"` };
  return { ok: true, score: hitsD.length * 10 + hitsA.length, matched: hitsD };
}

/* ----------------------------------------------------------------- main loop */
const slugify = (s) => s.toLowerCase().replace(/&#?\w+;/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 58);
const seenHashes = new Map();
for (const [k, v] of Object.entries(manifest)) if (v && v.sha256) seenHashes.set(v.sha256, v.productId);

/* Persist after every product. Writing only at the end meant one dropped
 * socket discarded the whole run's findings, which is precisely the failure
 * the manifest exists to prevent.
 *
 * Only files that actually changed are rewritten. Blindly rewriting every
 * catalogue JSON on each product made the run crawl and collided with the dev
 * server's file watcher, which holds handles open on Windows (errno -4094).
 * A brief retry covers the watcher's read window. */
const dirty = new Set();

async function writeGuarded(file, text) {
  for (let a = 0; a < 4; a++) {
    try { await fs.writeFile(file, text); return; }
    catch (e) {
      if (!/EBUSY|EPERM|UNKNOWN|EACCES/i.test(e.code || "") || a === 3) throw e;
      await sleep(300 * (a + 1));
    }
  }
}

async function persist() {
  await writeGuarded(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);
  if (!dirty.size) return;
  for (const file of dirty) {
    if (file === "__overrides") await writeGuarded(OVERRIDES, `${JSON.stringify(overrides, null, 2)}\n`);
    else await writeGuarded(path.join(DATA, file), `${JSON.stringify(jsonDocs.get(file), null, 2)}\n`);
  }
  dirty.clear();
}
for (const sig of ["SIGINT", "SIGTERM"]) {
  process.on(sig, async () => { await persist(); console.log("\n  interrupted — progress saved, rerun to resume"); process.exit(0); });
}

let downloaded = 0, updated = 0, noMatch = 0;

/* A provider that starts throttling is retired for the rest of the run rather
 * than aborting it: Openverse allows very few anonymous calls, while Commons
 * tolerates far more, so losing one must not cost us the other. Only when every
 * provider is down do we stop and let the manifest resume the run later. */
const providers = [
  { name: "openverse", fn: searchOpenverse, live: true },
  { name: "commons", fn: searchCommons, live: true },
];
const table = [];

for (const { p, reason } of work) {
  if (!providers.some((pr) => pr.live)) { console.log(`   ⏸  all providers throttled — rerun to resume from ${p.id}`); break; }
  const tokens = identityTokens(p);
  let best = null;

  const qs = queriesFor(p);
  for (const [qi, q] of qs.entries()) {
    const cands = [];
    for (const pr of providers) {
      if (!pr.live) continue;
      // Openverse allows very few anonymous calls, so it gets only the single
      // most specific query per product; Commons tolerates the full set.
      if (pr.name === "openverse" && qi > 0) continue;
      // A 429 is usually transient. Back off and retry before concluding the
      // provider is gone -- retiring it on the first blip cost a whole run.
      let done = false;
      for (let attempt = 0; attempt < 3 && !done; attempt++) {
        try {
          cands.push(...(await pr.fn(q)));
          done = true;
        } catch (e) {
          // A dropped socket is as transient as a 429 and must never end the
          // run: an ECONNRESET 46 products in previously killed the process
          // before anything was persisted.
          const transient = e.message === "RATE_LIMIT" || /ECONNRESET|ETIMEDOUT|EAI_AGAIN|socket|fetch failed|network/i.test(e.message);
          if (!transient) throw e;
          if (attempt === 2) { pr.live = false; console.log(`   ⏸  ${pr.name} unavailable after 3 tries (${e.message}) — continuing without it`); }
          else await sleep(2500 * (attempt + 1));
        }
      }
    }
    await sleep(PAUSE_MS);
    for (const c of cands) {
      const s = scoreCandidate(c, tokens, p);
      if (s.ok && (!best || s.score > best.score)) best = { ...c, score: s.score, matched: s.matched, query: q };
    }
    if (best && best.score >= 20) break; // strong match, stop searching
  }

  if (!best) {
    noMatch++;
    manifest[`acq-${p.id}`] = { productId: p.id, productName: p.name, status: "no-licensed-match", reason,
      searched: queriesFor(p), note: "no commercially-licensed image matched this product's identifying tokens", checkedAt: new Date().toISOString() };
    console.log(`   –  ${String(p.id).padEnd(6)} no licensed match  ${(p.name || "").slice(0, 46)}`);
    await persist();
    continue;
  }

  let buf;
  try {
    const r = await fetch(best.url, { headers: { "User-Agent": UA, Accept: "image/*" }, redirect: "follow" });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    buf = Buffer.from(await r.arrayBuffer());
  } catch (e) {
    console.log(`   ✗  ${p.id} download failed: ${e.message}`);
    manifest[`acq-${p.id}`] = { productId: p.id, productName: p.name, status: "download-failed", error: e.message, sourceUrl: best.url, checkedAt: new Date().toISOString() };
    continue;
  }

  const kind = sniff(buf);
  if (!kind) { console.log(`   ✗  ${p.id} not an image (HTML?)`); noMatch++; continue; }
  const d = dimsOf(buf, kind);
  if (d && Math.max(d.w, d.h) < MIN_EDGE) { console.log(`   ✗  ${p.id} ${d.w}x${d.h} under ${MIN_EDGE}px`); noMatch++; continue; }
  if (d && Math.max(d.w, d.h) / Math.min(d.w, d.h) > MAX_RATIO) { console.log(`   ✗  ${p.id} banner aspect`); noMatch++; continue; }

  const sha = createHash("sha256").update(buf).digest("hex");
  if (seenHashes.has(sha)) {
    console.log(`   ✗  ${p.id} duplicate of product ${seenHashes.get(sha)} — skipped`);
    manifest[`acq-${p.id}`] = { productId: p.id, productName: p.name, status: "duplicate", duplicateOf: seenHashes.get(sha), checkedAt: new Date().toISOString() };
    continue;
  }

  const slug = slugify(p.name || `product-${p.id}`);
  const rel = `/product-media/acquired/${slug}-${p.id}/1.${kind}`;
  await fs.mkdir(path.dirname(path.join(PUB, rel.replace(/^\//, ""))), { recursive: true });
  await fs.writeFile(path.join(PUB, rel.replace(/^\//, "")), buf);
  seenHashes.set(sha, p.id);
  downloaded++;

  // Attach to THIS product object only.
  if (p.__obj) {
    p.__obj.images = [rel];
    p.__obj.thumbnail = rel;
    if ("image" in p.__obj) p.__obj.image = rel;
    dirty.add(p.__file);
  } else {
    overrides[String(p.id)] = { thumbnail: rel, images: [rel] };
    dirty.add("__overrides");
  }
  updated++;

  manifest[`acq-${p.id}`] = {
    productId: p.id, productName: p.name, localFile: rel,
    sourceUrl: best.url, sourceName: best.source, landingPage: best.landing,
    creator: best.creator || null, creatorUrl: best.creatorUrl || null,
    license: best.licence, licenseRaw: best.licenceRaw || best.licence, licenseUrl: best.licenceUrl,
    attributionRequired: /^(by|by-sa)$/i.test(best.licence),
    usageBasis: `${best.source} — licence ${best.licence} permits commercial reuse`,
    matchedTokens: best.matched, query: best.query,
    sha256: sha, bytes: buf.length, width: d?.w ?? null, height: d?.h ?? null,
    downloadedAt: new Date().toISOString(), status: "downloaded", verified: "pending",
  };
  table.push({ id: p.id, name: p.name, local: rel, source: best.source, licence: best.licence, matched: best.matched.join(",") });
  await persist();
  console.log(`   ✓  ${String(p.id).padEnd(6)} ${best.licence.padEnd(6)} ${String(d?.w + "x" + d?.h).padEnd(11)} [${best.matched.join(",")}]  ${(p.name || "").slice(0, 34)}`);
}

await persist();

console.log(`\n  downloaded : ${downloaded}`);
console.log(`  updated    : ${updated}`);
console.log(`  no match   : ${noMatch}`);
if (providers.some((pr) => !pr.live)) console.log(`  throttled providers: ${providers.filter((p) => !p.live).map((p) => p.name).join(", ")} — rerun to resume`);
