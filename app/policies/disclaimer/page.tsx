import Policy from "@/components/policy/Policy";

export default function DisclaimerPage() {
  return (
    <Policy
      title="Disclaimer"
      intro="The information, products, and content provided by DrivoraParts LLC (“Company”, “we”, “us”) through our website and services (the “Services”) are offered for general commercial use. This Disclaimer explains the limits of the information we provide, the nature of the products we sell, and the responsibilities of customers and third parties. By using the Services, you acknowledge and accept the disclaimers set out below."
      sections={[
        {
          heading: "General Information Disclaimer",
          paragraphs: [
            "All information on the Services is provided in good faith and for general informational purposes. While we make reasonable efforts to keep information accurate and up to date, we make no representation or warranty of any kind, express or implied, regarding the accuracy, completeness, reliability, or suitability of any information or content on the Services.",
          ],
        },
        {
          heading: "Product Accuracy",
          paragraphs: [
            "We strive to describe products, specifications, fitment, compatibility, and pricing accurately. However, we do not warrant that product descriptions or other content are complete, current, or error-free. It is your responsibility to verify fitment, compatibility, and suitability before purchasing and installing any product.",
          ],
        },
        {
          heading: "Performance Parts Notice",
          paragraphs: [
            "Many products sold through the Services are high-performance automotive components intended for specific applications. Some components may be intended for off-road, track, or competition use only and may not be legal for use on public roads. You are solely responsible for determining and complying with all laws and regulations applicable to the purchase, installation, and use of these products in your jurisdiction.",
          ],
        },
        {
          heading: "Use at Your Own Risk",
          paragraphs: [
            "Your use of the Services and any products purchased through them is entirely at your own risk. We are not responsible for any damage, injury, or loss that results from the installation, use, or misuse of products, or from reliance on any information provided through the Services.",
          ],
        },
        {
          heading: "No Warranty of Outcomes",
          paragraphs: [
            "We do not guarantee any specific results, performance gains, durability, or outcomes from the use of any product. Actual results depend on numerous factors beyond our control, including installation quality, tuning, vehicle condition, maintenance, and operating conditions.",
          ],
        },
        {
          heading: "Installation and Professional Advice",
          paragraphs: [
            "Information on the Services is not a substitute for professional installation, inspection, or advice. We strongly recommend that components be installed, configured, and tuned by qualified professionals. Improper installation or use may cause damage or injury for which DrivoraParts LLC is not responsible.",
          ],
        },
        {
          heading: "Third-Party Supplier Responsibility",
          paragraphs: [
            "Some products may be sourced from, manufactured by, or fulfilled by third-party suppliers or manufacturers. DrivoraParts LLC is not responsible for the manufacturing defects, representations, warranties, or conduct of external suppliers beyond what is required by applicable law. Manufacturer warranties, where they exist, are provided by the respective manufacturers.",
          ],
        },
        {
          heading: "Shipping Delays Disclaimer",
          paragraphs: [
            "Estimated processing and delivery times are provided for convenience only and are not guaranteed. We are not responsible for delays caused by carriers, customs, weather, or other circumstances beyond our reasonable control. Please refer to our Shipping Policy for more information.",
          ],
        },
        {
          heading: "External Links",
          paragraphs: [
            "The Services may contain links to third-party websites or resources that are not owned or controlled by DrivoraParts LLC. We are not responsible for the content, products, services, or practices of any third-party sites, and the inclusion of any link does not imply endorsement.",
          ],
        },
        {
          heading: "Limitation of Responsibility",
          paragraphs: [
            "To the maximum extent permitted by law, DrivoraParts LLC disclaims all liability for any loss or damage, whether direct or indirect, arising from reliance on information, the purchase or use of products, the conduct of external suppliers, or your use of the Services.",
          ],
        },
        {
          heading: "Contact",
          paragraphs: [
            "If you have questions about this Disclaimer, contact DrivoraParts LLC at support@drivoraparts.com.",
          ],
        },
      ]}
    />
  );
}
