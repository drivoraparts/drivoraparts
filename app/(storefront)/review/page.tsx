import type { Metadata } from "next";
import Link from "next/link";
import { loadReviewLink } from "@/lib/reviews/requests";
import { questionSetsFor, INSTALLED_BY_OPTIONS } from "@/lib/reviews/questions";
import VerifiedReviewForm from "@/components/reviews/VerifiedReviewForm";
import { routes } from "@/lib/inventory/routes";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Review your part",
  robots: { index: false, follow: false },
};

const MESSAGES: Record<string, { title: string; body: string }> = {
  used: { title: "Thanks, your review is in", body: "A review has already been submitted for this item. Each purchased item can be reviewed once." },
  expired: { title: "This link has expired", body: "Review links work for 180 days. If you'd still like to review your part, email us and we'll send a new one." },
  order_closed: { title: "This order can't be reviewed", body: "The order was cancelled or refunded." },
  invalid: { title: "This link isn't valid", body: "Please use the link from your review email exactly as it was sent." },
  unavailable: { title: "Reviews are unavailable right now", body: "Please try again later." },
};

export default async function ReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ t?: string }>;
}) {
  const { t } = await searchParams;
  const link = await loadReviewLink(t);

  if (link.state !== "ready") {
    const message = MESSAGES[link.state];
    return (
      <main className="mx-auto w-full max-w-xl px-4 py-20 text-center sm:px-6">
        <h1 className="text-2xl font-bold text-foreground">{message.title}</h1>
        <p className="mt-3 text-muted">{message.body}</p>
        <Link href={routes.all} className="mt-8 inline-flex min-h-11 items-center rounded-md bg-foreground px-6 text-sm font-semibold text-white">
          Shop Toyota parts
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-4 pb-20 pt-10 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Verified buyer review</p>
      <h1 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">{link.productName}</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        Your review will appear as <strong className="text-foreground">{link.reviewerName}</strong> with a
        Verified Buyer badge, after a check for personal details and spam. Every rating is published the
        same way, good or bad.
      </p>
      <VerifiedReviewForm
        token={t ?? ""}
        questionSets={questionSetsFor(link.category, link.condition)}
        installedByOptions={INSTALLED_BY_OPTIONS}
        productHref={routes.product(link.productId)}
      />
    </main>
  );
}
