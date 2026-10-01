import { buildPolicyMetadata } from "@/lib/seo/policy-metadata";

export const metadata = buildPolicyMetadata("/policies/privacy-policy");

import Policy from "@/components/policy/Policy";
import {
  COMPANY_ADDRESS,
  COMPANY_DISPLAY_NAME,
  COMPANY_LEGAL_NAME,
  COMPANY_SUPPORT_EMAIL,
} from "@/lib/content/company";

export default function PrivacyPolicyPage() {
  return (
    <Policy
      title="Privacy Policy"
      lastUpdated="October 1, 2026"
      intro={`${COMPANY_LEGAL_NAME} (“Company”, “we”, “us”, or “our”) operates this website and the related e-commerce services (collectively, the “Services”). This Privacy Policy describes in detail how we collect, use, store, share, and protect your personal information when you visit our website, create an account, place an order, or otherwise interact with us. We are committed to handling your information responsibly and transparently. By accessing or using the Services, you acknowledge that you have read and understood this Privacy Policy and agree to the practices described below. If you do not agree with this Privacy Policy, please do not use the Services.`}
      sections={[
        {
          heading: "Scope of This Policy",
          paragraphs: [
            `${COMPANY_DISPLAY_NAME} is operated by ${COMPANY_LEGAL_NAME}, the business responsible for the personal information collected through the Services.`,
            `This Privacy Policy applies to all visitors, registered users, and customers of the Services, and to all personal information that ${COMPANY_LEGAL_NAME} collects through the website, checkout process, customer support channels, and related business operations.`,
            "This Privacy Policy does not apply to third-party websites, services, or applications that may be linked from our Services. Those third parties operate under their own privacy policies, and we encourage you to review them before providing any personal information.",
          ],
        },
        {
          heading: "Information We Collect",
          paragraphs: [
            "We collect information that you provide to us directly, information that is generated automatically as you use the Services, and information we receive from third parties such as payment processors and shipping carriers. The categories of information we may collect include the following:",
          ],
          bullets: [
            "Identity and contact data: your name, email address, telephone number, billing address, and shipping address.",
            "Account data: login credentials and preferences if you create an account.",
            "Order and transaction data: products purchased, order totals, order history, and related communications.",
            "Payment data: the payment method you selected, the amount, currency and status of your payment, any reference issued by the payment provider, the payment instructions and messages associated with your order, and any receipt you choose to upload as proof of payment.",
            "Device and technical data: IP address, browser type, device type, operating system, language settings, and referring URLs.",
            "Usage data: pages viewed, items added to the cart, search queries, and interactions with content on the Services.",
            "Cookie data: identifiers and preferences stored through cookies and similar technologies.",
          ],
        },
        {
          heading: "How We Collect Information",
          paragraphs: [
            "We collect information directly from you when you create an account, place an order, contact customer support, or sign up for communications. We collect information automatically through cookies, server logs, and analytics tools as you navigate the Services. We may also receive information from third-party service providers, such as confirmation of a successful payment from a payment processor or delivery status from a shipping carrier.",
          ],
        },
        {
          heading: "How We Use Your Information",
          paragraphs: [
            "We use the information we collect for legitimate business purposes related to operating the Services, including the following:",
          ],
          bullets: [
            "To process, fulfill, ship, and deliver your orders.",
            "To create and manage your account and authenticate your access.",
            "To provide customer support and respond to your questions and requests.",
            "To detect, prevent, investigate, and address fraud, abuse, and security incidents.",
            "To analyze and improve our products, website performance, and overall user experience.",
            "To send transactional messages, such as order confirmations and shipping updates.",
            "To comply with legal, regulatory, tax, accounting, and reporting obligations.",
          ],
        },
        {
          heading: "Payment Processing",
          paragraphs: [
            "Most orders are paid through a manual process. After you place an order, we send you payment instructions for the payment method you selected, and you complete the payment yourself, using your own account with that payment provider or your own bank. Your payment credentials are entered with that provider or bank, not on our Services, and are handled under their terms and privacy policies.",
            "Cryptocurrency payments are made through NOWPayments, a third-party payment service. When you choose cryptocurrency, we send you to a NOWPayments payment page, where the payment is handled under NOWPayments' own terms and privacy policy. We receive confirmation of the status of the payment.",
            "We keep a record of each payment for order management, fraud prevention, and accounting purposes: the payment method, amount, currency, status, any provider reference and, for manual payments, the instructions we sent, related messages, and any receipts you upload. Receipts are kept in private storage that is not publicly accessible and is available to DrivoraParts administrators. We do not ask for payment card details at checkout, and we do not store payment card numbers in our order records.",
          ],
        },
        {
          heading: "Cookies and Tracking Technologies",
          paragraphs: [
            "We use cookies and similar technologies to operate the Services, keep you signed in, remember the contents of your shopping cart, save your preferences, and understand how the Services are used. Some cookies are strictly necessary for the website to function, while others are used for analytics and performance measurement.",
            "You can control or disable cookies through your browser settings. Please note that disabling certain cookies may limit functionality, including the ability to maintain a cart or complete checkout. For more detail, please review our Cookie Policy.",
          ],
        },
        {
          heading: "Analytics and Tracking",
          paragraphs: [
            "We use third-party analytics, advertising and chat tools on the Services: Google Tag Manager and Google Analytics, Cloudflare Web Analytics, the Meta (Facebook) Pixel, the TikTok Pixel, and the Tawk.to chat widget. These tools use cookies and similar identifiers to collect information about your device and your use of the website, such as pages viewed and items added to your cart, and the advertising pixels use it to measure and attribute advertising.",
            "When you place an order, we also send Meta a record of the purchase from our servers (Meta's Conversions API). It includes the order value, currency, order number and product details, together with your email address and telephone number in hashed (one-way encoded) form. Meta may use this information to match the purchase to your Meta account and to measure advertising, under its own privacy policy.",
            "If you use the chat widget, the messages you send and the details you give are received by Tawk.to. Third-party analytics, advertising and chat providers process this data under their own privacy policies.",
          ],
        },
        {
          heading: "Third-Party Service Providers",
          paragraphs: [
            "We rely on third-party service providers to operate our business, including payment processors, shipping and logistics carriers, hosting and infrastructure providers, analytics services, and customer support tools. These providers may process your information only as necessary to perform services on our behalf and are expected to maintain appropriate safeguards.",
          ],
        },
        {
          heading: "How We Share Information",
          paragraphs: [
            "We do not sell your personal information. We share information only in the following circumstances: with service providers who help us operate the Services; with payment processors and shipping carriers to complete your orders; with authorities or other parties where required by law or to protect our rights; and in connection with a business transaction such as a merger, acquisition, or sale of assets.",
          ],
        },
        {
          heading: "Data Storage and Security",
          paragraphs: [
            "We implement reasonable technical and organizational measures designed to protect your information against unauthorized access, alteration, disclosure, or destruction. These measures may include encryption in transit, access controls, and secure hosting environments.",
            "Despite our efforts, no method of transmission over the internet or method of electronic storage is completely secure. We cannot guarantee absolute security, and you provide your information at your own risk.",
          ],
        },
        {
          heading: "Data Retention",
          paragraphs: [
            "We retain personal information for as long as necessary to provide the Services, maintain order and account records, resolve disputes, prevent fraud, and comply with our legal, tax, accounting, and reporting obligations. Retention periods vary depending on the type of information and the purpose for which it was collected. When information is no longer required, we securely delete or anonymize it.",
          ],
        },
        {
          heading: "Your Rights and Choices",
          paragraphs: [
            "Depending on your location and applicable law, you may have rights regarding your personal information, including the following:",
          ],
          bullets: [
            "Access: request a copy of the personal information we hold about you.",
            "Correction: request that inaccurate or incomplete information be corrected.",
            "Deletion: request deletion of your personal information, subject to legal exceptions.",
            "Restriction and objection: request that we restrict or stop certain processing of your data.",
            "Withdraw consent: withdraw consent where processing is based on consent.",
            "Marketing opt-out: opt out of non-transactional communications at any time.",
          ],
        },
        {
          heading: "Children's Privacy",
          paragraphs: [
            "The Services are intended for adults and are not directed to children under the age of 18. We do not knowingly collect personal information from children. If we become aware that we have collected personal information from a child without appropriate consent, we will take steps to delete that information.",
          ],
        },
        {
          heading: "International Users",
          paragraphs: [
            "If you access the Services from outside the country in which our systems are operated, your information may be transferred to, stored, and processed in a jurisdiction with different data protection laws. Where required, we apply appropriate safeguards for such transfers.",
          ],
        },
        {
          heading: "Legal Compliance",
          paragraphs: [
            `We process personal information in accordance with applicable data protection and consumer protection laws. We may disclose information where necessary to comply with a legal obligation, enforce our agreements, or protect the rights, property, or safety of ${COMPANY_LEGAL_NAME}, our customers, or others.`,
          ],
        },
        {
          heading: "Changes to This Policy",
          paragraphs: [
            "We may update this Privacy Policy from time to time to reflect changes in our practices, technology, or legal requirements. The Effective Date and Last Updated date shown above indicate when this policy was most recently revised. Continued use of the Services after changes take effect constitutes acceptance of the updated policy.",
          ],
        },
        {
          heading: "Contact Us",
          paragraphs: [
            `If you have questions, concerns, or requests regarding this Privacy Policy or your personal information, you may contact us at ${COMPANY_SUPPORT_EMAIL}. We will respond to legitimate requests within a reasonable timeframe and in accordance with applicable law.`,
            `Privacy requests are handled by ${COMPANY_LEGAL_NAME}.`,
            ...(COMPANY_ADDRESS
              ? [
                  `Mailing address: ${COMPANY_LEGAL_NAME}, ${COMPANY_ADDRESS.street}, ${COMPANY_ADDRESS.city}, ${COMPANY_ADDRESS.state} ${COMPANY_ADDRESS.postalCode}, ${COMPANY_ADDRESS.country}.`,
                ]
              : []),
          ],
        },
      ]}
    />
  );
}
