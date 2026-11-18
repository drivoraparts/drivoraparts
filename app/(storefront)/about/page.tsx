import type { Metadata } from "next";
import Link from "next/link";
import { routes } from "@/lib/inventory";
import { buildPageMetadata } from "@/lib/seo";
import { categoryPreviews } from "@/lib/catalog/category-preview";
import {
  COMPANY_LEGAL_NAME,
  COMPANY_PHONE_DISPLAY,
  COMPANY_PHONE_TEL_HREF,
  COMPANY_SUPPORT_EMAIL,
} from "@/lib/content/company";

export const metadata: Metadata = buildPageMetadata({
  title: "About DrivoraParts — Your Toyota. Your Parts. Your Road.",
  description:
    "DrivoraParts is a Toyota parts specialist: Toyota parts and engines for owners, mechanics and enthusiasts across the United States. One brand, a focused selection.",
  path: "/about",
});

/*
 * The owner-approved About copy (2026-11-18). It makes no dealer, Toyota
 * affiliation, facility, certification or testimonial claim.
 *
 * The category list is the approved one, filtered to categories that actually
 * have listings: each entry names the catalog categories it stands for, and an
 * entry is shown only when at least one of them is non-empty.
 */
const CATEGORY_GROUPS: { label: string; slugs: string[] }[] = [
  { label: "Toyota Engines", slugs: ["engine"] },
  { label: "Transmissions", slugs: ["transmission"] },
  { label: "Engine Components", slugs: ["turbocharger"] },
  { label: "Suspension & Steering", slugs: ["suspension"] },
  { label: "Braking Systems", slugs: ["brakes"] },
  { label: "Exterior & Body Components", slugs: ["bumper", "body-parts"] },
  { label: "Electrical Components", slugs: ["electronics", "lighting"] },
  { label: "Performance & Replacement Parts", slugs: ["aftermarket", "4x4-accessories"] },
];

const PRODUCT_TYPES = [
  "Genuine Toyota parts.",
  "OEM components.",
  "Quality replacement parts.",
  "Aftermarket components.",
  "Used and refurbished parts where available.",
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
      <div className="mx-auto max-w-3xl px-6 pb-4 pt-12 sm:pt-16">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-accent">
          About DrivoraParts
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
          Built Around Toyota. Focused on What Drives You.
        </h1>
      </div>

      <div className="mx-auto max-w-3xl space-y-10 px-6 pb-16 pt-6 sm:space-y-14 sm:pb-24 sm:pt-8">
        <section>
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
            A Better Way to Find Toyota Parts
          </h2>
          <div className="mt-5 space-y-4 leading-relaxed text-neutral-600">
            <p>
              Finding the right Toyota part shouldn&apos;t mean spending hours searching
              through unrelated listings, comparing incompatible components, or navigating
              websites that don&apos;t understand what your vehicle needs.
            </p>
            <p>
              We believe finding the right part starts with knowing the vehicle,
              understanding the application, and having access to the right options.
            </p>
            <p className="font-semibold text-neutral-900">
              That&apos;s why DrivoraParts is focused on one brand: Toyota.
            </p>
            <p>
              We&apos;ve built our business around helping Toyota owners, mechanics,
              enthusiasts, and repair professionals find the parts they need to keep their
              vehicles running, restore them, or take their builds further.
            </p>
          </div>
        </section>

        <Section title="One Brand. A Focused Selection.">
          <p>
            Toyota vehicles are built for different purposes, from everyday driving and
            dependable transportation to demanding work, off-road adventures, and
            performance projects.
          </p>
          <p>
            Our catalog focuses on Toyota parts and components across available categories,
            including:
          </p>
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
        </Section>

        <Section title="Made for Toyota Owners">
          <p>Every Toyota owner has a different reason for searching for parts.</p>
          <p>A mechanic may need a replacement engine for a customer&apos;s vehicle.</p>
          <p>
            A truck owner may be looking for components to keep their Hilux or Tacoma
            working.
          </p>
          <p>An enthusiast may be restoring a vehicle or upgrading its performance.</p>
          <p>
            And sometimes, you simply need the right replacement part to get back on the
            road.
          </p>
          <p className="font-semibold text-neutral-900">
            Whatever brings you here, DrivoraParts is built around that search.
          </p>
        </Section>

        <Section title="Finding the Right Fit Matters">
          <p>Not every part fits every Toyota.</p>
          <p>
            Model year, engine configuration, trim, drivetrain, and production
            specifications can all make a difference.
          </p>
          <p>That&apos;s why accurate product information and fitment details matter.</p>
          <p>
            We aim to provide useful product descriptions, available specifications,
            compatibility information, and clear product details so customers can make more
            informed purchasing decisions.
          </p>
          <p>
            When you&apos;re unsure about compatibility,{" "}
            <Link href="/contact?topic=fitment" className={linkClass}>
              our team is available to help
            </Link>
            .
          </p>
        </Section>

        <Section title="Genuine, Replacement & Aftermarket Options">
          <p>
            Toyota owners may need different types of components depending on their vehicle
            and requirements.
          </p>
          <p>Our selection may include:</p>
          <ul className="list-disc space-y-1.5 pl-5">
            {PRODUCT_TYPES.map((type) => (
              <li key={type}>{type}</li>
            ))}
          </ul>
          <p>
            Each product listing identifies the product type and condition wherever that
            information is available.
          </p>
          <p className="text-sm text-neutral-500">
            DrivoraParts is an independent business and is not affiliated with, sponsored
            by, or endorsed by Toyota Motor Corporation.
          </p>
        </Section>

        <Section title="Serving Toyota Owners Across the United States">
          <p>DrivoraParts focuses on customers within the United States.</p>
          <p>
            Our goal is to make sourcing Toyota parts more straightforward through a focused
            catalog, accessible customer support, and clear purchasing information.
          </p>
          <p>
            Depending on the product, orders may ship from DrivoraParts or our supplier
            network.
          </p>
          <p>
            Shipping availability, costs, and delivery arrangements depend on the product and
            supported destination. See our{" "}
            <Link href="/policies/shipping-policy" className={linkClass}>
              Shipping Policy
            </Link>
            .
          </p>
        </Section>

        <Section title="Our Commitment">
          <p>We&apos;re continuously working to improve the DrivoraParts experience.</p>
          <p>
            That means refining our catalog, improving product information, making
            vehicle-part discovery easier, and building a shopping experience centered on
            Toyota owners.
          </p>
          <p>We believe specialization matters.</p>
          <p className="font-semibold text-neutral-900">
            Rather than trying to be everything for everyone, we&apos;re concentrating on
            doing one thing better: helping people find the Toyota parts they need.
          </p>
        </Section>

        <section className="border-t border-neutral-200 pt-10 sm:pt-14">
          <p className="text-lg font-bold text-neutral-900">DrivoraParts</p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-accent sm:text-3xl">
            Your Toyota. Your Parts. Your Road.
          </p>
          <p className="mt-4 leading-relaxed text-neutral-600">
            Whether you&apos;re maintaining, repairing, restoring, or upgrading your Toyota,
            we&apos;re here to help you find the components to move forward.
          </p>

          <div className="mt-8 rounded-xl border border-neutral-200 bg-neutral-50 p-5 text-sm leading-relaxed text-neutral-700">
            <p className="font-semibold text-neutral-900">DrivoraParts</p>
            <p>Operated by {COMPANY_LEGAL_NAME}</p>
            <p className="mt-3">
              Call/Text:{" "}
              <a href={COMPANY_PHONE_TEL_HREF} className={`${linkClass} whitespace-nowrap`}>
                {COMPANY_PHONE_DISPLAY}
              </a>
            </p>
            <p>
              Email:{" "}
              <a href={`mailto:${COMPANY_SUPPORT_EMAIL}`} className={linkClass}>
                {COMPANY_SUPPORT_EMAIL}
              </a>
            </p>
          </div>
        </section>
      </div>

      <section className="border-t border-neutral-200 bg-neutral-50 px-6 py-14 text-center">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-neutral-500">
          Toyota Parts &amp; Engines. One Focus.
        </p>
        <Link
          href={routes.all}
          className="mt-6 inline-block transform rounded-full bg-accent px-10 py-4 font-semibold text-white transition hover:scale-105 hover:bg-accent-active"
        >
          Explore Toyota Parts
        </Link>
      </section>
    </main>
  );
}
