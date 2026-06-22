"use client";

import { FormEvent, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";

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
        <form onSubmit={handlePasswordSubmit} className="space-y-5 rounded-xl border border-white/10 bg-white/[0.04] p-6">
          <h2 className="text-lg font-semibold">Change password</h2>

          <div>
            <label htmlFor="current-password" className="mb-2 block text-sm text-zinc-400">
              Current password
            </label>
            <input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-red-400/60"
              required
            />
          </div>

          <div>
            <label htmlFor="new-password" className="mb-2 block text-sm text-zinc-400">
              New password
            </label>
            <input
              id="new-password"
              type="password"
              minLength={8}
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-red-400/60"
              required
            />
          </div>

          <div>
            <label htmlFor="confirm-password" className="mb-2 block text-sm text-zinc-400">
              Confirm new password
            </label>
            <input
              id="confirm-password"
              type="password"
              minLength={8}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-red-400/60"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold hover:bg-red-500 disabled:opacity-60"
          >
            {loading ? "Updating..." : "Update password"}
          </button>
        </form>

        <div className="space-y-5 rounded-xl border border-white/10 bg-white/[0.04] p-6">
          <h2 className="text-lg font-semibold">Session control</h2>
          <p className="text-sm text-zinc-400">
            Invalidate all active admin sessions and force a fresh login on every device.
            This also regenerates the admin session token version so existing JWTs stop working.
          </p>
          <button
            type="button"
            onClick={invalidateSessions}
            disabled={sessionLoading}
            className="rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold hover:border-red-500/40 disabled:opacity-60"
          >
            {sessionLoading ? "Clearing..." : "Logout all sessions"}
          </button>
        </div>
      </div>

      {error ? (
        <p className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="mt-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
          {message}
        </p>
      ) : null}
    </AdminShell>
  );
}
