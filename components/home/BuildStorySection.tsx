import Link from "next/link";
import EditorialImage from "./EditorialImage";
import ScrollReveal from "./ScrollReveal";
import { getPhoto } from "@/lib/media/homepage-photo";
import { routes } from "@/lib/inventory/routes";

/**
 * EVERY BUILD HAS A STORY — the page's editorial centre of gravity.
 *
 * These are brand statements about kinds of vehicle, not customer stories.
 * There are no names, no quotes, no purchases and no testimonials here,
 * because inventing any of those would be fabricating social proof. Each panel
 * says something true about what the vehicle is for and links to real
 * catalogue categories.
 *
 * The layout alternates image side by index so the eye zig-zags down the page
 * instead of scanning a column of identical cards.
 */

type Story = {
  slot: string;
  kicker: string;
  title: string;
  body: string;
  href: string;
  cta: string;
};

const STORIES: Story[] = [
  {
    slot: "workhorse",
    kicker: "The Workhorse",
    title: "It earns its keep",
    body: "Towing, hauling, and a load every day of the week. Suspension, brakes and drivetrain that get used hard and need parts that are rated for it — not the cheapest box on the shelf.",
    href: routes.category("suspension"),
    cta: "Suspension & drivetrain",
  },
  {
    slot: "tourer",
    kicker: "The Tourer",
    title: "A long way from the nearest workshop",
    body: "Remote touring punishes the things nobody thinks about until they fail: cooling, filtration, bushes, bearings. Parts chosen for distance, not for a weekend.",
    href: routes.category("engine"),
    cta: "Engine & cooling",
  },
  {
    slot: "offroader",
    kicker: "The Off-Roader",
    title: "Built to leave the blacktop",
    body: "Clearance, articulation and protection. Lift kits, bull bars, snorkels and recovery gear for vehicles that spend their weekends where the road stops.",
    href: routes.category("aftermarket"),
    cta: "4x4 & off-road",
  },
  {
    slot: "performance",
    kicker: "The Performance Build",
    title: "More than the factory intended",
    body: "Forced induction, forged internals, better fuel delivery and the cooling to survive it. Turbochargers, injectors and drivetrain rated past stock.",
    href: routes.category("turbocharger"),
    cta: "Turbo & performance",
  },
  {
    slot: "project",
    kicker: "The Project",
    title: "The one that lives on stands",
    body: "Half apart, waiting on a part that nobody stocks any more. Engines, transmissions and hard-to-source components for the build that has taken over the garage.",
    href: routes.category("transmission"),
    cta: "Engines & transmissions",
  },
];

export default function BuildStorySection() {
  const stories = STORIES.filter((s) => getPhoto(s.slot));
  if (!stories.length) return null;

  return (
    <section className="bg-background-dark py-20 sm:py-28" aria-labelledby="build-story-heading">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <ScrollReveal className="max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-accent-on-dark">
            Every build has a story
          </p>
          <h2
            id="build-story-heading"
            className="mt-4 text-[clamp(1.9rem,4.4vw,3.25rem)] font-bold uppercase leading-[1.02] tracking-[-0.015em] text-foreground-on-dark"
          >
            Every vehicle has a reason
          </h2>
          <p className="mt-5 text-base leading-relaxed text-muted-on-dark">
            A ute that works, a wagon that travels, a build that never quite
            finishes. We stock for all of them.
          </p>
        </ScrollReveal>
      </div>

      <div className="mt-16 space-y-16 sm:mt-20 sm:space-y-24">
        {stories.map((story, i) => (
          <ScrollReveal key={story.slot} delayMs={60}>
            <article className="mx-auto grid max-w-6xl items-center gap-8 px-5 sm:px-8 lg:grid-cols-2 lg:gap-14">
              <div className={`overflow-hidden ${i % 2 === 1 ? "lg:order-2" : ""}`}>
                <EditorialImage
                  slot={story.slot}
                  alt={`${story.kicker} — ${story.title}`}
                  sizes="(min-width: 1024px) 44rem, 100vw"
                  className="aspect-[4/3] w-full object-cover transition-transform duration-700 hover:scale-[1.03]"
                />
              </div>

              <div className={i % 2 === 1 ? "lg:order-1" : ""}>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-accent-on-dark">
                  {story.kicker}
                </p>
                <h3 className="mt-3 text-[clamp(1.5rem,3vw,2.25rem)] font-bold leading-tight tracking-tight text-foreground-on-dark">
                  {story.title}
                </h3>
                <p className="mt-4 max-w-lg text-base leading-relaxed text-muted-on-dark">
                  {story.body}
                </p>
                <Link
                  href={story.href}
                  prefetch={false}
                  className="mt-7 inline-flex items-center gap-2 border-b border-accent-on-dark pb-1 text-sm font-bold uppercase tracking-[0.12em] text-accent-on-dark transition-colors hover:border-foreground-on-dark hover:text-foreground-on-dark"
                >
                  {story.cta}
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </article>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
