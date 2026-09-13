import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { buildPageMetadata } from "@/lib/seo";
import { getOrderById } from "@/lib/db/orders";
import { findPaymentByOrderId } from "@/lib/db/payments";
import { readManualPayment } from "@/lib/payments/manual-payment";
import { createReceiptSignedUrl } from "@/lib/payments/receipt-storage";
import {
  getManualMethod,
  MANUAL_STATE_LABELS,
} from "@/lib/payments/manual-methods";
import PaymentSteps from "./PaymentSteps";
import ReceiptUpload from "./ReceiptUpload";

/*
 * The customer's durable home for a manual payment.
 *
 * Deliberately NOT part of /success. A customer paying by bank transfer may be
 * days away from having anything to upload -- they need somewhere to come back
 * to after they have actually sent the money, from whichever device is to hand,
 * without hunting through email. Every manual email points here.
 *
 * The order id in the URL is the capability, exactly as it is for
 * /api/public/order-resume: an unguessable v4 UUID, only ever sent to the
 * address on the order. The page is noindex so it never enters a search index,
 * and it renders only what the buyer already knows -- their own items, total
 * and payment state. No invoice URLs, no internal ids, no other customer's
 * anything.
 */

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildPageMetadata({
  title: "Your Payment",
  description: "View your DrivoraParts payment instructions and submit your receipt.",
  path: "/pay",
  noIndex: true,
});

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const card =
  "rounded-xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6";

export default async function PayPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  if (!UUID.test(orderId)) notFound();

  const order = await getOrderById(orderId);
  if (!order) notFound();

  const payment = await findPaymentByOrderId(order.id);
  const manual = readManualPayment(payment);

  // A crypto order has its own status page with its own invoice handling.
  if (!manual) {
    redirect(`/success?orderId=${encodeURIComponent(order.id)}`);
  }

  const methodLabel = getManualMethod(manual.method)?.label ?? "Bank Transfer";
  const total = Number(order.total);
  const closed =
    order.status === "cancelled" ||
    order.status === "failed" ||
    order.status === "refunded";

  // The customer's own receipts, signed for five minutes so they can confirm
  // what they sent. Their own files, on their own order -- nobody else's.
  const receipts = await Promise.all(
    manual.receipts.map(async (receipt) => ({
      ...receipt,
      url: await createReceiptSignedUrl(receipt.path),
    }))
  );

  return (
    <main className="mx-auto max-w-3xl bg-white px-5 py-8 text-neutral-900 sm:px-6 sm:py-10">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
        Payment {manual.paid ? "confirmed" : "confirmation"}
      </p>
      <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
        Order #{order.order_number}
      </h1>

      <div className="mt-4 flex flex-wrap gap-x-8 gap-y-2 border-y border-neutral-200 py-3.5 text-sm">
        <span className="text-neutral-500">
          Amount:{" "}
          <span className="font-semibold text-neutral-900">
            ${total.toFixed(2)} USD
          </span>
        </span>
        <span className="text-neutral-500">
          Payment method:{" "}
          <span className="font-semibold text-neutral-900">{methodLabel}</span>
        </span>
        <span className="text-neutral-500">
          Status:{" "}
          <span
            className={`font-semibold ${
              manual.paid
                ? "text-emerald-700"
                : manual.state === "verification_failed"
                  ? "text-red-600"
                  : "text-neutral-900"
            }`}
          >
            {MANUAL_STATE_LABELS[manual.state]}
          </span>
        </span>
      </div>

      {manual.paid ? (
        <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4">
          <p className="font-semibold text-emerald-900">
            Payment verified — thank you.
          </p>
          <p className="mt-1 text-sm text-emerald-800">
            We have confirmed your payment and your order is being prepared. You
            can follow it from{" "}
            <Link
              href={`/track-order?order=${encodeURIComponent(order.order_number)}`}
              className="underline underline-offset-2"
            >
              Track Your Order
            </Link>
            .
          </p>
        </div>
      ) : closed ? (
        <div className="mt-6 rounded-xl border border-neutral-200 bg-neutral-50 px-5 py-4">
          <p className="font-semibold text-neutral-900">
            This order is no longer active.
          </p>
          <p className="mt-1 text-sm text-neutral-600">
            Please{" "}
            <Link href="/contact" className="text-accent underline underline-offset-2">
              contact support
            </Link>{" "}
            if you believe this is a mistake.
          </p>
        </div>
      ) : null}

      {/*
        min-w-0 on both columns is load-bearing. Grid items default to
        min-width: auto, so a single unbreakable string anywhere inside -- a
        phone receipt's filename, a long IBAN in the instructions -- stretches
        the whole track past the viewport, and on mobile both columns share that
        one track. That is what pushed this page off the right edge the moment a
        receipt appeared under "Receipts you sent".
      */}
      <div className="mt-6 grid gap-5 lg:grid-cols-5">
        <div className="min-w-0 space-y-5 lg:col-span-3">
          {/* Instructions -------------------------------------------------- */}
          <section className={card}>
            <h2 className="text-base font-bold">Payment instructions</h2>
            {manual.instructions ? (
              <>
                <p className="mt-1 text-sm text-neutral-600">
                  Send the exact amount below using these details, then upload
                  your receipt.
                </p>
                <pre className="mt-3 overflow-x-auto whitespace-pre-wrap break-words rounded-lg bg-neutral-50 p-4 font-mono text-[13px] leading-relaxed text-neutral-900">
                  {manual.instructions}
                </pre>
                <p className="mt-3 text-xs text-neutral-500">
                  Use <strong>{order.order_number}</strong> as your payment
                  reference where possible.
                </p>
              </>
            ) : (
              /*
               * Waiting state: an admin has not sent this order's real payment
               * details yet. Deliberately shows no bank or recipient
               * information and no payment-reference advice -- there is
               * nothing to pay to until those details exist, and the moment
               * they are sent the branch above replaces this with them.
               */
              <>
                <p className="mt-1.5 text-sm font-semibold text-neutral-900">
                  Payment details are being prepared
                </p>
                <p className="mt-1 text-sm text-neutral-600">
                  You will receive another email from DrivoraParts with the
                  payment details for your selected payment method. Please keep
                  an eye on your inbox — your payment instructions will be sent
                  there shortly.
                </p>
              </>
            )}
          </section>

          {/* Message from DrivoraParts ------------------------------------- */}
          {manual.lastAdminMessage ? (
            <section className="rounded-xl border border-amber-200 bg-amber-50 p-5">
              <h2 className="text-sm font-bold text-amber-900">
                Message from DrivoraParts
              </h2>
              <p className="mt-1.5 whitespace-pre-wrap text-sm text-amber-900">
                {manual.lastAdminMessage}
              </p>
            </section>
          ) : null}

          {/* Upload -------------------------------------------------------- */}
          {!manual.paid && !closed ? (
            <section className={card}>
              <h2 className="text-base font-bold">
                Have you completed your payment?
              </h2>
              <p className="mb-4 mt-1 text-sm text-neutral-600">
                Upload your payment receipt — a bank screenshot, transfer
                confirmation or wire receipt — and we will verify it.
              </p>
              <ReceiptUpload orderId={order.id} />
            </section>
          ) : null}

          {/* What they already sent ---------------------------------------- */}
          {receipts.length > 0 ? (
            <section className={card}>
              <h2 className="text-base font-bold">Receipts you sent</h2>
              <ul className="mt-3 space-y-2">
                {receipts.map((receipt) => (
                  <li
                    key={receipt.path}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-neutral-200 px-3 py-2"
                  >
                    <span className="min-w-0 text-xs text-neutral-600">
                      {/* break-all: filenames have no spaces to wrap at. */}
                      <span className="break-all font-medium text-neutral-900">
                        {receipt.originalName ?? "Receipt"}
                      </span>
                      <span className="ml-2 text-neutral-400">
                        {new Date(receipt.uploadedAt).toLocaleString()}
                      </span>
                    </span>
                    {receipt.url ? (
                      <a
                        href={receipt.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 text-xs font-semibold text-accent hover:text-accent-hover"
                      >
                        View →
                      </a>
                    ) : null}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>

        {/* Sidebar ---------------------------------------------------------- */}
        <div className="min-w-0 space-y-5 lg:col-span-2">
          <section className={card}>
            <h2 className="text-sm font-bold">Payment progress</h2>
            <div className="mt-3">
              <PaymentSteps state={manual.state} />
            </div>
            {manual.state === "verification_failed" ? (
              <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
                We could not verify your last receipt. Please check the message
                above and upload another.
              </p>
            ) : null}
          </section>

          <section className={card}>
            <h2 className="text-sm font-bold">Your order</h2>
            <ul className="mt-3 divide-y divide-neutral-100">
              {order.items.map((item) => (
                <li key={item.id} className="flex justify-between gap-3 py-2">
                  <span className="min-w-0 text-xs text-neutral-700">
                    {item.name}
                    <span className="block text-neutral-400">
                      Qty {item.quantity}
                    </span>
                  </span>
                  <span className="shrink-0 text-xs font-medium text-neutral-900">
                    ${(Number(item.price) * item.quantity).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex justify-between border-t border-neutral-200 pt-3 text-sm font-bold">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </section>

          <p className="text-xs leading-relaxed text-neutral-500">
            Your order will remain pending until DrivoraParts confirms receipt of
            payment. Do not send additional payment unless instructed.{" "}
            <Link href="/contact" className="text-accent underline underline-offset-2">
              Contact support
            </Link>{" "}
            with any questions.
          </p>
        </div>
      </div>
    </main>
  );
}
