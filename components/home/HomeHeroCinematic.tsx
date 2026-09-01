import Link from "next/link";
import EditorialImage from "./EditorialImage";
import HeroVideo from "./HeroVideo";
import { getHeroVideo, renderPhoto } from "@/lib/media/homepage-photo";
import { routes } from "@/lib/inventory/routes";

/**
 * The opening frame. It has to do one job: make a stranger believe this is a
 * real automotive company within a second of landing.
 *
 * Sized in svh, not vh. On mobile browsers vh is the *largest* viewport, so a
 * 100vh hero is taller than the visible area while the address bar is showing
 * and the CTAs sit below the fold on first paint -- the one thing a hero must
 * never do.
 *
 * ONLY THE HEADLINE AND THE BUTTONS SIT ON THE PICTURE.
 * The supporting sentence and the stock line used to sit here too, and five
 * stacked text elements left the vehicle fighting for its own frame. They now
 * run in a band directly below, wording unchanged -- the reference site keeps
 * a headline and a button over the image and nothing else.
 *
 * The scrim is a two-part treatment rather than a flat wash: a base tint for
 * overall legibility, plus a bottom-weighted gradient so the headline sits on
 * the darkest part of the frame while the top stays open. Text contrast over a
 * moving picture is not guaranteed by tokens, so the scrim has to carry it.
 */
export default function HomeHeroCinematic({ listingCount }: { listingCount: number }) {
  const photo = renderPhoto("hero");
  const video = getHeroVideo();

  return (
    <>
      <section className="relative -mt-[106px] flex min-h-[86svh] w-full min-w-0 items-end overflow-hidden bg-background-dark pt-[106px] sm:-mt-[114px] sm:min-h-[92svh] sm:pt-[114px]">
        <div className="absolute inset-0 z-0">
          {video ? (
            <HeroVideo />
          ) : photo ? (
            /* The still is 3:2 and the mobile viewport is portrait, so
               object-cover crops horizontally. Centred, that framed the dust
               plume and pushed the vehicle out of shot -- measuring the image
               by column put the detail peak at ~71%, so the crop aims there. */
            <EditorialImage
              slot="hero"
              alt=""
              priority
              sizes="100vw"
              className="h-full w-full object-cover object-[66%_center] sm:object-center"
            />
          ) : null}
        </div>

        {/* Measured, not guessed: white over the scrimmed headline was 10.08:1
            where large text needs 3. That headroom is better spent on the
            picture than banked. Re-measure before lowering further. */}
        <div className="pointer-events-none absolute inset-0 z-10 bg-background-dark/5" />
        <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-background-dark via-background-dark/45 to-transparent" />

        <div className="relative z-20 mx-auto w-full max-w-6xl px-5 pb-16 sm:px-8 sm:pb-24 lg:pb-28">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-accent-on-dark">
            Trucks · 4x4 · Performance
          </p>

          <h1 className="mt-5 max-w-4xl text-[clamp(2.25rem,7vw,5rem)] font-bold uppercase leading-[0.95] tracking-[-0.02em] text-foreground-on-dark">
            Built for the
            <br />
            road ahead.
          </h1>

          <div className="mt-9 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            <Link
              href={routes.all}
              prefetch={false}
              className="touch-manipulation inline-flex items-center justify-center bg-accent px-9 py-4 text-sm font-bold uppercase tracking-[0.12em] text-accent-foreground transition-colors hover:bg-accent-hover active:bg-accent-active"
            >
              Shop Parts
            </Link>
            <Link
              href="/vehicles"
              prefetch={false}
              className="touch-manipulation inline-flex items-center justify-center border border-foreground-on-dark/35 px-9 py-4 text-sm font-bold uppercase tracking-[0.12em] text-foreground-on-dark transition-colors hover:bg-foreground-on-dark/10 active:bg-foreground-on-dark/15"
            >
              Shop by Vehicle
            </Link>
          </div>
        </div>
      </section>

      {/* The copy that used to crowd the picture, verbatim. */}
      <div className="border-b border-border bg-chrome">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p className="max-w-xl text-base leading-relaxed text-foreground">
            Premium OEM and aftermarket parts for trucks, 4x4s and performance
            vehicles — sourced for drivers worldwide.
          </p>
          <p className="shrink-0 text-xs font-semibold uppercase tracking-[0.16em] text-muted">
            {listingCount.toLocaleString()} listings in stock · Worldwide delivery
          </p>
        </div>
      </div>
    </>
  );
}
