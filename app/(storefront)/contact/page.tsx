import type { Metadata } from "next";
import ContactForm from "@/components/contact/ContactForm";
import CompanyAddress from "@/components/content/CompanyAddress";
import {
  CALIFORNIA_FULFILLMENT,
  COMPANY_LEGAL_NAME,
  COMPANY_SUPPORT_EMAIL,
} from "@/lib/content/company";
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
            Operated by
          </h2>
          <CompanyAddress variant="operator" />
          <p className="mt-3 text-sm">
            DrivoraParts is operated by {COMPANY_LEGAL_NAME}. Questions go to
            support at{" "}
            <a
              href={`mailto:${COMPANY_SUPPORT_EMAIL}`}
              className="font-semibold text-accent underline-offset-2 hover:text-accent-hover hover:underline"
            >
              {COMPANY_SUPPORT_EMAIL}
            </a>
            .
          </p>
        </div>

        {/*
          The main business and mailing address, and where authorized returns
          are sent. Orders do NOT all dispatch from here -- some ship from
          the supplier network -- so it is not headed as a warehouse, and no
          headquarters is claimed.

          The note below asks for authorization first: an unannounced parcel
          arriving here cannot be matched to an order.
        */}
        <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-6">
          <h2 className="mb-3 text-xl font-semibold text-neutral-900">
            Business &amp; Mailing Address
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
            This is our main business and mailing address. Not every order
            ships from here: a part ships from DrivoraParts or from our
            supplier network, depending on its availability and location.
            Authorized returns come back to this address. Request
            authorization through the form above before sending anything back,
            so the parcel can be matched to your order.
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
