import type { Metadata } from "next";
import Link from "next/link";
import ContactForm from "@/components/contact/ContactForm";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Start a Return",
  description:
    "Request a return authorization for a DrivoraParts order. Returns must be approved before shipping any item back.",
  path: "/returns",
});

export default function ReturnsPage() {
  return (
    <main className="mx-auto max-w-4xl bg-white px-6 py-12 text-neutral-900">
      <h1 className="mb-2 text-4xl font-bold">Start a Return</h1>
      <p className="mb-8 text-neutral-600">
        Returns must be authorized before you ship anything back to us. Tell us your
        order ID and the reason for the return below, and we&apos;ll follow up with
        return instructions if it&apos;s approved. Full details are in our{" "}
        <Link href="/policies/refund-policy" className="text-red-600 hover:text-red-700">
          Returns &amp; Refund Policy
        </Link>
        .
      </p>

      <div className="mb-8 grid gap-4 rounded-xl border border-neutral-200 bg-neutral-50 p-6 text-sm text-neutral-600 sm:grid-cols-3">
        <div>
          <p className="font-semibold text-neutral-900">30-day window</p>
          <p className="mt-1">Requests must be submitted within 30 days of delivery.</p>
        </div>
        <div>
          <p className="font-semibold text-neutral-900">Original condition</p>
          <p className="mt-1">Unused, uninstalled, in original packaging with all accessories.</p>
        </div>
        <div>
          <p className="font-semibold text-neutral-900">Authorization first</p>
          <p className="mt-1">Wait for approval before shipping anything back to us.</p>
        </div>
      </div>

      <ContactForm defaultTopic="returns" requireOrderId />
    </main>
  );
}
