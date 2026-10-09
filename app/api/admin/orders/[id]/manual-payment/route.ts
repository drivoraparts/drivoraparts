import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/require-admin";
import { logAdminAudit } from "@/lib/monitoring/audit";
import { logActivity } from "@/lib/monitoring/activity";
import { getClientIp } from "@/lib/security/ip";
import {
  claimOrderPaid,
  getOrderById,
  logOrderEvent,
  updateOrderLifecycleStatus,
  updateOrderShippingCharge,
} from "@/lib/db/orders";
import { findPaymentByOrderId, updatePaymentRecord } from "@/lib/db/payments";
import { adminMarkOrderPaid } from "@/lib/checkout/service";
import {
  readManualPayment,
  updateManualPayment,
} from "@/lib/payments/manual-payment";
import { getManualMethod, MANUAL_STATE_LABELS } from "@/lib/payments/manual-methods";
import {
  orderShippingSettlement,
  SHIPPING_OUTSTANDING_PAID_ERROR,
} from "@/lib/shipping/settlement";
import {
  sendManualPaymentInstructionsEmail,
  sendManualPaymentInfoRequestEmail,
} from "@/lib/email/send";

/**
 * Admin actions on a manual / direct payment.
 *
 * A sibling of the lifecycle route rather than a second order system: it reads
 * and writes the same order, the same payment row and the same timeline, and
 * "verify" delegates to adminMarkOrderPaid -- the identical workflow the crypto
 * webhook and the existing admin Mark Paid control use. There is exactly one
 * path to a paid order in this codebase and this is not a new one.
 *
 * Gated twice: middleware treats every /api/admin/* path as admin-only, and
 * requireAdminApi re-checks the session here.
 *
 * Timeline entries use the "note" event type deliberately. Manual states are
 * not payment statuses, and writing them into payment_status events would put
 * values into a stream other parts of the app read as real payment states.
 */

type ManualAction =
  | "send_instructions"
  | "request_info"
  | "mark_under_review"
  | "verify"
  | "reject";

const ACTIONS: ManualAction[] = [
  "send_instructions",
  "request_info",
  "mark_under_review",
  "verify",
  "reject",
];

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;

  const { id } = await params;
  const actor = auth.session?.email ?? "admin";
  const ip = getClientIp(req);

  const body = (await req.json().catch(() => null)) as {
    action?: string;
    message?: string;
    /** Shipping charge the admin worked out for this order, in USD. */
    shipping?: unknown;
    /** Expedited charge, when the customer asked for faster delivery. */
    expeditedShipping?: unknown;
  } | null;

  const action = body?.action;
  if (!action || !ACTIONS.includes(action as ManualAction)) {
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }

  const order = await getOrderById(id);
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const payment = await findPaymentByOrderId(id);
  const manual = readManualPayment(payment);
  if (!payment || !manual) {
    return NextResponse.json(
      { error: "This order is not a manual payment order" },
      { status: 400 }
    );
  }

  /*
   * Shipping figures arrive as typed text and are the only numbers in this
   * flow a person enters by hand, so they are parsed strictly: a finite,
   * non-negative amount under a ceiling no legitimate consignment reaches.
   * An unparseable value is rejected rather than coerced, because coercing
   * "1,200" to 1 would quietly undercharge and coercing it to NaN would
   * produce a total of NaN on the customer's payment page.
   */
  const MAX_SHIPPING_CHARGE = 100000;
  const parseCharge = (
    value: unknown,
    label: string
  ): { value: number; error: string | null } => {
    if (value === undefined || value === null || value === "") {
      return { value: 0, error: null };
    }
    const num = typeof value === "number" ? value : Number(String(value).trim());
    if (!Number.isFinite(num)) {
      return { value: 0, error: `Enter ${label} as a number.` };
    }
    if (num < 0) {
      return { value: 0, error: `${label} cannot be negative.` };
    }
    if (num > MAX_SHIPPING_CHARGE) {
      return {
        value: 0,
        error: `${label} looks wrong — it is over ${MAX_SHIPPING_CHARGE.toLocaleString()}.`,
      };
    }
    return { value: Math.round(num * 100) / 100, error: null };
  };

  const message = body?.message?.trim() ?? "";
  const methodLabel = getManualMethod(manual.method)?.label ?? "Bank Transfer";
  const customer = order.customer;

  /*
   * Only an order that is still open can be acted on. Nothing checked this
   * before: an admin could email payment instructions for a cancelled order
   * (whose /pay page tells the customer it is no longer active) or for one
   * that was already paid. Verify has its own atomic form of this check below.
   */
  if (action !== "verify") {
    if (payment.status === "paid" || order.status === "paid") {
      return NextResponse.json(
        { error: "This order is already paid." },
        { status: 409 }
      );
    }
    if (order.status !== "pending" && order.status !== "processing") {
      return NextResponse.json(
        {
          error: `This order is ${order.status}. Reopen it before contacting the customer about payment.`,
        },
        { status: 409 }
      );
    }
  }

  try {
    if (action === "send_instructions" || action === "request_info") {
      if (message.length < 5) {
        return NextResponse.json(
          { error: "Enter the message to send to the customer" },
          { status: 400 }
        );
      }
      if (!customer?.email) {
        return NextResponse.json(
          { error: "This order has no customer email address" },
          { status: 400 }
        );
      }

      const sending = action === "send_instructions";

      /*
       * Sending instructions is the moment shipping becomes a real number.
       *
       * It is written to the order BEFORE the email, so the figure the
       * customer is emailed and the figure /pay shows are the same one. If
       * the email then fails, the charge stands and the admin can re-send --
       * the reverse order would email a total the order did not hold.
       */
      let orderTotal = Number(order.total);
      let expeditedCharge: number | null = null;

      if (sending) {
        const shipping = parseCharge(body?.shipping, "the shipping charge");
        if (shipping.error) {
          return NextResponse.json({ error: shipping.error }, { status: 400 });
        }
        const expedited = parseCharge(
          body?.expeditedShipping,
          "the expedited shipping charge"
        );
        if (expedited.error) {
          return NextResponse.json({ error: expedited.error }, { status: 400 });
        }

        const updated = await updateOrderShippingCharge(
          id,
          { shipping: shipping.value, expedited: expedited.value },
          actor
        );
        if (!updated) {
          return NextResponse.json(
            { error: "Could not record the shipping charge on this order." },
            { status: 500 }
          );
        }

        orderTotal = Number(updated.total);

        expeditedCharge = expedited.value > 0 ? expedited.value : null;

        await updateManualPayment(payment, {
          expeditedShipping: expedited.value,
        });

        // The payment row is what the paid workflow and the payment stats
        // read, so it has to carry the same amount the customer is asked for.
        await updatePaymentRecord(payment.id, { amount: orderTotal });
      }

      const sent = sending
        ? await sendManualPaymentInstructionsEmail({
            to: customer.email,
            customerName: customer.full_name,
            orderId: order.id,
            orderNumber: order.order_number,
            total: orderTotal,
            subtotal: Number(order.subtotal),
            shipping: orderTotal - Number(order.subtotal) - (expeditedCharge ?? 0),
            expeditedShipping: expeditedCharge,
            methodLabel,
            instructions: message,
            items: order.items.map((item) => ({
              name: item.name,
              quantity: item.quantity,
              unitPrice: Number(item.price),
              image: item.image,
            })),
          })
        : await sendManualPaymentInfoRequestEmail({
            to: customer.email,
            customerName: customer.full_name,
            orderId: order.id,
            orderNumber: order.order_number,
            total: orderTotal,
            message,
          });

      // The email is the point of the action: if it did not go out, do not
      // record a state that claims it did.
      if (!sent) {
        return NextResponse.json(
          { error: "Email could not be sent. Check the email configuration." },
          { status: 502 }
        );
      }

      await updateManualPayment(
        payment,
        sending
          ? { instructions: message, state: "instructions_sent" }
          : { lastAdminMessage: message, state: "verification_failed" }
      );

      await logOrderEvent({
        orderId: id,
        eventType: "note",
        actor,
        note: sending
          ? `Payment instructions sent to customer (${methodLabel})`
          : "Requested more payment information from customer",
        customerVisible: true,
      });

      await logAdminAudit(actor, `order.manual_${action}`, id, { ip });
      await logActivity("info", `payment.manual_${action}`, {
        orderId: id,
        paymentId: payment.id,
        admin: actor,
      });

      return NextResponse.json({ ok: true, state: sending ? "instructions_sent" : "verification_failed" });
    }

    if (action === "mark_under_review") {
      await updateManualPayment(payment, { state: "under_review" });
      await logOrderEvent({
        orderId: id,
        eventType: "note",
        actor,
        note: "Payment under review",
        customerVisible: true,
      });
      await logAdminAudit(actor, "order.manual_under_review", id, { ip });
      return NextResponse.json({ ok: true, state: "under_review" });
    }

    if (action === "reject") {
      await updateManualPayment(payment, {
        state: "verification_failed",
        ...(message ? { lastAdminMessage: message } : {}),
      });
      await logOrderEvent({
        orderId: id,
        eventType: "note",
        actor,
        note: message
          ? `Payment verification failed: ${message}`
          : "Payment verification failed",
        customerVisible: true,
      });
      await logAdminAudit(actor, "order.manual_reject", id, { ip });
      return NextResponse.json({ ok: true, state: "verification_failed" });
    }

    // action === "verify"
    //
    // The only path that moves money-state.
    if (payment.status === "paid") {
      return NextResponse.json({
        ok: true,
        state: "verified",
        alreadyVerified: true,
      });
    }

    /*
     * Not while shipping is still unpriced. A manual order whose shipping was
     * not calculated at checkout (freight, outside the US) has an outstanding
     * shipping amount until the instructions -- with the charge -- go out;
     * verifying before then would record the products alone as full payment.
     */
    if (orderShippingSettlement(order, manual) === "outstanding") {
      return NextResponse.json({ error: SHIPPING_OUTSTANDING_PAID_ERROR }, { status: 409 });
    }

    /*
     * Claim the transition atomically: UPDATE ... WHERE status IN (pending,
     * processing), which exactly one request can win.
     *
     * The previous guard read the status and then acted on it, so two tabs
     * pressing Verify together both got through and ran the paid workflow
     * twice -- stock deducted twice, order_completed recorded twice. The same
     * WHERE clause is also what keeps a cancelled, failed or refunded order
     * from being revived as paid: adminMarkOrderPaid writes the status
     * directly and would not have stopped it.
     */
    const claimed = await claimOrderPaid(id);
    if (!claimed) {
      const current = await getOrderById(id);
      if (current?.status === "paid") {
        return NextResponse.json({
          ok: true,
          state: "verified",
          alreadyVerified: true,
        });
      }
      return NextResponse.json(
        {
          error: `This order is ${current?.status ?? "unavailable"} and can't be marked paid. Reopen it first.`,
        },
        { status: 409 }
      );
    }

    // The order is already paid now, so adminMarkOrderPaid skips its own
    // status write and runs the shared side effects -- once, because only this
    // request holds the claim.
    try {
      await adminMarkOrderPaid(id);
    } catch (error) {
      await logActivity("error", "payment.manual_verify_incomplete", {
        orderId: id,
        admin: actor,
        ip,
        message: error instanceof Error ? error.message : "side effects failed",
      });
      return NextResponse.json(
        {
          error:
            "The order is marked paid, but finishing the paid-order steps failed. Use Status controls → Payment status → Paid to complete them.",
        },
        { status: 500 }
      );
    }

    await updateManualPayment(payment, { state: "verified" });

    // Mirror the lifecycle route: nudge processing forward, never regress an
    // order that is already further along.
    if (order.order_status === "order_received") {
      await updateOrderLifecycleStatus(
        id,
        "processing",
        actor,
        "Manual payment verified (admin)"
      );
    }

    await logOrderEvent({
      orderId: id,
      eventType: "note",
      actor,
      note: `Manual payment verified (${methodLabel}) — ${MANUAL_STATE_LABELS.verified}`,
      customerVisible: true,
    });

    await logAdminAudit(actor, "order.manual_verify", id, {
      ip,
      method: manual.method,
      amount: manual.amount,
    });
    await logActivity("info", "payment.manual_verified", {
      orderId: id,
      paymentId: payment.id,
      admin: actor,
    });

    return NextResponse.json({ ok: true, state: "verified" });
  } catch (error) {
    await logActivity("warn", "payment.manual_action_failed", {
      orderId: id,
      action,
      admin: actor,
      ip,
      message: error instanceof Error ? error.message : "action failed",
    });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Action failed" },
      { status: 400 }
    );
  }
}
