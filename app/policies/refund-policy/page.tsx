export const runtime = 'edge';

import Policy from "@/components/policy/Policy";

export default function RefundPolicyPage() {
  return (
    <Policy
      title="Returns & Refund Policy"
      intro="DrivoraParts LLC (“Company”, “we”, “us”) wants you to be confident in your purchase. This Returns & Refund Policy explains the conditions under which you may return a product, how to request a return, and how refunds are processed. These rules apply consistently to all eligible products sold through our website and services (the “Services”). By placing an order, you agree to the terms of this policy."
      sections={[
        {
          heading: "Return Window",
          paragraphs: [
            "You may request a return within 30 days from the delivery date only. Requests submitted after this 30-day window will not be eligible for a return or refund, except where required by applicable law. The delivery date is determined by carrier tracking records where available.",
          ],
        },
        {
          heading: "Condition Requirements",
          paragraphs: [
            "To be eligible for a return, items must meet the following condition requirements:",
          ],
          bullets: [
            "The item must be unused, uninstalled, and in its original, resalable condition.",
            "The item must be returned in its original packaging, with all labels, manuals, and accessories included.",
            "Proof of purchase, such as an order number or receipt, is required for every return.",
            "The item must not show signs of installation, wear, modification, or damage caused after delivery.",
          ],
        },
        {
          heading: "Return Authorization Required",
          paragraphs: [
            "All returns must be authorized by DrivoraParts LLC before you ship any item back to us. To request a return, contact us with your order number and the reason for your return. We will review your request and, if approved, provide return instructions and a return authorization.",
            "Items sent back without prior return authorization may be refused, returned to you, or may not qualify for a refund. Please do not ship any item until your return has been approved.",
          ],
        },
        {
          heading: "Refund Approval Process",
          paragraphs: [
            "After your return is authorized and we receive the returned item, we will inspect it to confirm that it meets the condition requirements described above. Once the inspection is complete, we will notify you whether your refund has been approved or rejected. If a returned item does not meet the condition requirements, we may decline the refund or apply a deduction.",
          ],
        },
        {
          heading: "Refund Processing Time",
          paragraphs: [
            "Approved refunds are processed within 5 to 10 business days after approval. Refunds are issued to the original payment method used for the purchase. The time it takes for the refunded amount to appear in your account depends on your bank or payment provider and is outside our control.",
          ],
        },
        {
          heading: "Non-Returnable Items",
          paragraphs: [
            "For safety, hygiene, and resale reasons, certain items are not eligible for return, including but not limited to the following:",
          ],
          bullets: [
            "Electronics that have been installed, used, wired, or activated.",
            "Products that have been damaged by the user through misuse, improper installation, or neglect.",
            "Special-order, custom-built, or made-to-order items.",
            "Items explicitly marked as final sale or clearance at the time of purchase.",
          ],
        },
        {
          heading: "Return Shipping Responsibility",
          paragraphs: [
            "Unless the return is the result of our error or a confirmed defective product, the customer is responsible for the cost of return shipping. We recommend using a trackable and insured shipping method, as we cannot issue refunds for returns that are lost or damaged in transit before reaching us.",
          ],
        },
        {
          heading: "Damaged or Defective Items",
          paragraphs: [
            "If you receive an item that is damaged, defective, or incorrect, please contact us promptly, ideally within a few days of delivery, with your order number and supporting photographs. We will work with you to arrange a replacement, exchange, or refund in accordance with this policy and applicable law.",
          ],
        },
        {
          heading: "Restocking Fees",
          paragraphs: [
            "A reasonable restocking fee may apply to certain returns, particularly for large or specialized components. Any applicable restocking fee will be clearly communicated to you before the return is finalized.",
          ],
        },
        {
          heading: "Order Cancellations",
          paragraphs: [
            "If you wish to cancel an order, please contact us as soon as possible. We can usually cancel an order that has not yet entered processing or shipping. Once an order has shipped, it must be handled through the return process described in this policy.",
          ],
        },
        {
          heading: "Consistency Across Products",
          paragraphs: [
            "The rules described in this policy, including the 30-day return window, condition requirements, return authorization requirement, and refund timeframe, apply consistently across all eligible products sold through the Services, except where a product is specifically identified as non-returnable.",
          ],
        },
        {
          heading: "Contact",
          paragraphs: [
            "For return and refund requests or questions, contact DrivoraParts LLC at support@drivoraparts.com.",
          ],
        },
      ]}
    />
  );
}
