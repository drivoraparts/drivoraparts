import type { Metadata } from "next";
import { Suspense } from "react";
import { buildPageMetadata } from "@/lib/seo";
import TrackOrderForm from "@/components/orders/TrackOrderForm";

export const metadata: Metadata = buildPageMetadata({
  title: "Track Your Order",
  description: "Check the status of your DrivoraParts order using your order ID.",
  path: "/track-order",
});

export default function TrackOrderPage() {
  return (
    <main className="mx-auto max-w-lg bg-white px-5 py-8 text-neutral-900 sm:max-w-xl sm:px-6 sm:py-10">
      <h1 className="mb-1 text-2xl font-bold sm:text-3xl">Track Your Order</h1>
      <p className="mb-5 text-sm text-neutral-600">
        Enter your order ID to check its current status. You can find this in
        your order confirmation email.
      </p>

      <Suspense fallback={null}>
        <TrackOrderForm />
      </Suspense>
    </main>
  );
}
