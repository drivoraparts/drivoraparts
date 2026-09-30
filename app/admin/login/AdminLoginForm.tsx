"use client";

import { useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import AuthShell, {
  AuthAlert,
  AuthButton,
  AuthField,
  AuthFooterLink,
} from "@/components/admin/AuthShell";

/*
 * A destination is only usable if it is a path inside the admin area.
 *
 * `next` reaches this form through the query string -- the middleware puts it
 * there when it bounces someone off a protected page -- so it is caller
 * controlled and has to be checked before it is handed to window.location.
 * Unchecked, it turns this form into an open redirect that fires immediately
 * AFTER a successful sign-in, which is the most convincing moment to hand
 * someone to another site.
 *
 * Requiring the "/admin/" prefix (or exactly "/admin") rejects the forms that
 * matter: "https://evil.com" has no leading slash, and "//evil.com" is
 * protocol-relative, so neither can pass. Anything that does pass is a
 * same-origin path.
 */
function safeAdminDestination(candidate: unknown): string | null {
  if (typeof candidate !== "string" || candidate.startsWith("//")) return null;
  if (candidate !== "/admin" && !candidate.startsWith("/admin/")) return null;
  return candidate;
}

export default function AdminLoginForm() {
  const searchParams = useSearchParams();
  const next = safeAdminDestination(searchParams.get("next"));

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
        body: JSON.stringify({ password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        setError(data.error ?? "Login failed. Check your password.");
        return;
      }

      /*
       * Where they were going beats where the server would send them.
       *
       * The login endpoint answers with a flat "/admin/dashboard", so taking
       * it first meant `next` was never read and the deep link the middleware
       * had carefully preserved was thrown away -- an admin bounced off
       * /admin/orders signed in and landed on the dashboard every time. Both
       * values go through the same check, so neither can leave the admin area.
       */
      const destination =
        next ?? safeAdminDestination(data.redirect) ?? "/admin/dashboard";

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
