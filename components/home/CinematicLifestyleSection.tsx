import Link from "next/link";
import ScrollReveal from "./ScrollReveal";
import { routes } from "@/lib/inventory/routes";
import { directAssetUrl } from "@/lib/media/optimize-image";

type LifestyleCard = {
  image: string;
  headline: string;
  description: string;
  audience: string;
  ctaLabel: string;
  href: string;
};

const CARDS: LifestyleCard[] = [
  {
    image: "/home/pexels-stephanlouis-7012890.jpg",
    headline: "Built for the Streets",
    description:
      "High-performance lighting, exterior styling, and aerodynamic upgrades designed to give your vehicle a bold presence — and real function on the road, not just looks.",
    audience: "Perfect for daily drivers, street builds, and custom styling projects.",
    ctaLabel: "Explore Street Upgrades",
    href: routes.category("lighting"),
  },
  {
    image: "/home/pexels-garvin-st-villier-719266-14277598.jpg",
    headline: "Built for Boost",
    description:
      "Forced-induction hardware sized to match how the car is actually driven — quick-spooling setups for the street, bigger turbos for builds chasing top-end power.",
    audience: "Designed for tuners, racers, and performance enthusiasts.",
    ctaLabel: "Discover Performance Parts",
    href: routes.category("turbocharger"),
  },
  {
    image: "/home/pexels-sejio402-29181492.jpg",
    headline: "Built in the Shop",
    description:
      "Swap-ready manual and automatic transmissions, matched to real bellhousing patterns and gear ratios — the kind of parts a shop can trust to get the job done once.",
    audience: "Trusted by mechanics, workshops, and serious DIY builders.",
    ctaLabel: "Browse Workshop Essentials",
    href: routes.category("transmission"),
  },
  {
    image: "/home/pexels-juan-montes-92812630-11456554.jpg",
    headline: "Built to Restore",
    description:
      "Crate and takeout engines sourced and inspected for restorations, engine swaps, and everything in between — real units with honest condition notes, no surprises.",
    audience: "Ideal for restoration professionals and classic car collectors.",
    ctaLabel: "Start Your Restoration",
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

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:mt-12 lg:gap-7">
          {CARDS.map((card, index) => (
            <ScrollReveal key={card.headline} delayMs={index * 90}>
              <Link
                href={card.href}
                prefetch={false}
                className="group flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-[0_16px_40px_rgba(0,0,0,0.35)] transition-shadow duration-300 hover:shadow-[0_20px_50px_rgba(0,0,0,0.45)]"
              >
                <div className="relative h-56 shrink-0 overflow-hidden sm:h-64">
                  <img
                    src={directAssetUrl(card.image)}
                    alt={card.headline}
                    loading="lazy"
                    decoding="async"
                    sizes="(max-width: 640px) 100vw, 50vw"
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                </div>

                <div className="flex flex-1 flex-col p-6 sm:p-7">
                  <h3 className="text-xl font-bold text-neutral-900 sm:text-2xl">
                    {card.headline}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-neutral-600">
                    {card.description}
                  </p>
                  <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-neutral-400">
                    {card.audience}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-red-600 transition-colors group-hover:text-red-700">
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
