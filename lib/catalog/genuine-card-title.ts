/**
 * Short title for a Toyota Genuine section card: what the part is and what it
 * fits, e.g. "8-Speed Automatic · GR Supra (2020–2025)".
 *
 * Listing names lead with "Toyota" and the part number, which on a phone
 * meant the card was cut off before the vehicle was ever named -- and the
 * part number is printed on its own line beneath anyway. Here:
 *   - "Toyota" and the part number are dropped (the section is all Toyota),
 *   - the word "Transmission" goes (the cards say what they are),
 *   - bracketed codes before the vehicle go ("(RA60)", "(35000-60D90)"),
 *   - the vehicle part after " — ", years included, is kept as written.
 * The full name stays on the product page and in the card's title attribute.
 */
export function genuineCardTitle(name: string, partNumber?: string): string {
  // \u2014 and \u2013 are the em and en dash, escaped: a literal one in the
  // bundle doubles the Worker's memory (scripts/verify-opennext-output.mjs).
  const [part, ...rest] = name.split(/\s+[\u2014\u2013]\s+/);
  const vehicle = rest.join(" \u2014 ").trim();

  let what = part.replace(/^Toyota\s+/i, "");
  if (partNumber) what = what.split(partNumber).join(" ");
  what = what
    .replace(/\([^)]*\)/g, " ")
    .replace(/\bTransmission\b/gi, " ")
    .replace(/\s{2,}/g, " ")
    .trim();

  if (!what) return name;
  return vehicle ? `${what} · ${vehicle}` : what;
}
