import { NextResponse } from "next/server";
import { invalidateAllAdminSessions } from "@/lib/auth/admin";
import { clearSessionCookieOnResponse } from "@/lib/auth/cookies";
import { requireAdminApi } from "@/lib/auth/require-admin";

export const runtime = "edge";

export async function POST() {
  const { response } = await requireAdminApi();
  if (response) return response;

  invalidateAllAdminSessions();

  const success = NextResponse.json({
    success: true,
    message: "All admin sessions invalidated.",
  });
  clearSessionCookieOnResponse(success);
  return success;
}
