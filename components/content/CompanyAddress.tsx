import {
  COMPANY_LOCATION_SUMMARY,
  JAPAN_LOGISTICS_HUB,
  US_HEADQUARTERS,
} from "@/lib/content/company";

type CompanyAddressVariant = "summary" | "us-hq" | "japan-hub";
type CompanyAddressTone = "light" | "dark";

const variantClass: Record<CompanyAddressVariant, string> = {
  summary: "space-y-1 text-sm",
  "us-hq": "space-y-0.5 text-sm leading-relaxed",
  "japan-hub": "space-y-0.5 text-sm leading-relaxed",
};

/*
 * The summary variant renders on the light About page AND inside the dark
 * footer, so its colours cannot be fixed to one surface. On charcoal the
 * light-surface muted grey measured 3.82:1 -- below AA -- so the dark tone
 * switches to the on-dark tokens, which are chosen for exactly this case.
 */
const toneClass: Record<CompanyAddressTone, { body: string; strong: string; motto: string }> = {
  light: { body: "text-muted", strong: "text-foreground", motto: "text-muted" },
  dark: { body: "text-muted-on-dark", strong: "text-foreground-on-dark", motto: "text-muted-on-dark" },
};

export default function CompanyAddress({
  variant = "summary",
  tone = "light",
  className = "",
}: {
  variant?: CompanyAddressVariant;
  tone?: CompanyAddressTone;
  className?: string;
}) {
  const t = toneClass[tone];
  const classes = `${variantClass[variant]} ${t.body} ${className}`.trim();

  if (variant === "summary") {
    return (
      <address className={`${classes} not-italic`}>
        <p className={`font-semibold ${t.strong}`}>{COMPANY_LOCATION_SUMMARY.brand}</p>
        <p>{COMPANY_LOCATION_SUMMARY.corporateHq}</p>
        <p>{COMPANY_LOCATION_SUMMARY.distribution}</p>
        <p className={`pt-1 text-xs italic ${t.motto}`}>
          {COMPANY_LOCATION_SUMMARY.motto}
        </p>
      </address>
    );
  }

  if (variant === "us-hq") {
    return (
      <address className={`${classes} not-italic`}>
        <p className={`font-medium ${t.strong}`}>{US_HEADQUARTERS.companyName}</p>
        <p>{US_HEADQUARTERS.street}</p>
        <p>
          {US_HEADQUARTERS.city}, {US_HEADQUARTERS.state}{" "}
          {US_HEADQUARTERS.postalCode}
        </p>
        <p>{US_HEADQUARTERS.country}</p>
      </address>
    );
  }

  return (
    <address className={`${classes} not-italic`}>
      <p className={`font-medium ${t.strong}`}>{JAPAN_LOGISTICS_HUB.companyName}</p>
      <p>{JAPAN_LOGISTICS_HUB.street}</p>
      <p>
        {JAPAN_LOGISTICS_HUB.city}, {JAPAN_LOGISTICS_HUB.ward}
      </p>
      <p>
        {JAPAN_LOGISTICS_HUB.prefecture} {JAPAN_LOGISTICS_HUB.postalCode}
      </p>
      <p>{JAPAN_LOGISTICS_HUB.country}</p>
    </address>
  );
}
