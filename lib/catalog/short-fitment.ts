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
  return (boundary > 40 ? cut.slice(0, boundary) : cut).trimEnd() + "…";
}
