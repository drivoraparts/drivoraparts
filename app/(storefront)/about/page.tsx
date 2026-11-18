import type { Metadata } from "next";
import Link from "next/link";
import { routes } from "@/lib/inventory";
import { buildPageMetadata } from "@/lib/seo";
import { categoryPreviews } from "@/lib/catalog/category-preview";

export const metadata: Metadata = buildPageMetadata({
  title: "About DrivoraParts — Every Toyota Has a Story",
  description:
    "DrivoraParts is focused on one thing: Toyota. Genuine Toyota parts and selected aftermarket products, with clear fitment information, for Toyota owners across the United States.",
  path: "/about",
});

/*
 * The owner-approved About copy, "Every Toyota Has a Story" (2026-11-18),
 * laid out in the page's existing editorial structure. It makes no dealer,
 * Toyota affiliation, facility, certification or testimonial claim.
 *
 * The category list is the approved one, filtered to categories that have
 * listings: an entry is shown only when one of its catalog categories is
 * non-empty, and it links to the first that is.
 */
const CATEGORY_GROUPS: { label: string; slugs: string[] }[] = [
  { label: "Engines and engine components", slugs: ["engine", "turbocharger"] },
  { label: "Transmissions and drivetrain", slugs: ["transmission"] },
  { label: "Suspension and steering", slugs: ["suspension"] },
  { label: "Brakes and braking components", slugs: ["brakes"] },
  { label: "Bumpers and body components", slugs: ["bumper", "body-parts"] },
  { label: "Lighting and exterior accessories", slugs: ["lighting", "4x4-accessories"] },
  { label: "Performance and aftermarket upgrades", slugs: ["aftermarket", "wheels-tires"] },
];

const linkClass =
  "font-semibold text-accent underline-offset-2 hover:text-accent-hover hover:underline";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-neutral-200 pt-10 sm:pt-14">
      <h2 className="text-2xl font-bold tracking-tight text-neutral-900">{title}</h2>
      <div className="mt-5 space-y-4 leading-relaxed text-neutral-600">{children}</div>
    </section>
  );
}

export default function AboutPage() {
  const counts = new Map(categoryPreviews().map((c) => [c.slug, c.count]));
  const categories = CATEGORY_GROUPS.map((group) => {
    const listed = group.slugs.filter((slug) => (counts.get(slug) ?? 0) > 0);
    return listed.length ? { label: group.label, href: routes.category(listed[0]) } : null;
  }).filter((c): c is { label: string; href: string } => c !== null);

  return (
    <main className="bg-white text-neutral-900">
      {/* Opening */}
      <div className="mx-auto max-w-3xl px-6 pb-4 pt-12 sm:pt-16">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-accent">
          About DrivoraParts
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
          Every Toyota Has a Story
        </h1>
      </div>

      <div className="mx-auto max-w-3xl space-y-10 px-6 pb-16 pt-6 sm:space-y-14 sm:pb-24 sm:pt-8">
        {/* Editorial introduction */}
        <section>
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
            We Started With a Simple Problem
          </h2>
          <div className="mt-5 space-y-4 leading-relaxed text-neutral-600">
            <p>Finding the right automotive part shouldn&apos;t feel like another project.</p>
            <p>
              But anyone who has searched for a specific Toyota component knows how
              complicated it can become.
            </p>
            <p>
              One website has the part. Another has a different option. Somewhere else, the
              information doesn&apos;t quite match the vehicle you&apos;re working on.
            </p>
            <p>
              And before long, you&apos;re spending more time searching than actually getting
              things done.
            </p>
            <p>We saw an opportunity to make that experience better.</p>
            <p>
              Instead of trying to cover everything in the automotive world, we decided to
              focus on one thing and do it with purpose.
            </p>
          </div>
          <blockquote className="mt-6 border-l-2 border-accent pl-5 text-lg font-semibold leading-snug text-neutral-900 sm:text-xl">
            Toyota.
          </blockquote>
          <p className="mt-6 leading-relaxed text-neutral-600">
            That direction became the foundation of DrivoraParts.
          </p>
        </section>

        {/* Large storytelling section */}
        <Section title="One Focus. Everything Toyota.">
          <p>
            Toyota vehicles are built for different roads, different lifestyles and
            different ambitions.
          </p>
          <p>
            From dependable daily drivers and hardworking trucks to performance-oriented
            builds and long-term restoration projects, every Toyota has its own requirements.
          </p>
          <p>We built DrivoraParts around that variety.</p>
          <p>Our focus brings together Toyota automotive parts across essential categories:</p>
          <ul className="flex flex-wrap gap-2 pt-1">
            {categories.map((cat) => (
              <li key={cat.label}>
                <Link
                  href={cat.href}
                  className="inline-flex rounded-full border border-neutral-300 bg-white px-3.5 py-1.5 text-sm font-semibold text-neutral-700 transition-colors hover:border-accent-border hover:text-accent-hover"
                >
                  {cat.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="space-y-1 pt-2">
            <p>Different vehicles. Different applications.</p>
            <p className="font-semibold text-neutral-900">
              One place focused on helping you find the right Toyota parts.
            </p>
          </div>
        </Section>

        <Section title="Built Around the Way Toyota Owners Drive">
          <p>A vehicle project rarely stops at one component.</p>
          <p>
            You might start with an engine replacement and eventually need supporting
            drivetrain components.
          </p>
          <p>
            You might be refreshing your suspension, upgrading your brakes or bringing an older
            Toyota back to its original condition.
          </p>
          <p>Sometimes it&apos;s a performance upgrade.</p>
          <p>Sometimes it&apos;s simply getting your vehicle back on the road.</p>
          <p>
            Whatever brings you here, we believe finding the right component should be a
            straightforward part of the process.
          </p>
          <p className="font-semibold text-neutral-900">
            That&apos;s why DrivoraParts is focused on Toyota applications, product discovery
            and clearer fitment information.
          </p>
        </Section>

        <Section title="For Every Toyota Journey">
          <p>There&apos;s no single way to own a Toyota.</p>
          <p>Some people depend on theirs every day.</p>
          <p>Others spend their weekends upgrading, maintaining or restoring them.</p>
          <p>
            There are mechanics keeping vehicles moving, enthusiasts building something
            different and owners who simply want to keep a trusted vehicle running for years
            to come.
          </p>
          <p>We recognize those different needs.</p>
          <p>
            From everyday replacement components to carefully selected upgrades, our goal is
            to make Toyota parts easier to discover.
          </p>
          <p className="font-semibold text-neutral-900">
            Because every vehicle has a purpose, and every owner has a reason for choosing
            theirs.
          </p>
        </Section>

        <Section title="Genuine Parts. Quality Alternatives.">
          <p>Not every replacement or upgrade follows the same path.</p>
          <p>
            Sometimes the priority is maintaining original factory specifications with genuine
            Toyota parts.
          </p>
          <p>
            Other times, a quality aftermarket component offers an alternative suited to a
            particular application, budget or build direction.
          </p>
          <p>We recognize the importance of both.</p>
          <p>
            DrivoraParts brings together genuine Toyota parts and selected aftermarket
            products, with clear product information to help customers understand what
            they&apos;re purchasing.
          </p>
          <div className="space-y-1">
            <p>Different solutions. One important standard:</p>
            <p className="font-semibold text-neutral-900">Know what fits your vehicle.</p>
          </div>
        </Section>

        <Section title="Fitment Matters.">
          <p>A part can look right and still be wrong for the vehicle.</p>
          <p>
            Model years, generations, engine configurations, trim levels and other
            specifications can make all the difference.
          </p>
          <p>That&apos;s why vehicle compatibility matters at DrivoraParts.</p>
          <p>
            We focus on clear application information and accurate product representation to
            help Toyota owners identify components suited to their vehicles.
          </p>
          <p>We believe confidence starts with knowing what you&apos;re buying.</p>
          <p className="font-semibold text-neutral-900">
            And when you need an extra hand,{" "}
            <Link href="/contact?topic=fitment" className={linkClass}>
              our team is here to help
            </Link>
            .
          </p>
        </Section>

        <Section title="Focused on Toyota. Always Moving Forward.">
          <p>
            DrivoraParts is built around a simple direction: make finding Toyota parts a better
            experience.
          </p>
          <p>
            We&apos;re continually working to improve product discovery, expand relevant
            categories, refine fitment information and make it easier for customers to
            navigate their options.
          </p>
          <p>Our focus isn&apos;t on being everything to everyone.</p>
          <p>
            It&apos;s on building a dependable destination for people who drive, maintain,
            repair and upgrade Toyota vehicles.
          </p>
          <div className="space-y-1 font-semibold text-neutral-900">
            <p>One category at a time.</p>
            <p>One improvement at a time.</p>
            <p>Always moving forward.</p>
          </div>
        </Section>

        {/* Short, dramatic closing */}
        <section className="border-t border-neutral-200 pt-10 sm:pt-14">
          <h2 className="text-2xl font-bold uppercase tracking-tight text-neutral-900">
            Every Toyota Has a Story.
          </h2>
          <div className="mt-5 space-y-1.5 leading-relaxed text-neutral-600">
            <p>Some begin with a first drive.</p>
            <p>Others with a project that&apos;s been years in the making.</p>
            <p>Some start with a vehicle that simply needs the right replacement part.</p>
          </div>
          <div className="mt-5 space-y-4 leading-relaxed text-neutral-600">
            <p>
              Whatever the journey looks like, the right components help keep it moving.
            </p>
            <p>DrivoraParts was built around that idea.</p>
            <p className="font-semibold text-neutral-900">
              A clearer focus. A better parts-search experience. A destination dedicated to
              Toyota.
            </p>
          </div>

          <p className="mt-8 text-xl font-bold tracking-tight text-accent sm:text-2xl">
            Your Toyota. Your Road. Our Commitment.
          </p>

          <p className="mt-8 text-lg font-bold text-neutral-900">DrivoraParts</p>
          <p className="mt-1 leading-relaxed text-neutral-600">
            Toyota Parts for the Road Ahead.
          </p>

          <p className="mt-8 text-xs leading-relaxed text-neutral-500">
            DrivoraParts is an independent business and is not affiliated with, sponsored by,
            or endorsed by Toyota Motor Corporation.
          </p>
        </section>
      </div>

      <section className="border-t border-neutral-200 bg-neutral-50 px-6 py-14 text-center">
        <Link
          href={routes.all}
          className="inline-block transform rounded-full bg-accent px-10 py-4 font-semibold uppercase tracking-wide text-white transition hover:scale-105 hover:bg-accent-active"
        >
          Explore Toyota Parts
        </Link>
      </section>
    </main>
  );
}
