export const runtime = 'edge';

import Policy from "@/components/policy/Policy";

export default function TermsOfSalePage() {
  return (
    <Policy
      title="Terms of Sale"
      intro="These Terms of Sale govern all purchases of products made through the website and services operated by DrivoraParts LLC (“Company”, “we”, “us”). They describe how orders are placed and accepted, how prices and payments are handled, and the rights and responsibilities of both parties in a sale. By placing an order, you agree to these Terms of Sale in addition to our Terms of Service, Shipping Policy, and Returns & Refund Policy."
      sections={[
        {
          heading: "Application of These Terms",
          paragraphs: [
            "These Terms of Sale apply to every order placed through the Services. They should be read together with our other policies, which are incorporated by reference. If there is any conflict between these Terms of Sale and a specific product listing, the product listing will govern only with respect to the specific product details described.",
          ],
        },
        {
          heading: "Products and Descriptions",
          paragraphs: [
            "We make reasonable efforts to display products, specifications, fitment information, and descriptions accurately. However, availability, specifications, and images may change without notice, and minor variations may occur. Product images are provided for illustration only and may not depict the exact item, color, or configuration you receive.",
          ],
        },
        {
          heading: "Pricing",
          paragraphs: [
            "All prices are displayed in the applicable currency at checkout and may change without notice. Prices do not include shipping charges, duties, or taxes unless expressly stated. In the event of a pricing or description error, we reserve the right to cancel any affected orders, even after they have been confirmed, and to issue a refund where payment has been taken.",
          ],
        },
        {
          heading: "Order Placement and Acceptance",
          paragraphs: [
            "When you place an order, you are making an offer to purchase the selected products subject to these Terms of Sale. A binding contract is formed only when we accept your order and confirm it. We reserve the right to decline, cancel, or limit any order at our discretion, including for reasons such as suspected fraud, stock limitations, or pricing errors.",
          ],
        },
        {
          heading: "Payment",
          paragraphs: [
            "Payment must be received and verified in full before an order is processed and shipped. We use trusted third-party payment processors such as Stripe and PayPal to handle transactions securely. We do not store complete payment card details on our servers. You represent that you are authorized to use the payment method you provide.",
          ],
        },
        {
          heading: "Taxes and Duties",
          paragraphs: [
            "Applicable sales taxes may be calculated and added at checkout based on your location. For international orders, import duties, taxes, and customs fees may be charged upon delivery and are the responsibility of the recipient. These charges are separate from the order total and shipping cost.",
          ],
        },
        {
          heading: "Shipping and Delivery",
          paragraphs: [
            "Shipping and delivery are handled in accordance with our Shipping Policy. Estimated processing and delivery times are provided for convenience and are not guaranteed. Title and risk of loss for products pass to you upon delivery of the products to the carrier or to you, as applicable.",
          ],
        },
        {
          heading: "Returns and Refunds",
          paragraphs: [
            "Returns and refunds are governed by our Returns & Refund Policy, including the 30-day return window, condition requirements, return authorization requirement, and the 5 to 10 business-day refund processing timeframe described there. Please review that policy before making a purchase.",
          ],
        },
        {
          heading: "Warranties",
          paragraphs: [
            "Unless expressly stated in writing, products are sold without any warranty from DrivoraParts LLC. Any applicable manufacturer or third-party warranties are passed through to you to the extent permitted. To the maximum extent permitted by law, we disclaim all implied warranties, including merchantability and fitness for a particular purpose.",
          ],
        },
        {
          heading: "Limitation of Liability",
          paragraphs: [
            "To the maximum extent permitted by law, our total liability arising from or related to any sale is limited to the amount you paid for the product or order giving rise to the claim. We are not liable for any indirect, incidental, or consequential damages arising from the purchase or use of products.",
          ],
        },
        {
          heading: "Contact",
          paragraphs: [
            "For questions about a purchase or these Terms of Sale, contact DrivoraParts LLC at support@drivoraparts.com.",
          ],
        },
      ]}
    />
  );
}
