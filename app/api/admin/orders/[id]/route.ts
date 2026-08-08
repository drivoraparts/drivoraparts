import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/require-admin";
import { logAdminAudit } from "@/lib/monitoring/audit";
import { getClientIp } from "@/lib/security/ip";
import { deleteOrderRecord, getOrderById } from "@/lib/db/orders";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;

  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  try {
    await deleteOrderRecord(id);
    await logAdminAudit(auth.session?.email, "order.delete", id, {
      orderNumber: order.order_number,
      ip: getClientIp(req),
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Delete failed" },
      { status: 500 }
    );
  }
}
