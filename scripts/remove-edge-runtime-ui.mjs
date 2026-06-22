import fs from "fs";
import path from "path";

const RUNTIME_RE = /^export const runtime\s*=\s*['"]edge['"];?\s*\n+/gm;

const EDGE_API_PREFIXES = [
  "app/api/auth/",
  "app/api/checkout/",
  "app/api/payments/",
  "app/api/public/",
  "app/api/admin/login/",
  "app/api/admin/logout/",
];

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

function shouldKeepEdgeApi(file) {
  const normalized = file.replace(/\\/g, "/");
  return EDGE_API_PREFIXES.some((prefix) => normalized.startsWith(prefix));
}

let removedUi = 0;
let removedApi = 0;
let keptApi = 0;

for (const file of walk("app")) {
  const normalized = file.replace(/\\/g, "/");
  const isApi = normalized.includes("/api/");

  if (isApi) {
    if (shouldKeepEdgeApi(normalized)) {
      keptApi += 1;
      continue;
    }
  }

  let src = fs.readFileSync(file, "utf8");
  if (!/export const runtime\s*=\s*['"]edge['"]/.test(src)) continue;

  src = src.replace(RUNTIME_RE, "");
  fs.writeFileSync(file, src);
  if (isApi) {
    removedApi += 1;
    console.log("api removed:", file);
  } else {
    removedUi += 1;
    console.log("ui removed:", file);
  }
}

console.log(`Removed UI: ${removedUi}, removed API: ${removedApi}, kept edge API: ${keptApi}`);
