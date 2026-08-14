import { EMPTY_PAYMENT_STATS } from "@/lib/admin/fallbacks";
import { guardedSupabaseRead } from "@/lib/db/read-guard";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export type PaymentStatus =
  | "pending"
  | "processing"
  | "paid"
  | "failed"
  | "expired"
  | "refunded"
  | "partially_refunded";

export type PaymentRecord = {
  id: string;
  order_id: string;
  provider: string;
  provider_payment_id: string | null;
  amount: number;
  currency: string;
  status: PaymentStatus;
  payment_url: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};

export type CreatePaymentInput = {
  orderId: string;
  provider: string;
  amount: number;
  currency?: string;
  status?: PaymentStatus;
  paymentUrl?: string;
  providerPaymentId?: string;
  metadata?: Record<string, unknown>;
};

export async function createPaymentRecord(
  input: CreatePaymentInput
): Promise<PaymentRecord> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("payments")
    .insert({
      order_id: input.orderId,
      provider: input.provider,
      amount: input.amount,
      currency: input.currency ?? "USD",
      status: input.status ?? "pending",
      payment_url: input.paymentUrl ?? null,
      provider_payment_id: input.providerPaymentId ?? null,
      metadata: input.metadata ?? {},
    })
    .select("*")
    .single();

  if (error) throw error;
  return data as PaymentRecord;
}

export async function updatePaymentRecord(
  id: string,
  patch: Partial<
    Pick<
      PaymentRecord,
      "status" | "payment_url" | "provider_payment_id" | "metadata"
    >
  >
): Promise<PaymentRecord | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("payments")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) throw error;
  return data as PaymentRecord | null;
}

export async function findPaymentByOrderId(
  orderId: string
): Promise<PaymentRecord | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("order_id", orderId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data as PaymentRecord | null;
}

export async function findPaymentByProviderId(
  provider: string,
  providerPaymentId: string
): Promise<PaymentRecord | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("provider", provider)
    .eq("provider_payment_id", providerPaymentId)
    .maybeSingle();

  if (error) throw error;
  return data as PaymentRecord | null;
}

/** Same lookup, any provider -- used by customer Track Order's "Order ID or
 * Payment ID" field, where the caller doesn't know which provider it is. */
export async function findPaymentByAnyProviderId(
  providerPaymentId: string
): Promise<PaymentRecord | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("provider_payment_id", providerPaymentId)
    .maybeSingle();

  if (error) throw error;
  return data as PaymentRecord | null;
}

export async function listPayments(limit = 100): Promise<PaymentRecord[]> {
  return guardedSupabaseRead("listPayments", [], async () => {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("payments")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data ?? []) as PaymentRecord[];
  });
}

export async function getPaymentStats() {
  return guardedSupabaseRead("getPaymentStats", EMPTY_PAYMENT_STATS, async () => {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("payments")
      .select("status, amount, provider, order_id");

    if (error) throw error;

    /*
     * A payment can sit at "paid" while the order it belongs to was cancelled,
     * and nothing reconciled the two: payments reported $11,067.50 paid while
     * orders reported $9,557 revenue, with no way to see where the $1,510.50
     * went. Loading the closed orders lets the difference be stated instead of
     * left as two dashboard figures that silently disagree.
     */
    const { data: closedOrders, error: closedError } = await supabase
      .from("orders")
      .select("id")
      .in("status", ["cancelled", "failed"]);

    if (closedError) throw closedError;

    const closedOrderIds = new Set((closedOrders ?? []).map((order) => order.id));

    const stats = {
      total: data?.length ?? 0,
      pending: 0,
      processing: 0,
      paid: 0,
      failed: 0,
      expired: 0,
      refunded: 0,
      partially_refunded: 0,
      paidAmount: 0,
      pendingAmount: 0,
      nowpaymentsPaid: 0,
      nowpaymentsPaidAmount: 0,
      nowpaymentsPending: 0,
      nowpaymentsPendingAmount: 0,
      manualPaid: 0,
      manualPaidAmount: 0,
      /** Paid payments whose order was cancelled or failed — needs reconciling. */
      paidAgainstClosed: 0,
      paidAgainstClosedAmount: 0,
      /** Paid payments still backing a live order. Ties out to order revenue. */
      netPaidAmount: 0,
    };

    for (const payment of data ?? []) {
      const status = payment.status as PaymentStatus;
      if (status in stats) {
        stats[status as keyof typeof stats] += 1;
      }
      const amount = Number(payment.amount);

      if (payment.status === "pending") {
        stats.pendingAmount += amount;
        if (payment.provider === "nowpayments") {
          stats.nowpaymentsPending += 1;
          stats.nowpaymentsPendingAmount += amount;
        }
      }

      if (payment.status === "paid") {
        stats.paidAmount += amount;

        if (closedOrderIds.has(payment.order_id)) {
          stats.paidAgainstClosed += 1;
          stats.paidAgainstClosedAmount += amount;
        } else {
          stats.netPaidAmount += amount;
        }

        if (payment.provider === "nowpayments") {
          stats.nowpaymentsPaid += 1;
          stats.nowpaymentsPaidAmount += amount;
        } else if (payment.provider === "manual") {
          stats.manualPaid += 1;
          stats.manualPaidAmount += amount;
        }
      }
    }

    return stats;
  });
}

export async function findPaymentsByOrderIds(
  orderIds: string[]
): Promise<Map<string, PaymentRecord>> {
  if (!orderIds.length) return new Map();

  return guardedSupabaseRead("findPaymentsByOrderIds", new Map(), async () => {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("payments")
      .select("*")
      .in("order_id", orderIds)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const map = new Map<string, PaymentRecord>();
    for (const payment of (data ?? []) as PaymentRecord[]) {
      if (!map.has(payment.order_id)) {
        map.set(payment.order_id, payment);
      }
    }

    return map;
  });
}
