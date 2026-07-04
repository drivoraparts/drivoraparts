import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

function loadAllProducts() {
  const products = [];
  const imageRefRe = /"(\/product-media\/[^"]+)"/g;

  const mainSrc = fs.readFileSync(
    path.join(root, "lib/inventory/products.ts"),
    "utf8"
  );
  for (const block of mainSrc.split(/\n  \{\n    id: /).slice(1)) {
    const id = Number(block.match(/^(\d+),/)?.[1]);
    const name = block.match(/name: "([^"]+)"/)?.[1] ?? "?";
    const refs = new Set();
    let m;
    const re = new RegExp(imageRefRe.source, "g");
    while ((m = re.exec(block))) refs.add(m[1]);
    products.push({ id, name, source: "products.ts", refs: [...refs] });
  }

  for (const jsonFile of fs
    .readdirSync(path.join(root, "lib/inventory/data"))
    .filter((f) => f.endsWith(".json"))) {
    const items = JSON.parse(
      fs.readFileSync(path.join(root, "lib/inventory/data", jsonFile), "utf8")
    );
    for (const item of items) {
      const refs = new Set(
        [item.thumbnail, item.image, ...(item.images ?? [])].filter(
          (r) => typeof r === "string" && r.startsWith("/product-media/")
        )
      );
      products.push({
        id: item.id,
        name: item.name,
        source: jsonFile,
        refs: [...refs],
      });
    }
  }

  return products;
}

function fileHash(ref) {
  const fp = path.join(root, "public", ref.slice(1));
  if (!fs.existsSync(fp)) return null;
  return crypto.createHash("sha256").update(fs.readFileSync(fp)).digest("hex");
}

const products = loadAllProducts();
const hashToUsage = new Map();

for (const product of products) {
  for (const ref of product.refs) {
    const hash = fileHash(ref);
    if (!hash) continue;
    if (!hashToUsage.has(hash)) hashToUsage.set(hash, []);
    hashToUsage.get(hash).push({ id: product.id, name: product.name, ref });
  }
}

const crossProduct = [...hashToUsage.entries()].filter(([, usage]) => {
  const ids = new Set(usage.map((u) => u.id));
  return ids.size > 1;
});

console.log(`Cross-product duplicate images (same bytes): ${crossProduct.length}`);
for (const [hash, usage] of crossProduct.slice(0, 40)) {
  const ids = [...new Set(usage.map((u) => u.id))];
  console.log(`\n${hash.slice(0, 12)}... products: #${ids.join(", #")}`);
  for (const u of usage.slice(0, 6)) {
    console.log(`  #${u.id} ${u.ref}`);
  }
}

console.log(`\nTotal cross-product duplicate groups: ${crossProduct.length}`);
