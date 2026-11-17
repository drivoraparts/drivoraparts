import Link from "next/link";
import HomeFeaturedRotator from "@/components/home/HomeFeaturedRotator";
import ProductRail from "@/components/catalog/ProductRail";
import {
  getFeaturedBatch,
  getFeaturedTimeSlot,
  getHomeFeaturedProductPool,
} from "@/lib/home/featured-products";
import { getActiveListingCount } from "@/lib/catalog/counts";
import { getMarket, getMarketOverview } from "@/lib/catalog/markets";
import {
  getEngineAndTransmissionProducts,
  getToyotaDepartments,
  getVerifiedGenuineProducts,
} from "@/lib/catalog/toyota-departments";
import { isAuthorizedToyotaDealer } from "@/lib/brand/toyota-dealer";
import {
  COMPANY_PHONE_DISPLAY,
  COMPANY_PHONE_TEL_HREF,
  COMPANY_SUPPORT_EMAIL,
} from "@/lib/content/company";
import { routes } from "@/lib/inventory/routes";
import { buildPageMetadata, SITE_KEYWORDS } from "@/lib/seo";

export const revalidate = 600;

export const metadata = buildPageMetadata({
  title: "Toyota Parts — Tacoma, Tundra, 4Runner & Land Cruiser",
  description: `Shop ${getActiveListingCount().toLocaleString("en-US")} Toyota parts for the Tacoma, Tundra, 4Runner, Land Cruiser and more: suspension, bumpers, lighting, engines and transmissions, each matched to the vehicle it fits. Prices in USD.`,
  path: "/",
  keywords: SITE_KEYWORDS,
});

/*
 * WHAT THIS PAGE MAY CLAIM
 *
 * Every number on it is counted from the public catalog, and every vehicle
 * and department is shown only where real listings exist. Two lines depend on
 * facts the site cannot yet back up, and stay off until it can:
 *
 *   - "Authorized Toyota dealer" wording appears only when
 *     lib/brand/toyota-dealer.ts holds the authorization details.
 *   - "Genuine" in the hero appears only when that is true AND at least one
 *     listing is verified as a Toyota Genuine Part. A catalog of aftermarket
 *     parts headed "Genuine Toyota Parts" would mislead every buyer.
 *
 * No reviews, testimonials or stock claims appear here.
 */
export default function Home() {
  const listingCount = getActiveListingCount();
  const authorized = isAuthorizedToyotaDealer();
  const genuineProducts = getVerifiedGenuineProducts();
  const showGenuine = authorized && genuineProducts.length > 0;

  const usa = getMarket("usa");
  const vehicles = usa
    ? getMarketOverview(usa).groups.flatMap((group) => group.vehicles)
    : [];
  const departments = getToyotaDepartments();
  const engineAndTransmission = getEngineAndTransmissionProducts();
  const featuredPool = getHomeFeaturedProductPool();
  const featuredProducts = getFeaturedBatch(featuredPool, getFeaturedTimeSlot());

  return (
    <div className="w-full min-w-0 overflow-x-hidden bg-white text-[#17191C]">
      {/* 1. Hero */}
      <section className="border-b border-[#E5E7EB] bg-white">
        <div className="mx-auto max-w-6xl px-4 pb-14 pt-28 sm:px-6 sm:pb-20 sm:pt-32 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#69717C]">
            DrivoraParts
            <span className="mx-2 text-[#E5E7EB]" aria-hidden="true">
              |
            </span>
            {authorized ? "Your Authorized Toyota Parts Destination" : "Toyota Parts Specialists"}
          </p>
          <h1 className="mt-5 max-w-4xl text-4xl font-extrabold uppercase leading-[1.05] tracking-tight sm:text-6xl">
            {showGenuine ? "Genuine Toyota Parts." : "Toyota Parts."}{" "}
            <span className="text-[#EB0A1E]">The Right Fit.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[#69717C]">
            {showGenuine
              ? "Shop Toyota Genuine Parts, engines, transmissions, replacement components, and accessories with confidence."
              : "Shop parts for your Toyota, from suspension and bumpers to engines, transmissions and accessories, each matched to the models it fits."}
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href={routes.all}
              className="inline-flex min-h-12 items-center justify-center rounded-md bg-[#EB0A1E] px-7 text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-[#C8081A]"
            >
              Shop Toyota Parts
            </Link>
            <Link
              href="#vehicles"
              className="inline-flex min-h-12 items-center justify-center rounded-md border border-[#17191C] px-7 text-sm font-bold uppercase tracking-wider text-[#17191C] transition-colors hover:bg-[#17191C] hover:text-white"
            >
              Find Your Vehicle
            </Link>
          </div>
          <p className="mt-6 text-sm text-[#69717C]">
            {listingCount.toLocaleString("en-US")} Toyota parts listed · Prices in USD
          </p>
        </div>
      </section>

      {/* 2. Identity: what DrivoraParts is, stated only as far as it is true */}
      <section className="border-b border-[#E5E7EB] bg-[#F5F6F7]">
        <div className="mx-auto grid max-w-6xl gap-px px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
          {[
            authorized
              ? { title: "Authorized Toyota dealer", body: "Toyota parts supplied under our Toyota dealer authorization." }
              : { title: "Toyota only", body: "Every part listed names the Toyota models it fits." },
            { title: "Fitment on every listing", body: "Years, models and engines as the listing states them. Ask us before you buy if unsure." },
            { title: "Clear condition labels", body: "New, used or refurbished: the condition is shown on every part." },
            { title: "US support", body: `Call or text ${COMPANY_PHONE_DISPLAY}, or email us.` },
          ].map((item) => (
            <div key={item.title} className="py-6 sm:px-4 lg:py-8">
              <p className="text-sm font-bold uppercase tracking-wide">{item.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-[#69717C]">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Shop by Toyota vehicle */}
      {vehicles.length > 0 ? (
        <section id="vehicles" className="scroll-mt-24 border-b border-[#E5E7EB] bg-white">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
            <SectionHeading eyebrow="Shop by Vehicle" title="Choose your Toyota" />
            <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {vehicles.map(({ vehicle, count }) => (
                <li key={vehicle.key}>
                  <Link
                    href={`${routes.market("usa")}?vehicle=${encodeURIComponent(vehicle.key)}`}
                    className="group flex h-full min-h-24 flex-col justify-between rounded-lg border border-[#E5E7EB] p-4 transition-colors hover:border-[#17191C]"
                  >
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#69717C]">
                      Toyota
                    </span>
                    <span className="mt-1 text-lg font-bold group-hover:text-[#EB0A1E]">
                      {vehicle.model}
                    </span>
                    <span className="mt-2 text-xs text-[#69717C]">
                      {count.toLocaleString("en-US")} parts
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {/* 4. Shop by parts category */}
      {departments.length > 0 ? (
        <section className="border-b border-[#E5E7EB] bg-[#F5F6F7]">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="Shop by Category"
              title="Find the part you need"
              link={{ href: routes.all, label: "All Toyota parts" }}
            />
            <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {departments.map((department) => (
                <li key={department.key}>
                  <Link
                    href={department.href}
                    className="group flex h-full flex-col rounded-lg border border-[#E5E7EB] bg-white p-5 transition-colors hover:border-[#17191C]"
                  >
                    <span className="text-base font-bold group-hover:text-[#C8081A]">
                      {department.name}
                    </span>
                    <span className="mt-2 flex-1 text-sm leading-relaxed text-[#69717C]">
                      {department.description}
                    </span>
                    <span className="mt-4 text-xs font-semibold text-[#17191C]">
                      {department.count.toLocaleString("en-US")} parts →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {/* 5. Featured: Toyota Genuine Parts when verified ones exist, otherwise Toyota parts */}
      {showGenuine ? (
        <ProductRail
          eyebrow="Toyota Genuine Parts"
          title="Featured Toyota Genuine Parts"
          products={genuineProducts}
          viewAllHref={routes.all}
        />
      ) : featuredProducts.length > 0 ? (
        <section className="border-b border-[#E5E7EB] bg-white">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="Featured"
              title="Featured Toyota parts"
              link={{ href: routes.all, label: "View all" }}
            />
            <div className="mt-8">
              <HomeFeaturedRotator pool={featuredPool} initialBatch={featuredProducts} />
            </div>
          </div>
        </section>
      ) : null}

      {/* 6. Engines & transmissions */}
      <ProductRail
        eyebrow="Engines & Transmissions"
        title="Engine and transmission parts"
        products={engineAndTransmission}
        viewAllHref={`${routes.all}?category=engine,transmission`}
        tone="muted"
      />

      {/* 7. Why DrivoraParts */}
      <section className="border-b border-[#E5E7EB] bg-white">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Why DrivoraParts" title="Buying parts should be simple" />
          <div className="mt-8 grid gap-8 sm:grid-cols-3">
            {[
              {
                title: "The right fit",
                body: "Each listing states the Toyota models, years and engines it fits. If yours is not listed or you are not sure, ask us before you order.",
              },
              {
                title: "Honest descriptions",
                body: "Condition, part numbers and specifications are shown as we have them. We do not guess fitment.",
              },
              {
                title: "Transparent purchasing",
                body: "Prices in US dollars. Shipping is calculated at checkout from your address, and our policies are published in full.",
              },
            ].map((item) => (
              <div key={item.title} className="border-t-2 border-[#17191C] pt-5">
                <h3 className="text-lg font-bold">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-[#69717C]">{item.body}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 text-sm">
            <Link href="/policies" className="font-semibold underline underline-offset-4 hover:text-[#C8081A]">
              Shipping, returns and warranty policies
            </Link>
          </p>
        </div>
      </section>

      {/* 8. Support */}
      <section className="bg-[#17191C] text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-14 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#AEB4BB]">Customer Support</p>
            <h2 className="mt-3 text-2xl font-bold sm:text-3xl">Not sure it fits? Ask us first.</h2>
            <p className="mt-3 text-sm leading-relaxed text-[#AEB4BB]">
              Send us your Toyota&apos;s year, model and VIN and we will help you check fitment before you order.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              href={COMPANY_PHONE_TEL_HREF}
              className="inline-flex min-h-12 items-center justify-center rounded-md bg-white px-6 text-sm font-bold text-[#17191C] hover:bg-[#F5F6F7]"
            >
              Call {COMPANY_PHONE_DISPLAY}
            </a>
            <a
              href={`mailto:${COMPANY_SUPPORT_EMAIL}`}
              className="inline-flex min-h-12 items-center justify-center rounded-md border border-[#33373C] px-6 text-sm font-bold text-white hover:border-white"
            >
              {COMPANY_SUPPORT_EMAIL}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  link,
}: {
  eyebrow: string;
  title: string;
  link?: { href: string; label: string };
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#EB0A1E]">{eyebrow}</p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">{title}</h2>
      </div>
      {link ? (
        <Link href={link.href} className="text-sm font-semibold hover:text-[#C8081A]">
          {link.label} →
        </Link>
      ) : null}
    </div>
  );
}
