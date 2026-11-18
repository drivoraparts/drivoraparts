import type { Metadata } from "next";
import Link from "next/link";
import CompanyAddress from "@/components/content/CompanyAddress";
import { routes } from "@/lib/inventory";
import { buildPageMetadata } from "@/lib/seo";
import { hasGenuineSection } from "@/lib/catalog/toyota-departments";
import {
  COMPANY_LEGAL_NAME,
  COMPANY_PHONE_DISPLAY,
  COMPANY_PHONE_TEL_HREF,
  COMPANY_SUPPORT_EMAIL,
} from "@/lib/content/company";
import { FITMENT_GUARANTEE_HREF } from "@/lib/content/fitment-guarantee";

export const metadata: Metadata = buildPageMetadata({
  title: "About DrivoraParts — Your Toyota Parts Destination",
  description:
    "DrivoraParts specializes in Toyota parts and engines for Toyota owners across the United States, with clearly labeled genuine and aftermarket parts, checked fitment and real support.",
  path: "/about",
});

/*
 * The About page states only what the business can stand behind. It does not
 * claim Toyota authorization, dealer status, warehouses, staff numbers,
 * certifications or testimonials: none is on file (see lib/brand/
 * toyota-dealer.ts). "Genuine Toyota" is used only for listings verified in
 * lib/inventory/data/toyota-genuine.json.
 */

const SHOP_LINKS: { label: string; slug: string }[] = [
  { label: "Engines", slug: "engine" },
  { label: "Transmissions", slug: "transmission" },
  { label: "Suspension", slug: "suspension" },
  { label: "Bumpers & Body", slug: "bumper" },
  { label: "Lighting", slug: "lighting" },
  { label: "4x4 Accessories", slug: "4x4-accessories" },
];

const linkClass = "font-semibold text-accent underline-offset-2 hover:text-accent-hover hover:underline";

export default function AboutPage() {
  const showGenuine = hasGenuineSection();

  return (
    <main className="bg-white text-neutral-900">
      <div className="mx-auto max-w-3xl px-6 pb-4 pt-12 sm:pt-16">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-accent">
          About DrivoraParts
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
          Your Toyota Parts Destination
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-neutral-600">
          DrivoraParts specializes in parts and engines for Toyota vehicles. We help
          Toyota owners across the United States find the right part for their truck,
          SUV or car, described accurately and supported by people who answer.
        </p>
      </div>

      <div className="mx-auto max-w-3xl space-y-14 px-6 pb-20 pt-8 sm:pb-24">
        <section>
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
            Focused on Toyota
          </h2>
          <div className="mt-5 space-y-4 leading-relaxed text-neutral-600">
            <p>
              We concentrate on one make so we can know it well: the Tacoma, Tundra,
              4Runner, Land Cruiser, Sequoia, FJ Cruiser and the rest of the Toyota range.
              Our catalog covers engines, transmissions, suspension, bumpers and body
              parts, lighting and 4x4 equipment for those vehicles.
            </p>
            <p>
              Focusing on Toyota lets us organize the catalog around the vehicle you
              drive, so you can shop by model and system instead of sorting through parts
              made for something else.
            </p>
          </div>
          <ul className="mt-6 flex flex-wrap gap-2">
            {SHOP_LINKS.map((cat) => (
              <li key={cat.slug}>
                <Link
                  href={routes.category(cat.slug)}
                  className="inline-flex rounded-full border border-neutral-300 bg-white px-3.5 py-1.5 text-sm font-semibold text-neutral-700 transition-colors hover:border-accent-border hover:text-accent-hover"
                >
                  {cat.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="border-t border-neutral-200 pt-14">
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
            Genuine Parts, Clearly Labeled
          </h2>
          <div className="mt-5 space-y-4 leading-relaxed text-neutral-600">
            <p>
              We are committed to genuine Toyota parts and to product information you can
              rely on. A listing is labeled a Toyota Genuine Part only after we have
              checked it against its Toyota part number. Aftermarket parts are labeled as
              aftermarket, with the manufacturer named, so you always know what you are
              buying.
            </p>
            <p>
              Each listing states its part number where one exists, its condition, how it
              ships and what it fits. If a detail has not been confirmed, we would rather
              say so than guess.
            </p>
            {showGenuine ? (
              <p>
                <Link href="/catalog/toyota-genuine" className={linkClass}>
                  Browse Toyota Genuine Parts
                </Link>
              </p>
            ) : null}
          </div>
        </section>

        <section className="border-t border-neutral-200 pt-14">
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
            The Right Part for Your Toyota
          </h2>
          <div className="mt-5 space-y-4 leading-relaxed text-neutral-600">
            <p>
              Fitment is where parts buying goes wrong, so it is where we spend our
              effort. You can shop by Toyota model, check the fitment notes on every
              listing, and send us your VIN before you order so we can confirm the part
              against your vehicle.
            </p>
            <p>
              Eligible parts are covered by our{" "}
              <Link href={FITMENT_GUARANTEE_HREF} className={linkClass}>
                Fitment Guarantee
              </Link>
              .
            </p>
          </div>
        </section>

        <section className="border-t border-neutral-200 pt-14">
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
            Quality, Reliability and Transparency
          </h2>
          <div className="mt-5 space-y-4 leading-relaxed text-neutral-600">
            <p>
              Performance, quality and reliability are what Toyota owners expect from
              their vehicles, and what we hold our catalog to. We price shipping from
              published rates shown before you pay, publish our return, refund and
              warranty terms in full, and confirm anything unusual, such as special
              freight, in writing before payment.
            </p>
          </div>
        </section>

        <section className="border-t border-neutral-200 pt-14">
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
            Serving Customers Across the United States
          </h2>
          <div className="mt-5 space-y-4 leading-relaxed text-neutral-600">
            <p>
              DrivoraParts ships to all 50 states and Washington, DC. We do not ship
              internationally. Delivery times and rates are set out in our{" "}
              <Link href="/policies/shipping-policy" className={linkClass}>
                Shipping Policy
              </Link>
              .
            </p>
          </div>
        </section>

        <section className="border-t border-neutral-200 pt-14">
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
            Talk to Us
          </h2>
          <div className="mt-5 space-y-4 leading-relaxed text-neutral-600">
            <p>
              Questions about fitment, an order or a part you cannot find? Contact our
              support team.
            </p>
            <ul className="space-y-1.5">
              <li>
                Email:{" "}
                <a href={`mailto:${COMPANY_SUPPORT_EMAIL}`} className={linkClass}>
                  {COMPANY_SUPPORT_EMAIL}
                </a>
              </li>
              <li>
                Phone or text:{" "}
                <a href={COMPANY_PHONE_TEL_HREF} className={`${linkClass} whitespace-nowrap`}>
                  {COMPANY_PHONE_DISPLAY}
                </a>
              </li>
              <li>
                <Link href="/contact" className={linkClass}>
                  Contact form
                </Link>
              </li>
            </ul>
            <p className="text-sm text-neutral-500">
              DrivoraParts is operated by {COMPANY_LEGAL_NAME}. DrivoraParts is an
              independent retailer and is not affiliated with, authorized by or endorsed
              by Toyota Motor Corporation.
            </p>
          </div>
        </section>

        <div className="border-t border-neutral-200 pt-8">
          <CompanyAddress variant="summary" />
        </div>
      </div>

      <section className="border-t border-neutral-200 bg-neutral-50 py-16 text-center">
        <h2 className="mb-4 text-3xl font-bold text-neutral-900">Shop Toyota parts</h2>
        <p className="mb-8 px-6 text-neutral-600">
          Start with your Toyota, or browse the full catalog.
        </p>
        <div className="flex flex-col items-center gap-4">
          <Link
            href={routes.market("usa")}
            className="inline-block transform rounded-full bg-accent px-10 py-4 font-semibold text-white transition hover:scale-105 hover:bg-accent-active"
          >
            Shop by Toyota model
          </Link>
          <Link
            href={routes.all}
            className="inline-block transform rounded-full border border-neutral-300 bg-white px-10 py-4 font-semibold text-neutral-900 transition hover:scale-105 hover:border-neutral-400 hover:shadow-md"
          >
            All Toyota parts
          </Link>
        </div>
      </section>
    </main>
  );
}
