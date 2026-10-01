import Link from "next/link";
import { buildPolicyMetadata } from "@/lib/seo/policy-metadata";
import Policy from "@/components/policy/Policy";
import { COMPANY_SUPPORT_EMAIL } from "@/lib/content/company";
import { PAYPAL_DISCLOSURE } from "@/lib/content/manual-payment";
import { DIRECT_PAYMENT_METHODS, listWithOr } from "@/lib/content/purchase-terms";

export const metadata = buildPolicyMetadata("/policies/manual-payment");

const linkClass =
  "font-semibold text-accent underline-offset-2 hover:text-accent-hover hover:underline";

/*
 * Every statement here describes something the code does. The five steps are
 * the manual-payment flow as built: an order is created pending, an admin
 * prepares and sends instructions (with shipping), the customer pays and
 * uploads a receipt, and an admin verifies before the order moves on. The
 * reasons given are the ones the Shipping Policy already states -- shipping is
 * worked out by hand per order and sent with the payment details.
 *
 * What is deliberately absent: any mention of a bank, regulator, processor,
 * fraud rule or security standard as the reason. None of them is why this flow
 * exists, so none of them is claimed.
 *
 * The method list is read from the same config checkout reads, so disabling a
 * method there takes it out of this sentence too.
 */
export default function ManualPaymentPage() {
  const methods = listWithOr(DIRECT_PAYMENT_METHODS);

  return (
    <Policy
      title="Manual Payment"
      effectiveDate="October 1, 2026"
      lastUpdated="October 1, 2026"
      intro={`Orders paid by ${methods} use a manual payment process. Each order is reviewed by a person, and shipping is worked out for that specific order, so the amount you pay is confirmed after review and sent together with your payment details. You see the final figure before any payment is made. This page explains each step.`}
      sections={[
        {
          heading: "Place your order",
          paragraphs: [
            "Add your items, enter your shipping details and choose a payment method at checkout. Placing the order does not charge you, and your items are held while the order is reviewed.",
          ],
        },
        {
          heading: "Order review",
          paragraphs: [
            "DrivoraParts reviews your order and confirms the payment and shipping details that apply to it.",
          ],
        },
        {
          heading: "Payment instructions",
          paragraphs: [
            "We email you the payment instructions for the method you selected. The same instructions appear on your order page. They include the final amount due, with shipping.",
          ],
        },
        {
          heading: "Payment",
          paragraphs: [
            "Pay using those instructions, then upload your receipt on your order page so the payment can be matched to your order.",
          ],
        },
        {
          heading: "Verification",
          paragraphs: [
            "DrivoraParts verifies the payment before your order moves into fulfillment. Nothing ships until payment has been verified.",
          ],
        },
        {
          heading: "Shipping and the amount due",
          paragraphs: [
            "Shipping is calculated manually for each order and sent with your payment details. The final amount due is confirmed in those details before you pay.",
            <>
              How shipping is worked out, and when it may be free, is set out in the{" "}
              <Link href="/policies/shipping-policy" prefetch={false} className={linkClass}>
                Shipping Policy
              </Link>
              .
            </>,
          ],
        },
        {
          heading: "Payment methods and their conditions",
          paragraphs: [
            "Each payment method is run by its own provider and comes with that provider's terms. The instructions we send explain how to pay with the method you selected. Please read them before you send payment, and contact us first if anything is unclear.",
            "Bank transfer asks you to choose a transfer route at checkout, so that we send the account details that suit where you are paying from.",
          ],
        },
        {
          heading: "PayPal",
          paragraphs: [PAYPAL_DISCLOSURE.body],
        },
        {
          heading: "Cryptocurrency",
          paragraphs: [
            "Cryptocurrency is paid through NOWPayments. A NOWPayments payment page opens when you place the order, so it does not follow the steps above. The checkout page explains how that works.",
          ],
        },
        {
          heading: "Questions",
          paragraphs: [
            `If you have a question about paying for your order, contact us at ${COMPANY_SUPPORT_EMAIL} and include your order number.`,
          ],
        },
      ]}
    />
  );
}
