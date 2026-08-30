import {
  AUSTRALIA_LOGISTICS_HUB,
  COMPANY_LEGAL_NAME,
  COMPANY_SUPPORT_EMAIL,
  JAPAN_LOGISTICS_HUB,
  US_HEADQUARTERS,
} from "./company";
import { HOME_LISTING_COUNT } from "@/lib/home/listing-count";
import { isExpressConfigured } from "@/lib/shipping/config";

export type TrustSignal = {
  id: string;
  title: string;
  detail: string;
  seal: "ssl" | "payments" | "company" | "freight" | "inventory" | "shipping" | "guarantee";
};

export const TRUST_SECTION = {
  eyebrow: "Shop with confidence",
  headline: "Registered US seller · encrypted checkout · real inventory",
  // Derived, not hand-written: a hub that changes in company.ts must not be
  // able to leave this line claiming somewhere we no longer ship from.
  subhead: `${COMPANY_LEGAL_NAME} operates from ${US_HEADQUARTERS.city}, ${US_HEADQUARTERS.stateName} with distribution in ${JAPAN_LOGISTICS_HUB.city}, ${JAPAN_LOGISTICS_HUB.country} and ${AUSTRALIA_LOGISTICS_HUB.city}, ${AUSTRALIA_LOGISTICS_HUB.country}. Every listing is reviewed for accurate photos and specs, backed by freight-ready logistics and NOWPayments crypto checkout.`,
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
  {
    id: "inventory",
    title: "Listings reviewed for accuracy",
    detail: `${HOME_LISTING_COUNT.toLocaleString()}+ SKUs checked for correct photos, specs, and fitment.`,
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
    headline: "Pay your way — crypto, done right",
    detail:
      "Every order runs through NOWPayments. No bank holds, no chargebacks, no placeholder badge.",
    chips: ["Bitcoin", "Ethereum", "USDT", "300+ coins"],
    seal: "payments",
  },
  {
    id: "shipping",
    eyebrow: "Shipping & Returns",
    headline: "Free shipping. 30-day money-back guarantee.",
    detail: `Every order ships free, worldwide — from single parts to full engine assemblies, coordinated from our US, ${JAPAN_LOGISTICS_HUB.country}, and ${AUSTRALIA_LOGISTICS_HUB.country} hubs. Not the right fit? Return it within 30 days for a refund.`,
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
  {
    id: "security",
    eyebrow: "Security",
    headline: "Encrypted, every request",
    detail: "Checkout and account pages run on modern HTTPS/TLS — no exceptions.",
    chips: ["256-bit TLS", "Encrypted Checkout"],
    seal: "ssl",
  },
  {
    id: "verified",
    eyebrow: "Verified Marketplace",
    headline: `${COMPANY_LEGAL_NAME} — US registered`,
    detail: `Corporate HQ in ${US_HEADQUARTERS.city}, ${US_HEADQUARTERS.state}. Every listing reviewed before it goes live.`,
    chips: ["US Registered", "Verified Listings", "Professional Support"],
    seal: "company",
  },
];

export const TRUST_POLICY_LINKS = [
  { href: "/policies/refund-policy", label: "Refund policy" },
  { href: "/policies/shipping-policy", label: "Shipping policy" },
  { href: "/policies/privacy-policy", label: "Privacy policy" },
  { href: "/contact", label: "Contact support" },
] as const;
