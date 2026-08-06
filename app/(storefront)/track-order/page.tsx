import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import TrackOrderForm from "@/components/orders/TrackOrderForm";

export const metadata: Metadata = buildPageMetadata({
  title: "Track Your Order",
  description: "Check the status of your DrivoraParts order using your order ID.",
  path: "/track-order",
});

export default function TrackOrderPage() {
  return (
    <main className="mx-auto max-w-xl bg-white px-6 py-12 text-neutral-900">
      <h1 className="mb-2 text-4xl font-bold">Track Your Order</h1>
      <p className="mb-8 text-neutral-600">
        Enter your order ID to check its current status. You can find this in
        your order confirmation email.
      </p>

      <TrackOrderForm />
    </main>
  );
}
