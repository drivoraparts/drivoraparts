import Link from "next/link";

import CatalogProductCard from "./CatalogProductCard";
import ScrollReveal from "@/components/home/ScrollReveal";
import { MOTION } from "@/lib/motion/motion";
import { toCatalogCardData } from "@/lib/catalog/to-card-data";
import { renderPhoto } from "@/lib/media/homepage-photo";
import type { Product } from "@/lib/inventory/types";

/**
 * A horizontal wall of parts.
 *
 * IDENTITY
 * Four editorial collections rendered in the same box, differing only by an
 * alternating background, read as one section repeated four times. A rail can
 * now lead with a photograph of the thing it is about -- mechanical detail for
 * track hardware, the off-roader for off-road, the working truck for truck
 * builds -- which is what makes each feel like a different part of the
 * automotive world rather than a different row of the same table.
 *
 * `photoSlot` is only ever set where the picture genuinely is the subject.
 * There is no JDM photograph in this project, so that collection leads with
 * type instead of borrowing an unrelated car, and the layout is built to look
 * deliberate either way rather than looking like a missing image.
 *
 * MOTION
 * The heading arrives, then the supporting line, then the rail -- three
 * reveals, not one per card. Twelve products each flying in separately is the
 * entrance animation the brief rules out, and it delays reading the row.
 *
 * Scrolling is the browser's own: snap points, momentum on touch, and a
 * hidden scrollbar with a fade at the right edge so there is a visible reason
 * to push the row sideways.
 */
export default function ProductRail({
  eyebrow,
  title,
  description,
  products,
  viewAllHref,
  badge,
  tone = "light",
  photoSlot,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  products: Product[];
  viewAllHref?: string;
  /** Optional badge rendered on every card in this rail, e.g. "New". */
  badge?: string;
  tone?: "light" | "muted";
  /** Photography slot whose subject is this collection. See the note above. */
  photoSlot?: string;
}) {
  if (products.length === 0) return null;

  const photo = photoSlot ? renderPhoto(photoSlot) : null;
  const onPhoto = Boolean(photo);

  return (
    <section
      className={
        onPhoto
          ? "relative isolate overflow-hidden border-b border-neutral-800 bg-neutral-950 text-white"
          : `border-b border-neutral-200 px-4 py-12 sm:px-6 lg:px-8 ${
              tone === "muted" ? "bg-neutral-50" : "bg-white"
            }`
      }
    >
      {photo ? (
        <>
          <img
            src={photo.src}
            srcSet={photo.srcSet}
            sizes="100vw"
            alt=""
            loading="lazy"
            decoding="async"
            aria-hidden="true"
            className="absolute inset-0 -z-10 h-full w-full object-cover"
          />
          {/* The photograph is a ground, not a picture to study. A flat 80%
              wash made all three photographed collections read as the same
              black band, which defeats the point of giving them separate
              pictures. This is graded instead: heaviest on the left under the
              heading, lightest on the right where only the rail sits, so the
              subject is legible without ever competing with the type. */}
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-gradient-to-r from-neutral-950/95 via-neutral-950/75 to-neutral-950/55"
          />
        </>
      ) : null}

      <div
        className={
          onPhoto
            ? "mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8"
            : "mx-auto max-w-6xl"
        }
      >
        <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <ScrollReveal distance={MOTION.distance.sm}>
              <p
                className={`text-[11px] font-bold uppercase tracking-[0.22em] ${
                  onPhoto ? "text-accent-on-dark" : "text-accent"
                }`}
              >
                {eyebrow}
              </p>
              <h2
                className={`mt-2 text-xl font-bold tracking-tight sm:text-2xl ${
                  onPhoto ? "text-white" : "text-neutral-900"
                }`}
              >
                {title}
              </h2>
            </ScrollReveal>

            {description ? (
              <ScrollReveal
                delayMs={MOTION.stagger}
                distance={MOTION.distance.sm}
              >
                <p
                  className={`mt-2 max-w-xl text-sm leading-relaxed ${
                    onPhoto ? "text-neutral-300" : "text-neutral-600"
                  }`}
                >
                  {description}
                </p>
              </ScrollReveal>
            ) : null}
          </div>

          {viewAllHref ? (
            <ScrollReveal
              delayMs={MOTION.stagger}
              distance={MOTION.distance.sm}
              className="shrink-0"
            >
              <Link
                href={viewAllHref}
                prefetch={false}
                className={`group inline-flex touch-manipulation items-center gap-1.5 text-sm font-semibold transition-colors duration-[var(--motion-duration-fast)] ${
                  onPhoto
                    ? "text-accent-on-dark hover:text-white"
                    : "text-accent hover:text-accent-hover"
                }`}
              >
                View all
                <span
                  aria-hidden="true"
                  className="transition-transform duration-[var(--motion-duration-fast)] group-hover:translate-x-0.5"
                >
                  →
                </span>
              </Link>
            </ScrollReveal>
          ) : null}
        </div>

        <ScrollReveal delayMs={MOTION.stagger * 2}>
          <div className="relative">
            <div className="catalog-rail -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:gap-4 sm:px-0">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="w-[164px] shrink-0 snap-start sm:w-[210px]"
                >
                  <div className="relative">
                    {badge ? (
                      <span className="absolute left-2 top-2 z-20 rounded-[2px] bg-accent px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.08em] text-accent-foreground">
                        {badge}
                      </span>
                    ) : null}
                    <CatalogProductCard product={toCatalogCardData(product)} />
                  </div>
                </div>
              ))}
            </div>

            {/* Says the row continues, without a scrollbar sitting under it. */}
            <div
              aria-hidden="true"
              className={`pointer-events-none absolute inset-y-0 right-0 hidden w-12 sm:block ${
                onPhoto
                  ? "bg-gradient-to-l from-neutral-950 to-transparent"
                  : tone === "muted"
                    ? "bg-gradient-to-l from-neutral-50 to-transparent"
                    : "bg-gradient-to-l from-white to-transparent"
              }`}
            />
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
