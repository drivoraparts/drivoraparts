import { buildPolicyMetadata } from "@/lib/seo/policy-metadata";

export const metadata = buildPolicyMetadata("/policies/shipping-policy");

import Policy from "@/components/policy/Policy";
import {
  CALIFORNIA_FULFILLMENT,
  COMPANY_SUPPORT_EMAIL,
  COMPANY_LEGAL_NAME,
  COMPANY_PHONE_DISPLAY,
} from "@/lib/content/company";
import {
  US_FREE_PARCEL_BELOW,
  US_PARCEL_RATE_TABLE,
  US_PARCEL_TABLE_MAX,
  FREIGHT_FLAT_RATE_USD,
} from "@/lib/shipping/rate-table";

/* The published US table, rendered from the same data checkout charges from. */
const usd = (value: number) =>
  `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const US_RATE_LINES = US_PARCEL_RATE_TABLE.map((row) => {
  const range = `${usd(row.minCents / 100)} – ${usd(row.maxCents / 100)}`;
  return `${range}: ${row.feeCents === 0 ? "Free" : usd(row.feeCents / 100)}`;
});
const FREE_BELOW = usd(US_FREE_PARCEL_BELOW);
const TABLE_MAX = usd(US_PARCEL_TABLE_MAX);
const US_FREIGHT = usd(FREIGHT_FLAT_RATE_USD.US);

export default function ShippingPolicyPage() {
  return (
    <Policy
      title="Shipping Policy"
      lastUpdated="November 18, 2026"
      intro={`This Shipping Policy explains how ${COMPANY_LEGAL_NAME} (“DrivoraParts”, “we”, “us”) processes, ships and delivers orders placed through drivoraparts.com. DrivoraParts ships exclusively within the United States. Please review this policy before placing an order; placing an order indicates your acceptance of it.`}
      sections={[
        {
          heading: "United States Only",
          paragraphs: [
            "DrivoraParts currently ships only to addresses within the United States — the 50 states and Washington, DC. International shipping is not available.",
            "We do not ship to Canada, the United Kingdom, Australia, Europe, Africa or any other destination outside the United States. We also do not currently ship to US territories (such as Puerto Rico, Guam or the US Virgin Islands) or to APO, FPO or DPO military addresses.",
            "Checkout accepts only a United States delivery address. An order with a delivery address outside the United States cannot be placed.",
            "Alaska and Hawaii: we ship there, but the published rates below do not apply. Shipping to Alaska and Hawaii is quoted for your order and confirmed with you in writing before payment, and nothing is charged until you have accepted it.",
          ],
        },
        {
          heading: "Order Processing Time",
          paragraphs: [
            "Orders are processed within 1 to 5 business days after payment has been received and verified. Processing involves order review, payment confirmation, fraud screening, picking and packaging.",
            "Processing may take longer during peak periods, holidays, or for items shipped from our supplier network. Orders are generally not processed or shipped on weekends or US public holidays.",
          ],
        },
        {
          heading: "Delivery Estimates",
          paragraphs: [
            "Once an order has been processed, estimated delivery is 5 to 15 business days, subject to product availability and carrier conditions. Remote or rural addresses may need additional transit time.",
            "All delivery timeframes are estimates, not guarantees. They do not include order processing time and can be affected by factors outside our control.",
          ],
        },
        {
          heading: "Shipping Methods and Carriers",
          paragraphs: [
            "We ship using third-party carriers chosen for the weight, dimensions and type of product. The carrier and service are selected by us when your order is prepared.",
          ],
        },
        {
          heading: "Shipping Costs",
          paragraphs: [
            "We do not use live carrier-rate calculation. Shipping to the contiguous United States and Washington, DC is charged from the published rates below, and the charge is shown at checkout before you place your order. It is not changed after the order is placed. All charges are in US dollars.",
            `Standard parcel items: the charge depends on your order subtotal (the total of the item prices, before any discounts). Orders made up only of standard parcel items ship free when the subtotal is under ${FREE_BELOW}. The full table is:`,
          ],
          bullets: US_RATE_LINES,
          closing: [
            `Each product page states how that item ships. Items that ship as freight or in multiple boxes — such as engines, transmissions, truck beds, axles and other oversized or palletized items — are not covered by the parcel rates above. An order that contains at least one such item pays one fixed freight charge of ${US_FREIGHT} for the whole order, instead of the parcel charge. The charge is shown at checkout before you place your order and is the same whatever the order subtotal.`,
            `Orders with a subtotal above ${TABLE_MAX}, and any order needing special freight arrangements (for example liftgate delivery, residential freight or a delivery appointment), are quoted and confirmed with you in writing before payment. Nothing is charged until you have seen and accepted the shipping cost.`,
            "Expedited shipping may be available on some orders, depending on the items and the delivery address. Where it is offered and you accept it, the expedited charge is shown as a separate line in your payment details and is only added if you choose it.",
          ],
        },
        {
          heading: "Where Orders Are Dispatched From",
          paragraphs: [
            `Some orders are picked, packed and dispatched from our California fulfillment location at ${CALIFORNIA_FULFILLMENT.street}, ${CALIFORNIA_FULFILLMENT.city}, ${CALIFORNIA_FULFILLMENT.state} ${CALIFORNIA_FULFILLMENT.postalCode}. Other items ship directly from our supplier network, and an order containing both may arrive in more than one shipment. Each product page states where that item ships from.`,
            "Where an order ships from does not change the shipping charge shown at checkout, and every order is delivered only to the US address you provide.",
          ],
        },
        {
          heading: "Carrier Delays",
          paragraphs: [
            `Delivery may be delayed by incomplete or inaccurate address information, carrier disruptions, severe weather or other circumstances beyond our reasonable control. ${COMPANY_LEGAL_NAME} is not responsible for delays caused by these factors, but we will make reasonable efforts to help resolve delivery issues.`,
          ],
        },
        {
          heading: "Order Tracking",
          paragraphs: [
            "Where tracking is available, we provide tracking information after your order ships. Tracking availability and detail vary by carrier.",
          ],
        },
        {
          heading: "Incorrect or Incomplete Addresses",
          paragraphs: [
            "You are responsible for providing an accurate, current and complete US shipping address at checkout. We are not responsible for orders delayed, returned or misdelivered because of an inaccurate or incomplete address. Additional shipping charges may apply to reship an order returned because of an address error.",
          ],
        },
        {
          heading: "Lost or Damaged Packages",
          paragraphs: [
            "If your package is lost in transit or arrives damaged, contact us promptly with your order number and supporting details (photos of the packaging and the part help) so we can investigate with the carrier. For freight deliveries, please note any visible damage on the delivery receipt before signing.",
          ],
        },
        {
          heading: "Carrier Responsibility",
          paragraphs: [
            `Once an order is handed to a carrier, delivery is subject to the carrier's terms, handling and timelines. ${COMPANY_LEGAL_NAME} is not liable for the acts or omissions of carriers, except as required by applicable law.`,
          ],
        },
        {
          heading: "Questions and Contact",
          paragraphs: [
            `For questions about shipping, delivery or tracking, email ${COMPANY_SUPPORT_EMAIL} or call or text ${COMPANY_PHONE_DISPLAY}.`,
          ],
        },
      ]}
    />
  );
}
