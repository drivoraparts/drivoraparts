import {
  COMPANY_ADDRESS,
  COMPANY_LEGAL_NAME,
  COMPANY_LOCATION_SUMMARY,
} from "@/lib/content/company";

type CompanyAddressVariant = "summary" | "operator";
type CompanyAddressTone = "light" | "dark";

const variantClass: Record<CompanyAddressVariant, string> = {
  summary: "space-y-1 text-sm",
  operator: "space-y-0.5 text-sm leading-relaxed",
};

/*
 * The address can sit on a light page or a dark surface, so its colours cannot
 * be fixed to one. On charcoal the light-surface muted grey measured 3.82:1 --
 * below AA -- so the dark tone switches to the on-dark tokens, which are chosen
 * for exactly this case.
 */
const toneClass: Record<
  CompanyAddressTone,
  { body: string; strong: string; motto: string }
> = {
  light: {
    body: "text-muted",
    strong: "text-foreground",
    motto: "text-muted",
  },
  dark: {
    body: "text-muted-on-dark",
    strong: "text-foreground-on-dark",
    motto: "text-muted-on-dark",
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
        <p>{COMPANY_LOCATION_SUMMARY.operatedBy}</p>
        <p>{COMPANY_LOCATION_SUMMARY.distribution}</p>
        <p className={`pt-1 text-xs italic ${t.motto}`}>
          {COMPANY_LOCATION_SUMMARY.motto}
        </p>
      </address>
    );
  }

  // The operating entity, and its address only if one has been chosen for
  // publication (COMPANY_ADDRESS in lib/content/company.ts; none today).
  return (
    <address className={`${classes} not-italic`}>
      <p className={`font-medium ${t.strong}`}>{COMPANY_LEGAL_NAME}</p>
      {COMPANY_ADDRESS ? (
        <>
          <p>{COMPANY_ADDRESS.street}</p>
          <p>
            {COMPANY_ADDRESS.city}, {COMPANY_ADDRESS.state}{" "}
            {COMPANY_ADDRESS.postalCode}
          </p>
          <p>{COMPANY_ADDRESS.country}</p>
        </>
      ) : null}
    </address>
  );
}
