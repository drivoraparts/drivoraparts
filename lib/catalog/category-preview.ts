import { categories } from "@/lib/inventory/categories";
import { getAllProducts, getProductThumbnail } from "@/lib/inventory";
import { routes } from "@/lib/inventory/routes";

/**
 * What each category can show of itself, derived from the catalog.
 *
 * There is no category artwork in this project and none is being commissioned
 * for a layout pass, so the alternative was generic stock photography -- an
 * engine bay standing in for "Engine" -- which is precisely the thing the
 * imagery rule rules out. A real listing from the category is not a
 * substitute for that: it is better. It is the actual inventory, it cannot
 * misrepresent what the category contains, and it updates itself as stock
 * changes.
 *
 * Placeholder art is skipped when choosing the representative image. Roughly
 * one in ten listings carries a category SVG rather than a photograph, and a
 * tile showing the placeholder would advertise the gap rather than the
 * category. Where a category has no photographed listing at all, image comes
 * back null and the tile falls back to type -- deliberately, so the
 * image-audit workflow can still see what is missing.
 *
 * Counts are the real number of listings, not a rounded claim.
 */

export type CategoryPreview = {
  slug: string;
  name: string;
  count: number;
  /** A photographed listing from this category, or null if there is none. */
  image: string | null;
  href: string;
};

// The catalog is a bundled array that cannot change within an isolate, and
// this walks every product once per category. Computed on first use only.
let cache: CategoryPreview[] | null = null;

export function categoryPreviews(): CategoryPreview[] {
  if (cache) return cache;

  const all = getAllProducts();

  cache = categories.map((cat) => {
    const items = all.filter((p) => p.category === cat.slug);
    const photographed = items.find((p) => {
      const thumb = getProductThumbnail(p);
      return Boolean(thumb) && !thumb.includes("/placeholders/");
    });

    return {
      slug: cat.slug,
      name: cat.name,
      count: items.length,
      image: photographed ? getProductThumbnail(photographed) : null,
      href: routes.category(cat.slug),
    };
  });

  return cache;
}
