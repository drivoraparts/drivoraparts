import type { Metadata } from "next";
import CompanyAddress from "@/components/content/CompanyAddress";
import { COMPANY_SUPPORT_EMAIL } from "@/lib/content/company";
import { FACEBOOK_PAGE_LABEL, FACEBOOK_PAGE_URL } from "@/lib/content/social-links";
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
      <h1 className="mb-6 text-4xl font-bold">Contact Support</h1>

      <div className="space-y-6 text-neutral-600">
        <p>
          Need help with a product, marketplace feature, account question, or
          general inquiry?
        </p>

        <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-6">
          <h2 className="mb-3 text-xl font-semibold text-neutral-900">Support</h2>
          <p>
            Email:{" "}
            <a
              href={`mailto:${COMPANY_SUPPORT_EMAIL}`}
              className="text-red-600 hover:text-red-700"
            >
              {COMPANY_SUPPORT_EMAIL}
            </a>
          </p>
          <p className="mt-2">
            Response times may vary depending on inquiry volume.
          </p>
        </div>

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
            Partnerships, vendor onboarding, and marketplace opportunities can
            be directed through our support channel for review.
          </p>
        </div>
      </div>
    </main>
  );
}
