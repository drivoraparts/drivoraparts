import { NextResponse } from "next/server";
import {
  createSupportMessage,
  listSupportMessages,
  updateSupportMessage,
} from "@/lib/db/support";
import { requireAdminApi } from "@/lib/auth/require-admin";
import { logAdminAudit } from "@/lib/monitoring/audit";

export const runtime = "edge";

export async function GET(req: Request) {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") ?? undefined;

  const messages = await listSupportMessages(
    status as Parameters<typeof listSupportMessages>[0]
  );

  return NextResponse.json(messages);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);

  const customerEmail =
    typeof body?.customerEmail === "string" ? body.customerEmail.trim() : "";
  const subject = typeof body?.subject === "string" ? body.subject.trim() : "";
  const message = typeof body?.message === "string" ? body.message.trim() : "";

  if (!customerEmail || !subject || !message) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const record = await createSupportMessage({
    customerEmail,
    customerName:
      typeof body?.customerName === "string" ? body.customerName.trim() : undefined,
    subject,
    message,
  });

  return NextResponse.json(record, { status: 201 });
}

export async function PATCH(req: Request) {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;

  const body = await req.json().catch(() => null);
  const id = typeof body?.id === "string" ? body.id : null;

  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  const updated = await updateSupportMessage(id, {
    status: body?.status,
    admin_reply: body?.adminReply,
  });

  await logAdminAudit(auth.session?.email, "support.update", id, {
    status: body?.status,
  });

  return NextResponse.json(updated);
}
