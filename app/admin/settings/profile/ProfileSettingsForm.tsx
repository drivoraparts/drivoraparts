"use client";

import { FormEvent, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";

export default function ProfileSettingsForm({
  email,
  initialDisplayName,
}: {
  email: string;
  initialDisplayName: string;
}) {
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/settings/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error ?? "Unable to save profile");
        return;
      }

      setMessage("Profile updated.");
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminShell title="Profile Settings">
      <form onSubmit={handleSubmit} className="max-w-xl space-y-5">
        <div>
          <label htmlFor="admin-email" className="mb-2 block text-sm text-zinc-600">
            Admin email
          </label>
          <input
            id="admin-email"
            type="email"
            value={email}
            disabled
            className="w-full rounded-xl bg-zinc-50 border border-zinc-200 px-4 py-3 text-zinc-600"
          />
          <p className="mt-2 text-xs text-zinc-600">
            Email is managed via ADMIN_EMAIL environment variable.
          </p>
        </div>

        <div>
          <label htmlFor="display-name" className="mb-2 block text-sm text-zinc-600">
            Display name
          </label>
          <input
            id="display-name"
            type="text"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            className="w-full rounded-xl bg-zinc-50 border border-zinc-200 px-4 py-3 outline-none focus:border-red-400/60"
          />
        </div>

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
          {loading ? "Saving..." : "Save profile"}
        </button>
      </form>
    </AdminShell>
  );
}
