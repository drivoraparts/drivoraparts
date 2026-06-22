"use client";

import { FormEvent, useState } from "react";
import AuthShell, {
  AuthAlert,
  AuthButton,
  AuthField,
  AuthFooterLink,
} from "@/components/admin/AuthShell";

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
        credentials: "same-origin",
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error ?? "Request failed");
        return;
      }

      setMessage(data.message ?? "If the account exists, a reset link has been sent.");
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
    <AuthShell
      title="Reset password"
      subtitle="Enter your admin email and we will send a secure reset link if the account exists."
      footer={<AuthFooterLink href="/admin/login">Back to sign in</AuthFooterLink>}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <AuthField
          id="forgot-email"
          label="Email address"
          type="email"
          autoComplete="username"
          value={email}
          onChange={setEmail}
        />

        {error ? <AuthAlert tone="error">{error}</AuthAlert> : null}
        {message ? <AuthAlert tone="success">{message}</AuthAlert> : null}
        {resetUrl ? (
          <AuthAlert tone="info">
            Dev reset link:{" "}
            <a href={resetUrl} className="underline">
              {resetUrl}
            </a>
          </AuthAlert>
        ) : null}

        <AuthButton loading={loading} label="Send reset link" loadingLabel="Sending..." />
      </form>
    </AuthShell>
  );
}
