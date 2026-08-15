import { NextResponse } from "next/server";
import { getAdminEmail, validateAdminPassword } from "@/lib/auth/admin";
import {
  enforceLoginRateLimit,
  recordFailedLoginAttempt,
} from "@/lib/auth/login-rate-limit";
import { attachSessionCookie } from "@/lib/auth/cookies";
import { createAdminSessionToken } from "@/lib/auth/session";
import { authDebug } from "@/lib/auth/debug";
import { logAdminAudit } from "@/lib/monitoring/audit";
import { logActivity } from "@/lib/monitoring/activity";
import { getClientIp } from "@/lib/security/ip";

export async function handleAdminLogin(req: Request): Promise<Response> {
  const ip = getClientIp(req);

  try {
    const limited = await enforceLoginRateLimit(req);
    if (limited) {
      authDebug("login", "rate limited", { ip });
      return limited;
    }

    const body = await req.json().catch(() => null);
    const password = typeof body?.password === "string" ? body.password : "";

    /*
     * Password only. There is a single admin account, so the email field was
     * never choosing between identities — it was a second fixed string to
     * type. The account email still identifies the session and the audit log;
     * it is simply not something sign-in asks for. Any email sent by an older
     * client is ignored rather than checked.
     */
    const email = getAdminEmail();

    authDebug("login", "attempt", { hasPassword: Boolean(password), ip });

    if (!password) {
      authDebug("login", "rejected — missing password");
      return NextResponse.json({ error: "Password required" }, { status: 400 });
    }

    const valid = await validateAdminPassword(password);

    if (!valid) {
      authDebug("login", "rejected — invalid password", { ip });
      await recordFailedLoginAttempt(req, email);
      return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
    }

    const token = await createAdminSessionToken(email.toLowerCase());
    const response = NextResponse.json({ success: true, redirect: "/admin/dashboard" });
    attachSessionCookie(response, token);

    authDebug("login", "success — session cookie attached", {
      email: email.toLowerCase(),
      ip,
    });

    await logAdminAudit(email, "admin.login", "session", { ip });
    await logActivity("info", "Admin login successful", { email, ip });

    return response;
  } catch (error) {
    authDebug("login", "error", {
      message: error instanceof Error ? error.message : "Unknown error",
      ip,
    });
    await logActivity("error", "Admin login error", {
      message: error instanceof Error ? error.message : "Unknown error",
      ip,
    });
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
