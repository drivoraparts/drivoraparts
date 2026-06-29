import Link from "next/link";

const sections = [
  {
    title: "Legal & Data Compliance",
    items: [
      { name: "Privacy Policy", href: "/policies/privacy-policy" },
      { name: "Cookie Policy", href: "/policies/cookie-policy" },
      { name: "Accessibility Statement", href: "/policies/accessibility-statement" },
      { name: "Data Processing Agreement (DPA)", href: "/policies/dpa" },
    ],
  },
  {
    title: "Terms & User Conduct",
    items: [
      { name: "Terms of Service", href: "/policies/terms-of-service" },
      { name: "Acceptable Use Policy", href: "/policies/acceptable-use-policy" },
      { name: "End User License Agreement", href: "/policies/eula" },
    ],
  },
  {
    title: "E-Commerce & Operations",
    items: [
      { name: "Terms of Sale", href: "/policies/terms-of-sale" },
      { name: "Shipping Policy", href: "/policies/shipping-policy" },
      { name: "Return & Refund Policy", href: "/policies/refund-policy" },
    ],
  },
  {
    title: "Disclaimers & Disclosures",
    items: [
      { name: "Professional Disclaimer", href: "/policies/disclaimer" },
      { name: "Affiliate Disclosure", href: "/policies/affiliate-disclosure" },
      { name: "Limitation of Liability", href: "/policies/liability" },
    ],
  },
];

export default function PoliciesPage() {
  return (
    <div className="text-neutral-900">
      <h1 className="mb-4 inline-block border-b-2 border-red-600 pb-2 text-3xl font-bold md:text-4xl">
        Policies
      </h1>
      <p className="mb-10 text-sm text-neutral-500">
        Legal information and operating policies for DrivoraParts LLC.
      </p>

      {sections.map((section) => (
        <div key={section.title} className="mb-10">
          <h2 className="mb-4 text-xl text-red-600">{section.title}</h2>

          <div className="grid gap-3">
            {section.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-xl border border-neutral-200 bg-white p-4 transition hover:border-red-300 hover:bg-red-50"
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
