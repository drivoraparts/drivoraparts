/**
 * Manual-payment state, stored on the payment row's `metadata` JSONB column.
 *
 * Deliberately no schema migration: a manual payment is an ordinary row in
 * `payments` with provider "manual", and everything this flow tracks --
 * which method, where it is in the lifecycle, the instructions an admin sent,
 * the receipts a customer uploaded -- rides in metadata alongside the fields
 * the crypto provider already writes there. That keeps manual payments inside
 * the existing order/payment system rather than beside it, and means the admin
 * order screen, the payment stats and the paid workflow all keep working on
 * manual orders without being taught a new table.
 *
 * Nothing here ever marks an order paid. Advancing to "verified" is a separate,
 * explicit admin action that calls the existing adminMarkOrderPaid workflow --
 * see app/api/admin/orders/[id]/manual-payment/route.ts.
 */
import {
  updatePaymentRecord,
  findPaymentByOrderId,
  type PaymentRecord,
} from "@/lib/db/payments";
import type { ManualPaymentState } from "./manual-methods";

/** One customer-uploaded proof of payment. */
export type ManualReceipt = {
  /** Object key inside the private receipts bucket. Never a public URL: the
   * bucket is private and admins view these through short-lived signed URLs. */
  path: string;
  contentType: string;
  size: number;
  uploadedAt: string;
  originalName?: string;
};

export type ManualPaymentView = {
  paymentId: string;
  orderId: string;
  amount: number;
  currency: string;
  /** Method id from manual-methods.ts (bank_transfer, zelle, ...). */
  method: string;
  /** Bank/transfer route id the customer chose, for methods that need one. */
  route: string | null;
  state: ManualPaymentState;
  /** The payment details an admin pasted and sent. Never in source control. */
  instructions: string | null;
  instructionsSentAt: string | null;
  /** Whatever the customer typed when submitting their receipt. */
  customerNote: string | null;
  receipts: ManualReceipt[];
  receiptSubmittedAt: string | null;
  /** Last message an admin sent asking for more information. */
  lastAdminMessage: string | null;
  verifiedAt: string | null;
  /** True once the payment row itself is paid -- the single source of truth
   * for "this order is settled", shared with the crypto flow. */
  paid: boolean;
};

export function isManualPayment(
  payment: PaymentRecord | null | undefined
): boolean {
  return payment?.provider === "manual";
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function readReceipts(value: unknown): ManualReceipt[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry) => {
    if (typeof entry !== "object" || entry === null) return [];
    const record = entry as Record<string, unknown>;
    const path = asString(record.path);
    if (!path) return [];
    return [
      {
        path,
        contentType: asString(record.contentType) ?? "application/octet-stream",
        size: typeof record.size === "number" ? record.size : 0,
        uploadedAt: asString(record.uploadedAt) ?? new Date(0).toISOString(),
        originalName: asString(record.originalName) ?? undefined,
      },
    ];
  });
}

const STATES: ManualPaymentState[] = [
  "awaiting_payment",
  "instructions_sent",
  "receipt_submitted",
  "under_review",
  "verified",
  "verification_failed",
];

/** Read the manual view of a payment row. Returns null for crypto payments. */
export function readManualPayment(
  payment: PaymentRecord | null | undefined
): ManualPaymentView | null {
  if (!payment || !isManualPayment(payment)) return null;

  const meta = (payment.metadata ?? {}) as Record<string, unknown>;
  const rawState = asString(meta.manual_state);
  // A payment already marked paid reads as verified even if the metadata was
  // never advanced -- the payment row is the authority on settlement.
  const state: ManualPaymentState =
    payment.status === "paid"
      ? "verified"
      : STATES.includes(rawState as ManualPaymentState)
        ? (rawState as ManualPaymentState)
        : "awaiting_payment";

  return {
    paymentId: payment.id,
    orderId: payment.order_id,
    amount: Number(payment.amount),
    currency: payment.currency ?? "USD",
    method: asString(meta.manual_method) ?? "bank_transfer",
    route: asString(meta.manual_route),
    state,
    instructions: asString(meta.manual_instructions),
    instructionsSentAt: asString(meta.manual_instructions_sent_at),
    customerNote: asString(meta.manual_customer_note),
    receipts: readReceipts(meta.receipts),
    receiptSubmittedAt: asString(meta.manual_receipt_submitted_at),
    lastAdminMessage: asString(meta.manual_last_admin_message),
    verifiedAt: asString(meta.manual_verified_at),
    paid: payment.status === "paid",
  };
}

export async function getManualPaymentForOrder(
  orderId: string
): Promise<{ payment: PaymentRecord; view: ManualPaymentView } | null> {
  const payment = await findPaymentByOrderId(orderId);
  const view = readManualPayment(payment);
  if (!payment || !view) return null;
  return { payment, view };
}

type ManualPatch = {
  state?: ManualPaymentState;
  instructions?: string;
  customerNote?: string;
  lastAdminMessage?: string;
  /** Appended to the existing list rather than replacing it, so a customer can
   * submit several receipts across attempts without losing earlier ones. */
  addReceipts?: ManualReceipt[];
};

/**
 * Merge manual fields into the payment's metadata.
 *
 * Always spreads the existing metadata first: the crypto provider and the paid
 * workflow both write their own keys there (payment_method, paid_at, ...) and
 * a manual update must never drop them.
 */
export async function updateManualPayment(
  payment: PaymentRecord,
  patch: ManualPatch
): Promise<PaymentRecord | null> {
  const existing = (payment.metadata ?? {}) as Record<string, unknown>;
  const now = new Date().toISOString();
  const next: Record<string, unknown> = { ...existing };

  if (patch.state) {
    next.manual_state = patch.state;
    if (patch.state === "verified") next.manual_verified_at = now;
  }

  if (patch.instructions !== undefined) {
    next.manual_instructions = patch.instructions;
    next.manual_instructions_sent_at = now;
  }

  if (patch.customerNote !== undefined) {
    next.manual_customer_note = patch.customerNote;
  }

  if (patch.lastAdminMessage !== undefined) {
    next.manual_last_admin_message = patch.lastAdminMessage;
    next.manual_last_admin_message_at = now;
  }

  if (patch.addReceipts?.length) {
    next.receipts = [...readReceipts(existing.receipts), ...patch.addReceipts];
    next.manual_receipt_submitted_at = now;
  }

  return updatePaymentRecord(payment.id, { metadata: next });
}
