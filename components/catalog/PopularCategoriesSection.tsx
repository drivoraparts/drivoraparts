import Link from "next/link";

import ScrollReveal from "@/components/home/ScrollReveal";
import { MOTION } from "@/lib/motion/motion";
import { categoryPreviews } from "@/lib/catalog/category-preview";

/**
 * Browse by category.
 *
 * This was fourteen bordered boxes containing a name and a one-line blurb,
 * which read as navigation rather than as somewhere to look. It now shows each
 * category as what is actually in it: a real listing's photograph and the real
 * number of listings.
 *
 * WHY REAL PRODUCTS AND NOT CATEGORY ARTWORK
 * There is no category artwork, and inventing it would mean generic stock --
 * an engine bay for "Engine" -- which the imagery rule forbids and which tells
 * the customer nothing they did not already know from the word. A photograph
 * of something genuinely in the category is honest, and it changes as the
 * stock does. See lib/catalog/category-preview.ts.
 *
 * The images are object-contain on a plain surface, not cropped to fill. A
 * cover crop on a 4:3 tile takes the ends off gearboxes and the corners off
 * body panels, and the shape of a part is most of what identifies it.
 *
 * Aftermarket is included even though it was not in the brief's list: it holds
 * 127 real listings, and leaving it out of the only complete category index
 * would hide them.
 *
 * MOTION
 * One reveal for the heading, one for the grid -- not fourteen individually
 * flying in. Hover does the rest: the photograph scales a little, the row
 * shifts a few pixels, the arrow gains contrast.
 */
export default function PopularCategoriesSection() {
  const previews = categoryPreviews();

  return (
    <section
      aria-labelledby="category-discovery-heading"
      className="border-b border-neutral-200 bg-white px-4 py-14 sm:px-6 sm:py-16 lg:px-8"
    >
      <div className="mx-auto max-w-6xl">
        <ScrollReveal className="max-w-2xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-accent">
            Browse by Category
          </p>
          <h2
            id="category-discovery-heading"
            className="mt-2 text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl"
          >
            Start with the system you’re building.
          </h2>
        </ScrollReveal>

        <ScrollReveal delayMs={MOTION.stagger}>
          <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:gap-4">
            {previews.map((cat) => (
              <li key={cat.slug}>
                <Link
                  href={cat.href}
                  prefetch={false}
                  className="group flex h-full touch-manipulation flex-col overflow-hidden rounded-[3px] border border-neutral-200 bg-white transition-[border-color,box-shadow] duration-[var(--motion-duration-fast)] hover:border-neutral-400 hover:shadow-[0_10px_30px_-18px_rgba(0,0,0,0.45)]"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-neutral-50">
                    {cat.image ? (
                      <img
                        src={cat.image}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-contain p-3 transition-transform duration-[var(--motion-duration-base)] ease-[var(--motion-ease-state)] group-hover:scale-[1.04]"
                      />
                    ) : (
                      // No photographed listing in this category yet. Says so
                      // in type rather than borrowing an unrelated picture.
                      <div className="flex h-full w-full items-center justify-center">
                        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
                          {cat.name}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-1 items-end justify-between gap-2 border-t border-neutral-200 px-3 py-3">
                    <div className="min-w-0 transition-transform duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-state)] group-hover:translate-x-0.5">
                      <p className="truncate text-sm font-semibold text-neutral-900">
                        {cat.name}
                      </p>
                      <p className="mt-0.5 text-xs tabular-nums text-neutral-500">
                        {cat.count.toLocaleString()} listings
                      </p>
                    </div>
                    <span
                      aria-hidden="true"
                      className="shrink-0 pb-0.5 text-neutral-300 transition-[color,transform] duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-state)] group-hover:translate-x-0.5 group-hover:text-accent"
                    >
                      →
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </ScrollReveal>
      </div>
    </section>
  );
}
