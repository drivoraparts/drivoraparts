import type { Metadata } from "next";
import Link from "next/link";
import { buildPageMetadata } from "@/lib/seo";
import {
  DIRECT_PAYMENT_METHODS,
  ORDER_PROCESSING,
  WARRANTY_POLICY_HREF,
  listWithOr,
} from "@/lib/content/purchase-terms";

export const metadata: Metadata = buildPageMetadata({
  title: "Frequently Asked Questions",
  description:
    "Answers to common questions about DrivoraParts orders, payment, shipping, fitment, warranty, and returns.",
  path: "/faq",
});

type FaqItem = {
  question: string;
  answer: React.ReactNode;
};

const FAQS: FaqItem[] = [
  {
    question: "How do I pay for an order?",
    // Said checkout was crypto-only. It lists the direct methods first, from
    // lib/payments/manual-methods.ts, which is where this answer reads them.
    answer: (
      <>
        At checkout you choose a direct payment method — {listWithOr(DIRECT_PAYMENT_METHODS)}{" "}
        — or pay in cryptocurrency (Bitcoin, Ethereum, USDT and 300+ other
        coins) through NOWPayments. For a direct payment, the payment details
        are sent to you after you order, and the order ships once the payment
        is received and verified.
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
        <Link href="/contact" className="text-accent hover:text-accent-hover">
          contact form
        </Link>{" "}
        with your order ID.
      </>
    ),
  },
  {
    question: "How do I know if a part fits my vehicle?",
    // "Every listing shows fitment details" was not true: about one listing
    // in six records no fitment, and its page says so.
    answer:
      "Listings show the fitment recorded for the part: a list of vehicle applications, a fitment note, or universal where the maker sells it that way. Some listings record no fitment. If anything is unclear or your vehicle isn't listed, confirm with us before ordering — reach out via the contact form with your part number and vehicle details.",
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
        Yes. We ship to most domestic and many international destinations,
        and standard shipping is free on every order; some large or
        regulated items can only ship to certain regions. Orders are
        typically processed within {ORDER_PROCESSING} once payment is
        verified, and delivery typically takes 5–15 business days after that
        — estimates, not guarantees. Smaller parts ship via standard carriers;
        larger items (engines, transmissions, canopies, truck beds) ship as
        freight/LTL. Full timelines and details are in our{" "}
        <Link
          href="/policies/shipping-policy"
          className="text-accent hover:text-accent-hover"
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
        <Link href="/returns" className="text-accent hover:text-accent-hover">
          Start a return here
        </Link>
        , or see the full{" "}
        <Link
          href="/policies/refund-policy"
          className="text-accent hover:text-accent-hover"
        >
          Returns &amp; Refund Policy
        </Link>
        .
      </>
    ),
  },
  {
    question: "Do parts come with a warranty?",
    answer: (
      <>
        It depends on the part. Where a manufacturer or supplier warranty
        applies, the product listing states it, and that warranty&apos;s terms
        govern. A listing that states no warranty carries no separate
        DrivoraParts warranty. Our{" "}
        <Link href={WARRANTY_POLICY_HREF} className="text-accent hover:text-accent-hover">
          Warranty Policy
        </Link>{" "}
        explains how to submit a warranty request.
      </>
    ),
  },
  {
    question: "Is DrivoraParts a real, registered business?",
    answer:
      "Yes — DrivoraParts LLC is a US-registered company with headquarters in Torrance, California. Full company and policy details are available in our footer, including Terms of Sale, Privacy Policy, and Refund Policy.",
  },
  {
    question: "I have a question that isn't answered here — what do I do?",
    answer: (
      <>
        Send us a message through the{" "}
        <Link href="/contact" className="text-accent hover:text-accent-hover">
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
          <Link href="/contact" className="text-accent hover:text-accent-hover">
            Contact our support team
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
