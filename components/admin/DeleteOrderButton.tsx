"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteOrderButton({
  orderId,
  orderNumber,
  redirectTo,
  compact,
}: {
  orderId: string;
  orderNumber: string;
  /** Where to send the admin after a successful delete. Omit to just
   * refresh the current page (e.g. when deleting from a list). */
  redirectTo?: string;
  /** Smaller icon-only rendering for inline use in a list row. */
  compact?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (!window.confirm(`Delete order ${orderNumber}? This permanently removes it and cannot be undone.`)) {
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, { method: "DELETE" });
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      if (!res.ok) {
        throw new Error(data?.error ?? "Delete failed");
      }
      if (redirectTo) {
        router.push(redirectTo);
      } else {
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
      setLoading(false);
    }
  };

  if (compact) {
    return (
      <button
        type="button"
        onClick={handleDelete}
        disabled={loading}
        title={`Delete ${orderNumber}`}
        aria-label={`Delete order ${orderNumber}`}
        className="shrink-0 rounded-md border border-transparent p-1.5 text-zinc-400 transition hover:border-accent-border hover:bg-accent-subtle hover:text-accent-hover disabled:opacity-50"
      >
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
          <path
            fillRule="evenodd"
            d="M8.75 2.75a.75.75 0 0 0-.75.75v.5h-3a.75.75 0 0 0 0 1.5h.32l.83 9.94A2.25 2.25 0 0 0 8.4 17.5h3.2a2.25 2.25 0 0 0 2.25-2.06l.83-9.94h.32a.75.75 0 0 0 0-1.5h-3v-.5a.75.75 0 0 0-.75-.75h-2.5Zm.5 1.5v.25h1.5V4.25h-1.5ZM7.16 5.5l.8 9.82a.75.75 0 0 0 .75.68h3.2a.75.75 0 0 0 .75-.68l.8-9.82H7.16Z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleDelete}
        disabled={loading}
        className="rounded-lg border border-accent-border px-3 py-1.5 text-xs font-semibold text-accent transition hover:bg-accent-subtle disabled:opacity-50"
      >
        {loading ? "Deleting…" : "Delete order"}
      </button>
      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
