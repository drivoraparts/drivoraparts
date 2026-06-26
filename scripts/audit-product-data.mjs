import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const src = fs.readFileSync(path.join(root, "lib/inventory/products.ts"), "utf8");

const blocks = src.split(/\n  \{\n    id: /).slice(1);
const missingMedia = [];
const badPaths = [];

for (const block of blocks) {
  const id = Number(block.match(/^(\d+),/)?.[1]);
  const name = block.match(/name: "([^"]+)"/)?.[1] ?? "?";
  const hasThumb = /^\s*thumbnail:/m.test(block);
  const hasImages = /^\s*images:\s*\[/m.test(block);

  if (!hasThumb && !hasImages) {
    missingMedia.push({ id, name });
  }

  for (const match of block.matchAll(
    new RegExp('"(/[^"]+\\.(?:jpg|jpeg|png|webp|svg))"', "gi")
  )) {
    const ref = match[1];
    if (!ref.startsWith("/product-media/")) {
      badPaths.push({ id, name, ref });
      continue;
    }
    const filePath = path.join(root, "public", ref.slice(1));
    if (!fs.existsSync(filePath)) {
      badPaths.push({ id, name, ref, reason: "missing file" });
    }
  }
}

console.log(`Missing thumbnail/images fields: ${missingMedia.length}`);
missingMedia.forEach((p) => console.log(`  #${p.id} ${p.name}`));

console.log(`\nBad image paths: ${badPaths.length}`);
badPaths.forEach((p) =>
  console.log(`  #${p.id} ${p.ref}${p.reason ? ` (${p.reason})` : ""}`)
);
