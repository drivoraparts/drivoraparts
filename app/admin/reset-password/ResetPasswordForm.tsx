"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";

function ResetPasswordFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!token) {
      setError("Missing reset token. Request a new reset link.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error ?? "Reset failed");
        return;
      }

      setMessage(data.message ?? "Password updated.");
      setTimeout(() => {
        router.push("/admin/login");
      }, 1500);
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
        <h1 className="mt-2 text-2xl font-bold">Reset Password</h1>
        <p className="mt-2 text-sm text-gray-400">Choose a new admin password.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label htmlFor="new-password" className="mb-1 block text-sm text-gray-400">
              New password
            </label>
            <input
              id="new-password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-3 outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label htmlFor="confirm-password" className="mb-1 block text-sm text-gray-400">
              Confirm password
            </label>
            <input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-red-600 py-3 font-semibold disabled:opacity-60"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-400">
          <Link href="/admin/forgot-password" className="text-red-400 hover:underline">
            Request new link
          </Link>
          {" · "}
          <Link href="/admin/login" className="text-red-400 hover:underline">
            Back to login
          </Link>
        </p>
      </div>
    </main>
  );
}

export default function ResetPasswordForm() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center text-white">
          Loading...
        </main>
      }
    >
      <ResetPasswordFormInner />
    </Suspense>
  );
}
