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

/*
 * The server bundle must contain no character above U+00FF.
 *
 * V8 keeps a script's source in memory for as long as the Worker runs. Source
 * that is entirely Latin-1 is stored at one byte per character; a single
 * character outside it switches the WHOLE script to two bytes per character.
 * This bundle is about 40 million characters, so one stray bullet or en dash
 * costs roughly 40 MB of the isolate's 128 MB limit. That is what took the
 * site down with Cloudflare error 1102: 44 such characters, all inside regex
 * literals in our own code.
 *
 * Bundlers already escape these inside strings and template literals. They do
 * not touch regex literals, so that is where they survive. The fix when this
 * fails is to write the character as an escape in the regex -- \u2022 rather
 * than a literal bullet.
 */
const serverFunctions = path.join(ROOT, ".open-next", "server-functions");
const middlewareDir = path.join(ROOT, ".open-next", "middleware");
const wideCharFiles = [];
function scanForWideChars(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== "node_modules") scanForWideChars(full);
    } else if (entry.name === "handler.mjs") {
      // Only the bundled entry points are uploaded as Worker source; the
      // loose node_modules files beside them are not.
      const source = fs.readFileSync(full, "utf8");
      const match = /[^\u0000-\u00ff]/.exec(source);
      if (match) {
        const start = Math.max(0, match.index - 60);
        wideCharFiles.push({
          file: path.relative(ROOT, full),
          context: source.slice(start, match.index + 30).replace(/\s+/g, " "),
        });
      }
    }
  }
}
scanForWideChars(serverFunctions);
scanForWideChars(middlewareDir);
if (wideCharFiles.length > 0) {
  for (const { file, context } of wideCharFiles) {
    console.error(`❌ ${file} contains a character above U+00FF near: ${context}`);
  }
  console.error(
    "   This doubles the Worker's memory use. Escape it (e.g. \\u2022) -- see the comment in scripts/verify-opennext-output.mjs."
  );
  failed = true;
} else {
  console.log("✓ server bundle is Latin-1 only (stored at one byte per character)");
}

if (fs.existsSync(path.join(ROOT, ".vercel", "output", "static"))) {
  console.warn("⚠ .vercel/output/static exists — legacy next-on-pages artifact (safe to delete locally)");
}

if (failed) {
  process.exit(1);
}

console.log("\nOpenNext build output verification passed.\n");
