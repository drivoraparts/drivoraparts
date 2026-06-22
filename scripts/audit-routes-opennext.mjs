/**
 * Route audit for OpenNext on Cloudflare.
 * Run: node scripts/audit-routes-opennext.mjs
 *
 * OpenNext uses Node.js on Workers (nodejs_compat) — NOT Edge runtime exports.
 * The error "routes were not configured to run with Edge Runtime" means
 * Cloudflare is running @cloudflare/next-on-pages, not OpenNext.
 */
import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const APP = path.join(ROOT, "app");
const edgeRe = /^\s*export\s+const\s+runtime\s*=\s*['"]edge['"]/m;

function hasEdgeExport(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/.*$/gm, "")
    .split("\n")
    .some((line) => edgeRe.test(line));
}

function walk(dir, acc = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, acc);
    else if (/^(page|layout|route)\.(tsx?|jsx?)$/.test(ent.name)) acc.push(p);
  }
  return acc;
}

const routes = walk(APP).map((f) => path.relative(ROOT, f).replace(/\\/g, "/"));
const withEdge = routes.filter((r) => hasEdgeExport(fs.readFileSync(path.join(ROOT, r), "utf8")));

console.log(`OpenNext route audit (${routes.length} route files)\n`);
console.log("Runtime: Node.js on Workers (default — no export needed)");
console.log("Edge exports required: NO (OpenNext)\n");

if (withEdge.length) {
  console.error("❌ These files export edge runtime (REMOVE for OpenNext):");
  withEdge.forEach((r) => console.error(`  - ${r}`));
  process.exit(1);
}

console.log("✓ All routes use OpenNext-compatible default runtime");
console.log("✓ No edge runtime exports found\n");

console.log("If Cloudflare build fails with Edge Runtime errors:");
console.log("  → Dashboard Framework preset must be NONE (not Next.js)");
console.log("  → Build: npm ci && npm run pages:build");
console.log("  → See docs/CLOUDFLARE-DEPLOY.md\n");
