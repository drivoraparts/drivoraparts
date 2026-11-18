import Link from "next/link";
import TrustIcon, { type TrustIconName } from "./TrustIcon";
import { CONTACT_HREF, RETURN_POLICY_HREF, RETURN_WINDOW_DAYS } from "@/lib/content/purchase-terms";
import { toyotaBadgeText, toyotaLogoSrc } from "@/lib/brand/toyota-dealer";

/*
 * The strip under the header. Every item is a fact with a page behind it,
 * so each one links to the policy or contact page that backs it up:
 *
 *   Secure checkout       HTTPS throughout; payment is taken by PayPal, Cash
 *                         App or a crypto processor and no card data is stored.
 *   30-day returns        RETURN_WINDOW_DAYS in the Returns & Refund Policy.
 *   US phone & email      The +1 (401) number and support address (not "US-
 *                         based team": where staff sit is not established).
 *   Name-brand parts      The public catalog is Old Man Emu, ARB, Bilstein,
 *                         Fox and similar. Not "OEM quality", which aftermarket
 *                         parts cannot honestly claim.
 *
 * Static, not part of the fixed header: it scrolls away, so the header height
 * and every sticky offset (--header-h) are unchanged.
 */
const ITEMS: { icon: TrustIconName; label: string; short?: string; href: string }[] = [
  { icon: "lock", label: "Secure checkout", href: "/policies/buyer-protection" },
  { icon: "returns", label: `${RETURN_WINDOW_DAYS}-day returns`, href: RETURN_POLICY_HREF },
  { icon: "phone", label: "US phone & email support", short: "US phone support", href: CONTACT_HREF },
  { icon: "badge", label: "Name-brand parts", href: "/catalog/all" },
];

export default function TrustBar() {
  // Once lib/brand/toyota-dealer.ts holds the authorization, its designation
  // takes the first slot (first on phones, where the bar wraps) and replaces
  // "Name-brand parts", keeping four items.
  const toyota = toyotaBadgeText();
  const logo = toyotaLogoSrc();
  const items = toyota ? ITEMS.filter((item) => item.label !== "Name-brand parts") : ITEMS;

  return (
    <div className="border-b border-border bg-surface-muted">
      <ul className="mx-auto grid max-w-6xl grid-cols-2 gap-x-3 gap-y-1 px-4 py-2 sm:flex sm:items-center sm:justify-between sm:px-6 lg:px-8">
        {toyota ? (
          <li>
            <Link
              href="/about"
              prefetch={false}
              className="flex min-h-7 items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.06em] text-foreground"
            >
              {logo ? (
                // Toyota-supplied one-colour mark, never recoloured or reshaped.
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logo} alt="Toyota" height={18} className="h-[18px] w-auto" />
              ) : null}
              {toyota}
            </Link>
          </li>
        ) : null}
        {items.map((item) => (
          <li key={item.label}>
            <Link
              href={item.href}
              prefetch={false}
              className="flex min-h-7 min-w-0 items-center gap-1.5 text-[12px] font-semibold text-foreground transition-colors hover:text-accent-hover sm:text-[13px]"
            >
              <TrustIcon name={item.icon} />
              <span className="truncate sm:hidden">{item.short ?? item.label}</span>
              <span className="hidden sm:inline">{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
