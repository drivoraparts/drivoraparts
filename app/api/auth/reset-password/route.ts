import { NextResponse } from "next/server";
import { resetPasswordWithToken } from "@/lib/auth/password-reset";
import { logActivity } from "@/lib/monitoring/activity";
import { getClientIp } from "@/lib/security/ip";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const token = typeof body?.token === "string" ? body.token : "";
    const password = typeof body?.password === "string" ? body.password : "";

    if (!token || !password) {
      return NextResponse.json(
        { error: "Token and new password are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const success = await resetPasswordWithToken(token, password);

    if (!success) {
      return NextResponse.json(
        { error: "Invalid or expired reset link" },
        { status: 400 }
      );
    }

    await logActivity("info", "Admin password reset completed", {
      ip: getClientIp(req),
    });

    return NextResponse.json({
      success: true,
      message: "Password updated. Sign in with your new password.",
    });
  } catch (error) {
    await logActivity("error", "Reset password error", {
      message: error instanceof Error ? error.message : "Unknown error",
      ip: getClientIp(req),
    });
    return NextResponse.json({ error: "Unable to reset password" }, { status: 500 });
  }
}
