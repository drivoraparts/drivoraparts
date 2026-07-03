/**
 * Download reviewer profile photos into public/reviews/avatars/.
 * Run: node scripts/fetch-reviewer-avatars.mjs
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "../public/reviews/avatars");
const COUNT = 24;

async function downloadOne(url, dest) {
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 DrivoraParts/1.0" },
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 1000) throw new Error("file too small");
  await fs.writeFile(dest, buf);
}

const res = await fetch(
  `https://randomuser.me/api/?results=${COUNT}&inc=picture&noinfo`
);
const payload = await res.json();

await fs.mkdir(OUT_DIR, { recursive: true });

let saved = 0;
for (let i = 0; i < payload.results.length; i += 1) {
  const url = payload.results[i]?.picture?.medium;
  if (!url) continue;
  const name = `${String(i + 1).padStart(2, "0")}.jpg`;
  try {
    await downloadOne(url, path.join(OUT_DIR, name));
    saved += 1;
    console.log(`saved ${name}`);
  } catch (err) {
    console.warn(`skip ${name}: ${err.message}`);
  }
}

console.log(`Done — ${saved} avatars in ${OUT_DIR}`);
