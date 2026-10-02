/**
 * Audit the claims the storefront makes against the catalog behind them.
 *
 *   node scripts/audit-storefront-claims.mjs
 *
 * Three classes of bug that all reached production once and are all invisible
 * in a diff:
 *
 *   1. A listing whose stored `condition` contradicts its own title, e.g.
 *      "Used 2014-2018 L83 / L86 Water Pump" stored as brand-new and badged
 *      "Brand New" on the homepage, the catalog grid and the Meta feed.
 *   2. Boilerplate copied onto a part it does not describe -- 37 turbo kits,
 *      torque converters and cylinder heads carried three paragraphs about a
 *      crack-checked engine block with new pistons and bearings.
 *   3. HOME_LISTING_COUNT drifting from the catalog it claims to count. It
 *      sat at 1,446 while the catalog held 1,867.
 *
 * The catalog is TypeScript, so this bundles it with the esbuild already in
 * node_modules rather than adding a loader dependency.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "drivora-audit-"));
const entry = path.join(tmp, "entry.ts");
const bundle = path.join(tmp, "entry.mjs");

fs.writeFileSync(
  entry,
  `import { getAllProducts, resolveProductCondition } from "@/lib/inventory";
import { brands } from "@/lib/inventory/brands";
import { HOME_LISTING_COUNT } from "@/lib/home/listing-count";
import { PUBLIC_PRICE_RATIO } from "@/lib/inventory/pricing";
import {
  BASE_ORDER_DISCOUNT_PERCENT,
  BULK_ORDER_DISCOUNT_PERCENT,
  BULK_MIN_QUANTITY,
} from "@/lib/inventory/discounts";
process.stdout.write(
  JSON.stringify({
    homeListingCount: HOME_LISTING_COUNT,
    brands,
    pricing: {
      ratio: PUBLIC_PRICE_RATIO,
      baseDiscountPercent: BASE_ORDER_DISCOUNT_PERCENT,
      bulkDiscountPercent: BULK_ORDER_DISCOUNT_PERCENT,
      bulkMinQuantity: BULK_MIN_QUANTITY,
    },
    products: getAllProducts().map((p) => ({
      id: p.id,
      name: p.name,
      condition: p.condition,
      stock: p.stock,
      sourceUrl: p.sourceUrl,
      mileage: p.mileage,
      coreCharge: p.coreCharge,
      resolved: resolveProductCondition(p),
      description: p.description || "",
      price: p.price,
      compareAtPrice: p.compareAtPrice ?? null,
    })),
  })
);
`
);

/*
 * esbuild's JS API rather than its bin/ entry.
 *
 * bin/esbuild is not the same kind of file on every platform. On Windows it
 * is a Node shim, but esbuild's install script replaces it with the native
 * executable on Linux, so handing it to `node` on a CI runner fails with
 * "SyntaxError: Invalid or unexpected token" on the ELF header -- which is
 * precisely how this step first ran in Actions. The JS API is JavaScript
 * everywhere and finds the right binary itself.
 */
const { build } = await import("esbuild");

await build({
  entryPoints: [entry],
  bundle: true,
  platform: "node",
  format: "esm",
  outfile: bundle,
  loader: { ".json": "json" },
  alias: { "@": ROOT },
  logLevel: "error",
  absWorkingDir: ROOT,
});

const raw = execFileSync(process.execPath, ["--max-old-space-size=4096", bundle], {
  cwd: ROOT,
  maxBuffer: 256 * 1024 * 1024,
  encoding: "utf8",
});
fs.rmSync(tmp, { recursive: true, force: true });

const { products, homeListingCount, brands, pricing } = JSON.parse(raw);
const problems = [];

/* ---------------------------------------------------------------------------
   1. Condition vs. the title the listing carries
--------------------------------------------------------------------------- */

/*
 * "Used On IG75" is a Turbosmart diaphragm that FITS the IWG75 actuator and
 * is sold new, so "used" followed by "on"/"in"/"for"/"with" is a fitment
 * phrase, not a condition. Matching it would train everyone to ignore this
 * check.
 */
const TITLE_USED = /\b(?:used(?!\s+(?:on|in|for|with|by)\b)|pre[-\s]?owned|salvage|donor|take[-\s]?off|second[-\s]?hand)\b/i;
/*
 * "Exchange" is a condition word here, not a fitment one. A BD Diesel stock
 * exchange turbo or injection pump is a remanufactured core: you send yours
 * in and get a rebuilt one back. All 18 listings whose title carries the word
 * are that kind of part, and "Heat Exchanger" does not match because of the
 * word boundary.
 *
 * It earns its place because four of these shipped alongside the genuinely
 * new unit of the SAME part number -- BD marks those with an "S" suffix --
 * so the storefront showed two near-identical Garrett turbos at two prices,
 * both badged "Brand New", one of which was a rebuilt core.
 */
const TITLE_REFURB = /\b(?:refurbished|remanufactured|reman|rebuilt|reconditioned|exchange)\b/i;

for (const product of products) {
  if (product.resolved !== "brand-new") continue;
  if (TITLE_USED.test(product.name)) {
    problems.push(
      `[condition] ${product.id} titled used but stored "${product.condition}" -> badged Brand New: ${product.name}`
    );
  } else if (TITLE_REFURB.test(product.name)) {
    problems.push(
      `[condition] ${product.id} titled remanufactured but stored "${product.condition}" -> badged Brand New: ${product.name}`
    );
  }
}

/* ---------------------------------------------------------------------------
   1b. Condition vs. the rest of the listing's own evidence

   resolveProductCondition() falls back to brand-new for a listing that records
   no condition, so a missing or unrecognised value would badge Brand New
   without anyone deciding that. Every listing must state one.

   Evidence beyond the title that contradicts a Brand New badge:
     - mileage naming a takeout / donor / used unit (the engine-drivetrain
       packages inherited condition "brand-new" from a shared BASE object that
       also set mileage "Low-mile takeout / crate")
     - a core charge (only exchange / remanufactured units carry one)
     - prose stating the unit IS remanufactured / rebuilt (negations such as
       "new, not remanufactured" do not match)
   Ambiguous cases live in scripts/condition-review.json until the owner
   decides; the audit checks that file stays honest instead of guessing.
--------------------------------------------------------------------------- */

const KNOWN_CONDITION = /(?:new|used|refurbished|remanufactured|mixed)/i;
const MILEAGE_USED = /take[-\s]?out|donor|pulled|salvage|used/i;
const PROSE_REMAN =
  /\b(?:is|are)\s+(?:a\s+)?(?:fully\s+)?(?:remanufactured|rebuilt|refurbished|reconditioned)\b|fully disassembled, crack-checked and precision-machined/i;

const reviewManifest = JSON.parse(
  fs.readFileSync(path.join(ROOT, "scripts", "condition-review.json"), "utf8")
);
const pendingReview = new Map(reviewManifest.pendingOwnerReview.map((r) => [r.id, r.reason]));
const byId = new Map(products.map((p) => [p.id, p]));

// Catalog data is bundled into browser JavaScript, so a supplier URL stored on
// a listing is readable by every visitor and names the supplier. Provenance
// that pricing needs lives in `referencePriceVerified` instead.
for (const product of products) {
  if (product.sourceUrl) {
    problems.push(
      `[privacy] ${product.id} stores a supplier URL (sourceUrl) that ships to browsers; use referencePriceVerified: ${product.name}`
    );
  }
}

// The transmission importer used to stamp every listing with claims nobody had
// verified. These phrases are never acceptable in a description, and the
// importer must not be able to reintroduce them or the invented values.
const IMPORTER_TEMPLATE_CLAIMS = [
  /verified fitment, inspected before shipment/i,
  /ready for performance street, track, or 4WD builds/i,
  /Worldwide shipping available . freight quotes provided for heavy assemblies/i,
];
for (const product of products) {
  for (const re of IMPORTER_TEMPLATE_CLAIMS) {
    if (re.test(product.description)) {
      problems.push(`[claims] ${product.id} carries an unverified importer template claim (${re}): ${product.name}`);
    }
  }
}
{
  const importerSrc = fs.readFileSync(path.join(ROOT, "scripts", "import-transmissions.mjs"), "utf8");
  const forbidden = [
    [/stockQty\s*:\s*\d/, "invents stock quantity"],
    [/condition\s*:\s*["']/, "invents a condition"],
    [/warranty\s*:\s*["']/, "invents a warranty"],
    [/location\s*:\s*["']/, "invents a fulfilment location"],
    [/verified fitment|inspected before shipment|inspected and tested/i, "makes an unverified claim"],
    [/sourceUrl\s*:\s*listingMeta/, "ships a supplier URL"],
  ];
  for (const [re, why] of forbidden) {
    if (re.test(importerSrc)) {
      problems.push(`[importer] scripts/import-transmissions.mjs ${why} (${re})`);
    }
  }
  if (!importerSrc.includes("--force-overwrite")) {
    problems.push("[importer] scripts/import-transmissions.mjs lost its overwrite protection");
  }
}

/**
 * A missing condition is allowed ONLY for a held listing (stock:false): it cannot
 * be bought, and every layer omits the condition instead of defaulting it to New.
 * Anything else with no recognised condition is a problem. A non-empty but
 * unrecognised value is a problem even when held.
 * Returns "ok" | "held-exception" | "problem".
 */
function conditionRecordStatus(product) {
  const stored = String(product.condition ?? "").trim();
  if (!stored && product.stock === false) return "held-exception";
  if (!stored || !KNOWN_CONDITION.test(stored)) return "problem";
  return "ok";
}

if (process.argv.includes("--self-test")) {
  const cases = [
    [{ condition: undefined, stock: false }, "held-exception"],
    [{ condition: "", stock: false }, "held-exception"],
    [{ condition: undefined, stock: true }, "problem"],
    [{ condition: undefined }, "problem"],
    [{ condition: "   ", stock: true }, "problem"],
    [{ condition: "banana", stock: false }, "problem"],
    [{ condition: "brand-new", stock: true }, "ok"],
    [{ condition: "used", stock: false }, "ok"],
  ];
  const failed = cases.filter(([p, want]) => conditionRecordStatus(p) !== want);
  if (failed.length) {
    console.error("condition self-test FAILED:", JSON.stringify(failed));
    process.exit(1);
  }
  console.log(`Condition exception self-test passed (${cases.length} cases).`);
  process.exit(0);
}

for (const product of products) {
  const stored = String(product.condition ?? "").trim();
  const status = conditionRecordStatus(product);
  if (status === "held-exception") continue;
  if (status === "problem") {
    problems.push(
      `[condition] ${product.id} records no recognised condition ("${stored}") and would silently badge Brand New: ${product.name}`
    );
    continue;
  }
  if (product.resolved !== "brand-new" || pendingReview.has(product.id)) continue;
  if (product.mileage && MILEAGE_USED.test(product.mileage)) {
    problems.push(
      `[condition] ${product.id} mileage "${product.mileage}" describes a used unit but it is badged Brand New: ${product.name}`
    );
  } else if (product.coreCharge) {
    problems.push(
      `[condition] ${product.id} carries a core charge but is badged Brand New: ${product.name}`
    );
  } else if (PROSE_REMAN.test(product.description)) {
    problems.push(
      `[condition] ${product.id} description says it is remanufactured/rebuilt but it is badged Brand New: ${product.name}`
    );
  }
}

for (const [id] of pendingReview) {
  const product = byId.get(id);
  if (!product || product.resolved !== "brand-new") {
    problems.push(
      `[condition] scripts/condition-review.json lists ${id} but it is gone or no longer brand-new -- remove it from the manifest`
    );
  }
}
if (pendingReview.size > 0) {
  console.log(
    `NOTE: ${pendingReview.size} listings await owner condition review (scripts/condition-review.json): ${[...pendingReview.keys()].join(", ")}`
  );
}

/* ---------------------------------------------------------------------------
   2. Engine-block boilerplate on a part that is not an engine assembly
--------------------------------------------------------------------------- */

const BLOCK_PROSE = /A short block, long block or ready-run engine is the sensible answer/i;
const BLOCK_SPEC = /^Product: Engine assembly$/im;
const IS_ENGINE_ASSEMBLY = /\b(?:short block|long block|ready[-\s]?run engine|engine|motor)\b/i;

for (const product of products) {
  const claimsBlock = BLOCK_PROSE.test(product.description) || BLOCK_SPEC.test(product.description);
  if (claimsBlock && !IS_ENGINE_ASSEMBLY.test(product.name)) {
    problems.push(
      `[description] ${product.id} is not an engine assembly but its description describes a machined block: ${product.name}`
    );
  }
}

/* ---------------------------------------------------------------------------
   3. The one hardcoded count left on the site
--------------------------------------------------------------------------- */

if (homeListingCount !== products.length) {
  problems.push(
    `[count] HOME_LISTING_COUNT is ${homeListingCount} but the catalog holds ${products.length}. ` +
      `Run: node scripts/sync-home-listing-count.mjs (with a server running).`
  );
}

/* ---------------------------------------------------------------------------
   4. Brand registry hygiene

   A brand is a (slug, category) pair, so the same manufacturer is registered
   once per category on purpose. An exact repeat of one pair is never
   intentional: it double-counts that brand in getBrandsByCategory(), which is
   what renders the sibling-brand list on a brand page.

   Display names are checked per slug too. "SnugTop" and "Snugtop" were
   registered under the same slug in two categories, so the same manufacturer
   printed two ways depending on which page you landed on. Three slugs
   legitimately carry a second name -- Toyota/Nissan/Ford also trade as
   "<make> Genuine" in some categories -- so only a pure capitalisation
   difference is reported.
--------------------------------------------------------------------------- */

const seenPairs = new Set();
const namesBySlug = new Map();

for (const brand of brands) {
  const pair = `${brand.slug}|${brand.category}`;
  if (seenPairs.has(pair)) {
    problems.push(
      `[brands] duplicate registration of (${brand.slug}, ${brand.category}) in lib/inventory/brands.ts`
    );
  }
  seenPairs.add(pair);

  if (!namesBySlug.has(brand.slug)) namesBySlug.set(brand.slug, new Set());
  namesBySlug.get(brand.slug).add(brand.name);
}

for (const [slug, names] of namesBySlug) {
  if (names.size < 2) continue;
  const lowered = new Set([...names].map((n) => n.toLowerCase()));
  if (lowered.size === names.size) continue; // genuinely different names
  problems.push(
    `[brands] slug "${slug}" is registered under names differing only in case: ${[...names]
      .map((n) => `"${n}"`)
      .join(" vs ")}`
  );
}

/* ---------------------------------------------------------------------------
   5. Pricing: the numbers the storefront is supposed to be selling at

   Two things, both of which reached production once.

   The base ratio and the checkout promotion are separate figures that the
   business sets, and a listing's price is derived from the first while the
   cart applies the second. Neither is hard to change by accident, and nothing
   else fails when they are: the site keeps working and simply sells at the
   wrong price. Naming them here means a change has to be deliberate enough to
   edit this line too.

   The second check measures the OUTCOME, not the arithmetic. Re-deriving a
   price from its own reference would prove nothing: applyPublicPrices sets
   compareAtPrice to the very figure it fed resolvePublicPrice, so putting it
   back through reproduces the price by construction and passes whatever the
   constants say. What can actually be wrong is the spread it produces.

   A ratio of 0.85 should put listings near 15% below their reference, and the
   thing that pulls them off it is the rounding grid, whose step is a bigger
   share of a cheap part than a dear one. On the old $10 grid a $17 reference
   sold at $10 -- 41% off -- while a $30.95 one sold at $30, barely 3% off.
   Both are inside this band's reach; neither was visible in any diff.

   The band is deliberately wide. It is not asserting 15%; it is asserting
   that nothing has drifted far enough to make the shelf price a different
   claim from the one the business set. Today's catalog sits at 7.2%-23.1%.
--------------------------------------------------------------------------- */

const MIN_DISCOUNT_PERCENT = 5;
const MAX_DISCOUNT_PERCENT = 30;

const EXPECTED_PRICING = {
  ratio: 0.85,
  baseDiscountPercent: 5,
  bulkDiscountPercent: 10,
  bulkMinQuantity: 2,
};

for (const [key, expected] of Object.entries(EXPECTED_PRICING)) {
  if (pricing[key] !== expected) {
    problems.push(
      `[pricing] ${key} is ${pricing[key]}, expected ${expected} — change this in scripts/audit-storefront-claims.mjs too if it is intentional`
    );
  }
}

let pricesChecked = 0;

for (const product of products) {
  if (typeof product.compareAtPrice !== "number") continue;
  pricesChecked++;

  if (product.compareAtPrice <= product.price) {
    problems.push(
      `[pricing] ${product.id} strikes through ${product.compareAtPrice} but sells at ${product.price}: ${product.name}`
    );
    continue;
  }

  const off = (1 - product.price / product.compareAtPrice) * 100;
  if (off < MIN_DISCOUNT_PERCENT || off > MAX_DISCOUNT_PERCENT) {
    problems.push(
      `[pricing] ${product.id} sells ${off.toFixed(1)}% below its reference (${product.compareAtPrice} -> ${product.price}), outside ${MIN_DISCOUNT_PERCENT}-${MAX_DISCOUNT_PERCENT}%: ${product.name}`
    );
  }
}

if (pricesChecked === 0) {
  problems.push(
    "[pricing] no listing carries a reference price, so nothing re-derived — the check above is no longer testing anything"
  );
}

/* ------------------------------------------------------------------------ */

console.log(`Audited ${products.length} listings and ${brands.length} brand registrations.`);

if (problems.length === 0) {
  console.log("No storefront-claim problems found.");
  process.exit(0);
}

console.error(`\n${problems.length} problem(s):\n`);
for (const problem of problems) console.error("  " + problem);
process.exit(1);
