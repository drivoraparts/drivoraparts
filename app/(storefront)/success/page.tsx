import SuccessStatus from "./SuccessStatus";
import { buildPageMetadata } from "@/lib/seo";

/*
 * Deliberately neutral. This page serves confirmed, pending and unpaid
 * outcomes alike, and metadata is built before any of them is known — so the
 * tab read "Order Confirmed" above a page saying "Payment Not Completed".
 * SuccessStatus sets a more specific title once the status resolves.
 */
export const metadata = buildPageMetadata({
  title: "Order Status",
  description: "Check the status of your DrivoraParts order.",
  path: "/success",
  noIndex: true,
});

export default async function Success({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string; NP_id?: string; cancelled?: string }>;
}) {
  const params = await searchParams;
  return (
    <SuccessStatus
      orderId={params.orderId ?? null}
      npPaymentId={params.NP_id ?? null}
      cancelled={params.cancelled === "1"}
    />
  );
}
