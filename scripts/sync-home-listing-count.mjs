/**
 * Sync lib/home/listing-count.ts from the live catalog size.
 * Run: node scripts/sync-home-listing-count.mjs
 *
 * Counts through the running app rather than by loading the catalog directly.
 * The previous version shelled out to `npx tsx scripts/count-listings.ts`,
 * which needs tsx present and a working npm cache; when that failed the script
 * threw, nobody re-ran it, and the constant sat at 1,446 while the catalog grew
 * to 1,867 — the storefront quoted two different sizes for months.
 *
 * The catalog API's unfiltered `total` is the same number /catalog/all renders,
 * so the badge and the listing page cannot disagree again.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "lib/home/listing-count.ts");

const BASE = process.env.COUNT_SOURCE_URL || "http://localhost:3000";

async function fetchCount() {
  const response = await fetch(`${BASE}/api/catalog/products?limit=1`);
  if (!response.ok) {
    throw new Error(
      `Catalog API returned ${response.status}. Start the dev server, or set ` +
        `COUNT_SOURCE_URL to a running instance (e.g. https://drivoraparts.com).`
    );
  }

  const data = await response.json();
  const count = Number(data?.total);

  if (!Number.isFinite(count) || count <= 0) {
    throw new Error(`Invalid product count from catalog API: ${data?.total}`);
  }

  return count;
}

const count = await fetchCount();

const contents = `/**
 * Homepage hero stat — synced by scripts/sync-home-listing-count.mjs
 *
 * Sourced from the catalog API total, which is the same figure the storefront
 * renders on /catalog/all, so the two cannot disagree.
 */
export const HOME_LISTING_COUNT = ${count};
`;

await fs.writeFile(OUT, contents);
console.log(`Updated HOME_LISTING_COUNT → ${count}`);
