import Link from "next/link";
import { buildPolicyMetadata } from "@/lib/seo/policy-metadata";
import Policy from "@/components/policy/Policy";
import { COMPANY_DISPLAY_NAME, COMPANY_SUPPORT_EMAIL } from "@/lib/content/company";
import {
  CONTACT_HREF,
  RETURN_POLICY_HREF,
  SHIPPING_POLICY_HREF,
  REFUND_PROCESSING,
} from "@/lib/content/purchase-terms";

export const metadata = buildPolicyMetadata("/policies/buyer-protection");

const linkClass =
  "font-semibold text-accent underline-offset-2 hover:text-accent-hover hover:underline";

/*
 * DrivoraParts' own commitment, and nothing more.
 *
 * Every remedy here is one the Returns & Refund Policy, the Shipping Policy or
 * the Terms of Sale already provides; this page gathers them under one name
 * and says plainly what to do. It adds no warranty, insurance, escrow or
 * chargeback promise, and no deadline the refund policy does not already set.
 *
 * It says nothing about any payment provider's protection except that those
 * programs, where they exist, are separate and differ by method. See
 * lib/content/buyer-protection.ts for the short wording used at checkout.
 */
export default function BuyerProtectionPage() {
  return (
    <Policy
      title="Buyer Protection"
      effectiveDate="October 5, 2026"
      lastUpdated="October 5, 2026"
      intro={`Buying an engine, transmission or other major part online takes trust. ${COMPANY_DISPLAY_NAME} Buyer Protection is our own commitment to you: if we accept your payment for an order and we cannot fulfill our obligations under that order, we will make it right through the remedies described in our policies, including an applicable refund.`}
      sections={[
        {
          heading: "What this policy is",
          paragraphs: [
            "Buyer Protection is DrivoraParts' own customer commitment. It brings together the remedies already set out in our Returns & Refund Policy, Shipping Policy and Terms of Sale, and explains how to ask for help.",
            "It is not insurance, escrow, a warranty, or a program run by a payment provider or any other third party, and it does not replace your rights under applicable law.",
          ],
        },
        {
          heading: "Situations we will put right",
          paragraphs: [
            "Where an order you have paid for falls into one of these situations, contact us and we will resolve it with an applicable refund or replacement, in line with this policy and the policies it refers to:",
          ],
          bullets: [
            "DrivoraParts is unable to fulfill an order you have paid for.",
            "The wrong item is sent because of a DrivoraParts error.",
            "The item you receive materially differs from the order we confirmed with you.",
            "An eligible order is cancelled under the cancellation and refund terms in our policies.",
            "Another legitimate fulfillment problem that our Returns & Refund Policy covers, such as an item that arrives damaged or defective.",
          ],
        },
        {
          heading: "The remedies",
          paragraphs: [
            "Depending on the situation, and on what is available, the remedy is a replacement, an exchange or a refund. Where a refund applies, it is issued to the original payment method used for the order.",
            `Approved refunds are processed within ${REFUND_PROCESSING} after approval. How quickly the money then appears depends on your bank or payment provider, which we do not control.`,
            "If we cannot ship the item you ordered, we will tell you. Unless you choose to wait or accept an alternative we offer, we will cancel the affected part of the order and refund what you paid for it.",
          ],
        },
        {
          heading: "How to ask for help",
          paragraphs: [
            <>
              Contact us at{" "}
              <a href={`mailto:${COMPANY_SUPPORT_EMAIL}`} className={linkClass}>
                {COMPANY_SUPPORT_EMAIL}
              </a>{" "}
              or through our{" "}
              <Link href={CONTACT_HREF} prefetch={false} className={linkClass}>
                contact page
              </Link>
              , with your order number and a description of the problem. For damaged, defective or incorrect items, please include photographs, and contact us promptly after delivery.
            </>,
            "We review each request and tell you what we will do. Please do not ship anything back until we have given you a return authorization, so the parcel can be matched to your order.",
          ],
        },
        {
          heading: "What this policy does not cover",
          paragraphs: [
            "Buyer Protection does not extend the remedies in our other policies. In particular, it does not cover:",
          ],
          bullets: [
            "Changes of mind, which are handled under the return window and condition requirements in the Returns & Refund Policy.",
            "Items ordered in error by the customer, including a part that does not fit the vehicle because the wrong application was selected.",
            "Damage caused after delivery by installation, misuse, modification or neglect.",
            "Delays caused by carriers, customs or other circumstances outside our control, which are covered by the Shipping Policy.",
            "Items that our policies identify as non-returnable, such as special-order or made-to-order items, except where the problem is our error.",
            "Product warranties. Any warranty is stated on the product listing and in the Warranty Policy.",
          ],
        },
        {
          heading: "Payment methods and other protections",
          paragraphs: [
            "Buyer Protection comes from DrivoraParts and does not depend on which payment method you choose. Each payment method is operated by its own provider under its own terms, and any protection a provider offers differs by method and is separate from this policy. DrivoraParts does not state that a payment method carries protection from its provider.",
          ],
        },
        {
          heading: "Limits",
          paragraphs: [
            "Every request is assessed on its facts under this policy, our other policies and applicable law. This policy is not a promise that a particular outcome will follow in every circumstance, and it does not oblige us to refund an order that is not covered by it.",
          ],
        },
        {
          heading: "Related policies",
          paragraphs: [
            <>
              Please read this page together with the{" "}
              <Link href={RETURN_POLICY_HREF} prefetch={false} className={linkClass}>
                Returns &amp; Refund Policy
              </Link>
              , the{" "}
              <Link href={SHIPPING_POLICY_HREF} prefetch={false} className={linkClass}>
                Shipping Policy
              </Link>{" "}
              and the{" "}
              <Link href="/policies/terms-of-sale" prefetch={false} className={linkClass}>
                Terms of Sale
              </Link>
              .
            </>,
          ],
        },
      ]}
    />
  );
}
