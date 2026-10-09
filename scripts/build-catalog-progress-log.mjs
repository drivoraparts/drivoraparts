/**
 * Builds the catalog-readiness progress log, one row per listing.
 *
 *   node scripts/build-catalog-progress-log.mjs
 *
 * Writes docs/catalog-progress-log.csv. It records, for every listing, which
 * priority group it belongs to, whether the structured package-contents
 * framework applies to it, how much of its contents is established, and what
 * is still missing. "Framework applied" is not "complete": a listing whose
 * contents status is unconfirmed has the shared checklist but still needs its
 * supplier-confirmed contents. Re-run after each batch to refresh it.
 *
 * Read-only: nothing here changes a listing.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "drivora-progress-"));
const entry = path.join(tmp, "entry.ts");
const bundle = path.join(tmp, "entry.mjs");

fs.writeFileSync(
  entry,
  [
    'import { getAllProducts } from "@/lib/inventory";',
    'import { getProductCatalogMeta } from "@/lib/inventory/productEnhancements";',
    'import { classifyProductKind, ROLLOUT_KINDS } from "@/lib/inventory/product-kind";',
    'import { packageContents } from "@/lib/inventory/package-contents";',
    "const rows = getAllProducts().map((p) => {",
    "  const m = getProductCatalogMeta(p);",
    "  const l = m.logistics as { included?: string[]; contents?: { status: string; checklist?: string; included?: string[]; notIncluded?: string[]; requiredSeparately?: string[]; optionalUpgrades?: string[]; installationRequirements?: string[]; programmingRequirements?: string[] }; partNumber?: string; fitment?: string };",
    "  const kind = classifyProductKind(p);",
    "  return { id: p.id, name: p.name, category: p.category, price: p.price, label: m.conditionLabel,",
    "    kind: kind || '', inRollout: !!kind && ROLLOUT_KINDS.includes(kind),",
    "    explicit: !!packageContents[p.id] || !!p.packageContents,",
    "    status: l.contents ? l.contents.status : '', checklist: l.contents && l.contents.checklist || '',",
    "    included: (l.included || []).length, specRows: m.specRows.length,",
    "    stated: l.contents ? ((l.contents.notIncluded||[]).length + (l.contents.requiredSeparately||[]).length + (l.contents.optionalUpgrades||[]).length + (l.contents.installationRequirements||[]).length + (l.contents.programmingRequirements||[]).length) : 0,",
    "    fitment: !!(l.fitment || (p as any).fitmentApplications?.length || (p as any).universalFitment),",
    "    partNumber: !!l.partNumber, descLen: (p.description || '').length };",
    "});",
    "process.stdout.write(JSON.stringify(rows));",
  ].join("\n")
);

const { build } = await import("esbuild");
await build({
  entryPoints: [entry],
  bundle: true,
  platform: "node",
  format: "esm",
  outfile: bundle,
  loader: { ".json": "json" },
  alias: { "@": ROOT },
  logLevel: "error",
  absWorkingDir: ROOT,
});
const rows = JSON.parse(
  execFileSync(process.execPath, ["--max-old-space-size=4096", bundle], {
    cwd: ROOT,
    encoding: "utf8",
    maxBuffer: 512 * 1024 * 1024,
  })
);
fs.rmSync(tmp, { recursive: true, force: true });

const PRIORITY = {
  "engine-assembly": "P1",
  transmission: "P1",
  "turbo-supercharger": "P2",
  "transfer-case-differential": "P2",
  "brake-kit": "P3",
  "suspension-kit": "P3",
  "fuel-kit": "P3",
  "cooling-kit": "P3",
};
const BATCH = { P1: "batch-1", P2: "batch-1", P3: "batch-2" };

const csv = (v) => {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

const header = [
  "id", "name", "category", "condition", "priority", "kind", "framework_applied",
  "contents_source", "contents_status", "checklist", "included_items", "spec_rows",
  "fitment_recorded", "part_number_recorded", "description_chars", "description_status",
  "stated_statements", "still_missing", "batch",
];
const out = [header];
const tally = { applied: 0, listed: 0, partial: 0, unconfirmed: 0, stated: 0 };

for (const r of rows) {
  const priority = PRIORITY[r.kind] || (r.descLen < 350 ? "P4" : "P5");
  const applied = r.inRollout || r.explicit || !!r.status;
  const source = r.explicit ? "explicit entry" : r.status ? "derived" : "";
  const missing = [];
  if (applied && r.status === "unconfirmed") missing.push("package contents");
  if (applied && r.status === "partial") missing.push("remaining contents not confirmed");
  if (applied && !r.fitment) missing.push("fitment");
  if (applied && r.specRows < 3) missing.push("specifications");
  if (applied) {
    tally.applied++;
    if (r.status) tally[r.status]++;
  }
  out.push([
    r.id, r.name, r.category, r.label, priority, r.kind, applied ? "yes" : "no",
    source, r.status, r.checklist, r.included, r.specRows, r.fitment ? "yes" : "no",
    r.partNumber ? "yes" : "no", r.descLen,
    applied ? "original text kept; sections added from the listing's own statements" : "not started",
    r.stated, missing.join("; "),
    applied ? (r.explicit ? "pilot" : BATCH[priority] || "batch-2 (stated only)") : "",
  ]);
}

const file = path.join(ROOT, "docs", "catalog-progress-log.csv");
fs.mkdirSync(path.dirname(file), { recursive: true });
fs.writeFileSync(file, out.map((r) => r.map(csv).join(",")).join("\n") + "\n");
console.log(
  `${rows.length} listings logged; framework applied to ${tally.applied} ` +
    `(listed ${tally.listed}, partial ${tally.partial}, unconfirmed ${tally.unconfirmed}, stated-only ${tally.stated}); ` +
    `${rows.length - tally.applied} not started -> ${path.relative(ROOT, file)}`
);
