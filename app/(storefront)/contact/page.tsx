import type { Metadata } from "next";
import ContactForm from "@/components/contact/ContactForm";
import CompanyAddress from "@/components/content/CompanyAddress";
import { CALIFORNIA_FULFILLMENT } from "@/lib/content/company";
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

        {/*
          The registered office above is who the customer contracts with; this is
          where their part is actually picked and packed. Both are stated because a
          customer checking whether there is a real operation behind the site is
          asking about this one, and the Shipping Policy names it too.

          This is also the return address the refund policy gives, which is why the
          note below asks for authorization first: an unannounced parcel arriving
          here cannot be matched to an order.
        */}
        <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-6">
          <h2 className="mb-3 text-xl font-semibold text-neutral-900">
            California Fulfillment Center
          </h2>
          <address className="space-y-0.5 text-sm not-italic leading-relaxed">
            <p>{CALIFORNIA_FULFILLMENT.street}</p>
            <p>
              {CALIFORNIA_FULFILLMENT.city}, {CALIFORNIA_FULFILLMENT.state}{" "}
              {CALIFORNIA_FULFILLMENT.postalCode}
            </p>
            <p>{CALIFORNIA_FULFILLMENT.country}</p>
          </address>
          <p className="mt-3 text-sm">
            Orders are dispatched from here, and authorized returns come back
            here. Request authorization through the form above before sending
            anything back, so the parcel can be matched to your order.
          </p>
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
