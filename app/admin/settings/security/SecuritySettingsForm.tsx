"use client";

import { FormEvent, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4.5 w-4.5">
      <path d="M2 10s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6z" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="10" cy="10" r="2.5" />
    </svg>
  ) : (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4.5 w-4.5">
      <path
        d="M2.5 2.5l15 15M8.3 8.4a2.5 2.5 0 003.3 3.3M6.2 6.3C3.8 7.6 2 10 2 10s3 6 8 6c1.5 0 2.8-.4 3.9-1M11.8 4.4A9.5 9.5 0 0118 10s-.7 1.4-2 2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PasswordField({
  id,
  label,
  value,
  onChange,
  minLength,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  minLength?: number;
}) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm text-zinc-600">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={revealed ? "text" : "password"}
          minLength={minLength}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-xl bg-zinc-50 border border-zinc-200 px-4 py-3 pr-11 outline-none focus:border-red-400/60"
          required
        />
        <button
          type="button"
          onClick={() => setRevealed((v) => !v)}
          aria-label={revealed ? "Hide password" : "Show password"}
          aria-pressed={revealed}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 transition hover:text-zinc-600"
        >
          <EyeIcon open={revealed} />
        </button>
      </div>
    </div>
  );
}

export default function SecuritySettingsForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(false);

  async function handlePasswordSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/admin/settings/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error ?? "Unable to change password");
        return;
      }

      window.location.href = "/admin/login?message=password-changed";
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function invalidateSessions() {
    setSessionLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/admin/settings/invalidate-sessions", {
        method: "POST",
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error ?? "Unable to invalidate sessions");
        return;
      }

      window.location.href = "/admin/login?message=sessions-cleared";
    } catch {
      setError("Network error. Try again.");
    } finally {
      setSessionLoading(false);
    }
  }

  return (
    <AdminShell title="Security Settings">
      <div className="grid gap-8 xl:grid-cols-2">
        <form onSubmit={handlePasswordSubmit} className="space-y-5 rounded-xl bg-white shadow-sm border border-zinc-200 p-6">
          <h2 className="text-lg font-semibold">Change password</h2>

          <PasswordField
            id="current-password"
            label="Current password"
            value={currentPassword}
            onChange={setCurrentPassword}
          />

          <PasswordField
            id="new-password"
            label="New password"
            minLength={8}
            value={newPassword}
            onChange={setNewPassword}
          />

          <PasswordField
            id="confirm-password"
            label="Confirm new password"
            minLength={8}
            value={confirmPassword}
            onChange={setConfirmPassword}
          />

          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold hover:bg-red-500 disabled:opacity-60"
          >
            {loading ? "Updating..." : "Update password"}
          </button>
        </form>

        <div className="space-y-5 rounded-xl bg-white shadow-sm border border-zinc-200 p-6">
          <h2 className="text-lg font-semibold">Session control</h2>
          <p className="text-sm text-zinc-600">
            Invalidate all active admin sessions and force a fresh login on every device.
            This also regenerates the admin session token version so existing JWTs stop working.
          </p>
          <button
            type="button"
            onClick={invalidateSessions}
            disabled={sessionLoading}
            className="rounded-xl border border-zinc-200 px-5 py-3 text-sm font-semibold hover:border-red-500/40 disabled:opacity-60"
          >
            {sessionLoading ? "Clearing..." : "Logout all sessions"}
          </button>
        </div>
      </div>

      {error ? (
        <p className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </p>
      ) : null}
    </AdminShell>
  );
}
