/**
 * Re-derives homepage image variants under the per-slot film grades.
 *
 *   node scripts/regrade-homepage-photography.mjs           # show the plan
 *   node scripts/regrade-homepage-photography.mjs --apply
 *
 * Re-running the acquisition would re-search and could pick different
 * photographs; those choices have been reviewed, so this re-downloads each
 * image from the sourceUrl already in the manifest and regenerates its
 * variants. Same photograph, different grade.
 *
 * The five build-story panels each get their own atmosphere, so the section
 * stops reading as five copies of one treatment. Everything else -- hero,
 * shipping, closing, and all eleven vehicle cards -- is left ungraded: the
 * vehicle grid in particular must be full natural colour, because a shopper
 * identifying their ute is helped by its real paint, not by a mood.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { gradeToWebp } from "./lib/film-grade.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const PUB = path.join(ROOT, "public");
const MANIFEST = path.join(ROOT, "lib/content/homepage-photography.json");
const APPLY = process.argv.includes("--apply");
const UA = "DrivoraParts-Editorial/1.0 (homepage photography; drivoraparts.com)";

/** slot -> grade. Anything absent is left untouched. */
const PLAN = {
  workhorse: "warm-mono",       // dusty afternoon, practical
  tourer: "warm-color",         // golden hour, expansive
  offroader: "warm-mono-hard",  // hard sun, dust, drama
  performance: "full-color",    // technical, metallic, aggressive
  project: "film-warm",         // nostalgic workshop
};

const manifest = JSON.parse(await fs.readFile(MANIFEST, "utf8"));
const slots = Object.values(manifest).filter((e) => e.status === "ok");

console.log("  PLAN");
for (const e of slots) {
  const grade = PLAN[e.slot] || "none";
  const changed = (e.grade || "none") !== grade;
  if (grade !== "none" || e.grade) {
    console.log(`   ${e.slot.padEnd(32)} ${String(e.grade || "none").padEnd(16)} -> ${grade}${changed ? "" : "  (unchanged)"}`);
  }
}
const vehicles = slots.filter((e) => e.slot.startsWith("veh-"));
const revert = vehicles.filter((e) => e.treatment === "mono" || e.grade);
console.log(`\n  vehicle cards returning to full colour: ${revert.length}/${vehicles.length}`);

if (!APPLY) { console.log("\n  plan only — pass --apply"); process.exit(0); }

let done = 0, skipped = 0;
for (const e of slots) {
  const grade = PLAN[e.slot] || "none";
  const current = e.grade || (e.treatment === "mono" ? "legacy-mono" : "none");
  if (current === grade) { skipped += 1; continue; }

  let buf = null;
  for (let a = 0; a < 4 && !buf; a += 1) {
    try {
      const r = await fetch(e.sourceUrl, { headers: { "User-Agent": UA, Accept: "image/*" }, redirect: "follow" });
      if (r.status === 429 || r.status >= 500) throw new Error(`HTTP ${r.status}`);
      if (!r.ok) throw new Error(`HTTP ${r.status} fatal`);
      buf = Buffer.from(await r.arrayBuffer());
    } catch (err) {
      if (/fatal/.test(err.message) || a === 3) { console.log(`   x ${e.slot}: ${err.message}`); break; }
      await new Promise((res) => setTimeout(res, 3000 * (a + 1)));
    }
  }
  if (!buf) continue;

  const dir = path.join(PUB, "homepage", e.slot);
  await fs.mkdir(dir, { recursive: true });
  const variants = [];
  for (const v of e.variants) {
    const out = path.join(dir, `${v.width}.webp`);
    await fs.writeFile(out, await gradeToWebp(buf, v.width, grade));
    variants.push({ width: v.width, file: `/homepage/${e.slot}/${v.width}.webp`, bytes: (await fs.stat(out)).size });
  }
  e.variants = variants;
  e.grade = grade;
  delete e.treatment; // superseded by the named grade
  manifest[e.slot] = e;
  await fs.writeFile(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);
  done += 1;
  console.log(`   ✓ ${e.slot.padEnd(32)} ${grade.padEnd(16)} ${variants.length} variants`);
  await new Promise((res) => setTimeout(res, 600));
}

console.log(`\n  regraded : ${done}`);
console.log(`  unchanged: ${skipped}`);
