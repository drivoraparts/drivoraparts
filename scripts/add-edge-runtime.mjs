import fs from "fs";
import path from "path";

const EDGE = "export const runtime = 'edge';";

function walk(dir, acc = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, acc);
    else if (/^(page|layout|route|loading|error)\.tsx?$/.test(ent.name) || ent.name === "not-found.tsx") {
      acc.push(p);
    }
  }
  return acc;
}

let updated = 0;
for (const file of walk("app")) {
  const src = fs.readFileSync(file, "utf8");
  if (src.includes("export const runtime")) continue;
  if (/^["']use client["']/.test(src.trimStart())) continue;
  fs.writeFileSync(file, `${EDGE}\n\n${src}`);
  updated += 1;
  console.log("edge:", file);
}

console.log(`Updated ${updated} files`);
