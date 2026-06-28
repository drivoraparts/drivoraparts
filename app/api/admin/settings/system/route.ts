import { NextResponse } from "next/server";
import {
  getAdminSystemSettings,
  updateAdminSystemSettings,
  type PaymentMode,
} from "@/lib/admin/system-settings";
import { requireAdminApi } from "@/lib/auth/require-admin";

function isPaymentMode(value: string): value is PaymentMode {
  return value === "auto" || value === "nowpayments" || value === "manual";
}

export async function PATCH(req: Request) {
  const { response } = await requireAdminApi();
  if (response) return response;

  const body = await req.json().catch(() => null);
  const patch: { paymentMode?: PaymentMode; tawkEnabled?: boolean } = {};

  if (typeof body?.paymentMode === "string" && isPaymentMode(body.paymentMode)) {
    patch.paymentMode = body.paymentMode;
  }

  if (typeof body?.tawkEnabled === "boolean") {
    patch.tawkEnabled = body.tawkEnabled;
  }

  if (!patch.paymentMode && typeof patch.tawkEnabled !== "boolean") {
    return NextResponse.json({ error: "No valid settings provided" }, { status: 400 });
  }

  const settings = updateAdminSystemSettings(patch);

  return NextResponse.json({ success: true, settings });
}

export async function GET() {
  const { response } = await requireAdminApi();
  if (response) return response;

  return NextResponse.json({ settings: getAdminSystemSettings() });
}
