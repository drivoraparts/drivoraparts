/**
 * Pre-build guard: fail fast if legacy Cloudflare adapter or edge runtime exports return.
 */
import fs from "fs";
import path from "path";

const ROOT = process.cwd();
let failed = false;

function fail(message) {
  console.error(`❌ ${message}`);
  failed = true;
}

function pass(message) {
  console.log(`✓ ${message}`);
}

// 1. package.json must not reference next-on-pages
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, "package.json"), "utf8"));
const pkgText = JSON.stringify(pkg);
if (/next-on-pages/i.test(pkgText)) {
  fail("package.json still references @cloudflare/next-on-pages");
} else {
  pass("package.json has no next-on-pages references");
}

if (!pkg.dependencies?.["@opennextjs/cloudflare"]) {
  fail("@opennextjs/cloudflare is missing from dependencies");
} else {
  pass("@opennextjs/cloudflare is installed");
}

// 2. lockfile must not contain next-on-pages
const lockPath = path.join(ROOT, "package-lock.json");
if (fs.existsSync(lockPath)) {
  const lock = fs.readFileSync(lockPath, "utf8");
  if (/next-on-pages/i.test(lock)) {
    fail("package-lock.json still contains next-on-pages");
  } else {
    pass("package-lock.json is clean");
  }
}

// 3. no edge runtime exports in app/ (breaks OpenNext bundle)
function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, files);
    else if (/\.(tsx?|jsx?)$/.test(ent.name)) files.push(p);
  }
  return files;
}

const edgeLineRe = /^\s*export\s+const\s+runtime\s*=\s*['"]edge['"]/;

function hasEdgeExport(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/.*$/gm, "")
    .split("\n")
    .some((line) => edgeLineRe.test(line));
}
for (const file of walk(path.join(ROOT, "app"))) {
  const src = fs.readFileSync(file, "utf8");
  if (hasEdgeExport(src)) {
    fail(`Edge runtime export found (remove for OpenNext): ${path.relative(ROOT, file)}`);
  }
}
pass("No edge runtime exports in app/");

if (fs.existsSync(path.join(ROOT, "public", "catalog"))) {
  fail(
    "public/catalog/ exists — move product images to public/product-media/ (breaks /catalog routes on Cloudflare)"
  );
} else {
  pass("public/catalog does not shadow /catalog routes");
}

if (!fs.existsSync(path.join(ROOT, "public", "product-media"))) {
  fail("public/product-media/ is missing (product images root)");
} else {
  pass("public/product-media/ exists");
}

if (failed) {
  process.exit(1);
}

console.log("\nCloudflare pre-build verification passed.\n");
