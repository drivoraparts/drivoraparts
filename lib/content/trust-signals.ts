import {
  COMPANY_LEGAL_NAME,
  COMPANY_SUPPORT_EMAIL,
  JAPAN_LOGISTICS_HUB,
  US_HEADQUARTERS,
} from "./company";
import { HOME_LISTING_COUNT } from "@/lib/home/listing-count";

export type TrustSignal = {
  id: string;
  title: string;
  detail: string;
  seal: "ssl" | "payments" | "company" | "freight" | "inventory";
};

export const TRUST_SECTION = {
  eyebrow: "Shop with confidence",
  headline: "Registered US seller · encrypted checkout · real inventory",
  subhead:
    "DrivoraParts LLC operates from Torrance, California with distribution in Nagoya, Japan. Every listing uses in-house photos, freight-ready logistics, and NOWPayments crypto checkout.",
  legalLine: `${COMPANY_LEGAL_NAME} · ${US_HEADQUARTERS.city}, ${US_HEADQUARTERS.state} · ${COMPANY_SUPPORT_EMAIL}`,
  listingStat: `${HOME_LISTING_COUNT.toLocaleString()}+ active listings`,
} as const;

export const TRUST_PROOF = {
  legalName: COMPANY_LEGAL_NAME,
  supportEmail: COMPANY_SUPPORT_EMAIL,
  usStreet: US_HEADQUARTERS.street,
  usCityLine: `${US_HEADQUARTERS.city}, ${US_HEADQUARTERS.state} ${US_HEADQUARTERS.postalCode}`,
  usCountry: US_HEADQUARTERS.country,
  japanLine: `${JAPAN_LOGISTICS_HUB.city}, ${JAPAN_LOGISTICS_HUB.prefecture} · ${JAPAN_LOGISTICS_HUB.country}`,
  listingCount: HOME_LISTING_COUNT,
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
    title: "NOWPayments checkout",
    detail: "Bitcoin, Ethereum, USDT, and 300+ cryptocurrencies via licensed payment rails.",
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
    title: "Verified listing photos",
    detail: `${HOME_LISTING_COUNT.toLocaleString()}+ SKUs photographed in-house — what you see is what ships.`,
    seal: "inventory",
  },
];

export const TRUST_POLICY_LINKS = [
  { href: "/policies/refund-policy", label: "Refund policy" },
  { href: "/policies/shipping-policy", label: "Shipping policy" },
  { href: "/policies/privacy-policy", label: "Privacy policy" },
  { href: "/contact", label: "Contact support" },
] as const;
