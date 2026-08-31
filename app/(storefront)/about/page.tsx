import type { Metadata } from "next";
import Link from "next/link";
import CompanyAddress from "@/components/content/CompanyAddress";
import { routes } from "@/lib/inventory";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "About DrivoraParts",
  description:
    "Learn about DrivoraParts — a performance automotive marketplace for engines, drivetrain upgrades, suspension, brakes, electronics, and body parts.",
  path: "/about",
});

const BUILD_CATEGORIES: { label: string; slug?: string }[] = [
  { label: "Engines", slug: "engine" },
  { label: "Transmissions", slug: "transmission" },
  { label: "Turbochargers", slug: "turbocharger" },
  { label: "Suspension", slug: "suspension" },
  { label: "Brakes", slug: "brakes" },
  { label: "Lighting", slug: "lighting" },
  { label: "Body components", slug: "body-parts" },
  { label: "Truck equipment", slug: "4x4-accessories" },
  { label: "Performance & aftermarket", slug: "aftermarket" },
  { label: "OEM solutions" },
];

export default function AboutPage() {
  return (
    <main className="bg-white text-neutral-900">
      {/* Opening */}
      <div className="mx-auto max-w-3xl px-6 pb-4 pt-12 sm:pt-16">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-accent">
          About DrivoraParts
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
          Every Build Has a Story
        </h1>
      </div>

      <div className="mx-auto max-w-3xl space-y-16 px-6 pb-20 pt-8 sm:pb-28">
        {/* We started with a simple problem */}
        <section>
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
            We Started With a Simple Problem
          </h2>
          <div className="mt-5 space-y-4 leading-relaxed text-neutral-600">
            <p>There was a time when we were looking for a specific automotive part.</p>
            <p>Finding it shouldn&apos;t have been difficult.</p>
            <p>But the more we searched, the more frustrating it became.</p>
            <p>
              One website specialized in one manufacturer. Another carried a different
              brand. Another had the part we needed, but only for a completely different
              vehicle or application.
            </p>
            <p>
              Before long, we were jumping between multiple websites just trying to find
              the right component.
            </p>
            <p>And we kept asking ourselves:</p>
          </div>
          <blockquote className="mt-6 border-l-2 border-accent pl-5 text-lg font-semibold leading-snug text-neutral-900 sm:text-xl">
            Why isn&apos;t there one place where you can search across automotive brands,
            categories, and parts without having to visit five different websites?
          </blockquote>
          <p className="mt-6 leading-relaxed text-neutral-600">
            That question became the idea behind DrivoraParts.
          </p>
        </section>

        {/* One marketplace, more possibilities */}
        <section className="border-t border-neutral-200 pt-16">
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
            One Marketplace. More Possibilities.
          </h2>
          <div className="mt-5 space-y-4 leading-relaxed text-neutral-600">
            <p>We created DrivoraParts with a simple vision:</p>
            <p className="font-semibold text-neutral-900">
              Bring more of the automotive parts world together in one place.
            </p>
            <p>
              Instead of searching one website for an engine, another for a transmission,
              another for suspension, and another for performance components, Drivora is
              being built as a marketplace where you can explore the parts your entire
              project may need.
            </p>
          </div>

          <ul className="mt-6 flex flex-wrap gap-2">
            {BUILD_CATEGORIES.map((cat) =>
              cat.slug ? (
                <li key={cat.label}>
                  <Link
                    href={routes.category(cat.slug)}
                    className="inline-flex rounded-full border border-neutral-300 bg-white px-3.5 py-1.5 text-sm font-semibold text-neutral-700 transition-colors hover:border-accent-border hover:text-accent-hover"
                  >
                    {cat.label}
                  </Link>
                </li>
              ) : (
                <li
                  key={cat.label}
                  className="inline-flex rounded-full border border-neutral-200 bg-neutral-50 px-3.5 py-1.5 text-sm font-semibold text-neutral-500"
                >
                  {cat.label}
                </li>
              )
            )}
          </ul>

          <div className="mt-6 space-y-1 leading-relaxed text-neutral-600">
            <p>The vehicle may be different.</p>
            <p>The build may be different.</p>
            <p className="font-semibold text-neutral-900">
              The goal remains the same: make finding the right part easier.
            </p>
          </div>
        </section>

        {/* Built around the way people actually build */}
        <section className="border-t border-neutral-200 pt-16">
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
            Built Around the Way People Actually Build
          </h2>
          <div className="mt-5 space-y-4 leading-relaxed text-neutral-600">
            <p>A vehicle project rarely stops at one part.</p>
            <p>You might arrive looking for an engine and realize you also need a transmission.</p>
            <p>You might be upgrading your suspension and then start looking at brakes.</p>
            <p>You might be restoring a vehicle one component at a time.</p>
            <p>
              Or you might already have the vision in your head and simply need a place to
              find everything that brings it together.
            </p>
            <p className="font-semibold text-neutral-900">
              That&apos;s why Drivora isn&apos;t being built around a single brand or a
              single category. It&apos;s being built around the build itself.
            </p>
          </div>
        </section>

        {/* For every kind of build */}
        <section className="border-t border-neutral-200 pt-16">
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
            For Every Kind of Build
          </h2>
          <div className="mt-5 space-y-4 leading-relaxed text-neutral-600">
            <p>DrivoraParts is for the enthusiast searching for the next upgrade.</p>
            <p>The mechanic looking for a replacement.</p>
            <p>The builder putting together a performance setup.</p>
            <p>The truck owner upgrading their vehicle.</p>
            <p>The restorer bringing something back to life.</p>
            <p>And the everyday driver who simply needs the right part to get back on the road.</p>
            <p>
              Whether it&apos;s a street build, performance project, off-road machine,
              restoration, or daily driver, we&apos;re building Drivora to make the search
              simpler.
            </p>
          </div>
        </section>

        {/* OEM and aftermarket, together */}
        <section className="border-t border-neutral-200 pt-16">
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
            OEM and Aftermarket, Together
          </h2>
          <div className="mt-5 space-y-4 leading-relaxed text-neutral-600">
            <p>Not every project needs the same solution.</p>
            <p>
              Sometimes you want an OEM component that keeps your vehicle close to its
              original specification.
            </p>
            <p>
              Sometimes aftermarket is the better choice for your application, budget,
              performance goals, or build direction.
            </p>
            <p>
              Drivora brings both worlds into the same marketplace so you can explore your
              options instead of being locked into one path.
            </p>
            <p className="font-semibold text-neutral-900">
              Your vehicle. Your build. Your choice.
            </p>
          </div>
        </section>

        {/* Still building, still evolving */}
        <section className="border-t border-neutral-200 pt-16">
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
            Still Building. Still Evolving.
          </h2>
          <div className="mt-5 space-y-4 leading-relaxed text-neutral-600">
            <p>DrivoraParts is growing with the automotive community.</p>
            <p>
              We&apos;re expanding categories, improving discovery, refining product
              information, and building tools that make it easier to go from searching for
              a part to actually finding the right one.
            </p>
            <p>
              We don&apos;t want Drivora to be another website you visit because you have
              nowhere else to look.
            </p>
            <p className="font-semibold text-neutral-900">
              We want it to become the place you think of first when your next automotive
              project needs a part.
            </p>
          </div>
        </section>

        {/* Every build has a story — closing */}
        <section className="border-t border-neutral-200 pt-16">
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
            Every Build Has a Story.
          </h2>
          <div className="mt-5 space-y-1.5 leading-relaxed text-neutral-600">
            <p>Some builds start with a vision.</p>
            <p>Some start with a broken part.</p>
            <p>Some start with a vehicle sitting in a garage.</p>
          </div>
          <div className="mt-5 space-y-4 leading-relaxed text-neutral-600">
            <p>Ours started with a search that shouldn&apos;t have been so difficult.</p>
            <p>
              We couldn&apos;t find one place that brought the automotive world together
              the way we wanted.
            </p>
            <p className="font-semibold text-neutral-900">So we decided to build it.</p>
          </div>

          <p className="mt-8 text-lg font-bold text-neutral-900">That&apos;s DrivoraParts.</p>
          <p className="mt-2 leading-relaxed text-neutral-600">
            One marketplace.
            <br />
            More brands.
            <br />
            More categories.
            <br />
            More possibilities.
          </p>

          <p className="mt-6 text-xl font-bold tracking-tight text-accent">
            Find your part. Build your vision.
          </p>
        </section>

        <div className="border-t border-neutral-200 pt-8">
          <CompanyAddress variant="summary" />
        </div>
      </div>

      <section className="border-t border-neutral-200 bg-neutral-50 py-16 text-center">
        <h2 className="mb-4 text-3xl font-bold text-neutral-900">Explore the marketplace</h2>
        <p className="mb-8 text-neutral-600">
          Browse every listing or enter by category — same paths as the homepage.
        </p>
        <div className="flex flex-col items-center gap-4">
          <Link
            href={routes.all}
            className="inline-block transform rounded-full bg-accent px-10 py-4 font-semibold text-white transition hover:scale-105 hover:bg-accent-active"
          >
            All Products
          </Link>
          <Link
            href={routes.catalog}
            className="inline-block transform rounded-full border border-neutral-300 bg-white px-10 py-4 font-semibold text-neutral-900 transition hover:scale-105 hover:border-neutral-400 hover:shadow-md"
          >
            ENTER MARKET
          </Link>
        </div>
      </section>
    </main>
  );
}
