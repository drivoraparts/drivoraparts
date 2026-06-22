import { NextResponse } from "next/server";
import { getAdminProfile, setAdminDisplayName } from "@/lib/admin/profile";
import { getAdminEmail } from "@/lib/auth/admin";
import { requireAdminApi } from "@/lib/auth/require-admin";

export const runtime = "edge";

export async function PATCH(req: Request) {
  const { session, response } = await requireAdminApi();
  if (response) return response;

  const body = await req.json().catch(() => null);
  const displayName =
    typeof body?.displayName === "string" ? body.displayName.trim() : "";

  if (!displayName) {
    return NextResponse.json({ error: "Display name is required" }, { status: 400 });
  }

  setAdminDisplayName(displayName);

  return NextResponse.json({
    success: true,
    profile: getAdminProfile(session?.email ?? getAdminEmail()),
  });
}
