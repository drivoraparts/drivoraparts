"use client";

import Link from "next/link";
import CurrencyFooterNote from "@/components/currency/CurrencyFooterNote";
import NewsletterSignup from "@/components/layout/NewsletterSignup";
import { useTranslation } from "@/hooks/useTranslation";
import {
  COMPANY_LEGAL_NAME,
  COMPANY_SUPPORT_EMAIL,
  US_HEADQUARTERS,
} from "@/lib/content/company";
import {
  CONTACT_HREF,
  RETURN_POLICY_HREF,
  SHIPPING_POLICY_HREF,
  START_RETURN_HREF,
  WARRANTY_POLICY_HREF,
} from "@/lib/content/purchase-terms";
import type { UiKey } from "@/lib/i18n/ui";
import { routes } from "@/lib/inventory/routes";
import { MANUAL_METHODS } from "@/lib/payments/manual-methods";

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

/*
 * The payment row at the foot of the footer: one quiet badge per method
 * checkout offers, and no others. The direct methods are read from
 * MANUAL_METHODS -- the list checkout renders -- so disabling one there takes
 * its badge away too. Cryptocurrency is checkout's NOWPayments option.
 *
 * Marks are the files already in public/trust and already used at checkout,
 * unmodified: Zelle's tile, Cash App's $ tile, Venmo's blue wordmark, PayPal's
 * PP monogram and the Bitcoin wordmark checkout uses for its crypto option.
 * Bank transfer and wire are routes rather than brands, so they are set as
 * text. No card-network marks: checkout takes no cards.
 */
type PaymentBadge =
  | { text: string; srPrefix?: string }
  | { src: string; width: number; height: number; className: string };

const PAYMENT_BADGES: Record<string, PaymentBadge> = {
  bank_transfer: { text: "Bank Transfer" },
  wire: { text: "Wire (SWIFT)", srPrefix: "International " },
  zelle: { src: "/trust/zelle-mark.png", width: 196, height: 196, className: "h-5 w-5" },
  cash_app: { src: "/trust/cashapp-mark.png", width: 132, height: 132, className: "h-5 w-5" },
  venmo: { src: "/trust/venmo-logo-blue.png", width: 1400, height: 265, className: "h-3.5 w-auto" },
  paypal: { src: "/trust/paypal-mark.png", width: 209, height: 209, className: "h-5 w-5" },
};

const PAYMENT_ROW: { key: string; label: string; badge: PaymentBadge }[] = [
  ...MANUAL_METHODS.filter((method) => method.enabled).map((method) => ({
    key: method.id,
    label: method.label,
    badge: PAYMENT_BADGES[method.id] ?? { text: method.label },
  })),
  {
    key: "crypto",
    label: "Bitcoin and other cryptocurrency",
    badge: { src: "/trust/bitcoin.svg", width: 300, height: 63, className: "h-4 w-auto" },
  },
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

          {/*
            Who the seller is, in one line: the entity a customer contracts
            with and the city it answers from. This is not the "operating
            footprint" the note above removed -- that presented a corporate HQ
            and two logistics hubs as three operations, on records that could
            not be confirmed. One registered office is the fact that every
            other page already states (Contact, Terms of Sale, Returns), so
            the footer agreeing with them is one less thing to reconcile.
          */}
          <p className="mt-4 text-sm text-muted-on-dark">
            {COMPANY_LEGAL_NAME} · {US_HEADQUARTERS.city},{" "}
            {US_HEADQUARTERS.stateName}, USA
          </p>

          <p className="mt-2 flex flex-wrap items-center gap-x-1.5 text-sm">
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

      <ul
        aria-label={t("footerPaymentMethods")}
        className="flex flex-wrap items-center justify-center gap-2 pb-8"
      >
        {PAYMENT_ROW.map(({ key, label, badge }) => (
          <li
            key={key}
            className="inline-flex h-7 items-center justify-center rounded-[4px] bg-white px-2"
          >
            {"text" in badge ? (
              <span className="px-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-neutral-800">
                {badge.srPrefix ? <span className="sr-only">{badge.srPrefix}</span> : null}
                {badge.text}
              </span>
            ) : (
              // Small static brand files served as-is; the image optimiser
              // would add nothing at 20px.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={badge.src}
                alt={label}
                width={badge.width}
                height={badge.height}
                loading="lazy"
                decoding="async"
                className={`${badge.className} object-contain`}
              />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
