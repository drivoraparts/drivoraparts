import Link from "next/link";

import { routes } from "@/lib/inventory/routes";

/**
 * The closing shot.
 *
 * Replaces the band of photography credits that used to end the homepage. The
 * credits moved to /photography-credits, linked from the footer; this is what
 * the page closes on instead.
 *
 * WHY THERE IS NO HEADLINE OVER THE ARTWORK
 * The brief suggested "BUILT FOR THE MACHINE-OBSESSED" above the image, and
 * warned against duplicating typography the artwork already carries. Looking
 * at the artwork settles it: it carries three pieces of brand type already --
 * the DRIVORA PARTS banner reading "BUILT FOR THE DRIVE", a workshop sign
 * reading "BUILT. BREAK IT. FIX IT. REPEAT.", and a neon "BUILD WITHOUT
 * LIMITS". A fourth slogan, and the third to open with "BUILT", would be
 * exactly the doubling the brief rules out, and it would have to sit over a
 * frame whose corners are already occupied by the other three.
 *
 * So the picture keeps the voice and the site supplies only what the picture
 * genuinely lacks: one supporting line and a real link. The artwork has no
 * clickable anything in it -- the "EXPLORE THE CATALOG" the brief mentions is
 * not painted into this frame -- so the CTA below is the only route to the
 * catalog from here, and it uses the same accent button as the section above.
 *
 * WHY THE FRAME IS NEVER CROPPED
 * The two subjects sit at opposite extremes: the monster truck occupies
 * roughly 10-52% of the width, the performance car 60-94%. There is about
 * four percent of slack at each edge before one of them starts being cut, so
 * a taller mobile crop would take a wheel off the truck or the tail off the
 * car. The intentional mobile treatment is therefore to keep the composition
 * whole and move the copy beneath it, rather than to crop toward a subject --
 * at 375px the frame is about 211px tall, which also stops the section
 * dominating the phone homepage.
 *
 * WHY THE IMAGE STOPS WIDENING AT 1600px
 * The supplied artwork is 1080px wide. Stretched edge to edge on a 2560px
 * display it would be upscaled two and a half times and look soft, which is
 * the opposite of premium. Capping the frame keeps it under about 1.5x, and
 * below 1600px -- which is most screens -- it is still full width. A
 * higher-resolution original would let this cap be removed.
 */
export default function GarageClosingSection() {
  return (
    <section
      aria-labelledby="garage-closing-heading"
      className="relative isolate bg-neutral-950 text-white"
    >
      <h2 id="garage-closing-heading" className="sr-only">
        Build something worth driving
      </h2>

      <div className="relative mx-auto w-full max-w-[1600px]">
        <img
          src="/homepage/garage-closing/1080.webp"
          srcSet="/homepage/garage-closing/640.webp 640w, /homepage/garage-closing/1080.webp 1080w"
          sizes="(min-width: 1600px) 1600px, 100vw"
          width={1080}
          height={608}
          alt="A DrivoraParts workshop at sunset: a lifted monster truck and a black performance car either side of an open roller door, with engines, tools and parts across the floor."
          loading="lazy"
          decoding="async"
          className="block w-full"
        />

        {/*
          From sm upward the invitation sits on the frame, over a scrim heavy
          enough to read against wet concrete. Below sm the frame is only about
          211px tall and an overlay would cover the vehicles it is meant to be
          closing on, so the copy moves underneath instead.
        */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 hidden bg-gradient-to-t from-neutral-950 via-neutral-950/75 to-transparent pt-20 sm:block lg:pt-28">
          <div className="pointer-events-auto mx-auto flex max-w-3xl flex-col items-center gap-5 px-6 pb-8 text-center lg:pb-10">
            <p className="text-sm leading-relaxed text-neutral-200 lg:text-base">
              From the street to the trail, build something worth driving.
            </p>
            <div className="flex flex-col items-center gap-3 sm:flex-row">
              <Link
                href={routes.all}
                prefetch={false}
                className="touch-manipulation inline-flex items-center justify-center bg-accent px-10 py-4 text-sm font-bold uppercase tracking-[0.12em] text-accent-foreground transition-colors duration-[var(--motion-duration-fast)] hover:bg-accent-hover active:bg-accent-active"
              >
                Explore the catalog
              </Link>
              {/* The freight-quote route came off the CTA section this
                  replaced, where it was the only /contact link on the
                  homepage. Dropping that section without it would have
                  removed the page path to a quote. */}
              <Link
                href="/contact"
                prefetch={false}
                className="touch-manipulation inline-flex items-center justify-center border border-white/35 px-10 py-4 text-sm font-bold uppercase tracking-[0.12em] text-white transition-colors duration-[var(--motion-duration-fast)] hover:bg-white/10 active:bg-white/15"
              >
                Freight quote
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Phones. Same two elements, placed under the frame rather than on it. */}
      <div className="flex flex-col items-center gap-4 px-5 py-8 text-center sm:hidden">
        <p className="text-sm leading-relaxed text-neutral-300">
          From the street to the trail, build something worth driving.
        </p>
        <Link
          href={routes.all}
          prefetch={false}
          className="touch-manipulation inline-flex w-full items-center justify-center bg-accent px-8 py-4 text-sm font-bold uppercase tracking-[0.12em] text-accent-foreground transition-colors duration-[var(--motion-duration-fast)] active:bg-accent-active"
        >
          Explore the catalog
        </Link>
        <Link
          href="/contact"
          prefetch={false}
          className="touch-manipulation inline-flex w-full items-center justify-center border border-white/35 px-8 py-4 text-sm font-bold uppercase tracking-[0.12em] text-white transition-colors duration-[var(--motion-duration-fast)] active:bg-white/15"
        >
          Freight quote
        </Link>
      </div>
    </section>
  );
}
