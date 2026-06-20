import Policy from "@/components/policy/Policy";

export default function ShippingPolicyPage() {
  return (
    <Policy
      title="Shipping Policy"
      intro="This Shipping Policy explains how DrivoraParts LLC (“Company”, “we”, “us”) processes, ships, and delivers orders placed through our website and services (the “Services”). It also describes estimated timeframes, shipping costs, international shipping, and the responsibilities of both the Company and the customer. Please review this policy carefully before placing an order, as placing an order indicates your acceptance of the terms described here."
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
            "Once an order has been processed and shipped, estimated delivery typically ranges from 5 to 15 business days, depending on the destination region, the carrier, and the shipping method selected at checkout. Remote or rural destinations may require additional transit time.",
            "All delivery timeframes are estimates only and are not guaranteed. Estimated delivery dates do not include order processing time and may be affected by factors outside our control.",
          ],
        },
        {
          heading: "Shipping Methods and Carriers",
          paragraphs: [
            "We ship using reputable third-party carriers selected based on the destination, weight, dimensions, and type of product. The available shipping methods and associated costs are presented to you at checkout before you complete your purchase.",
          ],
        },
        {
          heading: "Shipping Costs",
          paragraphs: [
            "Shipping costs are calculated and displayed at checkout based on the destination, package weight and dimensions, and the shipping method chosen. Any applicable duties or taxes for international orders are calculated separately and are the responsibility of the recipient.",
          ],
        },
        {
          heading: "Delivery Regions",
          paragraphs: [
            "We ship to most domestic and many international destinations. Certain large, heavy, hazardous, or regulated performance components may only be available to specific regions due to carrier restrictions and applicable regulations. If we are unable to ship an item to your location, we will notify you and, where applicable, cancel and refund the affected portion of your order.",
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
            "Delivery may be delayed by customs inspections, incomplete or inaccurate address information, carrier disruptions, severe weather, or other circumstances beyond our reasonable control. DrivoraParts LLC is not responsible for delays caused by these factors, but we will make reasonable efforts to assist you in resolving delivery issues.",
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
            "Once an order is handed over to a carrier, delivery is subject to the carrier's terms, handling, and timelines. DrivoraParts LLC is not liable for the acts or omissions of carriers, including delays, mishandling, or loss occurring while the package is in the carrier's possession.",
          ],
        },
        {
          heading: "Questions and Contact",
          paragraphs: [
            "For any questions regarding shipping, delivery, or tracking, please contact DrivoraParts LLC at support@drivoraparts.com.",
          ],
        },
      ]}
    />
  );
}
