"use client";

import Link from "next/link";
import CurrencyFooterNote from "@/components/currency/CurrencyFooterNote";
import NewsletterSignup from "@/components/layout/NewsletterSignup";
import { useTranslation } from "@/hooks/useTranslation";
import { COMPANY_LEGAL_NAME, COMPANY_SUPPORT_EMAIL } from "@/lib/content/company";
import {
  CONTACT_HREF,
  RETURN_POLICY_HREF,
  SHIPPING_POLICY_HREF,
  START_RETURN_HREF,
  WARRANTY_POLICY_HREF,
} from "@/lib/content/purchase-terms";
import type { UiKey } from "@/lib/i18n/ui";
import { routes } from "@/lib/inventory/routes";

/*
 * The footer is navigation and the terms of sale, and nothing that asks to be
 * taken on trust. It used to open on an operating footprint -- a corporate HQ
 * and two "logistics hubs" -- which read as three separate operations and
 * rested on records that could not be confirmed (one hub has no street address
 * on file), then a motto and a line calling the parts "engineered". What stays
 * is what the site can stand behind: what it sells, how to reach support, and
 * where every policy lives.
 *
 * Every destination below is an existing page. The less-used legal documents
 * (DPA, EULA, acceptable use, disclaimer, affiliate disclosure, liability)
 * are one click away through All Policies rather than listed individually.
 */

type FooterLink = { href: string; label: UiKey };

const COLUMNS: { heading: UiKey; links: FooterLink[] }[] = [
  {
    heading: "footerShop",
    links: [
      { href: routes.all, label: "allParts" },
      { href: "/vehicles", label: "shopByVehicle" },
      { href: routes.category("engine"), label: "categoryEngines" },
      { href: routes.category("suspension"), label: "categorySuspension" },
      { href: routes.category("transmission"), label: "categoryTransmissions" },
      { href: routes.category("turbocharger"), label: "categoryTurbochargers" },
      { href: routes.category("brakes"), label: "categoryBrakes" },
      { href: routes.category("wheels-tires"), label: "categoryWheelsTires" },
      { href: routes.category("4x4-accessories"), label: "category4x4Accessories" },
    ],
  },
  {
    heading: "footerCustomerService",
    links: [
      { href: "/track-order", label: "trackOrder" },
      { href: CONTACT_HREF, label: "contactSupport" },
      { href: "/faq", label: "faq" },
      { href: START_RETURN_HREF, label: "startReturn" },
      { href: SHIPPING_POLICY_HREF, label: "shippingPolicy" },
      { href: RETURN_POLICY_HREF, label: "returnsRefunds" },
      { href: WARRANTY_POLICY_HREF, label: "warrantyPolicy" },
    ],
  },
  {
    heading: "footerInformation",
    links: [
      { href: "/about", label: "about" },
      { href: "/guides", label: "buyingGuides" },
      { href: "/policies/terms-of-service", label: "termsOfService" },
      { href: "/policies/cookie-policy", label: "cookiePolicy" },
      { href: "/policies/accessibility-statement", label: "accessibility" },
      { href: "/policies", label: "allPolicies" },
    ],
  },
  {
    // Ways into the catalog, the same four the market selector offers --
    // not places DrivoraParts operates from.
    heading: "footerMarkets",
    links: [
      { href: routes.market("usa"), label: "marketUnitedStates" },
      { href: routes.market("australia"), label: "marketAustralia" },
      { href: routes.market("uk"), label: "marketUnitedKingdom" },
      { href: routes.market("worldwide"), label: "marketWorldwide" },
    ],
  },
];

const LEGAL_LINKS: FooterLink[] = [
  { href: "/policies/terms-of-sale", label: "termsOfSale" },
  { href: "/policies/privacy-policy", label: "privacyPolicy" },
  { href: SHIPPING_POLICY_HREF, label: "shippingPolicy" },
  { href: RETURN_POLICY_HREF, label: "returnsRefunds" },
  { href: WARRANTY_POLICY_HREF, label: "warrantyPolicy" },
  // Several vehicle photographs are CC BY-SA, which requires the creator,
  // the licence and the source to be reachable. A link from every page
  // satisfies the licence without ending the homepage on legal text.
  { href: "/photography-credits", label: "imageCredits" },
];

const focusRing =
  "rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-on-dark";

// min-h-8 keeps every link a 32px tap target without spacing the list out.
const linkClass = `inline-flex min-h-8 items-center text-sm text-muted-on-dark transition-colors hover:text-foreground-on-dark ${focusRing}`;

const headingClass =
  "text-[11px] font-semibold uppercase tracking-[0.14em] text-accent-on-dark";

export default function FooterContent() {
  const { t } = useTranslation();

  return (
    <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
      {/*
        Phones read brand, links, then the sign-up; from lg the sign-up moves
        up under the brand and the links span both rows beside them.
      */}
      <div className="grid gap-y-10 py-12 lg:grid-cols-12 lg:grid-rows-[auto_1fr] lg:gap-x-10 lg:py-14">
        <div className="max-w-md lg:col-span-4">
          <p className="text-lg font-bold">
            <Link href="/" prefetch={false} className={`inline-flex min-h-8 items-center ${focusRing}`}>
              Drivora<span className="text-accent-on-dark">Parts</span>
            </Link>
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted-on-dark">{t("footerBrand")}</p>

          <p className="mt-4 flex flex-wrap items-center gap-x-1.5 text-sm">
            <span className="text-foreground-on-dark">{t("footerSupport")}:</span>
            <a
              href={`mailto:${COMPANY_SUPPORT_EMAIL}`}
              className={`inline-flex min-h-8 items-center text-accent-on-dark transition-colors hover:text-foreground-on-dark ${focusRing}`}
            >
              {COMPANY_SUPPORT_EMAIL}
            </a>
          </p>
        </div>

        <nav
          aria-label="Footer"
          className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4 lg:col-span-8 lg:row-span-2"
        >
          {COLUMNS.map((column) => (
            <div key={column.heading}>
              <h2 className={headingClass}>{t(column.heading)}</h2>
              <ul className="mt-3">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} prefetch={false} className={linkClass}>
                      {t(link.label)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="max-w-md lg:col-span-4">
          <h2 className={headingClass}>{t("footerNewsletterTitle")}</h2>
          <p className="mb-3 mt-2 text-sm text-muted-on-dark">{t("footerNewsletterText")}</p>
          <NewsletterSignup />
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-border-on-dark py-6 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
        <div className="text-xs text-muted-on-dark">
          <CurrencyFooterNote />
          <p>
            © {new Date().getFullYear()} {COMPANY_LEGAL_NAME}. {t("rightsReserved")}
          </p>
        </div>
        <nav aria-label="Legal">
          <ul className="flex flex-wrap gap-x-5">
            {LEGAL_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  prefetch={false}
                  className={`inline-flex min-h-8 items-center text-xs text-muted-on-dark transition-colors hover:text-foreground-on-dark ${focusRing}`}
                >
                  {t(link.label)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}
