import Link from "next/link";
import EditorialImage from "./EditorialImage";
import EditorialPlate from "./EditorialPlate";
import ScrollReveal from "./ScrollReveal";
import ProductRail from "@/components/catalog/ProductRail";
import { getPhoto } from "@/lib/media/homepage-photo";
import { getProductsByCategory } from "@/lib/inventory";
import { routes } from "@/lib/inventory/routes";

/**
 * EVERY BUILD HAS A STORY — the page's editorial centre of gravity.
 *
 * These are brand statements about kinds of vehicle, not customer stories.
 * There are no names, quotes, purchases or testimonials, because inventing
 * social proof is the fastest way to make a real business look fake.
 *
 * STORY -> NEED -> SOLUTION -> PRODUCTS
 * Each editorial panel is followed immediately by the actual catalogue
 * category it argues for, so the shopping is the answer to the story rather
 * than an unrelated grid bolted underneath it. Nothing here invents a
 * relationship: `category` is a real catalogue slug and the rail renders
 * whatever that category actually contains, or nothing at all if it is empty.
 *
 * The section is LIGHT and the photography is full colour. It was charcoal
 * with near-monochrome grades, which put five of the page's dark moments in
 * one block; the reference site this page is matched to runs roughly five
 * dark sections across twenty-five and is otherwise white, with no monochrome
 * anywhere. Dark is now reserved for the hero, the reach band, the trust
 * strip and the credits.
 */

type Story = {
  slot: string;
  kicker: string;
  title: string;
  body: string;
  category: string;
  railEyebrow: string;
  railTitle: string;
  cta: string;
};

const STORIES: Story[] = [
  {
    slot: "workhorse",
    kicker: "The Workhorse",
    title: "It earns its keep",
    body: "Towing, hauling, and a load every day of the week. Suspension, brakes and drivetrain that get used hard and need parts rated for it — not the cheapest box on the shelf.",
    category: "suspension",
    railEyebrow: "Workhorse parts",
    railTitle: "Suspension built for load",
    cta: "Suspension & drivetrain",
  },
  {
    slot: "tourer",
    kicker: "The Tourer",
    title: "A long way from the nearest workshop",
    body: "Remote touring punishes the things nobody thinks about until they fail: cooling, filtration, bushes, bearings. Parts chosen for distance, not for a weekend.",
    category: "engine",
    railEyebrow: "Touring parts",
    railTitle: "Engine & cooling for distance",
    cta: "Engine & cooling",
  },
  {
    slot: "offroader",
    kicker: "The Off-Roader",
    title: "Built to leave the blacktop",
    body: "Clearance, articulation and protection. Lift kits, bull bars, snorkels and recovery gear for vehicles that spend their weekends where the road stops.",
    // 4x4-accessories, not the broad "aftermarket" bucket: that one also holds
    // things like a Jaguar XF bonnet, which is a real listing but not what
    // this story is arguing for.
    category: "4x4-accessories",
    railEyebrow: "4x4 & off-road",
    railTitle: "Kit for where the road stops",
    cta: "4x4 & off-road",
  },
  {
    slot: "performance",
    kicker: "The Performance Build",
    title: "More than the factory intended",
    body: "Forced induction, forged internals, better fuel delivery and the cooling to survive it. Turbochargers, injectors and drivetrain rated past stock.",
    category: "turbocharger",
    railEyebrow: "Performance parts",
    railTitle: "Turbo & forced induction",
    cta: "Turbo & performance",
  },
  {
    slot: "project",
    kicker: "The Project",
    title: "The one that lives on stands",
    body: "Half apart, waiting on a part nobody stocks any more. Engines, transmissions and hard-to-source components for the build that has taken over the garage.",
    category: "transmission",
    railEyebrow: "Project parts",
    railTitle: "Engines & transmissions",
    cta: "Engines & transmissions",
  },
];

const RAIL_SIZE = 8;

export default function BuildStorySection() {
  return (
    <>
      <section
        className="bg-background pt-20 pb-16 sm:pt-28 sm:pb-20"
        aria-labelledby="build-story-heading"
      >
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <ScrollReveal className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-accent">
              Every build has a story
            </p>
            <h2
              id="build-story-heading"
              className="mt-4 text-[clamp(1.9rem,4.4vw,3.25rem)] font-bold uppercase leading-[1.02] tracking-[-0.015em] text-foreground"
            >
              Every vehicle has a reason
            </h2>
            <p className="mt-5 text-base leading-relaxed text-muted">
              A ute that works, a wagon that travels, a build that never quite
              finishes. We stock for all of them.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {STORIES.map((story, i) => {
        /* Real catalogue products only; an empty category renders no rail
         * rather than a fabricated one.
         *
         * Products with a real photograph come first. These rails exist to
         * bring colour back after a dark editorial panel, and a tile showing
         * "photography pending" does the opposite -- taking the first eight by
         * category put three placeholders into the off-road rail. Placeholder
         * listings are not excluded outright, only sorted behind, so a thin
         * category still fills its rail. */
        const hasPhoto = (p: { thumbnail?: string; images?: string[] }) => {
          const t = p.thumbnail || (p.images && p.images[0]) || "";
          return Boolean(t) && !t.endsWith(".svg");
        };
        const products = [...getProductsByCategory(story.category)]
          .sort((a, b) => Number(hasPhoto(b)) - Number(hasPhoto(a)))
          .slice(0, RAIL_SIZE);

        return (
          <div key={story.slot}>
            <section className="bg-background pb-16 sm:pb-20">
              <ScrollReveal delayMs={60}>
                <article className="mx-auto grid max-w-6xl items-center gap-8 px-5 sm:px-8 lg:grid-cols-2 lg:gap-14">
                  <div className={`overflow-hidden ${i % 2 === 1 ? "lg:order-2" : ""}`}>
                    {getPhoto(story.slot) ? (
                      <EditorialImage
                        slot={story.slot}
                        alt={`${story.kicker} — ${story.title}`}
                        sizes="(min-width: 1024px) 44rem, 100vw"
                        className="aspect-[16/10] w-full object-cover transition-transform duration-700 hover:scale-[1.03]"
                      />
                    ) : (
                      <EditorialPlate label={story.kicker} className="aspect-[16/10] w-full" />
                    )}
                  </div>

                  <div className={i % 2 === 1 ? "lg:order-1" : ""}>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-accent">
                      {story.kicker}
                    </p>
                    <h3 className="mt-3 text-[clamp(1.5rem,3vw,2.25rem)] font-bold leading-tight tracking-tight text-foreground">
                      {story.title}
                    </h3>
                    <p className="mt-4 max-w-lg text-base leading-relaxed text-muted">
                      {story.body}
                    </p>
                    <Link
                      href={routes.category(story.category)}
                      prefetch={false}
                      className="mt-7 inline-flex items-center gap-2 border-b border-accent pb-1 text-sm font-bold uppercase tracking-[0.12em] text-accent transition-colors hover:border-foreground hover:text-foreground"
                    >
                      {story.cta}
                      <span aria-hidden="true">→</span>
                    </Link>
                  </div>
                </article>
              </ScrollReveal>
            </section>

            <ProductRail
              eyebrow={story.railEyebrow}
              title={story.railTitle}
              products={products}
              viewAllHref={routes.category(story.category)}
              tone={i % 2 === 1 ? "muted" : "light"}
            />
          </div>
        );
      })}
    </>
  );
}
