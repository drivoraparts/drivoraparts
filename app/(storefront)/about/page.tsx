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

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-5xl bg-white px-6 py-12 text-neutral-900">
      <h1 className="mb-6 text-4xl font-bold">About DrivoraParts</h1>

      <div className="space-y-6 leading-relaxed text-neutral-600">
        <p>
          DrivoraParts was built for enthusiasts, builders, tuners,
          and performance-focused drivers looking for a modern way
          to discover automotive components.
        </p>

        <p>
          Our vision is to create a marketplace where performance
          parts, engine platforms, drivetrain upgrades, suspension
          systems, braking solutions, and vehicle electronics can be
          explored through a clean, intuitive experience.
        </p>

        <p>
          Whether you're building a street car, a track machine,
          an off-road project, or a complete restoration, our goal
          is to make finding the right parts easier and more
          transparent.
        </p>

        <p>
          DrivoraParts continues to evolve with new categories,
          expanded product coverage, and marketplace features
          designed around the automotive community.
        </p>

        <div className="border-t border-neutral-200 pt-4">
          <CompanyAddress variant="summary" />
        </div>
      </div>

      <section className="mt-16 border-t border-neutral-200 py-16 text-center">
        <h2 className="mb-4 text-3xl font-bold text-neutral-900">Explore the marketplace</h2>
        <p className="mb-8 text-neutral-600">
          Browse every listing or enter by category — same paths as the homepage.
        </p>
        <div className="flex flex-col items-center gap-4">
          <Link
            href={routes.all}
            className="inline-block transform rounded-full bg-red-600 px-10 py-4 font-semibold text-white transition hover:scale-105 hover:bg-red-700"
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
