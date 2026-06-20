import Policy from "@/components/policy/Policy";

export default function CookiePolicyPage() {
  return (
    <Policy
      title="Cookie Policy"
      intro="This Cookie Policy explains how DrivoraParts LLC (“Company”, “we”, “us”) uses cookies and similar tracking technologies on our website and services (the “Services”). It describes what cookies are, the types of cookies we use, why we use them, and how you can manage your preferences. This Cookie Policy should be read together with our Privacy Policy. By continuing to use the Services, you consent to our use of cookies as described below, except where you have disabled them through your browser."
      sections={[
        {
          heading: "What Are Cookies",
          paragraphs: [
            "Cookies are small text files that are placed on your device when you visit a website. They are widely used to make websites work, to make them more efficient, and to provide reporting information. Similar technologies, such as web beacons, pixels, and local storage, perform related functions and are also covered by this policy.",
          ],
        },
        {
          heading: "Why We Use Cookies",
          paragraphs: [
            "We use cookies and similar technologies to operate and secure the Services, to remember your preferences and shopping cart, to understand how visitors use the Services, and to improve performance and the overall user experience.",
          ],
        },
        {
          heading: "Session Cookies",
          paragraphs: [
            "Session cookies are temporary cookies that remain on your device until you close your browser. We use session cookies to keep you signed in during your visit, to maintain the state of your session, and to enable secure checkout.",
          ],
        },
        {
          heading: "Cart Persistence Cookies",
          paragraphs: [
            "We use cookies to remember the items you add to your shopping cart so that your selections are preserved as you browse and when you return to complete your purchase. Disabling these cookies may prevent the cart from functioning correctly.",
          ],
        },
        {
          heading: "Preference Cookies",
          paragraphs: [
            "Preference cookies remember choices you make, such as your language, region, or display settings, so that we can provide a more personalized and consistent experience.",
          ],
        },
        {
          heading: "Analytics Cookies",
          paragraphs: [
            "Analytics cookies help us understand how visitors interact with the Services by collecting aggregated, non-identifying information such as the pages visited, time spent, and navigation paths. This information helps us measure performance and improve usability.",
          ],
        },
        {
          heading: "Third-Party Cookies",
          paragraphs: [
            "Some cookies may be set by third-party services that appear on or support the Services, such as payment processors and analytics providers. These third parties may use cookies to perform their services and are responsible for their own cookie and privacy practices.",
          ],
        },
        {
          heading: "Consent",
          paragraphs: [
            "By continuing to use the Services, you are deemed to consent to our use of cookies as described in this policy, except for cookies that you disable through your browser. Where required by applicable law, we will request your consent before placing non-essential cookies on your device.",
          ],
        },
        {
          heading: "How to Manage or Disable Cookies",
          paragraphs: [
            "Most web browsers allow you to control cookies through their settings, including refusing or deleting cookies. The method for doing so varies from browser to browser. Please note that if you disable strictly necessary cookies, certain features of the Services, including the shopping cart and checkout, may not function correctly.",
          ],
        },
        {
          heading: "Updates to This Policy",
          paragraphs: [
            "We may update this Cookie Policy from time to time to reflect changes in technology, the cookies we use, or applicable law. The dates shown above reflect the most recent revision.",
          ],
        },
        {
          heading: "Contact",
          paragraphs: [
            "If you have questions about our use of cookies, please contact DrivoraParts LLC at support@drivoraparts.com.",
          ],
        },
      ]}
    />
  );
}
