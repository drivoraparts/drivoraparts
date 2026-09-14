import {
  COMPANY_FOOTPRINT,
  COMPANY_LOCATION_SUMMARY,
  COMPANY_MOTTO,
  COMPANY_SUPPORT_EMAIL,
  JAPAN_LOGISTICS_HUB,
  US_HEADQUARTERS,
} from "@/lib/content/company";

type CompanyAddressVariant = "summary" | "footprint" | "us-hq" | "japan-hub";
type CompanyAddressTone = "light" | "dark";

const variantClass: Record<CompanyAddressVariant, string> = {
  summary: "space-y-1 text-sm",
  footprint: "space-y-3 text-sm",
  "us-hq": "space-y-0.5 text-sm leading-relaxed",
  "japan-hub": "space-y-0.5 text-sm leading-relaxed",
};

/*
 * The summary variant renders on the light About page AND inside the dark
 * footer, so its colours cannot be fixed to one surface. On charcoal the
 * light-surface muted grey measured 3.82:1 -- below AA -- so the dark tone
 * switches to the on-dark tokens, which are chosen for exactly this case.
 */
const toneClass: Record<
  CompanyAddressTone,
  { body: string; strong: string; motto: string; link: string }
> = {
  light: {
    body: "text-muted",
    strong: "text-foreground",
    motto: "text-muted",
    link: "text-accent hover:text-accent-hover",
  },
  dark: {
    body: "text-muted-on-dark",
    strong: "text-foreground-on-dark",
    motto: "text-muted-on-dark",
    link: "text-accent-on-dark hover:text-foreground-on-dark",
  },
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

  /*
   * The footer's operating footprint: one labelled line per market, the two
   * primary markets first, then how to reach us. It replaced the summary in
   * the footer, whose two run-on sentences could not be scanned and repeated
   * the brand name the footer column already opens with.
   */
  if (variant === "footprint") {
    return (
      <address className={`${classes} not-italic`}>
        {COMPANY_FOOTPRINT.map((site) => (
          <div key={site.market}>
            <p
              className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${t.strong}`}
            >
              {site.market}
            </p>
            <p className="mt-0.5">
              {site.role} · {site.place}
            </p>
          </div>
        ))}
        <p>
          <a
            href={`mailto:${COMPANY_SUPPORT_EMAIL}`}
            className={`transition-colors ${t.link}`}
          >
            {COMPANY_SUPPORT_EMAIL}
          </a>
        </p>
        <p className={`text-xs italic ${t.motto}`}>{COMPANY_MOTTO}</p>
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
