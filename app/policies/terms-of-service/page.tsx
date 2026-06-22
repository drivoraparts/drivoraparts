import Policy from "@/components/policy/Policy";

export default function TermsOfServicePage() {
  return (
    <Policy
      title="Terms of Service"
      intro="These Terms of Service (“Terms”) constitute a legally binding agreement between you and DrivoraParts LLC (“Company”, “we”, “us”) and govern your access to and use of the website and services we operate (collectively, the “Services”). These Terms apply to all visitors, users, and customers of the Services. By accessing, browsing, or using the Services, or by placing an order, you acknowledge that you have read, understood, and agree to be bound by these Terms. If you do not agree with these Terms, you must not access or use the Services."
      sections={[
        {
          heading: "Acceptance of Terms",
          paragraphs: [
            "By using the Services, you confirm that you accept these Terms and that you agree to comply with them. If you are using the Services on behalf of a business or other entity, you represent that you have the authority to bind that entity to these Terms.",
            "These Terms should be read together with our Privacy Policy, Terms of Sale, Acceptable Use Policy, and other policies referenced on the Services, all of which are incorporated by reference.",
          ],
        },
        {
          heading: "Eligibility",
          paragraphs: [
            "You must be at least 18 years old, or the age of legal majority in your jurisdiction, and capable of forming a legally binding contract to use the Services. By using the Services, you represent and warrant that you meet these eligibility requirements and that all information you provide is accurate and complete.",
          ],
        },
        {
          heading: "Account Registration and Responsibility",
          paragraphs: [
            "Some features may require you to create an account or provide information during checkout. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.",
            "You agree to provide accurate, current, and complete information and to keep it up to date. You must notify us promptly of any unauthorized use of your account or any other breach of security. We are not liable for any loss arising from unauthorized use of your account.",
          ],
        },
        {
          heading: "Use of the Services",
          paragraphs: [
            "You may use the Services only for lawful purposes and in accordance with these Terms. You agree not to use the Services in any manner that could damage, disable, overburden, or impair the Services, or interfere with any other party's use of the Services.",
          ],
        },
        {
          heading: "Prohibited Activities",
          paragraphs: [
            "When using the Services, you agree that you will not engage in any of the following prohibited activities:",
          ],
          bullets: [
            "Fraudulent activity, including placing fake orders or engaging in chargeback abuse.",
            "Attempting to gain unauthorized access to the Services, other accounts, or our systems.",
            "Scraping, harvesting, or using automated tools to collect data without our permission.",
            "Reverse engineering, copying, or replicating the Services or their design.",
            "Uploading or transmitting viruses, malware, or other harmful code.",
            "Using the Services to violate any applicable law or the rights of any third party.",
          ],
        },
        {
          heading: "Orders and Order Acceptance",
          paragraphs: [
            "All orders placed through the Services are offers to purchase and are subject to acceptance and availability. A binding contract is formed only when we accept and confirm your order. We reserve the right to refuse, cancel, or limit any order at our sole discretion, including orders that appear fraudulent, that exceed quantity limits, or that result from errors.",
          ],
        },
        {
          heading: "Pricing and Modification Rights",
          paragraphs: [
            "Prices for products are subject to change without notice. We reserve the right to modify or discontinue products, features, or the Services at any time. Despite our best efforts, products may occasionally be mispriced or inaccurately described. We reserve the right to correct any errors and to cancel any affected orders, even after an order has been submitted or confirmed.",
          ],
        },
        {
          heading: "Service Availability",
          paragraphs: [
            "We strive to keep the Services available and operational, but we do not guarantee that the Services will be uninterrupted, timely, secure, or error-free. The Services may be temporarily unavailable due to maintenance, updates, technical issues, or circumstances beyond our reasonable control.",
          ],
        },
        {
          heading: "Intellectual Property",
          paragraphs: [
            "All content on the Services, including text, graphics, logos, images, page layouts, and software, is the property of DrivoraParts LLC or its licensors and is protected by applicable intellectual property laws. You may not reproduce, distribute, modify, or create derivative works from any content without our prior written permission.",
          ],
        },
        {
          heading: "Third-Party Links and Content",
          paragraphs: [
            "The Services may contain links to third-party websites or resources. We do not control and are not responsible for the content, products, or practices of any third-party sites. Your use of third-party websites is at your own risk and subject to their terms and policies.",
          ],
        },
        {
          heading: "Disclaimer of Warranties",
          paragraphs: [
            "To the maximum extent permitted by law, the Services and all products and content are provided on an “as-is” and “as-available” basis without warranties of any kind, whether express or implied, including implied warranties of merchantability, fitness for a particular purpose, and non-infringement.",
          ],
        },
        {
          heading: "Limitation of Liability",
          paragraphs: [
            "To the maximum extent permitted by law, DrivoraParts LLC shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from or related to your use of the Services. Our total aggregate liability for any claim shall not exceed the amount you paid for the product or order giving rise to the claim.",
          ],
        },
        {
          heading: "Indemnification",
          paragraphs: [
            "You agree to indemnify, defend, and hold harmless DrivoraParts LLC and its officers, employees, and agents from and against any claims, liabilities, damages, losses, and expenses arising out of your violation of these Terms or your misuse of the Services.",
          ],
        },
        {
          heading: "Suspension and Termination",
          paragraphs: [
            "We may suspend or terminate your access to the Services at any time, with or without notice, for conduct that we believe violates these Terms, harms other users, or is otherwise unlawful or harmful to our business. Upon termination, the provisions of these Terms that by their nature should survive will continue to apply.",
          ],
        },
        {
          heading: "Dispute Resolution and Governing Law",
          paragraphs: [
            "These Terms are governed by the laws of the United States and the state in which DrivoraParts LLC is organized, without regard to conflict-of-law principles. You agree that any dispute arising out of or relating to these Terms or the Services will first be addressed through good-faith negotiation, and that any formal proceedings will be brought in the courts having jurisdiction in that location, unless otherwise required by applicable law.",
          ],
        },
        {
          heading: "Changes to These Terms",
          paragraphs: [
            "We may revise these Terms from time to time. The dates shown above indicate the most recent revision. Your continued use of the Services after the changes become effective constitutes your acceptance of the revised Terms.",
          ],
        },
        {
          heading: "Contact",
          paragraphs: [
            "Questions about these Terms may be sent to DrivoraParts LLC at support@drivoraparts.com.",
          ],
        },
      ]}
    />
  );
}
