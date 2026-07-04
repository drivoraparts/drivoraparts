import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();
const imageRefRe = /"(\/product-media\/[^"]+)"/g;
const pathToProducts = new Map();
const productFiles = fs
  .readdirSync(path.join(root, "lib/inventory"))
  .filter((f) => f === "products.ts" || f.endsWith("-products.ts"));

function collectFromBlock(block, file) {
  const id = Number(block.match(/id:\s*(\d+)/)?.[1] ?? 0) || null;
  let match;
  const re = new RegExp(imageRefRe.source, "g");
  while ((match = re.exec(block))) {
    const img = match[1];
    if (!pathToProducts.has(img)) pathToProducts.set(img, []);
    pathToProducts.get(img).push({ id, file });
  }
}

for (const file of productFiles) {
  const src = fs.readFileSync(path.join(root, "lib/inventory", file), "utf8");
  if (file === "products.ts") {
    for (const block of src.split(/\n  \{\n    id: /).slice(1)) {
      collectFromBlock(block, file);
    }
  } else if (file.endsWith(".json")) {
    continue;
  } else {
    collectFromBlock(src, file);
  }
}

for (const jsonFile of fs
  .readdirSync(path.join(root, "lib/inventory/data"))
  .filter((f) => f.endsWith(".json"))) {
  const items = JSON.parse(
    fs.readFileSync(path.join(root, "lib/inventory/data", jsonFile), "utf8")
  );
  for (const item of items) {
    const refs = [
      item.thumbnail,
      item.image,
      ...(item.images ?? []),
    ].filter(Boolean);
    for (const img of refs) {
      if (!img.startsWith("/product-media/")) continue;
      if (!pathToProducts.has(img)) pathToProducts.set(img, []);
      pathToProducts.get(img).push({ id: item.id, file: jsonFile });
    }
  }
}

const dupPaths = [...pathToProducts.entries()].filter(([, prods]) => {
  const ids = new Set(prods.map((p) => p.id).filter(Boolean));
  return ids.size > 1;
});

console.log(`Same path on multiple product IDs: ${dupPaths.length}`);
for (const [img, prods] of dupPaths.slice(0, 30)) {
  const ids = [...new Set(prods.map((p) => p.id).filter(Boolean))];
  console.log(`  ${img} -> #${ids.join(", #")}`);
}

const hashToPaths = new Map();
for (const imgPath of pathToProducts.keys()) {
  const fp = path.join(root, "public", imgPath.slice(1));
  if (!fs.existsSync(fp)) continue;
  const hash = crypto
    .createHash("sha256")
    .update(fs.readFileSync(fp))
    .digest("hex")
    .slice(0, 16);
  if (!hashToPaths.has(hash)) hashToPaths.set(hash, []);
  hashToPaths.get(hash).push(imgPath);
}

const dupHashes = [...hashToPaths.entries()].filter(([, paths]) => paths.length > 1);
console.log(`\nSame file content, different paths: ${dupHashes.length}`);
for (const [hash, paths] of dupHashes.slice(0, 20)) {
  const productIds = new Set();
  for (const p of paths) {
    for (const { id } of pathToProducts.get(p) ?? []) {
      if (id) productIds.add(id);
    }
  }
  console.log(`  ${hash} (${paths.length} paths, ${productIds.size} products)`);
  for (const p of paths.slice(0, 5)) console.log(`    ${p}`);
}

console.log(`\nTotal unique image refs: ${pathToProducts.size}`);
