import { redirect } from "next/navigation";
import SuccessStatus from "./SuccessStatus";
import { buildPageMetadata } from "@/lib/seo";
import { findPaymentByOrderId } from "@/lib/db/payments";
import { isSupabaseConfigured } from "@/lib/env";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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
  const orderId = params.orderId ?? null;

  /*
   * Manual/direct-payment orders belong on /pay/<id>, never here.
   *
   * This page is the crypto status page. For a manual order the order-status
   * API reports pending with no invoice URL, which SuccessStatus reads as an
   * abandoned crypto payment: "Payment Not Completed", plus a Return to
   * Checkout button that places the same order a second time. Checkout now
   * sends manual customers straight to /pay, but orders placed before that --
   * and any bookmark or history entry pointing here -- still arrive, so they
   * are forwarded rather than shown the wrong page.
   */
  if (orderId && UUID.test(orderId) && isSupabaseConfigured()) {
    let isManual = false;
    try {
      const payment = await findPaymentByOrderId(orderId);
      isManual = payment?.provider === "manual";
    } catch {
      // A failed lookup falls through to the normal status page rather than
      // breaking it.
    }
    // redirect() works by throwing, so it has to stay outside the try.
    if (isManual) redirect(`/pay/${encodeURIComponent(orderId)}`);
  }

  return (
    <SuccessStatus
      orderId={orderId}
      npPaymentId={params.NP_id ?? null}
      cancelled={params.cancelled === "1"}
    />
  );
}
