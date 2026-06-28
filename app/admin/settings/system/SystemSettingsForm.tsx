"use client";

import { FormEvent, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import type { PaymentMode } from "@/lib/admin/system-settings";

export default function SystemSettingsForm({
  initialSiteUrl,
  initialPaymentMode,
  initialTawkEnabled,
  nowpaymentsConfigured,
  analyticsReady,
}: {
  initialSiteUrl: string;
  initialPaymentMode: PaymentMode;
  initialTawkEnabled: boolean;
  nowpaymentsConfigured: boolean;
  analyticsReady: boolean;
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
      <section className="mb-8 max-w-2xl rounded-xl border border-amber-200 bg-amber-50 p-5">
        <h2 className="text-lg font-semibold text-amber-950">Supabase analytics setup</h2>
        <p className="mt-2 text-sm text-amber-900">
          Status:{" "}
          <span className="font-semibold">
            {analyticsReady ? "Connected" : "Not connected — dashboard shows placeholder metrics"}
          </span>
        </p>
        {!analyticsReady ? (
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-amber-900">
            <li>Create a Supabase project at supabase.com.</li>
            <li>
              In Cloudflare Pages → your project → Settings → Environment variables, add{" "}
              <code className="rounded bg-amber-100 px-1">NEXT_PUBLIC_SUPABASE_URL</code>,{" "}
              <code className="rounded bg-amber-100 px-1">NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code>{" "}
              (or <code className="rounded bg-amber-100 px-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>
              ), and <code className="rounded bg-amber-100 px-1">SUPABASE_SERVICE_ROLE_KEY</code>.
            </li>
            <li>
              Run <code className="rounded bg-amber-100 px-1">supabase/migrations/001_initial_schema.sql</code>{" "}
              in the Supabase SQL Editor.
            </li>
            <li>Redeploy the site, then refresh this dashboard.</li>
          </ol>
        ) : (
          <p className="mt-2 text-sm text-amber-900">
            Orders, analytics events, and AI insights will read from your Supabase database.
          </p>
        )}
      </section>

      <form onSubmit={handleSubmit} className="max-w-xl space-y-5">
        <div>
          <label htmlFor="site-url" className="mb-2 block text-sm text-zinc-600">
            Site URL
          </label>
          <input
            id="site-url"
            type="url"
            value={initialSiteUrl}
            disabled
            className="w-full rounded-xl bg-zinc-50 border border-zinc-200 px-4 py-3 text-zinc-600"
          />
          <p className="mt-2 text-xs text-zinc-600">
            Managed via NEXT_PUBLIC_SITE_URL in your deployment environment.
          </p>
        </div>

        <div>
          <label htmlFor="payment-mode" className="mb-2 block text-sm text-zinc-600">
            Payment mode
          </label>
          <select
            id="payment-mode"
            value={paymentMode}
            onChange={(event) => setPaymentMode(event.target.value as PaymentMode)}
            className="w-full rounded-xl bg-zinc-50 border border-zinc-200 px-4 py-3 outline-none focus:border-red-400/60"
          >
            <option value="auto">Auto (NOWPayments)</option>
            <option value="nowpayments">NOWPayments only</option>
            <option value="manual">Manual fallback only</option>
          </select>
          <p className="mt-2 text-xs text-zinc-600">
            NOWPayments API keys{" "}
            {nowpaymentsConfigured
              ? "are configured for dynamic invoices and IPN webhooks."
              : "are not set — checkout still redirects to your NOWPayments payment link."}
          </p>
        </div>

        <label className="flex items-center gap-3 rounded-xl bg-zinc-50 border border-zinc-200 px-4 py-3">
          <input
            type="checkbox"
            checked={tawkEnabled}
            onChange={(event) => setTawkEnabled(event.target.checked)}
            className="h-4 w-4"
          />
          <span className="text-sm">Enable Tawk live chat widget on storefront</span>
        </label>

        {error ? (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}
        {message ? (
          <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
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
