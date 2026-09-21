import {
  AUSTRALIA_LOGISTICS_HUB,
  COMPANY_LEGAL_NAME,
  COMPANY_SUPPORT_EMAIL,
  JAPAN_LOGISTICS_HUB,
  US_HEADQUARTERS,
} from "./company";
import { HOME_LISTING_COUNT } from "@/lib/home/listing-count";
import { isExpressConfigured } from "@/lib/shipping/config";
import { DIRECT_PAYMENT_METHODS } from "@/lib/content/purchase-terms";

export type TrustSignal = {
  id: string;
  title: string;
  detail: string;
  seal: "ssl" | "payments" | "company" | "freight" | "inventory" | "shipping" | "guarantee";
};

export const TRUST_SECTION = {
  eyebrow: "Shop with confidence",
  // "encrypted checkout" was dropped from this line: the site still serves
  // plain http:// without redirecting (a Cloudflare setting), so it was not
  // true of every visit. See the security card below.
  headline: "Registered US seller · published policies · real inventory",
  // Derived, not hand-written: a hub that changes in company.ts must not be
  // able to leave this line claiming somewhere we no longer ship from.
  subhead: `${COMPANY_LEGAL_NAME} operates from ${US_HEADQUARTERS.city}, ${US_HEADQUARTERS.stateName} with distribution in ${JAPAN_LOGISTICS_HUB.city}, ${JAPAN_LOGISTICS_HUB.country} and ${AUSTRALIA_LOGISTICS_HUB.city}, ${AUSTRALIA_LOGISTICS_HUB.country}. Freight-ready logistics, direct payment or NOWPayments crypto at checkout, and fitment confirmed on request before you order.`,
  legalLine: `${COMPANY_LEGAL_NAME} · ${US_HEADQUARTERS.city}, ${US_HEADQUARTERS.state} · ${COMPANY_SUPPORT_EMAIL}`,
  listingStat: `${HOME_LISTING_COUNT.toLocaleString()}+ active listings`,
} as const;

export const TRUST_SIGNALS: TrustSignal[] = [
  {
    id: "ssl",
    title: "256-bit TLS encryption",
    detail: "Checkout and account pages secured with modern HTTPS on every request.",
    seal: "ssl",
  },
  {
    id: "payments",
    title: "Instant worldwide checkout",
    detail: "Pay with BTC, ETH, USDT & 300+ coins via NOWPayments — no bank or card required.",
    seal: "payments",
  },
  {
    id: "company",
    title: "US registered seller",
    detail: `${COMPANY_LEGAL_NAME} — corporate HQ in ${US_HEADQUARTERS.city}, ${US_HEADQUARTERS.state}.`,
    seal: "company",
  },
  {
    id: "freight",
    title: "Freight & LTL ready",
    detail: "Truck beds, shells, and pallet freight coordinated worldwide from our logistics hubs.",
    seal: "freight",
  },
  /*
   * This used to read "Listings reviewed for accuracy — N+ SKUs checked for
   * correct photos, specs, and fitment". It was not true: roughly three
   * quarters of listings carry the generic imported description that
   * hasGenericPlaceholderDescription() detects and noindexes, and about the
   * same proportion have no fitment field at all. A catalogue cannot claim its
   * SKUs are checked for fitment when most of them hold no fitment data.
   *
   * What is left is what can be shown to be true: the size of the catalogue,
   * and the offer to confirm fitment on request, which the product pages and
   * vehicle hubs already make.
   */
  {
    id: "inventory",
    title: "Ask before you order",
    detail: `${HOME_LISTING_COUNT.toLocaleString()}+ active listings. Send us your vehicle details and we'll confirm fitment before you buy.`,
    seal: "inventory",
  },
];

export type TrustCategory = {
  id: string;
  eyebrow: string;
  headline: string;
  detail: string;
  /** Real, text-only marks -- no third-party logos we aren't licensed to show. */
  chips: string[];
  seal: TrustSignal["seal"];
};

export const TRUST_CATEGORIES: TrustCategory[] = [
  {
    id: "payments",
    eyebrow: "Payments",
    /*
     * This said "Every order runs through NOWPayments. No bank holds, no
     * chargebacks" -- directly under a strip listing the six direct methods
     * checkout offers first. The methods are read from the list checkout
     * renders, so the card cannot name one checkout does not offer.
     */
    headline: "Direct payment or crypto",
    detail: `Pay by ${DIRECT_PAYMENT_METHODS.join(", ")}, or in cryptocurrency through NOWPayments. Direct payments are confirmed by DrivoraParts before the order ships.`,
    chips: ["Direct payment", "Bitcoin", "Ethereum", "USDT", "300+ coins"],
    seal: "payments",
  },
  {
    id: "shipping",
    eyebrow: "Shipping & Returns",
    headline: "Free shipping. 30-day money-back guarantee.",
    // "Worldwide" and "Not the right fit? Return it" both went further than
    // the policies: shipping reaches most domestic and many international
    // destinations, and a return has to be unused and uninstalled.
    detail: `Every order ships free — from single parts to full engine assemblies — to most domestic and many international destinations, coordinated from our US, ${JAPAN_LOGISTICS_HUB.country}, and ${AUSTRALIA_LOGISTICS_HUB.country} hubs. Unused, uninstalled items can be returned within 30 days of delivery for a refund.`,
    /*
     * "Express Available" appears only once an express price is actually
     * configured (see lib/shipping/config.ts). Until then the option does not
     * exist at checkout, and advertising it would be a claim the site cannot
     * honour. No delivery-time guarantee is stated anywhere, because nothing
     * in the system guarantees one.
     */
    chips: [
      "Free Standard Shipping",
      ...(isExpressConfigured() ? ["Express Available"] : []),
      "30-Day Guarantee",
      "LTL Freight",
    ],
    seal: "shipping",
  },
  /*
   * This read "Encrypted, every request -- Checkout and account pages run on
   * modern HTTPS/TLS, no exceptions", with a "256-bit TLS" chip. It was not
   * true: http://drivoraparts.com/checkout is served over plain HTTP with no
   * redirect (Cloudflare's "Always Use HTTPS" is off), and the cipher is
   * whatever the browser negotiates. What the payment flow itself does is
   * verifiable in the code, so that is what the card says.
   */
  {
    id: "security",
    eyebrow: "Payment security",
    headline: "Payment confirmed before dispatch",
    detail:
      "Direct-payment details are sent to you for each order rather than published on the site, and crypto is paid on a NOWPayments hosted invoice. Orders ship once payment is received and verified.",
    chips: ["Per-order payment details", "Hosted crypto invoice", "Verified before dispatch"],
    seal: "ssl",
  },
  {
    id: "verified",
    eyebrow: "Company",
    headline: `${COMPANY_LEGAL_NAME} — US registered`,
    // "Every listing reviewed before it goes live" and the "Verified Listings"
    // chip were removed for the same reason as the inventory badge above --
    // most listings are bulk imports the site itself flags as unreviewed.
    // The eyebrow said "Verified Marketplace" for the same unsupported
    // reason, and "Professional Support" named a service level nothing
    // defines; support is the contact form and email address.
    detail: `Corporate HQ in ${US_HEADQUARTERS.city}, ${US_HEADQUARTERS.state}. A real company you can email, with policies you can read.`,
    chips: ["US Registered", "Named Company", "Email Support"],
    seal: "company",
  },
];

export const TRUST_POLICY_LINKS = [
  { href: "/policies/refund-policy", label: "Refund policy" },
  { href: "/policies/shipping-policy", label: "Shipping policy" },
  { href: "/policies/privacy-policy", label: "Privacy policy" },
  { href: "/contact", label: "Contact support" },
] as const;
