"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { adminUi } from "./admin-ui";
import { MANUAL_STATE_LABELS, type ManualPaymentState } from "@/lib/payments/manual-methods";

/**
 * The manual-payment console for one order.
 *
 * Paste the payment details, press Send, and the customer gets them by email
 * with a link back to their own payment page. When they upload a receipt it
 * appears here, and Mark Payment Verified hands off to the same paid workflow
 * every other paid order goes through.
 *
 * Receipt links arrive already signed and expire in five minutes, so this
 * component never holds a durable URL to a private file.
 */

export type PanelReceipt = {
  path: string;
  contentType: string;
  size: number;
  uploadedAt: string;
  originalName?: string;
  /** Short-lived signed URL minted server-side for this render. */
  url: string | null;
};

const STATE_TONE: Record<ManualPaymentState, string> = {
  awaiting_payment: "bg-amber-100 text-amber-800",
  instructions_sent: "bg-blue-100 text-blue-800",
  receipt_submitted: "bg-violet-100 text-violet-800",
  // Its own colour. It used to share violet with receipt_submitted, so marking
  // an order under review changed nothing you could see at a glance.
  under_review: "bg-cyan-100 text-cyan-800",
  verified: "bg-emerald-100 text-emerald-800",
  verification_failed: "bg-red-100 text-red-800",
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ManualPaymentPanel({
  orderId,
  methodLabel,
  routeLabel,
  state,
  amount,
  currency,
  instructions,
  instructionsSentAt,
  customerNote,
  lastAdminMessage,
  receipts,
  paid,
  closed,
}: {
  orderId: string;
  methodLabel: string;
  /** The bank/transfer route the customer asked for, when the method needs
   * one. Null for Zelle/Cash App/Venmo/Wire, which have no sub-route. */
  routeLabel: string | null;
  state: ManualPaymentState;
  amount: number;
  currency: string;
  instructions: string | null;
  instructionsSentAt: string | null;
  customerNote: string | null;
  lastAdminMessage: string | null;
  receipts: PanelReceipt[];
  paid: boolean;
  /** Cancelled, failed or refunded. The API refuses every action on a closed
   * order, so the controls are withdrawn rather than left to fail. */
  closed: boolean;
}) {
  const router = useRouter();
  const [draft, setDraft] = useState(instructions ?? "");
  const [infoDraft, setInfoDraft] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [isError, setIsError] = useState(false);
  // Which action the current message belongs to, so it renders beside that
  // action's own button. It used to render once, at the very bottom of the
  // panel, whatever was pressed -- so the result of Mark under review or Send
  // instructions, errors included, appeared far from the control and the
  // button looked as though it had done nothing.
  const [statusFor, setStatusFor] = useState<string | null>(null);

  const run = async (action: string, message?: string) => {
    setBusy(action);
    setStatus("");
    setIsError(false);
    setStatusFor(action);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/manual-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, message }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Action failed");

      setStatus(
        data.alreadyVerified
          ? "Already verified — nothing changed."
          : action === "send_instructions"
            ? "Payment instructions emailed to the customer."
            : action === "request_info"
              ? "Message sent to the customer."
              : action === "verify"
                ? "Payment verified. The paid-order workflow has run."
                : action === "mark_under_review"
                  ? "Marked as under review. The customer's page now shows “Payment Under Review”."
                  : "Updated."
      );
      router.refresh();
    } catch (err) {
      setIsError(true);
      setStatus(err instanceof Error ? err.message : "Action failed");
    } finally {
      setBusy(null);
    }
  };

  /** The last action's result, shown beside the control that produced it. */
  const feedback = (forActions: string[]) =>
    status && statusFor && forActions.includes(statusFor) ? (
      <p
        role="status"
        className={`mt-2 text-xs ${isError ? "font-medium text-red-600" : "text-emerald-700"}`}
      >
        {status}
      </p>
    ) : null;

  return (
    <div className="min-w-0 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">
          Manual Payment
        </p>
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${STATE_TONE[state]}`}
        >
          {MANUAL_STATE_LABELS[state]}
        </span>
      </div>

      <div className="mt-2.5 flex flex-wrap gap-x-5 gap-y-1 text-xs text-zinc-500">
        <span>
          Method: <span className="font-medium text-zinc-900">{methodLabel}</span>
        </span>
        {/* The route the customer asked for. This is what says which set of
            instructions to paste below, so it sits beside the method rather
            than buried in the timeline. */}
        {routeLabel ? (
          <span>
            Selected bank/route:{" "}
            <span className="font-medium text-zinc-900">{routeLabel}</span>
          </span>
        ) : null}
        <span>
          Amount:{" "}
          <span className="font-medium text-zinc-900">
            ${amount.toFixed(2)} {currency}
          </span>
        </span>
        {instructionsSentAt ? (
          <span>
            Instructions sent:{" "}
            <span className="font-medium text-zinc-900">
              {new Date(instructionsSentAt).toLocaleString()}
            </span>
          </span>
        ) : null}
      </div>

      {/* Send / re-send payment instructions -------------------------------- */}
      <div className="mt-4 border-t border-zinc-100 pt-3.5">
        <label className="text-xs font-medium text-zinc-700">
          Payment instructions for the customer
        </label>
        <p className="mt-0.5 text-[11px] leading-relaxed text-zinc-500">
          Paste your bank / recipient details for this order. Sent exactly as
          typed, with the order number and amount added automatically. Nothing
          here is stored in the site&apos;s code.
        </p>
        <textarea
          value={draft}
          disabled={busy !== null}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={
            "Bank Name: …\nAccount Name: …\nAccount Number: …\nRouting Number: …\nSWIFT/BIC: …\nBank Address: …"
          }
          rows={7}
          className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-2.5 py-2 font-mono text-xs leading-relaxed"
        />
        <button
          type="button"
          onClick={() => run("send_instructions", draft)}
          disabled={busy !== null || paid || closed || draft.trim().length < 5}
          className={`${adminUi.buttonPrimary} mt-2 !py-1.5 text-xs`}
        >
          {busy === "send_instructions"
            ? "Sending…"
            : instructionsSentAt
              ? "Re-send instructions"
              : "Send instructions"}
        </button>
        {feedback(["send_instructions"])}
      </div>

      {/* What the customer submitted ---------------------------------------- */}
      <div className="mt-4 border-t border-zinc-100 pt-3.5">
        <p className="text-xs font-medium text-zinc-700">Customer receipts</p>
        {receipts.length === 0 ? (
          <p className="mt-1 text-[11px] text-zinc-500">
            None submitted yet. The customer can upload proof of payment from
            their order page.
          </p>
        ) : (
          <ul className="mt-2 space-y-1.5">
            {receipts.map((receipt) => (
              <li
                key={receipt.path}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-zinc-200 px-2.5 py-1.5"
              >
                <span className="min-w-0 text-xs text-zinc-600">
                  {/* break-all: receipt filenames have no spaces to wrap at, and
                      without it a long one runs out past the panel's edge. */}
                  <span className="break-all font-medium text-zinc-900">
                    {receipt.originalName ?? receipt.path.split("/").pop()}
                  </span>
                  <span className="ml-2 text-zinc-400">
                    {formatBytes(receipt.size)} ·{" "}
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
                    View image →
                  </a>
                ) : (
                  <span className="shrink-0 text-xs text-zinc-400">
                    Link unavailable
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}

        {customerNote ? (
          <div className="mt-2.5 rounded-lg bg-zinc-50 px-2.5 py-2">
            <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-500">
              Customer message
            </p>
            <p className="mt-0.5 whitespace-pre-wrap text-xs text-zinc-700">
              {customerNote}
            </p>
          </div>
        ) : null}
      </div>

      {/* Decisions ---------------------------------------------------------- */}
      <div className="mt-4 border-t border-zinc-100 pt-3.5">
        {paid ? (
          <p className="rounded-lg bg-emerald-50 px-2.5 py-2 text-xs text-emerald-800">
            Payment verified. The paid-order workflow has already run for this
            order.
          </p>
        ) : closed ? (
          <p className="rounded-lg bg-zinc-50 px-2.5 py-2 text-xs text-zinc-600">
            This order is closed (cancelled, failed or refunded), so its payment
            can&apos;t be verified and nothing is sent to the customer. Reopen the
            order first if payment has genuinely arrived.
          </p>
        ) : (
          <>
            <p className="text-[11px] leading-relaxed text-zinc-500">
              A submitted receipt only means the customer says they paid. Confirm
              the funds have actually arrived before verifying.
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => run("verify")}
                disabled={busy !== null}
                className="rounded-xl bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
              >
                {busy === "verify" ? "Verifying…" : "Mark payment verified"}
              </button>
              <button
                type="button"
                onClick={() => run("mark_under_review")}
                disabled={busy !== null || state === "under_review"}
                className={`${adminUi.buttonSecondary} !px-4 !py-1.5 text-xs`}
              >
                {busy === "mark_under_review"
                  ? "Saving…"
                  : state === "under_review"
                    ? "Under review ✓"
                    : "Mark under review"}
              </button>
            </div>
            {feedback(["verify", "mark_under_review"])}

            <label className="mt-3 block text-xs font-medium text-zinc-700">
              Request more information
            </label>
            <textarea
              value={infoDraft}
              disabled={busy !== null}
              onChange={(e) => setInfoDraft(e.target.value)}
              placeholder="e.g. The receipt you sent is unreadable — could you send a clearer photo showing the amount and date?"
              rows={3}
              className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-xs"
            />
            <button
              type="button"
              onClick={() => run("request_info", infoDraft)}
              disabled={busy !== null || infoDraft.trim().length < 5}
              className={`${adminUi.buttonSecondary} mt-2 !px-4 !py-1.5 text-xs`}
            >
              {busy === "request_info" ? "Sending…" : "Send request to customer"}
            </button>
            {feedback(["request_info"])}
          </>
        )}

        {lastAdminMessage ? (
          <p className="mt-2.5 text-[11px] text-zinc-500">
            Last message sent:{" "}
            <span className="text-zinc-700">{lastAdminMessage}</span>
          </p>
        ) : null}
      </div>
    </div>
  );
}
