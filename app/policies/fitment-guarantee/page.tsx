import Link from "next/link";
import { buildPolicyMetadata } from "@/lib/seo/policy-metadata";
import Policy from "@/components/policy/Policy";
import {
  COMPANY_PHONE_DISPLAY,
  COMPANY_PHONE_TEL_HREF,
  COMPANY_SUPPORT_EMAIL,
} from "@/lib/content/company";
import { REFUND_PROCESSING, RETURN_POLICY_HREF } from "@/lib/content/purchase-terms";
import { FITMENT_GUARANTEE_DAYS, FITMENT_VIN_CHECK_HREF } from "@/lib/content/fitment-guarantee";

export const metadata = buildPolicyMetadata("/policies/fitment-guarantee");

const linkClass =
  "font-semibold text-accent underline-offset-2 hover:text-accent-hover hover:underline";

/*
 * The terms behind the "Fitment Guaranteed" badge on product pages. Every
 * clause here is a commitment the business approved; the badge text lives in
 * lib/content/fitment-guarantee.ts and must never promise more than this page.
 * It overrides the return-shipping and restocking terms of the Returns &
 * Refund Policy for fitment problems only.
 */
export default function FitmentGuaranteePage() {
  return (
    <Policy
      title="Fitment Guarantee"
      effectiveDate="November 18, 2026"
      lastUpdated="November 18, 2026"
      intro="If a part doesn't fit the vehicle its listing names, we make it right at our cost."
      sections={[
        {
          heading: "Full refund, no restocking fee",
          paragraphs: [
            `You get back everything you paid for the part, to your original payment method. Refunds are processed within ${REFUND_PROCESSING} of the part arriving back with us. No restocking fee applies to a fitment return.`,
          ],
        },
        {
          heading: "We pay return shipping",
          paragraphs: [
            "For parcels we send you a prepaid return label. For freight items, such as bumpers and canopies, we schedule and pay for the pickup.",
          ],
        },
        {
          heading: `${FITMENT_GUARANTEE_DAYS} days from delivery`,
          paragraphs: [
            `Tell us within ${FITMENT_GUARANTEE_DAYS} days of delivery. Test-fitting the part to check it is fine.`,
          ],
        },
        {
          heading: "One business day to respond",
          paragraphs: [
            <>
              Send your order number, your vehicle&apos;s VIN and a photo showing the problem to{" "}
              <a href={`mailto:${COMPANY_SUPPORT_EMAIL}`} className={linkClass}>
                {COMPANY_SUPPORT_EMAIL}
              </a>
              , or call or text{" "}
              <a href={COMPANY_PHONE_TEL_HREF} className={linkClass}>
                {COMPANY_PHONE_DISPLAY}
              </a>
              . We reply within one business day with your return label or pickup arrangements.
            </>,
          ],
        },
        {
          heading: "Confirm before you buy",
          paragraphs: [
            <>
              Send us your VIN before ordering through our{" "}
              <Link href={FITMENT_VIN_CHECK_HREF} prefetch={false} className={linkClass}>
                contact form
              </Link>{" "}
              and we will confirm fitment in writing. If we confirmed it and the part does not fit,
              this guarantee always applies.
            </>,
          ],
        },
        {
          heading: "What's covered",
          paragraphs: [
            "The guarantee applies when the part cannot be installed on a vehicle matching the year, model, engine and configuration stated in the listing's fitment, without modifications the listing does not mention.",
            "The part must not have been cut, welded, painted, wired in or driven on. The guarantee does not cover vehicles that differ from the listed fitment, vehicle modifications that cause the mismatch, swap packages (whose fitment depends on fabrication), or normal wear on used and refurbished parts, which our condition terms cover.",
          ],
        },
        {
          heading: "How this relates to our Returns & Refund Policy",
          paragraphs: [
            <>
              For fitment problems, this guarantee overrides the return-shipping and restocking-fee
              terms of our{" "}
              <Link href={RETURN_POLICY_HREF} prefetch={false} className={linkClass}>
                Returns &amp; Refund Policy
              </Link>
              . Everything else in that policy, including return authorization before you ship,
              still applies.
            </>,
          ],
        },
      ]}
    />
  );
}
