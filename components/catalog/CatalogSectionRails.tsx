import Link from "next/link";

import ProductRail from "./ProductRail";
import { SECTION_ROW_SIZE, type CatalogSection } from "@/lib/catalog/sections";

/**
 * A scope as rows of parts rather than one endless grid.
 *
 * This is the market pages' row layout, lifted out so /catalog/all can use
 * the same one. It renders and nothing else: the caller decides what the rows
 * are, what "View all" points at and what the closing band says, because a
 * market row links to a market URL while the front page's row links to the
 * grid further down its own page.
 *
 * The rows reuse the site's existing rail: snap scrolling with momentum on
 * touch, roughly two cards visible on a 375px screen so it is obvious the row
 * continues, a fade at the right edge on wider screens, and no page-level
 * horizontal scrolling anywhere.
 */
export default function CatalogSectionRails({
  sections,
  viewAllHref,
  closing,
  anchorId = "listings",
}: {
  sections: CatalogSection[];
  /** Where a row's "View all" goes, or undefined to omit it on every row. */
  viewAllHref?: (section: CatalogSection) => string;
  /** The band after the last row. Omitted entirely when not supplied. */
  closing?: {
    title: string;
    detail: React.ReactNode;
    href: string;
    cta: string;
  };
  anchorId?: string;
}) {
  if (sections.length === 0) return null;

  return (
    <>
      {/* Where a hero's vehicle chips land, so choosing a vehicle opens on
          that vehicle's rows rather than back at the top of the page -- on a
          phone the difference is a full screen. The margin clears the sticky
          site header. */}
      <div id={anchorId} className="scroll-mt-[112px] sm:scroll-mt-[122px]" />

      {sections.map((section, index) => (
        <ProductRail
          key={section.key}
          eyebrow={`${section.total.toLocaleString()} listing${section.total === 1 ? "" : "s"}`}
          title={section.label}
          description={section.blurb}
          products={section.products}
          viewAllHref={
            section.total > SECTION_ROW_SIZE ? viewAllHref?.(section) : undefined
          }
          tone={index % 2 === 0 ? "light" : "muted"}
        />
      ))}

      {closing ? (
        <section className="border-b border-neutral-200 bg-white px-4 py-10 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-baseline sm:justify-between">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-neutral-900">
                {closing.title}
              </h2>
              <p className="mt-1 text-sm text-neutral-500">{closing.detail}</p>
            </div>
            <Link
              href={closing.href}
              prefetch={false}
              className="group inline-flex shrink-0 touch-manipulation items-center gap-1.5 text-sm font-semibold text-accent transition-colors duration-[var(--motion-duration-fast)] hover:text-accent-hover"
            >
              {closing.cta}
              <span
                aria-hidden="true"
                className="transition-transform duration-[var(--motion-duration-fast)] group-hover:translate-x-0.5"
              >
                →
              </span>
            </Link>
          </div>
        </section>
      ) : null}
    </>
  );
}
