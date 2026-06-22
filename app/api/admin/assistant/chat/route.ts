import { NextResponse } from "next/server";
import { generateAdminAssistantReply } from "@/lib/admin-assistant";
import { requireAdminApi } from "@/lib/auth/require-admin";

export const runtime = "edge";

export async function POST(req: Request) {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;

  const body = await req.json().catch(() => null);
  const message = typeof body?.message === "string" ? body.message : "";

  const response = await generateAdminAssistantReply(message);
  return NextResponse.json(response);
}
