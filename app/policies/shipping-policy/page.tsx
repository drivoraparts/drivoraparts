import { buildPolicyMetadata } from "@/lib/seo/policy-metadata";

export const metadata = buildPolicyMetadata("/policies/shipping-policy");

import Policy from "@/components/policy/Policy";
import { CALIFORNIA_FULFILLMENT, COMPANY_SUPPORT_EMAIL, COMPANY_LEGAL_NAME } from "@/lib/content/company";
import {
  US_FREE_PARCEL_BELOW,
  US_PARCEL_RATE_TABLE,
  US_PARCEL_TABLE_MAX,
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

export default function ShippingPolicyPage() {
  return (
    <Policy
      title="Shipping Policy"
      lastUpdated="October 9, 2026"
      intro={`This Shipping Policy explains how ${COMPANY_LEGAL_NAME} (“Company”, “we”, “us”) processes, ships, and delivers orders placed through our website and services (the “Services”). It also describes estimated timeframes, shipping costs, international shipping, and the responsibilities of both the Company and the customer. Please review this policy carefully before placing an order, as placing an order indicates your acceptance of the terms described here.`}
      sections={[
        {
          heading: "Order Processing Time",
          paragraphs: [
            "Orders are typically processed within 1 to 5 business days after payment has been received and verified. Processing involves order review, payment confirmation, fraud screening, picking, and packaging.",
            "Processing times may be longer during peak periods, sales, promotions, holidays, or for items shipped from partner warehouses or suppliers. Orders are generally not processed or shipped on weekends or public holidays.",
          ],
        },
        {
          heading: "Shipping Time and Delivery Estimates",
          paragraphs: [
            "Once an order has been processed and shipped, estimated delivery typically ranges from 5 to 15 business days, depending on the destination region, the carrier, and the shipping method arranged for your order. Remote or rural destinations may require additional transit time.",
            "All delivery timeframes are estimates only and are not guaranteed. Estimated delivery dates do not include order processing time and may be affected by factors outside our control.",
          ],
        },
        {
          heading: "Shipping Methods and Carriers",
          paragraphs: [
            "We ship using reputable third-party carriers selected based on the destination, weight, dimensions, and type of product. The carrier and service used for your order are chosen by us when the order is prepared.",
          ],
        },
        {
          heading: "Shipping Costs",
          paragraphs: [
            "We do not use live carrier-rate calculation. Standard shipping to the United States is charged from the published rates below, and the charge is shown at checkout before you place your order. It is not changed after the order is placed.",
            `United States, standard parcel items: the charge depends on your order subtotal (the total of the item prices, before any discounts). Orders made up only of standard parcel items ship free when the subtotal is under ${FREE_BELOW}. The full table is:`,
          ],
          bullets: US_RATE_LINES,
          closing: [
            `Each product page states how that item ships. Items that ship as freight or in multiple boxes — such as engines, transmissions, truck beds, axles and other oversized or palletized items — are not covered by the table above. For an order that contains one, the shipping charge is quoted and confirmed with you before payment, and nothing is charged until you have seen it. Checkout tells you this before you place the order.`,
            `Orders with a subtotal above ${TABLE_MAX}, and orders to destinations outside the United States, are also quoted and confirmed with you before payment. Standard shipping may be provided at no charge on eligible orders to the United Kingdom; this is not guaranteed. Orders to Australia and to other international destinations are charged for shipping.`,
            "Expedited shipping is available on some orders, where the destination and the items allow it. It is not offered on every order. Where it is offered and you accept it, the expedited charge is shown as a separate line in your payment details, in addition to the standard or freight charge, and is only added if you choose it.",
            "Any applicable duties or taxes for international orders are calculated separately and are the responsibility of the recipient.",
          ],
        },
        {
          heading: "Delivery Regions",
          paragraphs: [
            "We ship to most domestic and many international destinations. Certain large, heavy, hazardous, or regulated performance components may only be available to specific regions due to carrier restrictions and applicable regulations. If we are unable to ship an item to your location, we will notify you and, where applicable, cancel and refund the affected portion of your order.",
          ],
        },
        {
          heading: "Where Orders Are Dispatched From",
          paragraphs: [
            `Some orders are picked, packed, and dispatched from our California fulfillment location at ${CALIFORNIA_FULFILLMENT.street}, ${CALIFORNIA_FULFILLMENT.city}, ${CALIFORNIA_FULFILLMENT.state} ${CALIFORNIA_FULFILLMENT.postalCode}, ${CALIFORNIA_FULFILLMENT.country}. Other items ship directly from our supplier network, and an order containing both may arrive in more than one shipment. Each product page states where that item ships from.`,
            "Select premium and specialty performance components are sourced, inspected, and dispatched in Japan or Australia before onward delivery to your destination, through the supply and logistics partners we use in those countries. Where an order ships from does not change the shipping charge you are quoted, which is worked out for the order as a whole.",
          ],
        },
        {
          heading: "International Shipping",
          paragraphs: [
            "International delivery times vary significantly depending on the destination country and local customs processing. International orders may be subject to import duties, taxes, brokerage fees, and other customs charges imposed by the destination country.",
            "These charges are determined by the destination country's authorities, are not included in the order total or shipping cost, and are the sole responsibility of the recipient. We have no control over these charges and cannot predict their amount.",
          ],
        },
        {
          heading: "Customs and Carrier Delays",
          paragraphs: [
            `Delivery may be delayed by customs inspections, incomplete or inaccurate address information, carrier disruptions, severe weather, or other circumstances beyond our reasonable control. ${COMPANY_LEGAL_NAME} is not responsible for delays caused by these factors, but we will make reasonable efforts to assist you in resolving delivery issues.`,
          ],
        },
        {
          heading: "Order Tracking",
          paragraphs: [
            "Where tracking is available, we will provide tracking information after your order ships so you can monitor its progress. Tracking availability and the level of detail provided may vary by carrier and destination.",
          ],
        },
        {
          heading: "Incorrect or Incomplete Addresses",
          paragraphs: [
            "You are responsible for providing an accurate, current, and complete shipping address at checkout. We are not responsible for orders that are delayed, returned, or delivered incorrectly due to an inaccurate or incomplete address. Additional shipping charges may apply to reship orders returned due to address errors.",
          ],
        },
        {
          heading: "Lost or Damaged Packages",
          paragraphs: [
            "If your package is lost in transit or arrives damaged, please contact us promptly with your order number and supporting details so that we can investigate with the carrier. While we will make reasonable efforts to assist, responsibility for packages lost or damaged by carriers after they leave our facility generally rests with the carrier, except as required by applicable law.",
          ],
        },
        {
          heading: "Carrier Responsibility Limitations",
          paragraphs: [
            `Once an order is handed over to a carrier, delivery is subject to the carrier's terms, handling, and timelines. ${COMPANY_LEGAL_NAME} is not liable for the acts or omissions of carriers, including delays, mishandling, or loss occurring while the package is in the carrier's possession.`,
          ],
        },
        {
          heading: "Questions and Contact",
          paragraphs: [
            `For any questions regarding shipping, delivery, or tracking, please contact us at ${COMPANY_SUPPORT_EMAIL}.`,
          ],
        },
      ]}
    />
  );
}
