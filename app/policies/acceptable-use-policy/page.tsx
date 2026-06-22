export const runtime = 'edge';

import Policy from "@/components/policy/Policy";

export default function AcceptableUsePolicyPage() {
  return (
    <Policy
      title="Acceptable Use Policy"
      intro="This Acceptable Use Policy (“AUP”) sets out the rules that govern your use of the website and services operated by DrivoraParts LLC (“Company”, “we”, “us”). It is designed to protect our users, our business, our partners, and the integrity and security of the Services. This AUP supplements our Terms of Service. By accessing or using the Services, you agree to comply with this AUP. Violations may result in suspension or termination of access and, where appropriate, referral to law enforcement."
      sections={[
        {
          heading: "Scope",
          paragraphs: [
            "This AUP applies to everyone who accesses or uses the Services in any way, including visitors, registered users, and customers. It covers all interactions with the Services, including browsing, account creation, ordering, payment, and communication with us.",
          ],
        },
        {
          heading: "Acceptable Use",
          paragraphs: [
            "You may use the Services only for lawful purposes and in accordance with these rules and our Terms of Service. Acceptable use includes browsing our catalog, placing legitimate orders, managing your account, and contacting customer support in good faith.",
          ],
        },
        {
          heading: "No Illegal Activity",
          paragraphs: [
            "You must not use the Services to engage in, promote, or facilitate any activity that is illegal under applicable law, or that violates the rights of any third party. You are responsible for ensuring that your use of the Services complies with all laws and regulations that apply to you.",
          ],
        },
        {
          heading: "No Fraud or Chargeback Abuse",
          paragraphs: [
            "You must not engage in fraudulent activity of any kind, including submitting fake orders, using stolen or unauthorized payment methods, or abusing chargeback, refund, or return processes. We may cancel orders, reverse transactions, and report fraudulent activity to payment providers and authorities.",
          ],
        },
        {
          heading: "No Scraping or Reverse Engineering",
          paragraphs: [
            "You must not scrape, harvest, or use automated systems to collect data from the Services without our prior written permission. You must not reverse engineer, decompile, disassemble, or attempt to copy or replicate the design, source code, or systems underlying the Services.",
          ],
        },
        {
          heading: "No Impersonation",
          paragraphs: [
            "You must not impersonate any person or entity, misrepresent your identity or affiliation, or provide false, misleading, or inaccurate information when using the Services or placing orders.",
          ],
        },
        {
          heading: "No System Abuse or Interference",
          paragraphs: [
            "You must not attempt to gain unauthorized access to the Services, accounts, or systems; introduce viruses, malware, or harmful code; or otherwise interfere with, disrupt, or place an unreasonable load on the Services or the networks and infrastructure that support them.",
          ],
        },
        {
          heading: "No Misuse of Platform Infrastructure",
          paragraphs: [
            "You must not use the Services or our infrastructure to send spam, conduct unauthorized advertising, host or distribute unlawful content, or carry out any activity that compromises the security, availability, or integrity of the Services.",
          ],
        },
        {
          heading: "Intellectual Property",
          paragraphs: [
            "You may not copy, reproduce, republish, distribute, or create derivative works from content on the Services without authorization from DrivoraParts LLC.",
          ],
        },
        {
          heading: "Enforcement",
          paragraphs: [
            "We may investigate suspected violations of this AUP and take any action we consider appropriate, including removing content, restricting features, suspending or terminating access, reversing transactions, and cooperating with law enforcement. We are not obligated to monitor use of the Services but reserve the right to do so.",
          ],
        },
        {
          heading: "Reporting Violations",
          paragraphs: [
            "If you become aware of any violation of this AUP, please report it to DrivoraParts LLC at support@drivoraparts.com so we can investigate and respond appropriately.",
          ],
        },
        {
          heading: "Changes to This Policy",
          paragraphs: [
            "We may update this Acceptable Use Policy at any time. The dates shown above indicate the most recent revision. Continued use of the Services after changes take effect constitutes acceptance of the updated policy.",
          ],
        },
      ]}
    />
  );
}
