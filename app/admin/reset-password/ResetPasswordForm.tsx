"use client";

import { useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import AuthShell, {
  AuthAlert,
  AuthButton,
  AuthField,
  AuthFooterLink,
} from "@/components/admin/AuthShell";

function ResetPasswordFormInner() {
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
        credentials: "same-origin",
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error ?? "Reset failed");
        return;
      }

      setMessage(data.message ?? "Password updated. Redirecting to sign in...");
      window.setTimeout(() => {
        window.location.href = "/admin/login";
      }, 1200);
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Choose a new password"
      subtitle="Create a strong password with at least 8 characters."
      footer={
        <>
          <AuthFooterLink href="/admin/forgot-password">Request new link</AuthFooterLink>
          {" · "}
          <AuthFooterLink href="/admin/login">Back to sign in</AuthFooterLink>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <AuthField
          id="new-password"
          label="New password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={setPassword}
          minLength={8}
        />

        <AuthField
          id="confirm-password"
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          minLength={8}
        />

        {error ? <AuthAlert tone="error">{error}</AuthAlert> : null}
        {message ? <AuthAlert tone="success">{message}</AuthAlert> : null}

        <AuthButton loading={loading} label="Update password" loadingLabel="Updating..." />
      </form>
    </AuthShell>
  );
}

function ResetFallback() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#050505] text-zinc-400">
      Loading reset form...
    </main>
  );
}

export default function ResetPasswordForm() {
  return (
    <Suspense fallback={<ResetFallback />}>
      <ResetPasswordFormInner />
    </Suspense>
  );
}
