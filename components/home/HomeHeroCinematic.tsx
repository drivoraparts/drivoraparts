import Link from "next/link";
import EditorialImage from "./EditorialImage";
import { renderPhoto } from "@/lib/media/homepage-photo";
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
 * The scrim is a two-part treatment rather than a flat wash: a base tint for
 * overall legibility, plus a bottom-weighted gradient so the headline sits on
 * the darkest part of the frame while the top of the photograph stays open.
 * Text contrast over a photograph is not guaranteed by tokens, so the scrim
 * has to carry it.
 */
export default function HomeHeroCinematic({ listingCount }: { listingCount: number }) {
  const photo = renderPhoto("hero");

  return (
    <section className="relative -mt-[106px] flex min-h-[86svh] w-full min-w-0 items-end overflow-hidden bg-background-dark pt-[106px] sm:-mt-[114px] sm:min-h-[92svh] sm:pt-[114px]">
      {photo ? (
        <div className="absolute inset-0 z-0">
          <EditorialImage
            slot="hero"
            alt=""
            priority
            sizes="100vw"
            className="h-full w-full object-cover"
          />
        </div>
      ) : null}

      {/* Legibility scrim, kept as light as the type allows. A flat 45% wash
          plus a heavy gradient buried the photograph entirely -- the vehicles
          were not visible at all, which defeats the point of a hero image.
          The weight is concentrated in the bottom third, where the copy sits,
          so the sky and the horizon stay open. */}
      <div className="pointer-events-none absolute inset-0 z-10 bg-background-dark/20" />
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

        <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-on-dark sm:text-lg">
          Premium OEM and aftermarket parts for trucks, 4x4s and performance
          vehicles — sourced for drivers worldwide.
        </p>

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

        <p className="mt-8 text-xs font-medium uppercase tracking-[0.16em] text-muted-on-dark">
          {listingCount.toLocaleString()} listings in stock · Worldwide delivery
        </p>
      </div>
    </section>
  );
}
