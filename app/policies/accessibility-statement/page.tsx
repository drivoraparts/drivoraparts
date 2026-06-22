import Policy from "@/components/policy/Policy";

export default function AccessibilityStatementPage() {
  return (
    <Policy
      title="Accessibility Statement"
      intro="DrivoraParts LLC (“Company”, “we”, “us”) is committed to ensuring that our website and services (the “Services”) are accessible to all users, including people with disabilities. We believe that everyone should be able to browse, shop, and access information with ease, and we continually work to improve the accessibility and usability of the Services in line with recognized standards."
      sections={[
        {
          heading: "Our Commitment",
          paragraphs: [
            "We are committed to providing a website that is accessible to the widest possible audience, regardless of technology or ability. Accessibility is an ongoing priority for us, and we treat it as an essential part of delivering a high-quality experience to all of our customers.",
          ],
        },
        {
          heading: "Standards We Follow",
          paragraphs: [
            "We aim to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 at Level AA. These internationally recognized guidelines explain how to make web content more accessible to people with a wide range of disabilities, including visual, auditory, physical, speech, cognitive, and neurological disabilities.",
          ],
        },
        {
          heading: "Measures We Take",
          paragraphs: [
            "To support accessibility across the Services, we take measures that include the following:",
          ],
          bullets: [
            "Maintaining sufficient color contrast between text and background elements.",
            "Providing descriptive text alternatives for meaningful images and icons.",
            "Using clear, semantic, and structured headings and a logical content order.",
            "Ensuring the website is responsive and operable across a range of devices and screen sizes.",
            "Supporting keyboard navigation for interactive elements where feasible.",
            "Aiming for readable typography, spacing, and layout throughout the Services.",
          ],
        },
        {
          heading: "Ongoing Effort",
          paragraphs: [
            "Accessibility is a continuous commitment rather than a one-time task. We periodically review the Services, test for accessibility issues, and work to remediate them, including as we add new features, products, and content over time.",
          ],
        },
        {
          heading: "Known Limitations",
          paragraphs: [
            "Despite our best efforts, some content or third-party components may not yet be fully accessible. We are actively working to identify and address any areas that fall short of our goals and appreciate your patience and feedback as we continue to improve.",
          ],
        },
        {
          heading: "Third-Party Content",
          paragraphs: [
            "Some content, tools, or functionality on the Services may be provided by third parties. While we do not control the accessibility of third-party content, we make reasonable efforts to work with providers and to choose solutions that support accessibility where possible.",
          ],
        },
        {
          heading: "Feedback",
          paragraphs: [
            "We welcome your feedback on the accessibility of the Services. If you encounter a barrier, experience difficulty accessing any part of the Services, or need information in an alternative format, please let us know so we can assist you and improve.",
          ],
        },
        {
          heading: "Contact",
          paragraphs: [
            "To report an accessibility issue or request assistance, contact DrivoraParts LLC at support@drivoraparts.com. We will make reasonable efforts to provide the information, support, or accommodation you need.",
          ],
        },
      ]}
    />
  );
}
