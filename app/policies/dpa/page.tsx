export const runtime = 'edge';

import Policy from "@/components/policy/Policy";

export default function DPAPage() {
  return (
    <Policy
      title="Data Processing Agreement"
      intro="This Data Processing Agreement (“DPA”) describes how DrivoraParts LLC (“Company”, “we”, “us”) processes personal data on behalf of customers and partners in connection with our website and services (the “Services”), and the safeguards that apply to that data. This DPA forms part of our agreements wherever we process personal data on behalf of another party and is intended to reflect the requirements of applicable data protection laws."
      sections={[
        {
          heading: "Definitions",
          paragraphs: [
            "In this DPA, terms such as “personal data”, “processing”, “controller”, “processor”, “sub-processor”, and “data subject” have the meanings given to them under applicable data protection laws. References to the “controller” mean the party that determines the purposes and means of processing, and references to the “processor” mean the party that processes personal data on behalf of the controller.",
          ],
        },
        {
          heading: "Roles of the Parties",
          paragraphs: [
            "Where DrivoraParts LLC processes personal data to provide the Services, it acts as a processor or service provider on behalf of the customer or partner, who acts as the controller of that data. Each party is responsible for complying with its respective obligations under applicable data protection laws.",
          ],
        },
        {
          heading: "Scope and Purpose of Processing",
          paragraphs: [
            "We process personal data only to provide, support, and improve the Services, including order fulfillment, payment facilitation, shipping, customer support, fraud prevention, and related business operations. We process personal data in accordance with documented instructions and applicable law, and not for any incompatible purpose.",
          ],
        },
        {
          heading: "Confidentiality",
          paragraphs: [
            "We ensure that personnel authorized to process personal data are subject to appropriate confidentiality obligations and receive guidance on their data protection responsibilities. Access to personal data is limited to those who need it to perform their duties.",
          ],
        },
        {
          heading: "Security Measures",
          paragraphs: [
            "We maintain reasonable technical and organizational measures designed to protect personal data against unauthorized or unlawful processing and against accidental loss, destruction, alteration, or disclosure. These measures take into account the nature of the data, the risks involved, and the state of available technology.",
          ],
        },
        {
          heading: "Sub-Processors",
          paragraphs: [
            "We may engage sub-processors, such as hosting and infrastructure providers, payment processors, analytics services, and shipping carriers, to support the Services. We require sub-processors to apply data protection obligations consistent with this DPA, and we remain responsible for their performance of those obligations.",
          ],
        },
        {
          heading: "Data Subject Requests",
          paragraphs: [
            "We will provide reasonable assistance to help the controller respond to requests from data subjects exercising their rights, including rights of access, correction, deletion, restriction, and objection, to the extent applicable and technically feasible.",
          ],
        },
        {
          heading: "Personal Data Breach Notification",
          paragraphs: [
            "We will notify the controller without undue delay after becoming aware of a personal data breach affecting their data, and will provide information reasonably necessary to enable the controller to meet its own breach notification and compliance obligations.",
          ],
        },
        {
          heading: "International Data Transfers",
          paragraphs: [
            "Where personal data is transferred across borders, we apply appropriate safeguards as required by applicable law, which may include contractual protections and other measures designed to ensure an adequate level of protection for the data.",
          ],
        },
        {
          heading: "Return and Deletion of Data",
          paragraphs: [
            "Upon termination of the Services or upon the controller's reasonable request, we will delete or return personal data in accordance with applicable law and our retention obligations, unless we are required by law to retain it.",
          ],
        },
        {
          heading: "Cooperation and Records",
          paragraphs: [
            "We will, to the extent required by applicable law, make available information reasonably necessary to demonstrate compliance with this DPA and cooperate with the controller in connection with data protection assessments and inquiries from supervisory authorities.",
          ],
        },
        {
          heading: "Contact",
          paragraphs: [
            "For questions regarding this DPA or our data processing practices, contact DrivoraParts LLC at support@drivoraparts.com.",
          ],
        },
      ]}
    />
  );
}
