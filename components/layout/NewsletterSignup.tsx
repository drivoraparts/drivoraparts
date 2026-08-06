"use client";

import { useState, type FormEvent } from "react";
import { showToast } from "@/lib/store/toastStore";

export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting || !email.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), source: "footer" }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };

      if (!res.ok) {
        showToast(data.error ?? "Could not subscribe. Please try again.");
        return;
      }

      setSubscribed(true);
      setEmail("");
    } catch {
      showToast("Could not subscribe. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (subscribed) {
    return (
      <p className="text-sm text-neutral-600">
        You&apos;re subscribed — thanks for joining.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        aria-label="Email address"
        className="w-full min-w-0 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-red-500"
      />
      <button
        type="submit"
        disabled={submitting}
        className="shrink-0 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-500 disabled:opacity-60"
      >
        {submitting ? "Joining..." : "Subscribe"}
      </button>
    </form>
  );
}
