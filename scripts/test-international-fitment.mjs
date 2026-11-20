/**
 * PROTOTYPE tests (not in any npm script). Tests the two fitment pathways
 * independently:
 *  1. US pathway (scripts/check-toyota-expansion.mjs, unchanged): still rejects
 *     non-US models, ignores international batch files, and a record that only
 *     has international fitment cannot pass as commercial_pending.
 *  2. International pathway (scripts/check-international-fitment.mjs): a valid
 *     fixture passes and each rule rejects its broken case.
 * All fixtures are synthetic and live in a temp directory; nothing under docs/
 * or lib/ is read for writing or changed.
 *
 *   node scripts/test-international-fitment.mjs
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { validateRecords } from "./check-international-fitment.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(ROOT, "docs/catalog-expansion");
const US_VALIDATOR = path.join(ROOT, "scripts/check-toyota-expansion.mjs");
let failed = 0;
const ok = (name, cond, detail = "") => {
  console.log(`${cond ? "ok  " : "FAIL"} ${name}${cond ? "" : ` ${detail}`}`);
  if (!cond) failed += 1;
};

// ---------- 1. US pathway ----------
function usRun(mutate) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "us-fit-"));
  for (const f of fs.readdirSync(SRC).filter((f) => /^toyota-(expansion-batch|service-kits-batch)-\d+\.json$/.test(f))) {
    fs.copyFileSync(path.join(SRC, f), path.join(dir, f));
  }
  if (mutate) mutate(dir);
  const r = spawnSync(process.execPath, [US_VALIDATOR], { env: { ...process.env, TOYOTA_EXPANSION_DIR: dir }, encoding: "utf8" });
  fs.rmSync(dir, { recursive: true, force: true });
  return { code: r.status, out: `${r.stdout}${r.stderr}` };
}
const editBatch7 = (dir, fn) => {
  const p = path.join(dir, "toyota-expansion-batch-7.json");
  const d = JSON.parse(fs.readFileSync(p, "utf8"));
  fn(d);
  fs.writeFileSync(p, JSON.stringify(d));
};

const base = usRun();
ok("US: unmodified batches pass", base.code === 0, base.out.slice(-300));
const prado = usRun((dir) => editBatch7(dir, (d) => { d.records[0].fitmentApplications.push({ make: "Toyota", model: "Land Cruiser Prado", yearFrom: 2010, yearTo: 2015 }); }));
ok("US: Prado in fitmentApplications is rejected", prado.code === 1 && /"Toyota Land Cruiser Prado" is not a US-market Toyota model/.test(prado.out), prado.out.slice(-300));
const hilux = usRun((dir) => editBatch7(dir, (d) => { d.records[1].fitmentApplications = [{ make: "Toyota", model: "Hilux", yearFrom: 2016, yearTo: 2020 }]; }));
ok("US: Hilux in fitmentApplications is rejected", hilux.code === 1 && /"Toyota Hilux" is not a US-market Toyota model/.test(hilux.out));
const intlOnly = usRun((dir) => editBatch7(dir, (d) => { d.records[2].fitmentApplications = []; d.records[2].internationalFitmentApplications = [{ model: "Land Cruiser 200" }]; }));
ok("US: international-only fitment cannot pass as commercial_pending", intlOnly.code === 1 && /no fitment applications/.test(intlOnly.out));
const ignored = usRun((dir) => fs.writeFileSync(path.join(dir, "toyota-international-batch-1.json"), JSON.stringify({ records: [{ partNumber: "BAD", status: "nonsense" }] })));
ok("US: international batch files are not read by the US validator", ignored.code === 0);

// ---------- 2. International pathway ----------
const EPC = "https://epc.example.test/toyota/au/hzj79";
const valid = () => ({
  partNumber: "23670-17050",
  status: "commercial_pending",
  description: "Test fixture. For vehicles originally built for markets outside the United States; confirm by frame code and VIN before ordering.",
  internationalFitmentApplications: [{
    model: "Land Cruiser 70", market: "Australia", chassisCode: "HZJ79", engineCode: "1HZ", yearFrom: 1999, yearTo: 2006, status: "verified",
    evidence: [{ kind: "toyota_epc", market: "Australia", url: EPC }],
  }],
});
ok("INTL: valid fixture passes", validateRecords([valid()]).length === 0, validateRecords([valid()]).join("; "));

const CASES = [
  ["unsupported model", /not a supported international model/, (r) => { r.internationalFitmentApplications[0].model = "Land Cruiser 60"; }],
  ["US market not allowed", /is not a non-US market/, (r) => { r.internationalFitmentApplications[0].market = "United States"; }],
  ["chassis code from another model (Prado KDJ150 on LC70)", /chassis code "KDJ150" does not belong to Land Cruiser 70/, (r) => { r.internationalFitmentApplications[0].chassisCode = "KDJ150"; }],
  ["engine not offered in the model", /engine "1KD-FTV" is not offered in Land Cruiser 70/, (r) => { r.internationalFitmentApplications[0].engineCode = "1KD-FTV"; }],
  ["engine disagrees with chassis prefix (VDJ79 + 1HZ)", /does not match chassis prefix VDJ/, (r) => { r.internationalFitmentApplications[0].chassisCode = "VDJ79"; }],
  ["years outside production", /outside Land Cruiser 80 production/, (r) => { Object.assign(r.internationalFitmentApplications[0], { model: "Land Cruiser 80", chassisCode: "HZJ80", yearFrom: 1995, yearTo: 2003 }); }],
  ["no EPC evidence", /no Toyota EPC evidence/, (r) => { r.internationalFitmentApplications[0].evidence = []; }],
  ["evidence from a different market", /no Toyota EPC evidence for the Australia market/, (r) => { r.internationalFitmentApplications[0].evidence[0].market = "Japan"; }],
  ["unverified application on a commercial record", /keep it research_pending/, (r) => { r.internationalFitmentApplications[0].status = "vin_dependent"; }],
  ["US fitment mixed into an international record", /US fitmentApplications are not allowed/, (r) => { r.fitmentApplications = [{ make: "Toyota", model: "Land Cruiser", yearFrom: 2008, yearTo: 2021 }]; }],
  ["missing market disclaimer", /must say the vehicle was built for markets outside/, (r) => { r.description = "Genuine Toyota injector."; }],
  ["forbidden claim", /unestablished claim/, (r) => { r.description += " In stock."; }],
];
for (const [name, expect, mutate] of CASES) {
  const r = valid();
  mutate(r);
  const p = validateRecords([r]);
  ok(`INTL: rejects ${name}`, p.some((x) => expect.test(x)), p.join("; ") || "(no problem reported)");
}
const hold = valid();
hold.status = "research_pending";
hold.internationalFitmentApplications[0].status = "vin_dependent";
ok("INTL: unverified application allowed while research_pending (HOLD)", validateRecords([hold]).length === 0);

console.log(failed ? `\n${failed} test(s) failed` : "\nAll international-fitment prototype tests passed (US pathway unchanged).");
process.exit(failed ? 1 : 0);
