import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const imagePaths = new Set();
const re = new RegExp('"(/product-media/[^"]+)"', "g");

for (const name of fs.readdirSync(path.join(root, "lib/inventory"))) {
  if (name !== "products.ts" && !name.endsWith("-products.ts")) continue;
  const src = fs.readFileSync(path.join(root, "lib/inventory", name), "utf8");
  let match;
  while ((match = re.exec(src))) {
    imagePaths.add(match[1]);
  }
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
