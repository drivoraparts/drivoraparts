import { EMPTY_ORDER_STATS } from "@/lib/admin/fallbacks";
import { calculateCartDiscounts } from "@/lib/inventory/discounts";
import { guardedSupabaseRead } from "@/lib/db/read-guard";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { assertOrderTransition } from "@/lib/orders/state-machine";
import type { CustomerRecord } from "./customers";

export type OrderStatus =
  | "pending"
  | "processing"
  | "paid"
  | "failed"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export type OrderItemRecord = {
  id: string;
  order_id: string;
  product_id: number;
  name: string;
  price: number;
  image: string | null;
  category: string | null;
  brand: string | null;
  quantity: number;
};

export type OrderRecord = {
  id: string;
  customer_id: string;
  subtotal: number;
  shipping: number;
  total: number;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
};

export type OrderWithDetails = OrderRecord & {
  customer: CustomerRecord | null;
  items: OrderItemRecord[];
};

export type CreateOrderItemInput = {
  productId: number;
  name: string;
  price: number;
  image: string;
  category: string;
  brand?: string;
  quantity: number;
};

export type CreateOrderInput = {
  customerId: string;
  items: CreateOrderItemInput[];
  shipping?: number;
};

export async function createOrderRecord(
  input: CreateOrderInput
): Promise<OrderWithDetails> {
  const shipping = input.shipping ?? 0;
  const breakdown = calculateCartDiscounts(
    input.items.map((item) => ({
      id: item.productId,
      price: item.price,
      quantity: item.quantity,
      category: item.category,
    })),
    shipping
  );
  const subtotal = breakdown.merchandiseTotal;
  const total = breakdown.total;

  const supabase = getSupabaseAdmin();

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      customer_id: input.customerId,
      subtotal,
      shipping,
      total,
      status: "pending",
    })
    .select("*")
    .single();

  if (orderError) throw orderError;

  const itemRows = input.items.map((item) => ({
    order_id: order.id,
    product_id: item.productId,
    name: item.name,
    price: item.price,
    image: item.image,
    category: item.category,
    brand: item.brand ?? null,
    quantity: item.quantity,
  }));

  const { data: items, error: itemsError } = await supabase
    .from("order_items")
    .insert(itemRows)
    .select("*");

  if (itemsError) throw itemsError;

  const customer = await supabase
    .from("customers")
    .select("*")
    .eq("id", input.customerId)
    .maybeSingle();

  return {
    ...(order as OrderRecord),
    customer: (customer.data as CustomerRecord | null) ?? null,
    items: (items ?? []) as OrderItemRecord[],
  };
}

export async function getOrderById(id: string): Promise<OrderWithDetails | null> {
  const supabase = getSupabaseAdmin();

  const { data: order, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!order) return null;

  const [{ data: items }, { data: customer }] = await Promise.all([
    supabase.from("order_items").select("*").eq("order_id", id),
    supabase.from("customers").select("*").eq("id", order.customer_id).maybeSingle(),
  ]);

  return {
    ...(order as OrderRecord),
    customer: (customer as CustomerRecord | null) ?? null,
    items: (items ?? []) as OrderItemRecord[],
  };
}

/** Minimal status-only lookup for the public success-page poll (no PII). */
export async function getOrderStatusById(id: string): Promise<OrderStatus | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("orders")
    .select("status")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return (data?.status as OrderStatus) ?? null;
}

/**
 * Status + total for the public success-page poll. The order id is an
 * unguessable UUID and the total is an amount the buyer already knows, so
 * this exposes no PII beyond what the purchaser supplied.
 */
export async function getOrderStatusSummaryById(
  id: string
): Promise<{ status: OrderStatus; total: number } | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("orders")
    .select("status, total")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return { status: data.status as OrderStatus, total: Number(data.total) };
}

export async function listOrders(limit = 100): Promise<OrderWithDetails[]> {
  return guardedSupabaseRead("listOrders", [], async () => {
    const supabase = getSupabaseAdmin();
    const { data: orders, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    if (!orders?.length) return [];

    const orderIds = orders.map((o) => o.id);
    const customerIds = [...new Set(orders.map((o) => o.customer_id))];

    const [{ data: items }, { data: customers }] = await Promise.all([
      supabase.from("order_items").select("*").in("order_id", orderIds),
      supabase.from("customers").select("*").in("id", customerIds),
    ]);

    const customerMap = new Map(
      (customers ?? []).map((c) => [c.id, c as CustomerRecord])
    );
    const itemsByOrder = new Map<string, OrderItemRecord[]>();

    for (const item of items ?? []) {
      const list = itemsByOrder.get(item.order_id) ?? [];
      list.push(item as OrderItemRecord);
      itemsByOrder.set(item.order_id, list);
    }

    return orders.map((order) => ({
      ...(order as OrderRecord),
      customer: customerMap.get(order.customer_id) ?? null,
      items: itemsByOrder.get(order.id) ?? [],
    }));
  });
}

export async function listOrdersSince(
  sinceIso: string,
  limit = 500
): Promise<OrderWithDetails[]> {
  return guardedSupabaseRead("listOrdersSince", [], async () => {
    const supabase = getSupabaseAdmin();
    const { data: orders, error } = await supabase
      .from("orders")
      .select("*")
      .gte("created_at", sinceIso)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    if (!orders?.length) return [];

    const orderIds = orders.map((o) => o.id);
    const customerIds = [...new Set(orders.map((o) => o.customer_id))];

    const [{ data: items }, { data: customers }] = await Promise.all([
      supabase.from("order_items").select("*").in("order_id", orderIds),
      supabase.from("customers").select("*").in("id", customerIds),
    ]);

    const customerMap = new Map(
      (customers ?? []).map((c) => [c.id, c as CustomerRecord])
    );
    const itemsByOrder = new Map<string, OrderItemRecord[]>();

    for (const item of items ?? []) {
      const list = itemsByOrder.get(item.order_id) ?? [];
      list.push(item as OrderItemRecord);
      itemsByOrder.set(item.order_id, list);
    }

    return orders.map((order) => ({
      ...(order as OrderRecord),
      customer: customerMap.get(order.customer_id) ?? null,
      items: itemsByOrder.get(order.id) ?? [],
    }));
  });
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus
): Promise<OrderRecord | null> {
  const existing = await getOrderById(id);
  if (!existing) return null;

  assertOrderTransition(existing.status, status);

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) throw error;
  return data as OrderRecord | null;
}

export async function transitionOrderStatus(
  id: string,
  status: OrderStatus
): Promise<OrderRecord | null> {
  return updateOrderStatus(id, status);
}

/**
 * Atomically finalize an order as paid via a single conditional UPDATE
 * (compare-and-set on the current status). Only transitions from an unpaid,
 * non-terminal state, so concurrent/duplicate webhook deliveries are
 * idempotent: exactly ONE caller receives the updated row; all others receive
 * null. Callers must gate paid-side-effects (emails, etc.) on a non-null return.
 */
export async function finalizeOrderPaid(id: string): Promise<OrderRecord | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("orders")
    .update({ status: "paid", updated_at: new Date().toISOString() })
    .eq("id", id)
    .in("status", ["pending", "processing"])
    .select("*")
    .maybeSingle();

  if (error) throw error;
  return (data as OrderRecord | null) ?? null;
}

/**
 * Atomically mark an order failed without ever clobbering a paid order.
 * Idempotent: returns null when the order is already paid/failed or missing.
 */
export async function failOrderIfUnpaid(id: string): Promise<OrderRecord | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("orders")
    .update({ status: "cancelled", updated_at: new Date().toISOString() })
    .eq("id", id)
    .in("status", ["pending", "processing"])
    .select("*")
    .maybeSingle();

  if (error) throw error;
  return (data as OrderRecord | null) ?? null;
}

/**
 * Orders still `pending` and older than the given cutoff — the reconciliation
 * sweep's input set (missed/delayed webhooks).
 */
export async function listStalePendingOrders(
  cutoffIso: string,
  limit = 100
): Promise<OrderRecord[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("status", "pending")
    .lt("created_at", cutoffIso)
    .order("created_at", { ascending: true })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as OrderRecord[];
}

export async function getOrderStats() {
  return guardedSupabaseRead("getOrderStats", EMPTY_ORDER_STATS, async () => {
    const supabase = getSupabaseAdmin();

    const { data: paidOrders, error } = await supabase
      .from("orders")
      .select("total, status, created_at")
      .eq("status", "paid");

    if (error) throw error;

    const totalRevenue = (paidOrders ?? []).reduce(
      (sum, order) => sum + Number(order.total),
      0
    );

    const { count: totalOrders } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true });

    const { count: pendingOrders } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending");

    const { data: pendingRows } = await supabase
      .from("orders")
      .select("total")
      .eq("status", "pending");

    const pendingRevenue = (pendingRows ?? []).reduce(
      (sum, order) => sum + Number(order.total),
      0
    );

    return {
      totalRevenue,
      pendingRevenue,
      paidOrderCount: paidOrders?.length ?? 0,
      totalOrders: totalOrders ?? 0,
      pendingOrders: pendingOrders ?? 0,
    };
  });
}
