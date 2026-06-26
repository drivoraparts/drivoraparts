import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const productsSrc = fs.readFileSync(
  path.join(root, "lib/inventory/products.ts"),
  "utf8"
);

const imagePaths = new Set();
const re = new RegExp('"(/product-media/[^"]+)"', "g");
let match;
while ((match = re.exec(productsSrc))) {
  imagePaths.add(match[1]);
}

const missing = [];
for (const ref of imagePaths) {
  const filePath = path.join(root, "public", ref.replace(/^\//, ""));
  if (!fs.existsSync(filePath)) missing.push(ref);
}

console.log(`Image references: ${imagePaths.size}`);
console.log(`Missing files: ${missing.length}`);
for (const ref of missing) console.log(ref);

if (missing.length > 0) process.exitCode = 1;
