import type { Metadata } from "next";
import ReviewOptOutButton from "@/components/reviews/ReviewOptOutButton";

export const metadata: Metadata = {
  title: "Stop review requests",
  robots: { index: false, follow: false },
};

export default async function ReviewUnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ t?: string }>;
}) {
  const { t } = await searchParams;
  return (
    <main className="mx-auto w-full max-w-xl px-4 py-20 text-center sm:px-6">
      <h1 className="text-2xl font-bold text-foreground">Stop review requests?</h1>
      <p className="mt-3 text-muted">
        We&apos;ll stop asking you to review parts. Order and shipping emails are not affected.
      </p>
      <ReviewOptOutButton token={t ?? ""} />
    </main>
  );
}
