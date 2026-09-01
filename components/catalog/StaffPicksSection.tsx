import Link from "next/link";

import ScrollReveal from "@/components/home/ScrollReveal";
import ProductPrice from "@/components/currency/ProductPrice";
import ProductImage from "@/components/media/ProductImage";
import { MOTION } from "@/lib/motion/motion";
import { getStaffPicks } from "@/lib/catalog/staff-picks";
import { getCategory, getProductThumbnail } from "@/lib/inventory";
import { routes } from "@/lib/inventory/routes";

/**
 * Editorial notes on the four systems that decide a build.
 *
 * WHY THE HEADING CHANGED
 * This read "What we'd grab off the shelf", over four listings selected by
 * `all.find(...)` -- whichever happened to sit first in the concatenated
 * catalog arrays. The words promised individual curation; the code was
 * picking arbitrarily, and one of the notes claimed the listings had been
 * inspected before listing, which nothing here can support.
 *
 * The notes are genuine and they stay: they are advice about engines,
 * suspension, turbos and brakes, and they are the reason this section earns
 * its place. What changed is that the page now says what these are -- notes on
 * a category, shown against a current listing from it -- and the listing is
 * chosen by a stated rule (see lib/catalog/staff-picks.ts) rather than by
 * accident. If these ever do become four individually chosen parts, the older
 * heading becomes true again and is worth restoring.
 *
 * The category is named on each card, because the note is about the category
 * and the price underneath belongs to one listing. Without that label the two
 * read as a single claim about the one product.
 */
export default function StaffPicksSection() {
  const picks = getStaffPicks();
  if (picks.length === 0) return null;

  return (
    <section
      aria-labelledby="staff-picks-heading"
      className="border-b border-neutral-200 bg-neutral-50 px-4 py-14 sm:px-6 sm:py-16 lg:px-8"
    >
      <div className="mx-auto max-w-6xl">
        <ScrollReveal className="max-w-2xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-accent">
            Where to start
          </p>
          <h2
            id="staff-picks-heading"
            className="mt-2 text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl"
          >
            Four systems worth getting right.
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-neutral-600">
            Notes on the parts that decide a build, each shown against a
            current listing from that category.
          </p>
        </ScrollReveal>

        <div className="mt-9 grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
          {picks.map((pick, index) => {
            const category = getCategory(pick.categorySlug);
            return (
              <ScrollReveal
                key={pick.categorySlug}
                delayMs={index * MOTION.stagger}
                distance={MOTION.distance.sm}
              >
                <article className="group flex h-full flex-col overflow-hidden rounded-[3px] border border-neutral-200 bg-white transition-[border-color,box-shadow] duration-[var(--motion-duration-fast)] hover:border-neutral-400 hover:shadow-[0_12px_32px_-20px_rgba(0,0,0,0.5)]">
                  <p className="border-b border-neutral-200 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-500">
                    {category?.name ?? pick.categorySlug}
                  </p>

                  <p className="px-3 pt-3 text-xs leading-relaxed text-neutral-700">
                    {pick.reason}
                  </p>

                  <div className="mt-auto px-3 pb-3 pt-4">
                    <Link
                      href={routes.product(pick.product.id)}
                      prefetch={false}
                      className="flex items-center gap-3 rounded-[2px] border border-neutral-200 p-2 transition-colors duration-[var(--motion-duration-fast)] hover:border-neutral-400"
                    >
                      <span className="block h-14 w-14 shrink-0 overflow-hidden rounded-[2px] bg-neutral-50">
                        <ProductImage
                          src={getProductThumbnail(pick.product)}
                          alt={pick.product.name}
                          profile="card"
                          className="h-full w-full object-contain p-1 transition-transform duration-[var(--motion-duration-base)] ease-[var(--motion-ease-state)] group-hover:scale-[1.03]"
                        />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="line-clamp-2 block text-[11px] font-semibold leading-snug text-neutral-900">
                          {pick.product.name}
                        </span>
                        <ProductPrice
                          price={pick.product.price}
                          compareAtPrice={pick.product.compareAtPrice}
                          size="sm"
                          className="mt-1"
                        />
                      </span>
                    </Link>
                  </div>
                </article>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
