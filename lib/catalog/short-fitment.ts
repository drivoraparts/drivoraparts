/**
 * Fitment text, cut to card length.
 *
 * This lived inside lib/catalog/query.ts, where it shortened the fitment the
 * marketplace grid prints. The rails now print fitment too, and they are fed
 * by lib/catalog/to-card-data.ts rather than by the query -- so the choice was
 * a second copy of the rule or one shared one. A card that says
 * "Fits 1996-2003 Ford 7.3L Power Stroke, including the 1996-1997 OBS F-2..."
 * in the grid and something cut differently in a rail is the same listing
 * disagreeing with itself.
 *
 * Kept in its own module, importing nothing, for the reason query-options.ts
 * gives: to-card-data.ts is re-exported from @/lib/inventory, and pulling
 * query.ts in behind it would drag the market definitions and the vehicles
 * dataset along with it.
 */

/** Longest fitment a card prints before it is cut on a word boundary. */
const MAX_CARD_FITMENT = 96;

export function shortFitment(text: string | undefined): string | undefined {
  if (!text) return undefined;
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= MAX_CARD_FITMENT) return clean;
  const cut = clean.slice(0, MAX_CARD_FITMENT);
  const boundary = cut.lastIndexOf(" ");
  // A cut after "applications," would otherwise print "applications,…".
  return (boundary > 40 ? cut.slice(0, boundary) : cut).replace(/[\s,;:]+$/, "") + "…";
}

type FitmentSource = {
  fitment?: string;
  fitmentApplications?: {
    make: string;
    yearFrom: number | null;
    yearTo: number | null;
  }[];
};

/**
 * The one-line fitment a listing is summarised by, wherever a line is all
 * there is room for: cards, the compare table, the product page's meta
 * description and the order-tracking page.
 *
 * For listings with a structured application list, the stored fitment line was
 * written by the import that recorded the list, and it names at most three
 * makes with no sign that others were left out. On 92 listings that silently
 * drops a make the list contains -- #1017 read "Ford / GMC / Mercury" over 124
 * applications that include Chevrolet -- so the line told a Chevrolet owner
 * the part did not fit their car.
 *
 * Where the stored line names every make it is kept as written. Where it does
 * not, the line is rebuilt from the applications themselves: how many, which
 * makes (all of them) and the years they span. The stored text is not edited;
 * the vehicle hubs and search still match against it.
 */
export function compactFitment(product: FitmentSource): string | undefined {
  const text = product.fitment?.trim() || undefined;
  const applications = product.fitmentApplications ?? [];
  if (applications.length === 0) return text;

  const makes = [...new Set(applications.map((row) => row.make.trim()).filter(Boolean))].sort(
    (a, b) => a.localeCompare(b)
  );
  const lower = (text ?? "").toLowerCase();
  if (text && makes.every((make) => lower.includes(make.toLowerCase()))) return text;

  const makeList =
    makes.length <= 1
      ? makes.join("")
      : `${makes.slice(0, -1).join(", ")} & ${makes[makes.length - 1]}`;
  const years = applications
    .flatMap((row) => [row.yearFrom, row.yearTo])
    .filter((year): year is number => typeof year === "number");
  const from = years.length > 0 ? Math.min(...years) : undefined;
  const to = years.length > 0 ? Math.max(...years) : undefined;
  const span = from === undefined ? "" : from === to ? `, ${from}` : `, ${from}–${to}`;

  const count = applications.length;
  return `${count.toLocaleString("en-US")} ${makeList} application${count === 1 ? "" : "s"}${span}`;
}
