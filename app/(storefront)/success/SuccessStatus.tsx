"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Price from "@/components/currency/Price";

type View = "pending" | "paid" | "failed" | "unknown";

const POLL_INTERVAL_MS = 3000;
const MAX_ATTEMPTS = 40; // ~2 minutes

const COPY: Record<View, { heading: string; subtext: string; message: string }> = {
  paid: {
    heading: "Payment Successful",
    subtext: "Your order is confirmed",
    message: "We've received your payment and confirmed your order.",
  },
  pending: {
    heading: "Confirming Your Payment",
    subtext: "This page updates automatically",
    message:
      "Please wait while we confirm your payment with the provider. You don't need to refresh — this page updates on its own.",
  },
  failed: {
    heading: "Payment Not Confirmed",
    subtext: "We're still verifying",
    message:
      "We couldn't confirm your payment yet. If you were charged, it will be reconciled automatically — please contact support if this persists.",
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
    orderId || npPaymentId ? "pending" : "unknown"
  );
  const [total, setTotal] = useState<number | null>(null);
  const [resolvedOrderId, setResolvedOrderId] = useState<string | null>(orderId);

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
        };
        if (!active) return false;

        if (typeof data.orderId === "string") {
          setResolvedOrderId(data.orderId);
        }
        if (typeof data.total === "number") setTotal(data.total);

        if (data.status === "paid") {
          setView("paid");
          return true;
        }
        if (data.status === "failed" || data.status === "cancelled") {
          setView("failed");
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
      if (done || attempts >= MAX_ATTEMPTS) clearInterval(interval);
    }, POLL_INTERVAL_MS);

    void check();

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [orderId, npPaymentId]);

  const { heading, subtext, message } = COPY[view];
  const totalLabel = view === "paid" ? "Total Paid" : "Order Total";

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col overflow-x-hidden px-4 py-10 text-white sm:px-6 sm:py-12">
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <img
          src="/brand/drivora-checkout.png"
          alt="DrivoraParts"
          width={40}
          height={40}
          className="h-10 w-10 rounded-sm bg-white/95 object-contain p-1"
        />
        <div>
          <h1 className="text-lg font-semibold text-white">{heading}</h1>
          <p className="text-xs text-white/50">{subtext}</p>
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-black/40 p-4 text-center">
        <p className="text-sm text-white/80">{message}</p>
      </div>

      {resolvedOrderId ? (
        <div className="mt-4 space-y-3 rounded-xl border border-white/10 bg-black/40 p-4">
          <div>
            <p className="text-xs text-white/50">Order ID</p>
            <p className="break-all text-sm text-white">{resolvedOrderId}</p>
          </div>
          {total != null ? (
            <div>
              <p className="text-xs text-white/50">{totalLabel}</p>
              <p className="text-lg font-medium text-white">
                <Price usd={total} />
              </p>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="mt-5 space-y-2">
        <Link
          href="/catalog"
          className="block w-full rounded-lg bg-red-600 py-3 text-center text-sm font-semibold text-white transition hover:bg-red-500 active:scale-[0.99]"
        >
          Continue Shopping
        </Link>
        <Link
          href="/"
          className="block w-full rounded-lg border border-white/10 py-3 text-center text-sm text-white/80 transition hover:bg-white/5"
        >
          Back to Home
        </Link>
      </div>
    </main>
  );
}
