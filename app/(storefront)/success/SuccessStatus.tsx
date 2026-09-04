"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Price from "@/components/currency/Price";
import { formatUsdAsCurrency } from "@/lib/currency/format";
import { useCurrencyStore } from "@/lib/store/currencyStore";
import { useCartStore } from "@/lib/store/cartStore";
import { clearCheckoutFormDraft } from "@/lib/checkout/form-persist";
import { clearCheckoutStartClaim } from "@/lib/checkout/checkout-tracking";
import {
  readMetaCheckoutItems,
  trackMetaPurchase,
} from "@/lib/analytics/meta-pixel";
import { trackTikTokPurchase } from "@/lib/analytics/tiktok-pixel";

/*
 * confirming  - polling; the payment may still be settling
 * paid        - the provider confirmed it; the only state that says "order placed"
 * verifying   - the provider has seen funds but not finished confirming
 * incomplete  - the customer came back without paying, or the invoice lapsed
 * unknown     - arrived here with no order reference at all
 */
type View = "confirming" | "paid" | "verifying" | "incomplete" | "unknown";

const POLL_INTERVAL_MS = 3000;
// ~90s. Crypto confirmations are usually quicker; past this the honest thing
// is to stop claiming we are "confirming" and offer a way to finish paying.
const MAX_ATTEMPTS = 30;

const COPY: Record<View, { heading: string; subtext: string; message: string }> = {
  paid: {
    heading: "Payment Successful",
    subtext: "Your order is confirmed",
    message: "We've received your payment and confirmed your order.",
  },
  confirming: {
    heading: "Confirming Your Payment",
    subtext: "This page updates automatically",
    message:
      "Please wait while we confirm your payment with the provider. You don't need to refresh — this page updates on its own.",
  },
  verifying: {
    heading: "Payment Pending",
    subtext: "Your payment is being verified",
    message:
      "We can see your payment and are waiting for it to confirm. Please don't send another payment — this page updates on its own, and your order is safe.",
  },
  incomplete: {
    heading: "Payment Not Completed",
    subtext: "Your details are saved",
    message:
      "We haven't received your payment yet. Your cart and checkout details are saved — use the button below to finish paying. If you have just paid, leave this page open: it updates on its own as soon as the payment confirms.",
  },
  unknown: {
    heading: "Order Received",
    subtext: "Your order is being processed",
    message: "Your order is being processed.",
  },
};

export default function SuccessStatus({
  orderId,
  npPaymentId,
  cancelled = false,
}: {
  orderId: string | null;
  npPaymentId: string | null;
  /**
   * Arrived through the payment page's cancel button. Never used to decide
   * what the customer is told — the server does that — only to stop polling
   * for a payment that was never started.
   */
  cancelled?: boolean;
}) {
  const [view, setView] = useState<View>(
    orderId || npPaymentId ? "confirming" : "unknown"
  );
  const [total, setTotal] = useState<number | null>(null);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  type StatusItem = { name: string; quantity: number; price: number; image: string | null };
  const [items, setItems] = useState<StatusItem[]>([]);
  const [resolvedOrderId, setResolvedOrderId] = useState<string | null>(orderId);
  // The invoice the customer already has. Resuming it avoids creating a second
  // order or a second payment session for the same purchase.
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const purchaseTracked = useRef(false);
  const clearCart = useCartStore((s) => s.clearCart);
  // Only to decide whether an approximate line is worth showing; the amount due
  // is always rendered in USD, the currency the invoice settles in.
  const currency = useCurrencyStore((s) => s.currency);
  const locale = useCurrencyStore((s) => s.locale);

  useEffect(() => {
    if (!orderId && !npPaymentId) return;

    let active = true;
    let attempts = 0;

    const query = new URLSearchParams();
    if (orderId) query.set("orderId", orderId);
    if (npPaymentId) query.set("NP_id", npPaymentId);

    const check = async (): Promise<boolean> => {
      try {
        const res = await fetch(`/api/public/order-status?${query.toString()}`, {
          cache: "no-store",
        });
        if (!active) return false;

        if (res.status === 503) {
          setView("unknown");
          return true;
        }

        if (!res.ok) return false;

        const data = (await res.json()) as {
          status?: string;
          total?: number;
          orderId?: string;
          orderNumber?: string;
          items?: StatusItem[];
          paymentStatus?: string | null;
          paymentUrl?: string | null;
        };
        if (!active) return false;

        if (typeof data.orderId === "string") {
          setResolvedOrderId(data.orderId);
        }
        if (typeof data.total === "number") setTotal(data.total);
        if (typeof data.orderNumber === "string") setOrderNumber(data.orderNumber);
        if (Array.isArray(data.items)) setItems(data.items);
        if (typeof data.paymentUrl === "string") setPaymentUrl(data.paymentUrl);

        if (data.status === "paid") {
          setView("paid");
          // Only now -- payment is actually confirmed -- is it safe to
          // clear the cart. Clearing it earlier (e.g. when Pay Now is
          // clicked) would wipe the customer's cart before they've even
          // paid, so backing out of NOWPayments landed on an empty cart.
          clearCart();
          clearCheckoutFormDraft();
          // Release the checkout_start claim too, so a second order in the
          // same session is counted rather than suppressed as a repeat.
          clearCheckoutStartClaim();
          if (
            !purchaseTracked.current &&
            typeof data.total === "number" &&
            typeof data.orderId === "string"
          ) {
            purchaseTracked.current = true;
            const items = readMetaCheckoutItems();
            trackTikTokPurchase({
              orderId: data.orderId,
              value: data.total,
              items,
            });
            trackMetaPurchase({
              orderId: data.orderId,
              value: data.total,
              items,
            });
          }
          return true;
        }
        if (data.status === "failed" || data.status === "cancelled") {
          setView("incomplete");
          return true;
        }

        /*
         * The order is still pending, so the payment record decides what the
         * customer is told. "processing" means the provider has seen the funds
         * and is confirming them — worth saying so, and worth warning against
         * paying twice. An expired or failed invoice is finished: stop polling
         * and offer to start payment again. Anything else keeps polling.
         */
        if (data.paymentStatus === "processing") {
          setView("verifying");
          return false;
        }
        if (
          data.paymentStatus === "expired" ||
          data.paymentStatus === "failed"
        ) {
          setView("incomplete");
          return true;
        }

        /*
         * No confirmed payment on the first answer from the server, so show
         * that straight away — with the button to finish paying — rather than
         * holding a spinner for ninety seconds. Most people arriving here
         * without a payment simply left the invoice.
         *
         * Polling continues underneath: if the customer did pay and the
         * webhook is still in flight, this flips to Payment Successful on its
         * own, which is why the copy tells them to leave the page open.
         * Returning false keeps the interval alive.
         */
        setView((current) => (current === "paid" ? current : "incomplete"));

        // Pressing cancel means no payment was made, so there is nothing to
        // wait for — stop polling instead of asking thirty more times. Any
        // other route keeps checking, in case a webhook is still in flight.
        return cancelled;
      } catch {
        // transient — keep polling
      }
      return false;
    };

    const interval = setInterval(async () => {
      attempts += 1;
      const done = await check();
      if (done) {
        clearInterval(interval);
        return;
      }
      if (attempts >= MAX_ATTEMPTS) {
        clearInterval(interval);
        // Nothing confirmed in the polling window. Previously the page simply
        // stopped, leaving "Confirming Your Payment" on screen indefinitely
        // with no way forward.
        if (active) {
          setView((current) =>
            current === "paid" || current === "verifying" ? current : "incomplete"
          );
        }
      }
    }, POLL_INTERVAL_MS);

    void check();

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [orderId, npPaymentId, clearCart, cancelled]);

  const { heading, subtext, message } = COPY[view];
  const totalLabel = view === "paid" ? "Total Paid" : "Order Total";

  // Keep the tab honest as the state resolves — it is what the customer sees
  // in their history and when switching windows.
  useEffect(() => {
    document.title = `${heading} | DrivoraParts`;
  }, [heading]);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col overflow-x-hidden bg-white px-4 py-10 text-neutral-900 sm:px-6 sm:py-12">
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <img
          src="/brand/drivora-checkout.png"
          alt="DrivoraParts"
          width={40}
          height={40}
          className="h-10 w-10 rounded-sm border border-neutral-200 bg-white object-contain p-1"
        />
        <div>
          <h1 className="text-lg font-semibold text-neutral-900">{heading}</h1>
          <p className="text-xs text-neutral-500">{subtext}</p>
        </div>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-center">
        <p className="text-sm text-neutral-700">{message}</p>
      </div>

      {resolvedOrderId ? (
        <div className="mt-4 space-y-3 rounded-xl border border-neutral-200 bg-white p-4">
          <div>
            <p className="text-xs text-neutral-500">Order ID</p>
            <p className="break-all text-sm text-neutral-900">
              {orderNumber ?? resolvedOrderId}
            </p>
            {orderNumber ? (
              <p className="break-all text-[11px] text-neutral-400">
                {resolvedOrderId}
              </p>
            ) : null}
          </div>

          {/*
            * What the money is for.
            *
            * The page showed a total and the order id and nothing else, so
            * someone deciding whether to send $9,756.50 could not see from it
            * which part they were paying for. The lines come from the same
            * server response as the status, so they are the order's own
            * snapshot rather than anything read back out of the cart.
            */}
          {items.length > 0 ? (
            <div>
              <p className="mb-1.5 text-xs text-neutral-500">Items</p>
              <ul className="space-y-1.5">
                {items.map((item, index) => (
                  <li
                    key={`${item.name}-${index}`}
                    className="flex items-start justify-between gap-3 text-sm"
                  >
                    <span className="min-w-0 text-neutral-900">
                      {item.name}
                      {item.quantity > 1 ? (
                        <span className="text-neutral-500"> × {item.quantity}</span>
                      ) : null}
                    </span>
                    <span className="shrink-0 tabular-nums text-neutral-700">
                      {formatUsdAsCurrency(item.price * item.quantity, "USD", 1, locale)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {npPaymentId ? (
            <div>
              <p className="text-xs text-neutral-500">NOWPayments Transaction ID</p>
              <p className="break-all text-sm text-neutral-900">{npPaymentId}</p>
            </div>
          ) : null}
          {total != null ? (
            /*
             * USD is the figure, not a converted one.
             *
             * This used to render <Price usd={total} />, which converts into
             * whichever currency the visitor is browsing in. On a catalog page
             * that is the point; on the page where someone is about to pay it
             * is a different number from the one NOWPayments will charge. A
             * $9,756.50 invoice was being shown as "FCFA 6,507,928" directly
             * above a Continue Payment button that opens a USD invoice.
             *
             * The settlement amount leads. When the visitor is browsing in
             * another currency the converted value is kept underneath, clearly
             * marked approximate, so the familiar figure is not lost -- it just
             * stops impersonating the amount due.
             */
            <div>
              <p className="text-xs text-neutral-500">{totalLabel}</p>
              <p className="text-lg font-medium text-neutral-900">
                {formatUsdAsCurrency(total, "USD", 1, locale)}
              </p>
              {currency !== "USD" ? (
                <p className="text-xs text-neutral-500">
                  {/* Explicit {" "}: Price renders a <span>, and the literal
                      space after it was being dropped, so the line read
                      "FCFA 5,507,928at today's rate". */}
                  ≈ <Price usd={total} />
                  {" at today’s rate · charged in USD"}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}

      {view === "incomplete" ? (
        /*
         * Resuming the stored invoice rather than sending the customer back
         * through checkout: a fresh checkout would create a second order and a
         * second payment session for the same purchase. Falls back to checkout
         * only when no invoice URL was recorded.
         */
        <div className="mt-5 space-y-2">
          {paymentUrl ? (
            <a
              href={paymentUrl}
              className="block w-full rounded-lg bg-accent py-3 text-center text-sm font-semibold text-white transition hover:bg-accent-hover active:scale-[0.99]"
            >
              Continue Payment
            </a>
          ) : null}
          <Link
            href="/checkout"
            className="block w-full rounded-lg border border-neutral-300 py-3 text-center text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50"
          >
            Return to Checkout
          </Link>
          <p className="px-1 pt-1 text-center text-xs text-neutral-500">
            Your cart and checkout details are still saved. You will not be
            charged twice — this reopens the same payment.
          </p>
        </div>
      ) : (
        <div className="mt-5 space-y-2">
          <Link
            href="/catalog"
            className="block w-full rounded-lg bg-accent py-3 text-center text-sm font-semibold text-white transition hover:bg-accent-hover active:scale-[0.99]"
          >
            Continue Shopping
          </Link>
          <Link
            href="/"
            className="block w-full rounded-lg border border-neutral-300 py-3 text-center text-sm text-neutral-700 transition hover:bg-neutral-50"
          >
            Back to Home
          </Link>
        </div>
      )}
    </main>
  );
}
