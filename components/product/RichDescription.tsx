import TranslatedText from "@/components/i18n/TranslatedText";

/**
 * Renders a product description with real structure.
 *
 * Descriptions are authored as plain text and were rendered as a single span,
 * so every heading ran straight into the paragraph beneath it — a long listing
 * became an unreadable wall. Only five headings were recognised anywhere, and
 * those were routed into separate tabs rather than styled in place.
 *
 * This gives headings, bullets and paragraphs their own treatment without
 * changing how descriptions are written. Nothing needs re-authoring: existing
 * listings gain spacing and weight, and longer ones become scannable.
 */

type Block =
  | { kind: "heading"; level: 1 | 2; text: string }
  | { kind: "list"; items: string[] }
  | { kind: "paragraph"; text: string };

/**
 * A heading is a short line that introduces what follows. Detected by shape
 * rather than a fixed list, so a new section never silently becomes body text:
 * ALL-CAPS lines, and Title Case lines that carry no sentence punctuation.
 */
function isHeading(line: string, next: string | undefined): boolean {
  const text = line.trim();
  if (!text || text.length > 70) return false;
  if (/^[•\-*]/.test(text)) return false;
  if (/[.:,;?]$/.test(text)) return false;
  // "Label: value" is data, not a heading — "Mileage: N/A / Not Verified" and
  // "Stock Status: In Stock" were being bolded as section titles.
  if (text.includes(":")) return false;
  // A heading introduces something — a trailing blank line means it does not.
  if (next === undefined) return false;

  const letters = text.replace(/[^A-Za-z]/g, "");
  if (letters.length < 2) return false;

  const isAllCaps = letters === letters.toUpperCase();
  const startsUpper = /^[A-Z0-9]/.test(text);
  const wordCount = text.split(/\s+/).length;

  return (isAllCaps && wordCount <= 10) || (startsUpper && wordCount <= 6);
}

function parse(description: string): Block[] {
  const lines = description.split("\n");
  const blocks: Block[] = [];
  let paragraph: string[] = [];
  let list: string[] = [];

  const flushParagraph = () => {
    if (!paragraph.length) return;
    blocks.push({ kind: "paragraph", text: paragraph.join(" ").trim() });
    paragraph = [];
  };

  const flushList = () => {
    if (!list.length) return;
    blocks.push({ kind: "list", items: list });
    list = [];
  };

  lines.forEach((raw, index) => {
    const line = raw.trim();

    if (!line) {
      flushParagraph();
      flushList();
      return;
    }

    if (/^[•\-*]\s*/.test(line)) {
      flushParagraph();
      list.push(line.replace(/^[•\-*]\s*/, ""));
      return;
    }

    // Checkmark lines read as list items too — "✓ Factory ECU".
    if (/^[✓✔]\s*/.test(line)) {
      flushParagraph();
      list.push(line.replace(/^[✓✔]\s*/, ""));
      return;
    }

    flushList();

    // Find the next non-blank line to decide whether this introduces anything.
    let next: string | undefined;
    for (let i = index + 1; i < lines.length; i += 1) {
      if (lines[i].trim()) {
        next = lines[i].trim();
        break;
      }
    }

    if (isHeading(line, next)) {
      flushParagraph();
      const letters = line.replace(/[^A-Za-z]/g, "");
      const major = letters === letters.toUpperCase() || blocks.length === 0;
      blocks.push({ kind: "heading", level: major ? 1 : 2, text: line });
      return;
    }

    paragraph.push(line);
  });

  flushParagraph();
  flushList();
  return blocks;
}

export default function RichDescription({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  if (!text?.trim()) return null;

  const blocks = parse(text);

  return (
    <div className={`flex flex-col gap-4 ${className}`.trim()}>
      {blocks.map((block, index) => {
        if (block.kind === "heading") {
          return block.level === 1 ? (
            <h3
              key={index}
              className="mt-3 border-b border-neutral-200 pb-1.5 text-base font-extrabold uppercase tracking-[0.06em] text-neutral-900 first:mt-0 sm:text-lg"
            >
              <TranslatedText as="span">{block.text}</TranslatedText>
            </h3>
          ) : (
            <h4
              key={index}
              className="mt-1 text-sm font-bold text-neutral-900 sm:text-[0.95rem]"
            >
              <TranslatedText as="span">{block.text}</TranslatedText>
            </h4>
          );
        }

        if (block.kind === "list") {
          return (
            <ul key={index} className="flex list-disc flex-col gap-1.5 pl-5">
              {block.items.map((item, itemIndex) => (
                <li
                  key={itemIndex}
                  className="text-sm leading-relaxed text-neutral-700"
                >
                  <TranslatedText as="span">{item}</TranslatedText>
                </li>
              ))}
            </ul>
          );
        }

        return (
          <p key={index} className="text-sm leading-relaxed text-neutral-700">
            <TranslatedText as="span">{block.text}</TranslatedText>
          </p>
        );
      })}
    </div>
  );
}
