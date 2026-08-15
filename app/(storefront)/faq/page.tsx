import type { Metadata } from "next";
import Link from "next/link";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Frequently Asked Questions",
  description:
    "Answers to common questions about DrivoraParts orders, payment, shipping, fitment, and returns.",
  path: "/faq",
});

type FaqItem = {
  question: string;
  answer: React.ReactNode;
};

const FAQS: FaqItem[] = [
  {
    question: "How do I pay for an order?",
    answer: (
      <>
        Checkout is handled through our secure crypto payment processor,
        accepting Bitcoin, Ethereum, USDT, and 300+ other cryptocurrencies. If
        you don&apos;t hold crypto yet, the checkout page walks you through
        buying it with a debit or credit card via a trusted exchange partner
        first, then sending it to your order&apos;s payment address.
      </>
    ),
  },
  {
    question: "How do I check my order status?",
    answer: (
      <>
        After checkout, you land on an order confirmation page that tracks
        your payment status in real time. You&apos;ll also get an email
        receipt as soon as your order is placed, and another once payment is
        confirmed. If you need a status update at any time, reach out through
        our{" "}
        <Link href="/contact" className="text-red-600 hover:text-red-700">
          contact form
        </Link>{" "}
        with your order ID.
      </>
    ),
  },
  {
    question: "How do I know if a part fits my vehicle?",
    answer:
      "Every listing shows fitment details for the specific make, model, and years it's compatible with. If anything is unclear or your vehicle isn't explicitly listed, confirm with us before ordering — reach out via the contact form with your part number and vehicle details.",
  },
  {
    question: "What condition are the parts in?",
    answer:
      "Condition varies by listing and is always shown on the product page — brand new, used, refurbished, or aftermarket. Catalog items (engines, transmissions, brakes, etc.) are new unless stated otherwise; our Aftermarket marketplace lists pre-owned and take-off parts with condition notes and real photos of the actual unit where applicable.",
  },
  {
    question: "How long does shipping take, and do you ship internationally?",
    answer: (
      <>
        Yes, we ship worldwide. Smaller parts ship via standard carriers;
        larger items (engines, transmissions, canopies, truck beds) are
        coordinated via freight/LTL shipping. Full timelines and details are
        in our{" "}
        <Link
          href="/policies/shipping-policy"
          className="text-red-600 hover:text-red-700"
        >
          Shipping Policy
        </Link>
        .
      </>
    ),
  },
  {
    question: "Can I return a part if it doesn't work out?",
    answer: (
      <>
        Yes — most items can be returned within 30 days of delivery if
        they&apos;re unused, uninstalled, and in original packaging. Returns
        need authorization before you ship anything back.{" "}
        <Link href="/returns" className="text-red-600 hover:text-red-700">
          Start a return here
        </Link>
        , or see the full{" "}
        <Link
          href="/policies/refund-policy"
          className="text-red-600 hover:text-red-700"
        >
          Returns &amp; Refund Policy
        </Link>
        .
      </>
    ),
  },
  {
    question: "Is DrivoraParts a real, registered business?",
    answer:
      "Yes — BROOKSTONEUS LLC is a US-registered company with headquarters in Torrance, California. Full company and policy details are available in our footer, including Terms of Sale, Privacy Policy, and Refund Policy.",
  },
  {
    question: "I have a question that isn't answered here — what do I do?",
    answer: (
      <>
        Send us a message through the{" "}
        <Link href="/contact" className="text-red-600 hover:text-red-700">
          contact form
        </Link>{" "}
        and we&apos;ll typically reply within 1–2 business days.
      </>
    ),
  },
];

export default function FaqPage() {
  return (
    <main className="mx-auto max-w-3xl bg-white px-6 py-12 text-neutral-900">
      <h1 className="mb-2 text-4xl font-bold">Frequently Asked Questions</h1>
      <p className="mb-10 text-neutral-600">
        Quick answers to the questions we hear most often.
      </p>

      <div className="space-y-6">
        {FAQS.map((item) => (
          <div
            key={item.question}
            className="rounded-xl border border-neutral-200 bg-neutral-50 p-6"
          >
            <h2 className="mb-2 text-lg font-semibold text-neutral-900">
              {item.question}
            </h2>
            <p className="text-sm leading-relaxed text-neutral-600">{item.answer}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-xl border border-neutral-200 bg-white p-6 text-center">
        <p className="text-sm text-neutral-600">
          Still have questions?{" "}
          <Link href="/contact" className="text-red-600 hover:text-red-700">
            Contact our support team
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
