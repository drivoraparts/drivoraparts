import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/require-admin";
import { logAdminAudit } from "@/lib/monitoring/audit";
import { logActivity } from "@/lib/monitoring/activity";
import { getClientIp } from "@/lib/security/ip";
import {
  getOrderById,
  logOrderEvent,
  resumeShipping,
  startShippingHold,
  updateControlStatus,
  updateCustomerMessage,
  updateOrderLifecycleStatus,
  updateShippingInfo,
  updateShippingStatusRecord,
  type ControlStatus,
  type OrderLifecycleStatus,
  type ShippingHoldReason,
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
  "order_received",
  "processing",
  "preparing_order",
  "verification",
  "ready_for_shipment",
  "processing_complete",
];

const CONTROL_STATUSES: ControlStatus[] = ["active", "on_hold", "cancelled", "completed", "refunded"];

const SHIPPING_STATUSES: ShippingStatus[] = [
  "not_shipped",
  "preparing_shipment",
  "shipped",
  "in_transit",
  "customs_clearance",
  "arrived_at_destination",
  "out_for_delivery",
  "delivery_exception",
  "delivered",
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

const SHIPPING_HOLD_REASONS: ShippingHoldReason[] = [
  "customs_clearance",
  "documentation_required",
  "customs_inspection",
  "documentation_review",
  "address_verification",
  "carrier_delay",
  "other",
];

type LifecycleBody = {
  target:
    | "control_status"
    | "order_status"
    | "shipping_status"
    | "payment_status"
    | "shipping_info"
    | "customer_message"
    | "shipping_hold_start"
    | "shipping_hold_resume";
  value?: string;
  shippingInfo?: ShippingInfoInput;
  note?: string;
  notifyCustomer?: boolean;
  /** shipping_status only: explicitly override the "processing must be
   * complete first" gate. Without this, starting shipping before order
   * processing is marked complete is rejected -- the admin has to
   * deliberately choose to begin the shipping phase early. */
  forceShipping?: boolean;
  /** shipping_hold_start only: the reason shown to the customer. */
  holdReason?: string;
  /** shipping_hold_start only: customer-visible clearance explanation. */
  customerNote?: string;
  /** Backdate the resulting timeline event, e.g. "this actually shipped on
   * Aug 5th". Must be a valid, non-future timestamp -- an event can't be
   * logged as happening later than now. */
  occurredAt?: string;
};

class InvalidOccurredAtError extends Error {}

function parseOccurredAt(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) {
    throw new InvalidOccurredAtError("Invalid date");
  }
  if (parsed.getTime() > Date.now()) {
    throw new InvalidOccurredAtError("Date can't be in the future");
  }
  return parsed.toISOString();
}

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

  let occurredAt: string | undefined;
  try {
    occurredAt = parseOccurredAt(body.occurredAt);
  } catch (error) {
    if (error instanceof InvalidOccurredAtError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    throw error;
  }

  try {
    if (body.target === "control_status") {
      if (!body.value || !CONTROL_STATUSES.includes(body.value as ControlStatus)) {
        return NextResponse.json({ error: "Invalid control status" }, { status: 400 });
      }
      const updated = await updateControlStatus(
        id,
        body.value as ControlStatus,
        actor,
        note,
        occurredAt
      );
      await logAdminAudit(actor, "order.update_control_status", id, { status: body.value, ip });
      return NextResponse.json(updated);
    }

    if (body.target === "order_status") {
      if (!body.value || !ORDER_STATUSES.includes(body.value as OrderLifecycleStatus)) {
        return NextResponse.json({ error: "Invalid order status" }, { status: 400 });
      }
      const updated = await updateOrderLifecycleStatus(
        id,
        body.value as OrderLifecycleStatus,
        actor,
        note,
        occurredAt
      );
      await logAdminAudit(actor, "order.update_order_status", id, { status: body.value, ip });
      return NextResponse.json(updated);
    }

    if (body.target === "shipping_status") {
      if (!body.value || !SHIPPING_STATUSES.includes(body.value as ShippingStatus)) {
        return NextResponse.json({ error: "Invalid shipping status" }, { status: 400 });
      }
      const status = body.value as ShippingStatus;

      // Shipping is its own phase, gated behind order processing being
      // explicitly marked complete -- an admin can still override with
      // forceShipping when a real exception calls for it.
      if (order.order_status !== "processing_complete" && !body.forceShipping) {
        return NextResponse.json(
          { error: "Order processing isn't complete yet. Pass forceShipping to begin shipping anyway." },
          { status: 409 }
        );
      }

      const updated = await updateShippingStatusRecord(id, status, actor, note, occurredAt);
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

    if (body.target === "shipping_hold_start") {
      if (!body.holdReason || !SHIPPING_HOLD_REASONS.includes(body.holdReason as ShippingHoldReason)) {
        return NextResponse.json({ error: "Invalid hold reason" }, { status: 400 });
      }
      const customerNote = body.customerNote?.trim() || null;
      const updated = await startShippingHold(
        id,
        body.holdReason as ShippingHoldReason,
        customerNote,
        note,
        actor
      );
      await logAdminAudit(actor, "order.shipping_hold_start", id, { reason: body.holdReason, ip });
      return NextResponse.json(updated);
    }

    if (body.target === "shipping_hold_resume") {
      const updated = await resumeShipping(id, actor, note);
      await logAdminAudit(actor, "order.shipping_hold_resume", id, { ip });
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
        // adminMarkOrderPaid only flips the legacy `status` column and the
        // payments table -- "Payment Confirmed" on the customer timeline is
        // derived straight from that payment status, so nothing else needs
        // to change here. Order processing itself only needs a nudge if it
        // hasn't started yet (never regress an order already further along).
        if (order.order_status === "order_received") {
          await updateOrderLifecycleStatus(id, "processing", actor, note ?? "Payment confirmed (admin)");
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
          occurredAt,
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
