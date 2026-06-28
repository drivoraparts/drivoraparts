import { EMPTY_PAYMENT_STATS } from "@/lib/admin/fallbacks";
import { guardedSupabaseRead } from "@/lib/db/read-guard";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

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

export async function listPayments(limit = 100): Promise<PaymentRecord[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as PaymentRecord[];
}

export async function getPaymentStats() {
  return guardedSupabaseRead("getPaymentStats", EMPTY_PAYMENT_STATS, async () => {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("payments")
      .select("status, amount, provider");

    if (error) throw error;

    const stats = {
      total: data?.length ?? 0,
      pending: 0,
      paid: 0,
      failed: 0,
      refunded: 0,
      paidAmount: 0,
      cryptomusPaid: 0,
      cryptomusPaidAmount: 0,
      manualPaid: 0,
      manualPaidAmount: 0,
    };

    for (const payment of data ?? []) {
      stats[payment.status as PaymentStatus] += 1;
      if (payment.status === "paid") {
        stats.paidAmount += Number(payment.amount);
        if (payment.provider === "cryptomus" || payment.provider === "nowpayments") {
          stats.cryptomusPaid += 1;
          stats.cryptomusPaidAmount += Number(payment.amount);
        } else if (payment.provider === "manual") {
          stats.manualPaid += 1;
          stats.manualPaidAmount += Number(payment.amount);
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
