import Link from "next/link";
import EditorialImage from "./EditorialImage";
import HeroVideo from "./HeroVideo";
import { getHeroVideo, renderPhoto } from "@/lib/media/homepage-photo";
import { routes } from "@/lib/inventory/routes";

/**
 * The opening frame. The film is the subject; the type is a caption on it.
 *
 * THE SCRIM IS A SIDE PANEL, NOT A WASH.
 * Earlier versions tinted the whole frame and then laid a bottom-weighted
 * gradient over that, which bought legibility by dimming the footage --
 * including the vehicle, which is the one thing the hero exists to show. The
 * treatment now runs left-to-right and dies out before the middle: dense
 * enough to carry text on the far left, gone by the centre, so the truck's
 * body, stance and clearance stay bright and sharp.
 *
 * Mobile cannot use a side gradient -- at 370px a column dark enough to read
 * against would cover the whole picture -- so it keeps a bottom-weighted one
 * and the copy sits under the vehicle rather than beside it.
 *
 * Sized in svh, not vh. On mobile browsers vh is the *largest* viewport, so a
 * 100vh hero is taller than the visible area while the address bar shows and
 * the CTAs land below the fold on first paint.
 */
export default function HomeHeroCinematic({ listingCount }: { listingCount: number }) {
  const photo = renderPhoto("hero");
  const video = getHeroVideo();

  return (
    <>
      <section className="relative -mt-[106px] flex min-h-[86svh] w-full min-w-0 items-end overflow-hidden bg-background-dark pt-[106px] sm:-mt-[114px] sm:min-h-[92svh] sm:items-center sm:pt-[114px]">
        {/* Left at auto z-index. `z-0` on a positioned element creates a
            stacking context, which would trap anything this layer renders
            beneath the gradients. */}
        <div className="absolute inset-0">
          {video ? (
            <HeroVideo />
          ) : photo ? (
            <EditorialImage
              slot="hero"
              alt=""
              priority
              sizes="100vw"
              className="h-full w-full object-cover object-[66%_center] sm:object-center"
            />
          ) : null}
        </div>

        {/* MOBILE: bottom-weighted, because the copy sits under the vehicle. */}
        <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-background-dark via-background-dark/55 to-transparent sm:hidden" />

        {/* DESKTOP: a left-hand panel that fades out by the middle of the
            frame. Nothing tints the centre or the right, so the footage keeps
            its own brightness where the vehicle actually is. */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 hidden w-[72%] bg-gradient-to-r from-background-dark via-background-dark/75 to-transparent sm:block lg:w-[52%]" />

        {/* Centring this in a max-w-6xl column put the text's right edge at 41%
            of the frame, which forced the gradient out to 62% to cover it. Held
            hard against the left instead, the column ends around 31% and the
            gradient can die out by the halfway mark. */}
        <div className="relative z-20 w-full px-5 pb-16 sm:px-10 sm:pb-0">
          {/* The text column is capped rather than centred: on a wide screen it
              holds the left third and the rest of the frame is film. */}
          <div className="max-w-[30rem] lg:max-w-[26rem]">
            {/* White, not --accent-on-dark. The brief is that the footage
                stays bright, which means the type has to carry its own
                contrast rather than the scrim carrying it: measured against
                the desert shot the accent came out at 2.33:1 where small caps
                need 4.5, and no gradient strength worth having fixes a warm
                orange on a warm orange. White is 8:1 on the same pixels. */}
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-foreground-on-dark">
              Trucks · 4x4 · Performance
            </p>

            {/* Compact on purpose: tighter leading and tracking, and a ceiling
                well below the old 5rem, so the headline states itself without
                spreading across the vehicle. */}
            <h1 className="mt-4 text-[clamp(1.9rem,4.6vw,3.25rem)] font-bold uppercase leading-[0.98] tracking-[-0.025em] text-foreground-on-dark">
              Built for the road ahead.
            </h1>

            <p className="mt-4 max-w-sm text-sm leading-relaxed text-foreground-on-dark/90 sm:text-base">
              Premium OEM and aftermarket parts for trucks, 4x4s and performance
              vehicles — sourced for drivers worldwide.
            </p>

            <div className="mt-7 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
              <Link
                href={routes.all}
                prefetch={false}
                className="touch-manipulation inline-flex items-center justify-center bg-accent px-8 py-3.5 text-sm font-bold uppercase tracking-[0.12em] text-accent-foreground transition-colors hover:bg-accent-hover active:bg-accent-active"
              >
                Shop Parts
              </Link>
              <Link
                href="/vehicles"
                prefetch={false}
                className="touch-manipulation inline-flex items-center justify-center border border-foreground-on-dark/40 px-8 py-3.5 text-sm font-bold uppercase tracking-[0.12em] text-foreground-on-dark transition-colors hover:bg-foreground-on-dark/10 active:bg-foreground-on-dark/15"
              >
                Shop by Vehicle
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* The stock line lives below the film, where it does not compete with
          it. Wording unchanged. */}
      <div className="border-b border-border bg-chrome">
        <div className="mx-auto max-w-6xl px-5 py-4 sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
            {listingCount.toLocaleString()} listings in stock · Worldwide delivery
          </p>
        </div>
      </div>
    </>
  );
}
