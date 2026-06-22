import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, getSessionCookieOptions } from "@/lib/auth/session";
import { logAdminAudit } from "@/lib/monitoring/audit";
import { logActivity } from "@/lib/monitoring/activity";
import { getClientIp } from "@/lib/security/ip";
import { getAdminSession } from "@/lib/auth/require-admin";

export async function POST(req: Request) {
  const session = await getAdminSession();
  const ip = getClientIp(req);
  const cookieStore = await cookies();

  cookieStore.set(ADMIN_SESSION_COOKIE, "", {
    ...getSessionCookieOptions(),
    maxAge: 0,
  });

  await logAdminAudit(session?.email, "admin.logout", "session", { ip });
  await logActivity("info", "Admin logout", {
    email: session?.email ?? null,
    ip,
  });

  return NextResponse.json({ success: true });
}
