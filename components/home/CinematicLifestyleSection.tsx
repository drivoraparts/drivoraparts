import Link from "next/link";
import ScrollReveal from "./ScrollReveal";
import { routes } from "@/lib/inventory/routes";
import { directAssetUrl } from "@/lib/media/optimize-image";

type LifestyleCard = {
  image: string;
  headline: string;
  description: string;
  ctaLabel: string;
  href: string;
};

const CARDS: LifestyleCard[] = [
  {
    image: "/home/pexels-stephanlouis-7012890.jpg",
    headline: "Built for the Streets",
    description: "Lighting, body, and styling upgrades that turn heads.",
    ctaLabel: "Shop Lighting",
    href: routes.category("lighting"),
  },
  {
    image: "/home/pexels-garvin-st-villier-719266-14277598.jpg",
    headline: "Built for Boost",
    description: "Turbochargers and forced-induction hardware for real power gains.",
    ctaLabel: "Shop Turbochargers",
    href: routes.category("turbocharger"),
  },
  {
    image: "/home/pexels-sejio402-29181492.jpg",
    headline: "Built in the Shop",
    description: "Swap-ready transmissions, trusted by builders who do it right.",
    ctaLabel: "Shop Transmissions",
    href: routes.category("transmission"),
  },
  {
    image: "/home/pexels-juan-montes-92812630-11456554.jpg",
    headline: "Built to Restore",
    description: "Crate and takeout engines for restorations and swaps alike.",
    ctaLabel: "Shop Engines",
    href: routes.category("engine"),
  },
];

export default function CinematicLifestyleSection() {
  return (
    <section
      className="relative border-b border-neutral-900 bg-neutral-950 py-14 sm:py-20"
      aria-label="Built for every kind of build"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-red-500">
            Every Build Has a Story
          </p>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-[2rem]">
            Whatever you&apos;re building, we&apos;ve got the parts for it
          </h2>
        </ScrollReveal>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:mt-12 lg:gap-5">
          {CARDS.map((card, index) => (
            <ScrollReveal key={card.headline} delayMs={index * 90}>
              <Link
                href={card.href}
                prefetch={false}
                className="group relative block aspect-[4/3] overflow-hidden rounded-2xl sm:aspect-[16/10]"
              >
                <img
                  src={directAssetUrl(card.image)}
                  alt={card.headline}
                  loading="lazy"
                  decoding="async"
                  sizes="(max-width: 640px) 100vw, 50vw"
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

                <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                  <h3 className="text-lg font-bold text-white sm:text-xl">
                    {card.headline}
                  </h3>
                  <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-neutral-300">
                    {card.description}
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-red-400 transition-colors group-hover:text-red-300">
                    {card.ctaLabel}
                    <span
                      aria-hidden
                      className="transition-transform group-hover:translate-x-0.5"
                    >
                      →
                    </span>
                  </span>
                </div>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
