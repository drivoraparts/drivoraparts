/**
 * Post-build guard: confirm OpenNext output exists (run after pages:build).
 */
import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const worker = path.join(ROOT, ".open-next", "worker.js");
const assets = path.join(ROOT, ".open-next", "assets");

let failed = false;

function requirePath(p, label) {
  if (!fs.existsSync(p)) {
    console.error(`❌ Missing ${label}: ${path.relative(ROOT, p)}`);
    failed = true;
  } else {
    console.log(`✓ ${label} exists`);
  }
}

requirePath(worker, "OpenNext worker");
requirePath(assets, "OpenNext assets directory");

if (fs.existsSync(path.join(ROOT, ".vercel", "output", "static"))) {
  console.warn("⚠ .vercel/output/static exists — legacy next-on-pages artifact (safe to delete locally)");
}

if (failed) {
  process.exit(1);
}

console.log("\nOpenNext build output verification passed.\n");
