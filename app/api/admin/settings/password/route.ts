export const runtime = 'edge';

import { NextResponse } from "next/server";
import { changeAdminPassword } from "@/lib/auth/admin";
import { clearSessionCookieOnResponse } from "@/lib/auth/cookies";
import { requireAdminApi } from "@/lib/auth/require-admin";

export async function POST(req: Request) {
  const { response } = await requireAdminApi();
  if (response) return response;

  const body = await req.json().catch(() => null);
  const currentPassword =
    typeof body?.currentPassword === "string" ? body.currentPassword : "";
  const newPassword = typeof body?.newPassword === "string" ? body.newPassword : "";

  if (!currentPassword || !newPassword) {
    return NextResponse.json(
      { error: "Current and new password are required" },
      { status: 400 }
    );
  }

  const result = await changeAdminPassword(currentPassword, newPassword);

  if (!result.ok) {
    return NextResponse.json({ error: result.error ?? "Password change failed" }, { status: 400 });
  }

  const success = NextResponse.json({
    success: true,
    message: "Password updated. Please sign in again.",
  });
  clearSessionCookieOnResponse(success);
  return success;
}
