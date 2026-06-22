import { NextResponse } from "next/server";
import { getLiveUsersSnapshot } from "@/lib/live/users";
import { requireAdminApi } from "@/lib/auth/require-admin";

export const runtime = "edge";

export async function GET() {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;

  const snapshot = await getLiveUsersSnapshot();
  return NextResponse.json(snapshot);
}
