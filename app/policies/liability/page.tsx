import Policy from "@/components/policy/Policy";
import { COMPANY_NAME, COMPANY_SUPPORT_EMAIL } from "@/lib/content/company";

export default function LiabilityPage() {
  return (
    <Policy
      title="Limitation of Liability"
      intro="This Limitation of Liability policy describes the extent of the responsibility and liability of DrivoraParts LLC (“Company”, “we”, “us”) in connection with your access to and use of our website, services, and products (the “Services”). It applies to the maximum extent permitted by applicable law and forms part of our agreement with you. By using the Services, you agree to the limitations described below."
      sections={[
        {
          heading: "As-Is Service",
          paragraphs: [
            "The Services and all products and content are provided on an “as-is” and “as-available” basis, without warranties of any kind, whether express or implied, including implied warranties of merchantability, fitness for a particular purpose, title, and non-infringement, except as expressly required by applicable law.",
          ],
        },
        {
          heading: "No Guarantee of Uninterrupted Service",
          paragraphs: [
            "We do not warrant or guarantee that the Services will be uninterrupted, timely, secure, or error-free, or that defects will be corrected. The Services may be unavailable from time to time due to maintenance, updates, technical issues, or factors beyond our reasonable control, and we are not liable for any such unavailability.",
          ],
        },
        {
          heading: "Limitation of Liability",
          paragraphs: [
            "To the maximum extent permitted by law, DrivoraParts LLC, together with its officers, employees, agents, and partners, shall not be liable for any damages arising out of or in connection with your use of, or inability to use, the Services or any products purchased through them.",
          ],
        },
        {
          heading: "No Responsibility for Indirect Damages",
          paragraphs: [
            "In no event shall DrivoraParts LLC be liable for any indirect, incidental, special, consequential, exemplary, or punitive damages, including loss of profits, revenue, data, goodwill, or other intangible losses, even if we have been advised of the possibility of such damages.",
          ],
        },
        {
          heading: "Maximum Liability Cap",
          paragraphs: [
            "Where liability cannot be fully excluded, the total aggregate liability of DrivoraParts LLC for any claim arising out of or relating to the Services or a product shall not exceed the total amount you actually paid for the specific product or order giving rise to the claim.",
          ],
        },
        {
          heading: "Product Use and Installation",
          paragraphs: [
            "DrivoraParts LLC is not responsible or liable for any damage, injury, or loss resulting from the improper installation, misuse, modification, or use of products contrary to manufacturer guidance, professional recommendations, or applicable law. You assume all risk associated with the installation and use of products.",
          ],
        },
        {
          heading: "Shipping Carrier Liability Disclaimer",
          paragraphs: [
            "Once products are handed over to a shipping carrier, delivery is subject to the carrier's terms, handling, and responsibility. DrivoraParts LLC is not liable for the acts or omissions of carriers, including delays, mishandling, loss, or damage occurring while a package is in the carrier's possession, except as required by law.",
          ],
        },
        {
          heading: "Third-Party Products and Services",
          paragraphs: [
            "We are not liable for the acts, omissions, products, or services of third parties, including manufacturers, suppliers, payment processors, and operators of linked websites. Any dealings you have with third parties are solely between you and the relevant third party.",
          ],
        },
        {
          heading: "Force Majeure",
          paragraphs: [
            "DrivoraParts LLC shall not be liable for any failure or delay in performance resulting from events beyond our reasonable control, including natural disasters, fire, flood, pandemics, carrier or supplier disruptions, labor disputes, utility or network failures, or governmental actions.",
          ],
        },
        {
          heading: "Responsibility Disclaimer",
          paragraphs: [
            "You assume full responsibility for your use of the Services and products, including verifying fitment, legality, compliance, and suitability for your intended purpose, and for ensuring that installation and use comply with all applicable laws.",
          ],
        },
        {
          heading: "Jurisdictional Limits",
          paragraphs: [
            "Some jurisdictions do not allow the exclusion or limitation of certain warranties or damages. In such cases, the exclusions and limitations in this policy will apply only to the extent permitted by applicable law, and our liability will be limited to the smallest amount permitted.",
          ],
        },
        {
          heading: "Contact",
          paragraphs: [
            `For questions about this Limitation of Liability policy, contact ${COMPANY_NAME} at ${COMPANY_SUPPORT_EMAIL}.`,
          ],
        },
      ]}
    />
  );
}
