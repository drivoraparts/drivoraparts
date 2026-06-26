/**
 * Post-build guard for Cloudflare OpenNext assets.
 * - Ensures public/catalog was not copied into assets (breaks /catalog routes)
 * - Writes _routes.json for Pages when present
 */
import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const assets = path.join(ROOT, ".open-next", "assets");
const shadowDir = path.join(assets, "catalog");

if (!fs.existsSync(assets)) {
  console.error("❌ Missing .open-next/assets — run pages:build first");
  process.exit(1);
}

if (fs.existsSync(shadowDir)) {
  console.error(
    "❌ .open-next/assets/catalog/ exists and will 404 /catalog on Cloudflare.\n" +
      "   Product media must live under public/product-media/, not public/catalog/."
  );
  process.exit(1);
}

const routesPath = path.join(assets, "_routes.json");
const routes = {
  version: 1,
  include: ["/*"],
  exclude: [
    "/_next/static/*",
    "/product-media/*",
    "/home/*",
    "/engines/*",
    "/turbochargers/*",
    "/favicon.ico",
    "/favicon.png",
    "/favicon-16.png",
    "/favicon-32.png",
    "/apple-touch-icon.png",
    "/brand/*",
    "/robots.txt",
    "/sitemap.xml",
  ],
};

fs.writeFileSync(routesPath, `${JSON.stringify(routes, null, 2)}\n`);
console.log("✓ Wrote _routes.json for Cloudflare Pages routing");
console.log("✓ No public/catalog shadow directory in build output");
