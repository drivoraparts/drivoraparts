import {
  COMPANY_LOCATION_SUMMARY,
  US_HEADQUARTERS,
} from "@/lib/content/company";

/**
 * The registered address, as filed with the California Secretary of State.
 *
 * A "japan-hub" variant used to render a Nagoya address for a facility the
 * company does not operate. It was unused by any page and the address itself
 * was not a valid Japanese one, so it is gone rather than corrected — parts
 * are sourced from Japanese suppliers, which the summary variant now says.
 */
type CompanyAddressVariant = "summary" | "us-hq";

const variantClass: Record<CompanyAddressVariant, string> = {
  summary: "space-y-1 text-sm text-neutral-500",
  "us-hq": "space-y-0.5 text-sm text-neutral-600 leading-relaxed",
};

export default function CompanyAddress({
  variant = "summary",
  className = "",
}: {
  variant?: CompanyAddressVariant;
  className?: string;
}) {
  const classes = `${variantClass[variant]} ${className}`.trim();

  if (variant === "summary") {
    return (
      <address className={`${classes} not-italic`}>
        <p className="font-semibold text-neutral-900">{COMPANY_LOCATION_SUMMARY.brand}</p>
        <p>{COMPANY_LOCATION_SUMMARY.corporateHq}</p>
        <p>{COMPANY_LOCATION_SUMMARY.distribution}</p>
        <p className="pt-1 text-xs italic text-gray-500">
          {COMPANY_LOCATION_SUMMARY.motto}
        </p>
      </address>
    );
  }

  return (
    <address className={`${classes} not-italic`}>
      <p className="font-medium text-neutral-900">{US_HEADQUARTERS.companyName}</p>
      <p>{US_HEADQUARTERS.street}</p>
      <p>
        {US_HEADQUARTERS.city}, {US_HEADQUARTERS.state} {US_HEADQUARTERS.postalCode}
      </p>
      <p>{US_HEADQUARTERS.country}</p>
    </address>
  );
}
