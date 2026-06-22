export const runtime = 'edge';

import Policy from "@/components/policy/Policy";

export default function AffiliateDisclosurePage() {
  return (
    <Policy
      title="Affiliate Disclosure"
      intro="This Affiliate Disclosure explains how DrivoraParts LLC (“Company”, “we”, “us”) may earn compensation through affiliate and partner relationships in connection with our website and services (the “Services”). We believe in being transparent with our users about how we may be compensated, and this disclosure is provided in the interest of honesty and trust."
      sections={[
        {
          heading: "Affiliate Links",
          paragraphs: [
            "Some of the links on the Services may be affiliate links. This means that the Services may contain links to products, merchants, or partners through which we may earn compensation if you take certain actions, such as clicking a link or completing a purchase.",
          ],
        },
        {
          heading: "Commission-Based Earnings",
          paragraphs: [
            "DrivoraParts LLC may participate in affiliate or commission-based partnership programs. If you click an affiliate link and complete a qualifying purchase or action with a partner, we may receive a commission or referral fee from that partner. These commissions help support the operation of the Services.",
          ],
        },
        {
          heading: "No Additional Cost to You",
          paragraphs: [
            "Using an affiliate link does not increase the price you pay. Any commission we receive is paid by the partner or merchant and comes at no additional cost to you as the customer. You pay the same price whether or not you use an affiliate link.",
          ],
        },
        {
          heading: "Editorial Independence and Transparency",
          paragraphs: [
            "Affiliate relationships do not control or dictate the content we publish. Product placement, recommendations, and information are intended to be based on relevance and value to our users rather than solely on potential commissions. We are committed to maintaining transparency about our affiliate relationships.",
          ],
        },
        {
          heading: "Third-Party Responsibility",
          paragraphs: [
            "Purchases or actions completed through affiliate links are governed by the terms, conditions, and policies of the relevant third-party merchant or partner. We are not responsible for the products, services, pricing, fulfillment, or transactions handled by third parties.",
          ],
        },
        {
          heading: "Your Choice",
          paragraphs: [
            "You are never obligated to use an affiliate link. If you prefer, you may navigate directly to any merchant or product without using a link provided on the Services.",
          ],
        },
        {
          heading: "Updates to This Disclosure",
          paragraphs: [
            "We may update this Affiliate Disclosure from time to time to reflect changes in our partnerships or practices. The dates shown above reflect the most recent revision.",
          ],
        },
        {
          heading: "Contact",
          paragraphs: [
            "If you have questions about this Affiliate Disclosure, contact DrivoraParts LLC at support@drivoraparts.com.",
          ],
        },
      ]}
    />
  );
}
