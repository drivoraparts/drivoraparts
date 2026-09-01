import ScrollReveal from "@/components/home/ScrollReveal";
import VehicleFinderControls from "./VehicleFinderControls";
import { getAllProducts } from "@/lib/inventory";
import { renderPhoto } from "@/lib/media/homepage-photo";

/**
 * "Tell us what you drive."
 *
 * A two-part composition: the vehicle on one side, the controls on the other.
 * The split is the argument -- a photograph of a truck next to four fields
 * says what the fields are for before the labels are read, which a row of
 * dropdowns under a heading does not.
 *
 * WHY THIS PHOTOGRAPH
 * It identifies something specific: a 4x4 pickup, which is what most of this
 * catalog fits. That is the test the imagery rule sets -- an image has to
 * reinforce the idea of its section, not decorate it. The file is one the site
 * already ships and has already paid for in bytes (43KB at 1280, with 800 and
 * 480 variants), so this costs a cache hit rather than a new download.
 *
 * The credit renders only where the licence demands one. This particular
 * photograph does not require attribution, so nothing prints today -- but the
 * check is on the manifest rather than on my reading of it, so swapping the
 * slot for one that does require a credit cannot silently drop it.
 *
 * MOTION
 * The panel and its fields rise as the section arrives, staggered, and that is
 * all. No parallax: the brief warns against it, and a background that tracks
 * the scroll would pull attention toward the picture at the exact moment the
 * visitor is meant to be reading four field labels.
 */
export default function CatalogVehicleFinderSection() {
  const photo = renderPhoto("veh-toyota-hilux-4x4");
  const productCount = getAllProducts().length;

  return (
    <section
      aria-labelledby="vehicle-finder-heading"
      className="relative isolate overflow-hidden border-y border-neutral-800 bg-neutral-950 text-white"
    >
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-0 lg:grid-cols-12">
        {/* The vehicle. */}
        <div className="relative lg:col-span-5">
          <ScrollReveal className="h-full">
            <div className="relative h-44 w-full overflow-hidden sm:h-60 lg:h-full lg:min-h-[26rem]">
              {photo ? (
                <picture>
                  {photo.avifSrcSet ? (
                    <source type="image/avif" srcSet={photo.avifSrcSet} sizes="(min-width: 1024px) 42vw, 100vw" />
                  ) : null}
                  <img
                    src={photo.src}
                    srcSet={photo.srcSet}
                    sizes="(min-width: 1024px) 42vw, 100vw"
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover object-center"
                  />
                </picture>
              ) : (
                <div className="blueprint-ground h-full w-full bg-neutral-900" />
              )}

              {/* Keeps the join with the panel from being a hard seam, and
                  stops the picture competing with the type beside it. */}
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/30 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-neutral-950/20 lg:to-neutral-950"
              />
            </div>
          </ScrollReveal>

          {photo?.credit ? (
            <p className="absolute bottom-2 left-3 text-[10px] text-neutral-500">
              {photo.creditHref ? (
                <a href={photo.creditHref} rel="nofollow noopener" className="hover:text-neutral-300">
                  {photo.credit}
                </a>
              ) : (
                photo.credit
              )}
            </p>
          ) : null}
        </div>

        {/* The controls. */}
        <div className="lg:col-span-7">
          <div className="px-4 py-12 sm:px-8 sm:py-14 lg:py-16 lg:pl-12 lg:pr-8">
            <ScrollReveal>
              <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-accent-on-dark">
                Fitment
              </p>
              <h2
                id="vehicle-finder-heading"
                className="mt-3 text-2xl font-bold leading-tight tracking-tight sm:text-4xl"
              >
                Tell us what you drive.
              </h2>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-neutral-400">
                Narrow {productCount.toLocaleString()} listings to the ones
                built for your vehicle.
              </p>
            </ScrollReveal>

            <div className="mt-8">
              <VehicleFinderControls />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
