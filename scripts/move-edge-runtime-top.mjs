import fs from "fs";
import path from "path";

const EDGE = "export const runtime = 'edge';";
const RUNTIME_RE = /^export const runtime\s*=\s*['"]edge['"];?\s*\n?/gm;

function walk(dir, acc = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, acc);
    else if (
      /^(page|layout|route|loading|error)\.tsx?$/.test(ent.name) ||
      ent.name === "not-found.tsx"
    ) {
      acc.push(p);
    }
  }
  return acc;
}

let moved = 0;
let added = 0;

for (const file of walk("app")) {
  let src = fs.readFileSync(file, "utf8");
  const trimmed = src.trimStart();

  if (/^["']use client["']/.test(trimmed)) continue;

  const hadRuntime = RUNTIME_RE.test(src);
  src = src.replace(RUNTIME_RE, "");

  if (src.startsWith(EDGE)) {
    if (hadRuntime) continue;
  }

  const next = `${EDGE}\n\n${src.replace(/^\n+/, "")}`;
  fs.writeFileSync(file, next);
  if (hadRuntime) {
    moved += 1;
    console.log("moved:", file);
  } else {
    added += 1;
    console.log("added:", file);
  }
}

console.log(`Moved ${moved}, added ${added}`);
