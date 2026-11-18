/**
 * Self-test for the fitment-evidence rules in scripts/check-toyota-expansion.mjs.
 *
 *   node scripts/test-toyota-fitment-validator.mjs
 *
 * Copies the staged batch to a temp directory, breaks one rule at a time, and
 * confirms the validator rejects it with the expected message. The unmodified
 * copy must pass. Nothing under docs/ is changed.
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(ROOT, "docs/catalog-expansion");
const VALIDATOR = path.join(ROOT, "scripts/check-toyota-expansion.mjs");
const BATCH = "toyota-expansion-batch-1.json";

const find = (data, pn) => data.records.find((r) => r.partNumber === pn);
const claimedOf = (r) => r.fitmentVerification.applications.filter((a) => a.status === "verified" || a.status === "vin_dependent");

const CASES = [
  {
    name: "conflicting part-number applications",
    expect: /conflict: 17801-0P100 and 17801-0C040 both claim Tacoma/,
    mutate(d) {
      const r = find(d, "17801-0C040");
      const a = r.fitmentVerification.applications[0];
      a.engine = "2GR-FKS 3.5L V6";
    },
  },
  {
    name: "production-origin restriction marked verified",
    expect: /production-origin or production-date restriction marked "verified"/,
    mutate(d) {
      find(d, "04465-06170").fitmentVerification.applications[0].status = "verified";
    },
  },
  {
    name: "unsupported model-year range",
    expect: /2GR-FKS was offered in the US Highlander only 2017-2022/,
    mutate(d) {
      const r = find(d, "04152-YZZA1");
      const a = r.fitmentVerification.applications.find((x) => x.model === "Highlander" && x.status === "vin_dependent");
      a.yearTo = 2023;
      r.fitmentApplications.find((x) => x.model === "Highlander").yearTo = 2023;
    },
  },
  {
    name: "incorrect supersession (spin-on to cartridge)",
    expect: /supersession across part families/,
    mutate(d) {
      find(d, "90915-YZZN1").fitmentVerification.supersession.push({
        partNumber: "04152-YZZA1", relation: "superseded_by", status: "verified",
        evidence: [{ kind: "dealer_catalog", source: "test", url: "https://example.com/x" }], reason: null,
      });
    },
  },
  {
    name: "VIN-dependent application marked universal",
    expect: /VIN-dependent applications cannot be marked universal fitment/,
    mutate(d) {
      find(d, "17801-0P100").universalFitment = true;
    },
  },
  {
    name: "listed without Toyota or dealer catalog evidence",
    expect: /listed without Toyota or US dealer catalog evidence/,
    mutate(d) {
      const r = find(d, "17801-0C040");
      for (const a of claimedOf(r)) a.evidence = [{ kind: "retailer", source: "test retailer", url: "https://example.com/r" }];
    },
  },
  {
    name: "ready without sufficient evidence or resolved fitment",
    expect: /ready with unresolved fitment blockers|ready with no verified or VIN-dependent application/,
    mutate(d) {
      const r = find(d, "90919-01287");
      r.status = "ready";
    },
  },
  {
    name: "VIN-level confirmation claimed without a lookup",
    expect: /description claims VIN-level confirmation/,
    mutate(d) {
      const r = find(d, "17801-0C040");
      r.description += "\nFitment VIN-confirmed.";
    },
  },
  {
    name: "listed fitment broader than the evidence",
    expect: /listed fitment does not match/,
    mutate(d) {
      find(d, "43512-04052").fitmentApplications.push({ yearFrom: 2024, yearTo: 2025, make: "Toyota", model: "Tacoma", submodel: null });
    },
  },
];

function run(dir) {
  return spawnSync(process.execPath, [VALIDATOR], { env: { ...process.env, TOYOTA_EXPANSION_DIR: dir }, encoding: "utf8" });
}

function copyBatch() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "toyota-fitment-"));
  for (const f of fs.readdirSync(SRC)) if (f.endsWith(".json")) fs.copyFileSync(path.join(SRC, f), path.join(dir, f));
  return dir;
}

let failures = 0;
const base = copyBatch();
const ok = run(base);
if (ok.status !== 0) {
  console.error(`baseline: expected pass, got:\n${ok.stderr}`);
  failures += 1;
}
fs.rmSync(base, { recursive: true, force: true });

for (const c of CASES) {
  const dir = copyBatch();
  const file = path.join(dir, BATCH);
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  c.mutate(data);
  fs.writeFileSync(file, JSON.stringify(data));
  const res = run(dir);
  const out = `${res.stdout}${res.stderr}`;
  if (res.status === 0 || !c.expect.test(out)) {
    console.error(`FAIL ${c.name}: exit ${res.status}\n${out.slice(0, 600)}`);
    failures += 1;
  } else {
    console.log(`ok   ${c.name}`);
  }
  fs.rmSync(dir, { recursive: true, force: true });
}

if (failures) {
  console.error(`${failures} fitment-validator self-test(s) failed`);
  process.exit(1);
}
console.log(`Fitment validator self-test passed (${CASES.length} rule violations rejected, baseline accepted).`);
