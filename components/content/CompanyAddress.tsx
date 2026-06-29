import {
  COMPANY_LOCATION_SUMMARY,
  JAPAN_LOGISTICS_HUB,
  US_HEADQUARTERS,
} from "@/lib/content/company";

type CompanyAddressVariant = "summary" | "us-hq" | "japan-hub";

const variantClass: Record<CompanyAddressVariant, string> = {
  summary: "space-y-1 text-sm text-neutral-500",
  "us-hq": "space-y-0.5 text-sm text-neutral-600 leading-relaxed",
  "japan-hub": "space-y-0.5 text-sm text-neutral-600 leading-relaxed",
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

  if (variant === "us-hq") {
    return (
      <address className={`${classes} not-italic`}>
        <p className="font-medium text-neutral-900">{US_HEADQUARTERS.companyName}</p>
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
      <p className="font-medium text-neutral-900">{JAPAN_LOGISTICS_HUB.companyName}</p>
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
