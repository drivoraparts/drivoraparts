import Link from "next/link";
import Policy from "@/components/policy/Policy";
import { COMPANY_SUPPORT_EMAIL } from "@/lib/content/company";
import { CONTACT_HREF, RETURN_POLICY_HREF } from "@/lib/content/purchase-terms";
import { buildPolicyMetadata } from "@/lib/seo/policy-metadata";

export const metadata = buildPolicyMetadata("/warranty");

/*
 * The general rules; the product listing holds the specifics. Nothing here
 * sets a warranty length, a remedy or an exclusion of its own: a listing that
 * states a manufacturer or supplier warranty is governed by that warranty's
 * terms, and a listing that states none carries no separate DrivoraParts
 * warranty. Returns stay with the Returns & Refund Policy, and contact goes
 * through the support channels the site already publishes.
 */

const linkClass = "text-accent underline-offset-2 hover:text-accent-hover hover:underline";

const supportChannels = (
  <>
    our{" "}
    <Link href={CONTACT_HREF} prefetch={false} className={linkClass}>
      contact form
    </Link>{" "}
    or by email at{" "}
    <a href={`mailto:${COMPANY_SUPPORT_EMAIL}`} className={linkClass}>
      {COMPANY_SUPPORT_EMAIL}
    </a>
  </>
);

export default function WarrantyPolicyPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-16 leading-relaxed text-neutral-900 md:py-24">
      <Policy
        title="Warranty Policy"
        effectiveDate="September 21, 2026"
        lastUpdated="September 21, 2026"
        intro="Warranty coverage varies by product. Where a manufacturer or supplier warranty applies, coverage is subject to that warranty’s applicable terms. Products without a stated manufacturer or supplier warranty do not receive a separate DrivoraParts warranty unless expressly stated on the product listing."
        sections={[
          {
            heading: "Product-Specific Warranty Coverage",
            paragraphs: [
              "The product listing is the primary source for determining whether a warranty applies to a particular product.",
              "Where a listing identifies a manufacturer, supplier, or other applicable warranty, that warranty’s stated terms govern the coverage.",
              "Warranty duration, exclusions, and other conditions vary by product and are not assumed unless they are specifically stated.",
            ],
          },
          {
            heading: "Manufacturer or Supplier Warranty",
            paragraphs: [
              "When a manufacturer or supplier warranty applies, the claim is subject to the applicable manufacturer’s or supplier’s warranty terms.",
              "You may be asked to provide reasonable information needed to evaluate a warranty claim, which may include:",
            ],
            bullets: [
              "Your order number",
              "The product or part number",
              "A description of the issue",
              "Photographs",
              "Installation information",
              "Other documentation reasonably related to the claim",
            ],
            closing: [
              "Where applicable, the manufacturer or supplier may determine whether a claim qualifies under its warranty terms.",
            ],
          },
          {
            heading: "Products Without a Stated Warranty",
            paragraphs: [
              "If a product listing does not state a manufacturer, supplier, or other applicable warranty, no separate DrivoraParts warranty is provided unless the listing or another applicable written agreement expressly states otherwise.",
              "Not every product sold by DrivoraParts carries a warranty.",
            ],
          },
          {
            heading: "How to Submit a Warranty Request",
            paragraphs: ["If you believe a product may qualify for warranty coverage:"],
            steps: [
              <>Contact DrivoraParts through {supportChannels}.</>,
              "Provide your order number.",
              "Provide the product or part number.",
              "Describe the issue.",
              "Provide photographs or other information if requested.",
              "DrivoraParts will review the product listing and the applicable warranty information.",
              "Where a manufacturer or supplier warranty applies, the claim will be handled according to the applicable warranty terms.",
            ],
            closing: [
              "Submitting a warranty request does not by itself guarantee approval, replacement, refund, or any other particular resolution.",
            ],
          },
          {
            heading: "Installation",
            paragraphs: [
              "You should follow the applicable manufacturer’s installation instructions and requirements.",
              "Where appropriate, professional installation is recommended.",
            ],
          },
          {
            heading: "Warranty and Returns Are Separate",
            paragraphs: [
              "Warranty coverage and returns are separate matters.",
              <>
                A return request is handled according to the DrivoraParts{" "}
                <Link href={RETURN_POLICY_HREF} prefetch={false} className={linkClass}>
                  Returns &amp; Refund Policy
                </Link>
                .
              </>,
              "A warranty request is handled according to the applicable manufacturer, supplier, or expressly stated DrivoraParts warranty terms.",
            ],
          },
          {
            heading: "Contact",
            paragraphs: [
              <>For warranty questions or requests, contact DrivoraParts through {supportChannels}.</>,
            ],
          },
        ]}
      />
    </div>
  );
}
