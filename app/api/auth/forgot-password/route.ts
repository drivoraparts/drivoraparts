import { NextResponse } from "next/server";
import { getAdminEmail } from "@/lib/auth/admin";
import {
  createPasswordResetToken,
  shouldExposeResetLink,
} from "@/lib/auth/password-reset";
import { getSiteUrl } from "@/lib/env";
import { sendEmail } from "@/lib/email/send";
import { logActivity } from "@/lib/monitoring/activity";
import { getClientIp } from "@/lib/security/ip";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const email = typeof body?.email === "string" ? body.email.trim() : "";

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const reset = await createPasswordResetToken(email);
    const genericMessage =
      "If that email is registered as an admin account, a reset link has been sent.";

    if (reset) {
      const resetUrl = `${getSiteUrl()}/admin/reset-password?token=${encodeURIComponent(reset.token)}`;

      if (shouldExposeResetLink()) {
        await logActivity("info", "Admin password reset link generated (dev)", {
          email: getAdminEmail(),
          ip: getClientIp(req),
        });

        return NextResponse.json({
          success: true,
          message: genericMessage,
          resetUrl,
          expiresAt: reset.expiresAt,
        });
      }

      await sendEmail({
        to: getAdminEmail(),
        subject: "DrivoraParts admin password reset",
        html: `
          <div style="font-family:Arial,sans-serif;color:#111;">
            <h1>Reset your admin password</h1>
            <p>Use the link below within 15 minutes:</p>
            <p><a href="${resetUrl}">${resetUrl}</a></p>
            <p>If you did not request this, ignore this email.</p>
          </div>
        `,
      });

      await logActivity("info", "Admin password reset email requested", {
        ip: getClientIp(req),
      });
    }

    return NextResponse.json({ success: true, message: genericMessage });
  } catch (error) {
    await logActivity("error", "Forgot password error", {
      message: error instanceof Error ? error.message : "Unknown error",
      ip: getClientIp(req),
    });
    return NextResponse.json({ error: "Unable to process request" }, { status: 500 });
  }
}
