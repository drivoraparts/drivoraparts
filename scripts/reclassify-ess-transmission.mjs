/**
 * Move miscategorized ESS catalog items out of transmission into correct categories.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const JSON_PATH = path.join(ROOT, "lib/inventory/data/ess-catalog.json");

function classify(name, description = "") {
  const hay = `${name} ${description}`.toLowerCase();

  if (/swap package|engine & transmission package|engine package|drivetrain package|stage \d cam|drop.in package|l87 8l90 stage/i.test(hay)) {
    return "engine";
  }
  if (/fuel system|catback|exhaust|shirt|racing style shirt/i.test(hay)) {
    if (/fuel system|fuel tank/i.test(hay)) return "engine";
    if (/catback|exhaust/i.test(hay)) return "engine";
    return "aftermarket";
  }
  if (/accessory drive|serpentine|motor mount(?!.*transmission crossmember)/i.test(hay)) {
    return "engine";
  }

  // Transmission assemblies, clutches, converters, coolers, swap trans hardware
  if (
    /\b(?:10l80|8l90|6l80|10r80|tr6060|tr-6060)\b.*transmission/i.test(hay) ||
    /^10l80 transmission|^8l90 transmission|^6l80 transmission/i.test(name.toLowerCase()) ||
    /torque converter|transmission cooler|clutch kit|clutch\b|flywheel|bellhousing|throw.?out|hydraulic conversion kit|counter weight kit|bolt pak flywheel|transmission conversion crossmember|swap transmission crossmember|2wd conversion kit/i.test(hay)
  ) {
    return "transmission";
  }

  if (/crossmember/i.test(hay)) return "engine";

  return "transmission";
}

const raw = JSON.parse(await fs.readFile(JSON_PATH, "utf8"));
let changed = 0;

for (const product of raw) {
  if (product.category !== "transmission") continue;
  const next = classify(product.name, product.description);
  if (next !== product.category) {
    console.log(`${product.id}: ${product.category} → ${next} | ${product.name}`);
    product.category = next;
    changed++;
  }
  if (/tansmission/i.test(product.name)) {
    product.name = product.name.replace(/Tansmission/i, "Transmission");
    changed++;
  }
}

await fs.writeFile(JSON_PATH, JSON.stringify(raw, null, 2));
console.log(`\nUpdated ${changed} ESS catalog entries.`);
