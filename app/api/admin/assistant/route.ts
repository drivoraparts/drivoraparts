import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/require-admin";
import { generateAdminAssistantReply } from "@/lib/admin-assistant";

export const runtime = "edge";

export async function POST(req: Request) {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;

  const body = await req.json().catch(() => null);
  const message = typeof body?.message === "string" ? body.message : "";

  const response = await generateAdminAssistantReply(message);
  return NextResponse.json(response);
}
