import ScrollReveal from "./ScrollReveal";
import VehicleShowcase, { type ShowcaseItem } from "./VehicleShowcase";
import { renderPhoto } from "@/lib/media/homepage-photo";
import { vehiclePlatforms } from "@/data/vehicles";

/**
 * FIND YOUR VEHICLE — the page says "we understand vehicles" before it says
 * "we sell products".
 *
 * Every platform here comes from data/vehicles.ts, the same source the
 * /vehicles hubs and the fitment matcher use. Nothing is invented: if a
 * vehicle appears here, the catalogue genuinely has a hub for it.
 *
 * This component stays on the server so the vehicles dataset -- fitment
 * regexes, generation notes, long blurbs -- never reaches the browser. Only
 * the name, tagline and image URLs each slide actually needs are handed to
 * the client carousel.
 *
 * A platform without a photograph still appears, as a type-only slide.
 * Dropping it would silently shrink the range we look able to serve, which is
 * a worse lie than a slide with no picture.
 */
export default function VehiclePlatformGrid() {
  const items: ShowcaseItem[] = vehiclePlatforms.map((p) => {
    const photo = renderPhoto(`veh-${p.slug}`);
    return {
      slug: p.slug,
      name: p.name,
      tagline: p.tagline,
      src: photo?.src ?? null,
      srcSet: photo?.srcSet ?? null,
      width: photo?.width ?? null,
      height: photo?.height ?? null,
    };
  });

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

        <VehicleShowcase items={items} />
      </div>
    </section>
  );
}
