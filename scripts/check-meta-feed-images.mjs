/**
 * Regression check: the Meta catalog feed must never export a placeholder
 * ("photography pending") or default avatar as a product image, must leave such
 * listings out instead, and must keep exporting real product images.
 *
 * Runs against the real catalog plus synthetic products; no database or network.
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "meta-feed-"));
const entry = path.join(tmp, "entry.ts");
const bundle = path.join(tmp, "entry.mjs");

fs.writeFileSync(
  entry,
  `import { buildMetaCatalogFeedRows, toMetaCatalogFeedRow } from "@/lib/feeds/meta-catalog";
const base: any = { id: 99999, name: "Synthetic part", category: "transmission", brand: "zf", price: 100, description: "Synthetic\\n\\nBody.", condition: "brand-new", stock: false };
const ph = "/product-media/placeholders/transmission.svg";
const real = "/product-media/transmission/sonnax-zip-kit-zf8-zip/1.webp";
const mk = (thumb: string, images: string[]) => toMetaCatalogFeedRow({ ...base, thumbnail: thumb, image: thumb, images } as any);
const rows = buildMetaCatalogFeedRows();
process.stdout.write(JSON.stringify({
  placeholderOnly: mk(ph, [ph]) === null,
  defaultAvatarOnly: mk("/product-media/avatars/default.svg", ["/product-media/avatars/default.svg"]) === null,
  realImage: (mk(real, [real]) as any)?.image_link ?? null,
  placeholderThenReal: (mk(ph, [ph, real]) as any)?.image_link ?? null,
  noCondition: toMetaCatalogFeedRow({ ...base, condition: undefined, thumbnail: real, image: real, images: [real] } as any) === null,
  total: rows.length,
  badRows: rows.filter((r) => /\\/product-media\\/placeholders\\/|default\\.svg/.test(r.image_link)).map((r) => r.id),
}));
`
);

const { build } = await import("esbuild");
await build({
  entryPoints: [entry], bundle: true, platform: "node", format: "esm", outfile: bundle,
  loader: { ".json": "json" }, alias: { "@": ROOT }, logLevel: "error", absWorkingDir: ROOT, tsconfigRaw: "{}",
});
const out = JSON.parse(execFileSync(process.execPath, [bundle], { cwd: ROOT, maxBuffer: 128 * 1024 * 1024, encoding: "utf8" }));
fs.rmSync(tmp, { recursive: true, force: true });

const problems = [];
if (!out.placeholderOnly) problems.push("a listing with only the transmission placeholder is still exported");
if (!out.defaultAvatarOnly) problems.push("a listing with only the default avatar is still exported");
if (!out.realImage || !out.realImage.includes("sonnax-zip-kit-zf8-zip/1.webp")) problems.push("a real product image is no longer exported");
if (!out.placeholderThenReal || !out.placeholderThenReal.includes("sonnax-zip-kit-zf8-zip/1.webp")) problems.push("a listing with a placeholder first and a real image second does not export the real image");
if (!out.noCondition) problems.push("a listing with no recorded condition is exported");
if (out.badRows.length) problems.push(`feed rows carry a placeholder/default image: ${out.badRows.join(", ")}`);
if (problems.length) {
  console.error(problems.map((p) => `  [meta-feed] ${p}`).join("\n"));
  process.exit(1);
}
console.log(`Meta feed image check passed (${out.total} feed rows, none with a placeholder image).`);
