import type { Metadata } from "next";
import ContactForm from "@/components/contact/ContactForm";
import CompanyAddress from "@/components/content/CompanyAddress";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Contact Support",
  description:
    "Contact DrivoraParts support for product questions, orders, fitment help, and marketplace assistance.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-4xl bg-white px-6 py-12 text-neutral-900">
      <h1 className="mb-2 text-4xl font-bold">Contact Support</h1>
      <p className="mb-8 text-neutral-600">
        Questions about an order, part fitment, or your account? Send us a message below.
      </p>

      <ContactForm />

      <div className="mt-8 space-y-6 text-neutral-600">
        <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-6">
          <h2 className="mb-3 text-xl font-semibold text-neutral-900">
            U.S. Corporate Headquarters
          </h2>
          <CompanyAddress variant="us-hq" />
        </div>

        <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-6">
          <h2 className="mb-3 text-xl font-semibold text-neutral-900">
            Business Inquiries
          </h2>
          <p>
            Partnerships, vendor onboarding, and marketplace opportunities can also be
            submitted through the form above.
          </p>
        </div>
      </div>
    </main>
  );
}
