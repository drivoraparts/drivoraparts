/**
 * Sync lib/home/listing-count.ts from the live catalog size.
 * Run: node scripts/sync-home-listing-count.mjs
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "lib/home/listing-count.ts");

const result = spawnSync("npx", ["tsx", "scripts/count-listings.ts"], {
  cwd: ROOT,
  encoding: "utf8",
  shell: true,
});

if (result.status !== 0) {
  throw new Error(result.stderr || "Failed to count catalog products");
}

const count = Number(result.stdout.trim());
if (!Number.isFinite(count) || count <= 0) {
  throw new Error(`Invalid product count: ${count}`);
}

const contents = `/** Homepage hero stat — synced by scripts/sync-home-listing-count.mjs */
export const HOME_LISTING_COUNT = ${count};
`;

await fs.writeFile(OUT, contents);
console.log(`Updated HOME_LISTING_COUNT → ${count}`);
