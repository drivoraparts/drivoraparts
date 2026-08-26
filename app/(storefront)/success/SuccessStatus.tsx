"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Price from "@/components/currency/Price";
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
    subtext: "Your order is saved",
    message:
      "Your payment has not been completed yet. Your checkout information has been saved — you can return to the payment page to finish paying.",
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
}: {
  orderId: string | null;
  npPaymentId: string | null;
}) {
  const [view, setView] = useState<View>(
    orderId || npPaymentId ? "confirming" : "unknown"
  );
  const [total, setTotal] = useState<number | null>(null);
  const [resolvedOrderId, setResolvedOrderId] = useState<string | null>(orderId);
  // The invoice the customer already has. Resuming it avoids creating a second
  // order or a second payment session for the same purchase.
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const purchaseTracked = useRef(false);
  const clearCart = useCartStore((s) => s.clearCart);

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
          paymentStatus?: string | null;
          paymentUrl?: string | null;
        };
        if (!active) return false;

        if (typeof data.orderId === "string") {
          setResolvedOrderId(data.orderId);
        }
        if (typeof data.total === "number") setTotal(data.total);
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
  }, [orderId, npPaymentId, clearCart]);

  const { heading, subtext, message } = COPY[view];
  const totalLabel = view === "paid" ? "Total Paid" : "Order Total";

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
            <p className="break-all text-sm text-neutral-900">{resolvedOrderId}</p>
          </div>
          {npPaymentId ? (
            <div>
              <p className="text-xs text-neutral-500">NOWPayments Transaction ID</p>
              <p className="break-all text-sm text-neutral-900">{npPaymentId}</p>
            </div>
          ) : null}
          {total != null ? (
            <div>
              <p className="text-xs text-neutral-500">{totalLabel}</p>
              <p className="text-lg font-medium text-neutral-900">
                <Price usd={total} />
              </p>
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
              className="block w-full rounded-lg bg-red-600 py-3 text-center text-sm font-semibold text-white transition hover:bg-red-500 active:scale-[0.99]"
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
            className="block w-full rounded-lg bg-red-600 py-3 text-center text-sm font-semibold text-white transition hover:bg-red-500 active:scale-[0.99]"
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
