import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();

function readReferencedFromProducts() {
  const src = fs.readFileSync(
    path.join(root, "lib/inventory/products.ts"),
    "utf8"
  );
  const referenced = new Set(["/product-media/avatars/default.svg"]);
  for (const match of src.matchAll(
    new RegExp('"(/product-media/[^"]+)"', "g")
  )) {
    referenced.add(match[1]);
  }
  return referenced;
}

function readReferencedFromCode() {
  const referenced = readReferencedFromProducts();
  for (const file of ["lib/reviews/store.ts", "middleware.ts"]) {
    const content = fs.readFileSync(path.join(root, file), "utf8");
    for (const match of content.matchAll(
      new RegExp('"(/product-media/[^"]+)"', "g")
    )) {
      referenced.add(match[1]);
    }
  }
  return referenced;
}

const referenced = readReferencedFromCode();
const tracked = execSync('git ls-files "public/product-media"', {
  encoding: "utf8",
})
  .split("\n")
  .filter(Boolean);

const unreferencedTracked = tracked.filter((file) => {
  const url = "/" + file.replace(/^public[/\\]/, "").replace(/\\/g, "/");
  return !referenced.has(url);
});

const deadFiles = [
  "app/product/[id]/ProductGallery.tsx",
  "app/(storefront)/catalog/page.tsx.disabled",
  "app/(storefront)/catalog/layout.tsx.disabled",
  "app/(storefront)/catalog/all/page.tsx.disabled",
  "scripts/audit-product-fields.mjs",
  "scripts/find-cleanup-targets.mjs",
  "public/product-media/engine/bmw/BMW S58 (new M performance)/s58-engine.htm",
];

console.log(`Referenced: ${referenced.size}`);
console.log(`Tracked: ${tracked.length}`);
console.log(`Unreferenced tracked: ${unreferencedTracked.length}`);

if (!process.argv.includes("--apply")) {
  for (const file of unreferencedTracked.slice(0, 15)) console.log("  " + file);
  process.exit(0);
}

for (const file of deadFiles) {
  const full = path.join(root, file);
  if (fs.existsSync(full)) fs.unlinkSync(full);
}

for (const file of unreferencedTracked) {
  const full = path.join(root, file);
  if (fs.existsSync(full)) fs.unlinkSync(full);
}

removeEmptyDirs(path.join(root, "public/product-media"));

execSync(
  'git add -A "public/product-media" "app/product" "app/(storefront)/catalog" scripts',
  { stdio: "inherit", shell: true }
);

console.log(
  `Removed ${deadFiles.length} dead files and ${unreferencedTracked.length} unreferenced media files.`
);

function removeEmptyDirs(start) {
  if (!fs.existsSync(start)) return;
  for (const entry of fs.readdirSync(start, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    removeEmptyDirs(path.join(start, entry.name));
  }
  if (start !== path.join(root, "public/product-media") && fs.readdirSync(start).length === 0) {
    fs.rmdirSync(start);
  }
}
