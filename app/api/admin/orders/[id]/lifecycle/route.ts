import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/require-admin";
import { logAdminAudit } from "@/lib/monitoring/audit";
import { logActivity } from "@/lib/monitoring/activity";
import { getClientIp } from "@/lib/security/ip";
import {
  getOrderById,
  logOrderEvent,
  updateCustomerMessage,
  updateOrderLifecycleStatus,
  updateShippingInfo,
  updateShippingStatusRecord,
  type OrderLifecycleStatus,
  type ShippingInfoInput,
  type ShippingStatus,
} from "@/lib/db/orders";
import { adminMarkOrderPaid } from "@/lib/checkout/service";
import { findPaymentByOrderId, updatePaymentRecord, type PaymentStatus } from "@/lib/db/payments";
import {
  sendOrderDeliveredEmail,
  sendOrderOutForDeliveryEmail,
  sendOrderShippedEmail,
} from "@/lib/email/send";

const ORDER_STATUSES: OrderLifecycleStatus[] = [
  "pending",
  "confirmed",
  "processing",
  "on_hold",
  "ready_for_shipment",
  "shipped",
  "completed",
  "cancelled",
  "refunded",
];

const SHIPPING_STATUSES: ShippingStatus[] = [
  "not_shipped",
  "preparing_shipment",
  "shipped",
  "in_transit",
  "customs_clearance",
  "arrived_at_destination",
  "out_for_delivery",
  "delivered",
  "delivery_exception",
];

const PAYMENT_STATUSES: PaymentStatus[] = [
  "pending",
  "processing",
  "paid",
  "failed",
  "expired",
  "refunded",
  "partially_refunded",
];

type LifecycleBody = {
  target: "order_status" | "shipping_status" | "payment_status" | "shipping_info" | "customer_message";
  value?: string;
  shippingInfo?: ShippingInfoInput;
  note?: string;
  notifyCustomer?: boolean;
};

export async function PATCH(
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

  const body = (await req.json().catch(() => null)) as LifecycleBody | null;
  if (!body || !body.target) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const actor = auth.session?.email ?? "admin";
  const ip = getClientIp(req);
  const note = body.note?.trim() || undefined;

  try {
    if (body.target === "order_status") {
      if (!body.value || !ORDER_STATUSES.includes(body.value as OrderLifecycleStatus)) {
        return NextResponse.json({ error: "Invalid order status" }, { status: 400 });
      }
      const updated = await updateOrderLifecycleStatus(
        id,
        body.value as OrderLifecycleStatus,
        actor,
        note
      );
      await logAdminAudit(actor, "order.update_order_status", id, { status: body.value, ip });
      return NextResponse.json(updated);
    }

    if (body.target === "shipping_status") {
      if (!body.value || !SHIPPING_STATUSES.includes(body.value as ShippingStatus)) {
        return NextResponse.json({ error: "Invalid shipping status" }, { status: 400 });
      }
      const status = body.value as ShippingStatus;
      const updated = await updateShippingStatusRecord(id, status, actor, note);
      await logAdminAudit(actor, "order.update_shipping_status", id, { status, ip });

      if (body.notifyCustomer && updated && order.customer) {
        const emailInput = {
          to: order.customer.email,
          customerName: order.customer.full_name,
          orderNumber: order.order_number,
          carrier: updated.carrier,
          trackingNumber: updated.tracking_number,
          estimatedDeliveryStart: updated.estimated_delivery_start,
          estimatedDeliveryEnd: updated.estimated_delivery_end,
        };

        if (status === "shipped") {
          await sendOrderShippedEmail(emailInput);
        } else if (status === "out_for_delivery") {
          await sendOrderOutForDeliveryEmail(emailInput);
        } else if (status === "delivered") {
          await sendOrderDeliveredEmail({
            to: order.customer.email,
            customerName: order.customer.full_name,
            orderNumber: order.order_number,
          });
        }
      }

      return NextResponse.json(updated);
    }

    if (body.target === "customer_message") {
      const message = body.value?.trim() || null;
      const updated = await updateCustomerMessage(id, message, actor);
      await logAdminAudit(actor, "order.update_customer_message", id, { ip });
      return NextResponse.json(updated);
    }

    if (body.target === "shipping_info") {
      if (!body.shippingInfo) {
        return NextResponse.json({ error: "shippingInfo required" }, { status: 400 });
      }
      const updated = await updateShippingInfo(id, body.shippingInfo, actor);
      await logAdminAudit(actor, "order.update_shipping_info", id, { ip });
      return NextResponse.json(updated);
    }

    if (body.target === "payment_status") {
      if (!body.value || !PAYMENT_STATUSES.includes(body.value as PaymentStatus)) {
        return NextResponse.json({ error: "Invalid payment status" }, { status: 400 });
      }
      const status = body.value as PaymentStatus;

      if (status === "paid") {
        await adminMarkOrderPaid(id);
        // adminMarkOrderPaid only flips the legacy `status` column -- keep the
        // richer order_status timeline in sync the same way the real
        // NOWPayments webhook does, but only advance it if nothing further
        // along has already happened (never regress a shipped/completed order).
        if (order.order_status === "pending") {
          await updateOrderLifecycleStatus(id, "confirmed", actor, note ?? "Payment confirmed (admin)");
        }
      } else {
        const payment = await findPaymentByOrderId(id);
        if (!payment) {
          return NextResponse.json({ error: "No payment record for this order" }, { status: 404 });
        }
        await updatePaymentRecord(payment.id, { status });
        await logOrderEvent({
          orderId: id,
          eventType: "payment_status",
          fromValue: payment.status,
          toValue: status,
          actor,
          note,
        });
      }

      await logAdminAudit(actor, "order.update_payment_status", id, { status, ip });
      const updated = await getOrderById(id);
      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: "Unknown target" }, { status: 400 });
  } catch (error) {
    await logActivity("warn", "order.lifecycle_update_failed", {
      orderId: id,
      target: body.target,
      admin: actor,
      ip,
      message: error instanceof Error ? error.message : "update failed",
    });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Update failed" },
      { status: 400 }
    );
  }
}
