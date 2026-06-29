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

const routesPath = path.join(assets, "_routes.json");
requirePath(routesPath, "_routes.json");

const homeAssets = path.join(assets, "home");
requirePath(homeAssets, "home page static assets");

const homeImages = fs.existsSync(homeAssets)
  ? fs.readdirSync(homeAssets).filter((name) => /\.(jpg|jpeg|png|webp)$/i.test(name))
  : [];
if (homeImages.length === 0) {
  console.error("❌ No homepage images in .open-next/assets/home/");
  failed = true;
} else {
  console.log(`✓ ${homeImages.length} homepage images in build assets`);
}

if (fs.existsSync(routesPath)) {
  const routes = JSON.parse(fs.readFileSync(routesPath, "utf8"));
  if (!routes.exclude?.includes("/home/*")) {
    console.error("❌ _routes.json must exclude /home/* so Cloudflare serves static homepage images");
    failed = true;
  } else {
    console.log("✓ _routes.json excludes /home/* from Worker");
  }
}

if (fs.existsSync(path.join(ROOT, ".vercel", "output", "static"))) {
  console.warn("⚠ .vercel/output/static exists — legacy next-on-pages artifact (safe to delete locally)");
}

if (failed) {
  process.exit(1);
}

console.log("\nOpenNext build output verification passed.\n");
