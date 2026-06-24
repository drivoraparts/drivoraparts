"use client";

import { useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import AuthShell, {
  AuthAlert,
  AuthButton,
  AuthField,
  AuthFooterLink,
} from "@/components/admin/AuthShell";

export default function AdminLoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/admin/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        setError(data.error ?? "Login failed. Check your email and password.");
        return;
      }

      const destination =
        typeof data.redirect === "string" && data.redirect.startsWith("/admin")
          ? data.redirect
          : next;

      window.location.href = destination;
    } catch (caught) {
      console.error("[auth:login-ui] network error", caught);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Admin sign in"
      subtitle="Secure access for DrivoraParts staff. Sessions are encrypted and monitored."
      footer={
        <>
          <AuthFooterLink href="/admin/forgot-password">Forgot password?</AuthFooterLink>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <AuthField
          id="admin-email"
          label="Email address"
          type="email"
          autoComplete="username"
          value={email}
          onChange={setEmail}
        />

        <AuthField
          id="admin-password"
          label="Password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={setPassword}
        />

        {error ? <AuthAlert tone="error">{error}</AuthAlert> : null}

        <AuthButton loading={loading} label="Sign in" loadingLabel="Signing in..." />
      </form>
    </AuthShell>
  );
}
