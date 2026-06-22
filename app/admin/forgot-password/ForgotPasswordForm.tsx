"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [resetUrl, setResetUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");
    setResetUrl("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error ?? "Request failed");
        return;
      }

      setMessage(data.message ?? "Check your email for a reset link.");
      if (typeof data.resetUrl === "string") {
        setResetUrl(data.resetUrl);
      }
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
      <div className="w-full max-w-md rounded-xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl">
        <p className="text-sm uppercase tracking-widest text-red-500">DrivoraParts</p>
        <h1 className="mt-2 text-2xl font-bold">Forgot Password</h1>
        <p className="mt-2 text-sm text-gray-400">
          Enter your admin email. We will send a reset link if the account exists.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label htmlFor="forgot-email" className="mb-1 block text-sm text-gray-400">
              Email
            </label>
            <input
              id="forgot-email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-3 outline-none focus:border-red-500"
            />
          </div>

          {error ? (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-200">
              {error}
            </p>
          ) : null}

          {message ? (
            <p className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-2 text-sm text-green-200">
              {message}
            </p>
          ) : null}

          {resetUrl ? (
            <p className="break-all rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-2 text-xs text-yellow-100">
              Dev reset link:{" "}
              <a href={resetUrl} className="underline">
                {resetUrl}
              </a>
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-red-600 py-3 font-semibold disabled:opacity-60"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-400">
          <Link href="/admin/login" className="text-red-400 hover:underline">
            Back to login
          </Link>
        </p>
      </div>
    </main>
  );
}
