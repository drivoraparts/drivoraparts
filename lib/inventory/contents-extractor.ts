import type { PackageContents } from "./types";

/**
 * Reads what a listing's OWN text says about its contents.
 *
 * Everything returned is the listing's wording, kept as written, so qualifiers
 * ("tier dependent", "when available", "confirm at checkout") travel with the
 * statement instead of being dropped by a tidy list. Nothing is inferred from
 * the kind of product: if the text does not say it, it is not returned.
 *
 * Formats read:
 *  1. A bulleted list under an "Includes" / "Package Details" style heading.
 *  2. "Includes: a, b, c" / "Included: ..." lines. Comma-separated, split
 *     outside brackets; a line carrying a qualifier is kept whole instead.
 *  3. A sentence in which the kit or package "contains", "includes" or "comes
 *     with" something, kept as one statement (splitting prose into items
 *     mangles it).
 *  4. Spec rows "Label: Included" and "Label: Not included / Sold separately".
 *  5. Sentences that say something is not included, or sold separately.
 *  6. Short statements that something is required (an alignment, a tune,
 *     programming, a mount), when they are about installing the product.
 */
export type ExtractedContents = Pick<
  PackageContents,
  | "included"
  | "notIncluded"
  | "requiredSeparately"
  | "optionalUpgrades"
  | "installationRequirements"
  | "programmingRequirements"
>;

const QUALIFIER = /\b(when available|tier|depend|confirm|optional|may |varies|if |subject to|select)\b|\(/i;
const NOISE = /\b(warranty|guarantee|shipping|freight|price|financ|refund|return|labou?r|carrier)\b/i;

const MAX_ITEMS = 8;
const MAX_STATEMENT_CHARS = 260;

function tidy(text: string): string {
  const t = text
    .replace(/\s+/g, " ")
    .replace(/^[•\-*\s]+/, "")
    .replace(/[\s.;,]+$/, "")
    .trim();
  return t ? t.charAt(0).toUpperCase() + t.slice(1) : t;
}

/** Split on commas and semicolons that are not inside brackets. */
function splitOutsideBrackets(text: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = "";
  for (const ch of text) {
    if (ch === "(") depth++;
    if (ch === ")") depth = Math.max(0, depth - 1);
    if ((ch === "," || ch === ";") && depth === 0) {
      parts.push(current);
      current = "";
      continue;
    }
    current += ch;
  }
  parts.push(current);
  return parts.map(tidy).filter(Boolean);
}

/** Drops a marketing tail ("..., so the whole system is upgraded") from a statement. */
function trimTail(text: string): string {
  return text.split(/,\s+(?:so|which|meaning|making|giving|allowing)\s/i)[0];
}

function push(list: string[], value: string): void {
  const v = tidy(
    trimTail(value)
      .replace(/\*+$/, "")
      .replace(/^note\s*:\s*/i, "")
  );
  if (!v || v.length > MAX_STATEMENT_CHARS) return;
  const lower = v.toLowerCase();
  // Skip an exact repeat, or a fragment of a statement already listed.
  if (list.some((x) => x.toLowerCase() === lower || x.toLowerCase().includes(lower))) return;
  // A longer statement replaces the shorter fragment it contains.
  const fragment = list.findIndex((x) => lower.includes(x.toLowerCase()));
  if (fragment >= 0) {
    list[fragment] = v;
    return;
  }
  if (list.length < MAX_ITEMS) list.push(v);
}

/**
 * For "<product title>, package contains 4 shocks and 4 springs": keep from
 * the subject that does the containing, not the whole line.
 */
function fromSubject(sentence: string): string {
  const m = sentence.match(
    /(?:^|[\s,;-])((?:the |this |our )?(?:kit|package|set|system|assembly|unit|pair)\s+(?:contains|includes|comes with|is supplied with|ships with)\b.*)$/i
  );
  return m ? m[1] : sentence;
}

function sentences(description: string): string[] {
  return description
    .split(/\n+/)
    .flatMap((line) => line.split(/(?<=[.!?])\s+(?=[A-Z0-9])/))
    .map((s) => s.trim())
    .filter(Boolean);
}

const PROGRAMMING_TOPIC = /\b(tune|tuning|programming|calibration|reflash|re-flash|flash)\b/i;
const INSTALL_TOPIC =
  /\b(alignment|compressor|mount|bracket|cutting|drilling|welding|fabrication|modification|trimming|professional|splicing|wiring|reinforcement|spacer|adapter|bolts?|installation)\b/i;
const REQUIREMENT_WORD = /\b(requires?|required|needed|necessary)\b/i;
const NOT_A_REQUIREMENT = /\b(included|supplies|means|unlike|competitor|designed|allows?|ensures?)\b/i;

const HEADING_LINE = /^(package\s+|kit\s+)?(includes?|contents|what.s included|package details|included)\s*:?$/i;
const INLINE_INCLUDES = /^(?:package |kit )?(?:includes?|included|contents)\s*:\s*(.+)$/i;
const SPEC_ROW =
  /^([A-Za-z][A-Za-z0-9 /&'-]{1,40}):\s*(not included|not supplied|sold separately|excluded|included|supplied)\.?$/i;

export function extractContents(description: string): ExtractedContents {
  const included: string[] = [];
  const notIncluded: string[] = [];
  const requiredSeparately: string[] = [];
  const optional: string[] = [];
  const installation: string[] = [];
  const programming: string[] = [];
  const lines = description.split("\n");

  // 1. Bulleted list under an "Includes" style heading.
  for (let i = 0; i < lines.length; i++) {
    if (!HEADING_LINE.test(lines[i].trim())) continue;
    const items: string[] = [];
    let j = i + 1;
    while (j < lines.length && !lines[j].trim()) j++;
    for (; j < lines.length; j++) {
      const line = lines[j].trim();
      if (/^[•\-*]\s+/.test(line)) items.push(line.replace(/^[•\-*]\s+/, ""));
      else break;
    }
    if (items.length >= 2) items.forEach((item) => push(included, item));
  }

  for (const raw of lines) {
    const line = raw.trim().replace(/^[•\-*]\s*/, "");

    // 2. "Includes: a, b, c"
    const inline = line.match(INLINE_INCLUDES);
    if (inline && !/^not\b/i.test(inline[1])) {
      if (QUALIFIER.test(inline[1])) push(included, inline[1]);
      else splitOutsideBrackets(inline[1]).forEach((item) => push(included, item));
      continue;
    }

    // "Package Contains 2 Coilovers 2 Shocks"
    const contains = line.match(/^(?:package|kit) contains\s+(.+)$/i);
    if (contains) {
      push(included, contains[1]);
      continue;
    }

    // 4. Spec rows: "Compressor: Not included", "Hardware: Included"
    const row = line.match(SPEC_ROW);
    if (row) {
      const label = tidy(row[1]);
      if (/^(not included|not supplied|sold separately|excluded)$/i.test(row[2])) {
        push(notIncluded, `${label}: ${row[2].toLowerCase()}`);
      } else {
        push(included, label);
      }
      continue;
    }

    // Short spec lines: "Tune Required", "NO TUNE REQUIRED", "Programming required".
    const short = line.match(
      /^(no )?(tune|tuning|programming|calibration|alignment|drilling|cutting|welding|modification)s?\s+(is |are )?(required|needed)\.?$/i
    );
    if (short) {
      push(PROGRAMMING_TOPIC.test(short[2]) ? programming : installation, line);
    }
  }

  for (const sentence of sentences(description)) {
    if (NOISE.test(sentence) || sentence.length > MAX_STATEMENT_CHARS + 60) continue;
    // Already handled line by line above.
    if (/^(package |kit )?(includes?|included|contents)\s*:/i.test(sentence)) continue;
    if (/:\s*$/.test(sentence)) continue; // a heading such as "Kit includes:"
    if (SPEC_ROW.test(sentence)) continue;
    if (/^(no )?(tune|tuning|programming|calibration)s?\s+(is |are )?(required|needed)\.?$/i.test(sentence)) continue;

    // 5. Stated exclusions and separately sold items.
    if (/\b(does not include|doesn.t include|is not included|are not included|not supplied|excludes?)\b/i.test(sentence)) {
      push(notIncluded, sentence);
      continue;
    }
    if (/\bsold separately\b/i.test(sentence)) {
      // "rather than sold separately" is marketing about a bundled design.
      if (/\b(rather than|instead of|not sold separately|never sold separately)\b/i.test(sentence)) continue;
      if (REQUIREMENT_WORD.test(sentence) || /\b(needs?|must)\b/i.test(sentence)) push(requiredSeparately, sentence);
      else push(optional, sentence);
      continue;
    }

    // 3. "The kit contains / includes / comes with ..." (not an optional extra
    // that merely mentions what ITS kit includes).
    if (
      !/\b(also available|available separately|optional|highly recommended|for an additional)\b/i.test(sentence) &&
      (/\b(kit|package|set|system|assembly|unit|pair)\b[^.]{0,60}\b(contains|includes|comes with|is supplied with|ships with)\b/i.test(sentence) ||
        /^(contains|includes)\b/i.test(sentence))
    ) {
      push(included, fromSubject(sentence));
      continue;
    }

    // 6. Stated requirements: short, on a known topic, not marketing prose.
    if (
      sentence.length <= 150 &&
      REQUIREMENT_WORD.test(sentence) &&
      !NOT_A_REQUIREMENT.test(sentence) &&
      (PROGRAMMING_TOPIC.test(sentence) || INSTALL_TOPIC.test(sentence))
    ) {
      push(PROGRAMMING_TOPIC.test(sentence) ? programming : installation, sentence);
    }
  }

  return {
    ...(included.length ? { included } : {}),
    ...(notIncluded.length ? { notIncluded } : {}),
    ...(requiredSeparately.length ? { requiredSeparately } : {}),
    ...(optional.length ? { optionalUpgrades: optional } : {}),
    ...(installation.length ? { installationRequirements: installation.slice(0, 3) } : {}),
    ...(programming.length ? { programmingRequirements: programming.slice(0, 2) } : {}),
  };
}
