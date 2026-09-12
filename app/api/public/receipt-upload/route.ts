import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/env";
import { findPaymentByOrderId } from "@/lib/db/payments";
import { logOrderEvent } from "@/lib/db/orders";
import {
  readManualPayment,
  updateManualPayment,
  type ManualReceipt,
} from "@/lib/payments/manual-payment";
import { getManualMethod } from "@/lib/payments/manual-methods";
import {
  uploadReceipt,
  isAllowedReceiptType,
  MAX_RECEIPT_BYTES,
  MAX_RECEIPTS_PER_SUBMISSION,
  MAX_RECEIPTS_PER_ORDER,
} from "@/lib/payments/receipt-storage";
import { sendAdminManualReceiptEmail } from "@/lib/email/send";
import { logActivity } from "@/lib/monitoring/activity";
import { logError } from "@/lib/monitoring/logger";

export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_NOTE_LENGTH = 2000;

/**
 * Customer submission of proof of payment for a manual order.
 *
 * Authorisation model, deliberately the same as /api/public/order-resume: the
 * order id is a v4 UUID and IS the capability. It is unguessable and only ever
 * delivered to the address on the order. Every rejection -- malformed id,
 * unknown order, not a manual payment, already paid, cancelled -- returns an
 * identical 404, so the response never reveals which of those is true and this
 * cannot be used to probe for valid orders.
 *
 * What this endpoint can NOT do, by construction:
 *
 *  - It cannot mark anything paid. It only attaches files and moves the manual
 *    state to "receipt_submitted", which means "the customer says they paid".
 *    Settlement remains an explicit admin action.
 *  - It cannot read anything back. There is no GET here; uploads are write-only
 *    from the public side.
 *  - It cannot touch a paid, failed or cancelled order, so a settled sale
 *    cannot have files appended to it later.
 *
 * Uploads land in a private bucket via the service-role client, which exists
 * only on the server -- the browser never holds a key that can reach storage.
 */
export async function POST(req: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Unavailable" }, { status: 503 });
  }

  const notFound = NextResponse.json({ error: "Not found" }, { status: 404 });

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid upload" }, { status: 400 });
  }

  const orderId = String(form.get("orderId") ?? "");
  if (!UUID.test(orderId)) return notFound;

  const note = String(form.get("note") ?? "")
    .trim()
    .slice(0, MAX_NOTE_LENGTH);

  const files = form
    .getAll("receipts")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);

  if (!files.length) {
    return NextResponse.json(
      { error: "Attach at least one receipt image." },
      { status: 400 }
    );
  }

  if (files.length > MAX_RECEIPTS_PER_SUBMISSION) {
    return NextResponse.json(
      { error: `Please upload at most ${MAX_RECEIPTS_PER_SUBMISSION} files at a time.` },
      { status: 400 }
    );
  }

  for (const file of files) {
    if (file.size > MAX_RECEIPT_BYTES) {
      return NextResponse.json(
        {
          error: `"${file.name}" is larger than ${Math.round(MAX_RECEIPT_BYTES / (1024 * 1024))}MB.`,
        },
        { status: 400 }
      );
    }
    if (!isAllowedReceiptType(file.type)) {
      return NextResponse.json(
        { error: `"${file.name}" is not a supported file type. Use JPG, PNG, WEBP, HEIC or PDF.` },
        { status: 400 }
      );
    }
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data: order } = await supabase
      .from("orders")
      .select("id, order_number, status, total, customer_id")
      .eq("id", orderId)
      .maybeSingle();

    // Only an order still awaiting payment accepts receipts.
    if (!order || order.status !== "pending") return notFound;

    const payment = await findPaymentByOrderId(orderId);
    const manual = readManualPayment(payment);
    if (!payment || !manual || manual.paid) return notFound;

    if (manual.receipts.length + files.length > MAX_RECEIPTS_PER_ORDER) {
      return NextResponse.json(
        { error: "This order already has the maximum number of receipts. Contact support." },
        { status: 400 }
      );
    }

    const stored: ManualReceipt[] = [];
    for (const file of files) {
      const saved = await uploadReceipt({
        orderId,
        bytes: await file.arrayBuffer(),
        contentType: file.type,
        originalName: file.name.slice(0, 120),
      });
      stored.push({
        path: saved.path,
        contentType: saved.contentType,
        size: saved.size,
        uploadedAt: new Date().toISOString(),
        originalName: saved.originalName,
      });
    }

    await updateManualPayment(payment, {
      addReceipts: stored,
      state: "receipt_submitted",
      ...(note ? { customerNote: note } : {}),
    });

    await logOrderEvent({
      orderId,
      eventType: "note",
      actor: "customer",
      note: `Customer submitted ${stored.length} payment receipt${stored.length === 1 ? "" : "s"}`,
      customerVisible: true,
    });

    // Tell the owner. Never let a mail failure lose an upload that succeeded.
    try {
      const { data: customer } = await supabase
        .from("customers")
        .select("full_name, email")
        .eq("id", order.customer_id)
        .maybeSingle();

      await sendAdminManualReceiptEmail({
        orderId,
        orderNumber: String(order.order_number),
        customerName: customer?.full_name ?? "Customer",
        customerEmail: customer?.email ?? "unknown",
        total: Number(order.total),
        methodLabel: getManualMethod(manual.method)?.label ?? "Bank Transfer",
        receiptCount: stored.length,
        customerNote: note || undefined,
      });
    } catch (mailError) {
      logError("manual_receipt_admin_email_failed", mailError, { orderId });
    }

    await logActivity("info", "payment.manual_receipt_submitted", {
      orderId,
      paymentId: payment.id,
      count: stored.length,
    });

    return NextResponse.json(
      { ok: true, received: stored.length },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    logError("receipt_upload_failed", error, { orderId });
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
