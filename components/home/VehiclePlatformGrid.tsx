import Link from "next/link";
import EditorialImage from "./EditorialImage";
import ScrollReveal from "./ScrollReveal";
import { getPhoto } from "@/lib/media/homepage-photo";
import { vehiclePlatforms } from "@/data/vehicles";

/**
 * FIND YOUR VEHICLE — the page says "we understand vehicles" before it says
 * "we sell products".
 *
 * Every platform here comes from data/vehicles.ts, which is the same source
 * the /vehicles hubs and the fitment matcher use. Nothing is invented: if a
 * vehicle is on this grid, the catalogue genuinely has a hub for it.
 *
 * A platform without a photograph still renders, as a type-only card. Dropping
 * it instead would silently shrink the range we appear to cover, which is a
 * worse lie than a card with no picture.
 */
export default function VehiclePlatformGrid() {
  const platforms = vehiclePlatforms.map((p) => ({
    slug: p.slug,
    name: p.name,
    tagline: p.tagline,
    hasPhoto: Boolean(getPhoto(`veh-${p.slug}`)),
  }));

  return (
    <section
      className="border-y border-border bg-background py-20 sm:py-28"
      aria-labelledby="vehicle-grid-heading"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <ScrollReveal className="max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-accent">
            Find your vehicle
          </p>
          <h2
            id="vehicle-grid-heading"
            className="mt-4 text-[clamp(1.9rem,4.4vw,3.25rem)] font-bold uppercase leading-[1.02] tracking-[-0.015em] text-foreground"
          >
            Start with what you drive
          </h2>
          <p className="mt-5 text-base leading-relaxed text-muted">
            Platform pages built around real fitment data — generations, chassis
            codes and the splits that decide whether a part actually bolts on.
          </p>
        </ScrollReveal>

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {platforms.map((p, i) => (
            <ScrollReveal key={p.slug} delayMs={Math.min(i, 6) * 40}>
              <Link
                href={`/vehicles/${p.slug}`}
                prefetch={false}
                className="group relative block h-full overflow-hidden border border-border bg-surface transition-colors hover:border-accent"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-surface-muted">
                  {p.hasPhoto ? (
                    <EditorialImage
                      slot={`veh-${p.slug}`}
                      alt={p.name}
                      sizes="(min-width: 1024px) 22rem, (min-width: 640px) 45vw, 100vw"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                        {p.name}
                      </span>
                    </div>
                  )}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background-dark/70 via-transparent to-transparent" />
                </div>

                <div className="p-5">
                  <h3 className="text-base font-bold tracking-tight text-foreground group-hover:text-accent-hover">
                    {p.name}
                  </h3>
                  <p className="mt-1 text-xs font-medium uppercase tracking-[0.1em] text-muted">
                    {p.tagline}
                  </p>
                </div>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
