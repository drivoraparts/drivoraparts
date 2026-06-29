import { NextResponse } from "next/server";
import { forceUpdateOrderStatus, getOrderById } from "@/lib/db/orders";
import { adminMarkOrderPaid } from "@/lib/checkout/service";
import { restoreOrderInventory } from "@/lib/checkout/inventory-order";
import { requireAdminApi } from "@/lib/auth/require-admin";
import { logAdminAudit } from "@/lib/monitoring/audit";
import { logActivity } from "@/lib/monitoring/activity";
import { getClientIp } from "@/lib/security/ip";
import {
  sendOrderDeliveredEmail,
  sendOrderShippedEmail,
} from "@/lib/email/send";

const VALID_STATUSES = [
  "pending",
  "processing",
  "paid",
  "failed",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
] as const;

export async function PATCH(req: Request) {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;

  const ip = getClientIp(req);
  const body = await req.json().catch(() => null);
  const orderId = typeof body?.orderId === "string" ? body.orderId : null;
  const status = body?.status;

  if (!orderId || !VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const order = await getOrderById(orderId);
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (order.status === status) {
    return NextResponse.json(order);
  }

  try {
    if (status === "paid") {
      await adminMarkOrderPaid(orderId);
    } else {
      await forceUpdateOrderStatus(orderId, status);
      if (status === "cancelled" || status === "failed") {
        await restoreOrderInventory(orderId);
      }
    }

    const updated = (await getOrderById(orderId)) ?? order;

    if (order.customer) {
      if (status === "shipped") {
        await sendOrderShippedEmail({
          to: order.customer.email,
          customerName: order.customer.full_name,
          orderId,
        });
      }

      if (status === "delivered") {
        await sendOrderDeliveredEmail({
          to: order.customer.email,
          customerName: order.customer.full_name,
          orderId,
        });
      }
    }

    await logAdminAudit(auth.session?.email, "order.update_status", orderId, {
      status,
      ip,
      from: order.status,
      adminOverride: true,
    });
    await logActivity("info", "order.status_updated", {
      orderId,
      from: order.status,
      to: status,
      admin: auth.session?.email,
      ip,
    });

    return NextResponse.json(updated);
  } catch (error) {
    await logActivity("warn", "order.status_transition_rejected", {
      orderId,
      from: order.status,
      to: status,
      admin: auth.session?.email,
      ip,
      message: error instanceof Error ? error.message : "update failed",
    });
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Could not update order status",
      },
      { status: 400 }
    );
  }
}
