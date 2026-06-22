import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { validateAdminCredentials } from "@/lib/auth/admin";
import {
  enforceLoginRateLimit,
  recordFailedLoginAttempt,
} from "@/lib/auth/login-rate-limit";
import {
  ADMIN_SESSION_COOKIE,
  createAdminSessionToken,
  getSessionCookieOptions,
} from "@/lib/auth/session";
import { logAdminAudit } from "@/lib/monitoring/audit";
import { logActivity } from "@/lib/monitoring/activity";
import { getClientIp } from "@/lib/security/ip";

export async function handleAdminLogin(req: Request): Promise<Response> {
  try {
    const limited = await enforceLoginRateLimit(req);
    if (limited) return limited;

    const body = await req.json().catch(() => null);
    const email = typeof body?.email === "string" ? body.email : "";
    const password = typeof body?.password === "string" ? body.password : "";

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password required" },
        { status: 400 }
      );
    }

    const valid = await validateAdminCredentials(email, password);

    if (!valid) {
      await recordFailedLoginAttempt(req, email);
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = await createAdminSessionToken(email.trim().toLowerCase());
    const cookieStore = await cookies();
    cookieStore.set(ADMIN_SESSION_COOKIE, token, getSessionCookieOptions());

    await logAdminAudit(email, "admin.login", "session", {
      ip: getClientIp(req),
    });
    await logActivity("info", "Admin login successful", {
      email,
      ip: getClientIp(req),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    await logActivity("error", "Admin login error", {
      message: error instanceof Error ? error.message : "Unknown error",
      ip: getClientIp(req),
    });
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
