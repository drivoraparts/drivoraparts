import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const file = path.join(path.dirname(fileURLToPath(import.meta.url)), "../lib/inventory/products.ts");
let s = fs.readFileSync(file, "utf8");

for (let id = 107; id <= 120; id++) {
  const re = new RegExp(`\\r?\\n  \\{\\r?\\n    id: ${id},[\\s\\S]*?\\r?\\n  \\},`, "m");
  const next = s.replace(re, "");
  if (next !== s) {
    console.log(`Removed product ${id}`);
    s = next;
  }
}

fs.writeFileSync(file, s);
console.log("Done");
