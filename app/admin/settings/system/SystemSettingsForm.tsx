"use client";

import { FormEvent, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import type { PaymentMode } from "@/lib/admin/system-settings";

export default function SystemSettingsForm({
  initialSiteUrl,
  initialPaymentMode,
  initialTawkEnabled,
  cryptomusConfigured,
}: {
  initialSiteUrl: string;
  initialPaymentMode: PaymentMode;
  initialTawkEnabled: boolean;
  cryptomusConfigured: boolean;
}) {
  const [paymentMode, setPaymentMode] = useState<PaymentMode>(initialPaymentMode);
  const [tawkEnabled, setTawkEnabled] = useState(initialTawkEnabled);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/settings/system", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentMode, tawkEnabled }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error ?? "Unable to save settings");
        return;
      }

      setMessage("System settings updated for this runtime.");
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminShell title="System Settings">
      <form onSubmit={handleSubmit} className="max-w-xl space-y-5">
        <div>
          <label htmlFor="site-url" className="mb-2 block text-sm text-zinc-400">
            Site URL
          </label>
          <input
            id="site-url"
            type="url"
            value={initialSiteUrl}
            disabled
            className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-zinc-400"
          />
          <p className="mt-2 text-xs text-zinc-500">
            Managed via NEXT_PUBLIC_SITE_URL in your deployment environment.
          </p>
        </div>

        <div>
          <label htmlFor="payment-mode" className="mb-2 block text-sm text-zinc-400">
            Payment mode
          </label>
          <select
            id="payment-mode"
            value={paymentMode}
            onChange={(event) => setPaymentMode(event.target.value as PaymentMode)}
            className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-red-400/60"
          >
            <option value="auto">Auto (Cryptomus if configured)</option>
            <option value="cryptomus">Cryptomus only</option>
            <option value="manual">Manual fallback only</option>
          </select>
          <p className="mt-2 text-xs text-zinc-500">
            Cryptomus keys {cryptomusConfigured ? "are configured" : "are not configured"}.
          </p>
        </div>

        <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/20 px-4 py-3">
          <input
            type="checkbox"
            checked={tawkEnabled}
            onChange={(event) => setTawkEnabled(event.target.checked)}
            className="h-4 w-4"
          />
          <span className="text-sm">Enable Tawk live chat widget on storefront</span>
        </label>

        {error ? (
          <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
            {error}
          </p>
        ) : null}
        {message ? (
          <p className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
            {message}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold hover:bg-red-500 disabled:opacity-60"
        >
          {loading ? "Saving..." : "Save system settings"}
        </button>
      </form>
    </AdminShell>
  );
}
