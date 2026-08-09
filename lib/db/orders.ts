import { EMPTY_ORDER_STATS } from "@/lib/admin/fallbacks";
import { calculateCartDiscounts } from "@/lib/inventory/discounts";
import { guardedSupabaseRead } from "@/lib/db/read-guard";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { assertOrderTransition } from "@/lib/orders/state-machine";
import { isPlacedOrder } from "@/lib/orders/placed";
import { findPaymentsByOrderIds } from "@/lib/db/payments";
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

/**
 * Order Processing Status -- separate from the legacy `status` column above
 * (which stays untouched; see migration 005 for why). Purely the
 * pre-shipping preparation pipeline: what has to happen to an order after
 * payment before it's ready to hand off to shipping. "Payment Confirmed"
 * deliberately isn't a value here -- it's derived read-only from the real
 * payments table (see lib/tracking/customer-view.ts) so it can never be
 * set by clicking through this list. Coarse states like On Hold/Cancelled
 * live on `control_status` instead (see ControlStatus below), and shipping
 * progress lives entirely on `shipping_status`.
 */
export type OrderLifecycleStatus =
  | "order_received"
  | "processing"
  | "preparing_order"
  | "verification"
  | "ready_for_shipment"
  | "processing_complete";

/**
 * The high-level administrative control layer for an order -- independent
 * of how far processing/shipping has actually progressed. An order can be
 * put On Hold or Cancelled at any point regardless of its processing or
 * shipping stage, without losing that stage (see migration 008).
 */
export type ControlStatus = "active" | "on_hold" | "cancelled" | "completed" | "refunded";

export type ShippingStatus =
  | "not_shipped"
  | "preparing_shipment"
  | "shipped"
  | "in_transit"
  | "arrived_at_destination"
  | "out_for_delivery"
  | "delivery_exception"
  | "delivered";

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

export type ShippingHoldReason =
  | "customs_clearance"
  | "documentation_required"
  | "customs_inspection"
  | "documentation_review"
  | "address_verification"
  | "carrier_delay"
  | "other";

export type OrderRecord = {
  id: string;
  order_number: string;
  customer_id: string;
  subtotal: number;
  shipping: number;
  total: number;
  status: OrderStatus;
  control_status: ControlStatus;
  order_status: OrderLifecycleStatus;
  shipping_status: ShippingStatus;
  carrier: string | null;
  tracking_number: string | null;
  shipment_origin: string | null;
  shipment_destination: string | null;
  shipment_reference: string | null;
  shipment_notes: string | null;
  shipment_type: string | null;
  shipment_current_location: string | null;
  shipment_current_location_updated_at: string | null;
  shipping_hold_active: boolean;
  shipping_hold_reason: ShippingHoldReason | null;
  shipping_hold_note: string | null;
  shipping_hold_updated_at: string | null;
  estimated_delivery_start: string | null;
  estimated_delivery_end: string | null;
  confirmation_sent_at: string | null;
  customer_message: string | null;
  customer_message_updated_at: string | null;
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
  customerEmail?: string;
};

/**
 * Short, non-sequential, customer-safe order reference (e.g. "DRV-7K2QX9F").
 * Never exposes row counts or creation order, unlike the internal UUID,
 * which is never shown to customers going forward.
 */
function generateOrderNumber(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I
  let suffix = "";
  const bytes = crypto.getRandomValues(new Uint8Array(7));
  for (const byte of bytes) {
    suffix += alphabet[byte % alphabet.length];
  }
  return `DRV-${suffix}`;
}

const MAX_ORDER_NUMBER_ATTEMPTS = 5;

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
    shipping,
    input.customerEmail
  );
  const subtotal = breakdown.merchandiseTotal;
  const total = breakdown.total;

  const supabase = getSupabaseAdmin();

  let order: OrderRecord | null = null;
  let orderError: { code?: string; message: string } | null = null;

  for (let attempt = 0; attempt < MAX_ORDER_NUMBER_ATTEMPTS; attempt += 1) {
    const result = await supabase
      .from("orders")
      .insert({
        customer_id: input.customerId,
        subtotal,
        shipping,
        total,
        status: "pending",
        order_number: generateOrderNumber(),
        order_status: "order_received",
        control_status: "active",
      })
      .select("*")
      .single();

    if (!result.error) {
      order = result.data as OrderRecord;
      orderError = null;
      break;
    }

    // 23505 = unique_violation -- retry with a freshly generated order_number.
    if (result.error.code !== "23505") {
      orderError = result.error;
      break;
    }
    orderError = result.error;
  }

  if (!order) {
    throw orderError ?? new Error("Failed to create order");
  }

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

const COMPLETED_PURCHASE_STATUSES: OrderStatus[] = ["paid", "shipped", "delivered"];

/**
 * Real verified-purchase check for reviews: true only if this email has a
 * paid/shipped/delivered order containing this product. Never trust a
 * caller-supplied "verified" flag for review badges — always derive it here.
 */
export async function hasCompletedPurchase(
  email: string,
  productId: number
): Promise<boolean> {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) return false;

  const supabase = getSupabaseAdmin();

  const { data: customers, error: customerError } = await supabase
    .from("customers")
    .select("id")
    .ilike("email", normalizedEmail);

  if (customerError) throw customerError;
  if (!customers?.length) return false;

  const customerIds = customers.map((c) => c.id as string);

  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select("id")
    .in("customer_id", customerIds)
    .in("status", COMPLETED_PURCHASE_STATUSES);

  if (ordersError) throw ordersError;
  if (!orders?.length) return false;

  const orderIds = orders.map((o) => o.id as string);

  const { data: items, error: itemsError } = await supabase
    .from("order_items")
    .select("id")
    .in("order_id", orderIds)
    .eq("product_id", productId)
    .limit(1);

  if (itemsError) throw itemsError;
  return Boolean(items?.length);
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

/**
 * Customer-facing lookup by the short public order number (e.g. "DRV-7K2QX9F"),
 * never the internal UUID. Email is an optional extra check: when provided,
 * it must match the order's customer email (case-insensitive) or the lookup
 * returns null, same as "not found" -- doesn't leak whether the order number
 * itself exists.
 */
export async function getOrderByNumber(
  orderNumber: string,
  email?: string
): Promise<OrderWithDetails | null> {
  const supabase = getSupabaseAdmin();
  const normalized = orderNumber.trim().toUpperCase();

  const { data: order, error } = await supabase
    .from("orders")
    .select("*")
    .eq("order_number", normalized)
    .maybeSingle();

  if (error) throw error;
  if (!order) return null;

  const { data: customer } = await supabase
    .from("customers")
    .select("*")
    .eq("id", order.customer_id)
    .maybeSingle();

  if (email && customer?.email?.toLowerCase() !== email.trim().toLowerCase()) {
    return null;
  }

  const { data: items } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", order.id);

  return {
    ...(order as OrderRecord),
    customer: (customer as CustomerRecord | null) ?? null,
    items: (items ?? []) as OrderItemRecord[],
  };
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

    return hydrateOrdersWithDetails(orders as OrderRecord[]);
  });
}

/** Admin-facing list: completed checkouts only (excludes abandoned/failed attempts). */
export async function listPlacedOrders(limit = 100): Promise<OrderWithDetails[]> {
  return guardedSupabaseRead("listPlacedOrders", [], async () => {
    const batchSize = Math.max(limit * 4, 100);
    const orders = await listOrders(batchSize);
    if (!orders.length) return [];

    const payments = await findPaymentsByOrderIds(orders.map((order) => order.id));
    return orders
      .filter((order) => isPlacedOrder(order, payments.get(order.id)))
      .slice(0, limit);
  });
}

async function hydrateOrdersWithDetails(orders: OrderRecord[]): Promise<OrderWithDetails[]> {
  const supabase = getSupabaseAdmin();
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

    return hydrateOrdersWithDetails(orders as OrderRecord[]);
  });
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus
): Promise<OrderRecord | null> {
  const existing = await getOrderById(id);
  if (!existing) return null;

  assertOrderTransition(existing.status, status);

  return persistOrderStatus(id, status);
}

/** Admin override — skips automated transition rules. */
export async function forceUpdateOrderStatus(
  id: string,
  status: OrderStatus
): Promise<OrderRecord | null> {
  const existing = await getOrderById(id);
  if (!existing) return null;
  if (existing.status === status) return existing;

  return persistOrderStatus(id, status);
}

async function persistOrderStatus(
  id: string,
  status: OrderStatus
): Promise<OrderRecord | null> {
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
    .update({
      status: "paid",
      order_status: "processing",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .in("status", ["pending", "processing"])
    .select("*")
    .maybeSingle();

  if (error) throw error;
  const updated = (data as OrderRecord | null) ?? null;

  if (updated) {
    // "Payment Confirmed" is derived from the real payments table, not this
    // column -- this payment_status event just gives the customer-facing
    // stepper a genuine timestamp to show against that step.
    await logOrderEvent({
      orderId: id,
      eventType: "payment_status",
      fromValue: "pending",
      toValue: "paid",
      actor: "webhook",
      note: "Payment confirmed by NOWPayments",
    });
    await logOrderEvent({
      orderId: id,
      eventType: "order_status",
      fromValue: "order_received",
      toValue: "processing",
      actor: "webhook",
      note: "Order processing started",
    });
  }

  return updated;
}

/**
 * Atomically mark an order failed without ever clobbering a paid order.
 * Idempotent: returns null when the order is already paid/failed or missing.
 */
export async function failOrderIfUnpaid(id: string): Promise<OrderRecord | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("orders")
    .update({
      status: "cancelled",
      control_status: "cancelled",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .in("status", ["pending", "processing"])
    .select("*")
    .maybeSingle();

  if (error) throw error;
  const updated = (data as OrderRecord | null) ?? null;

  if (updated) {
    await logOrderEvent({
      orderId: id,
      eventType: "control_status",
      toValue: "cancelled",
      actor: "webhook",
      note: "Payment failed",
    });
  }

  return updated;
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

    const recentOrders = await listOrders(1000);
    const payments = await findPaymentsByOrderIds(recentOrders.map((order) => order.id));
    const placedOrders = recentOrders.filter((order) =>
      isPlacedOrder(order, payments.get(order.id))
    );
    const openPending = placedOrders.filter((order) => order.status === "pending");
    const abandonedCheckouts = recentOrders.filter((order) => {
      if (order.status === "cancelled" || order.status === "failed") {
        return false;
      }
      return !isPlacedOrder(order, payments.get(order.id));
    });

    const pendingRevenue = openPending.reduce(
      (sum, order) => sum + Number(order.total),
      0
    );

    return {
      totalRevenue,
      pendingRevenue,
      paidOrderCount: paidOrders?.length ?? 0,
      totalOrders: placedOrders.length,
      placedOrders: placedOrders.length,
      pendingOrders: openPending.length,
      abandonedCheckouts: abandonedCheckouts.length,
    };
  });
}

/* =========================================================
   ORDER TIMELINE (order_events)
========================================================= */

export type OrderEventType =
  | "payment_status"
  | "control_status"
  | "order_status"
  | "shipping_status"
  | "shipment_hold"
  | "note";

export type OrderEventRecord = {
  id: string;
  order_id: string;
  event_type: OrderEventType;
  from_value: string | null;
  to_value: string | null;
  note: string | null;
  actor: string;
  customer_visible: boolean;
  created_at: string;
};

export async function logOrderEvent(input: {
  orderId: string;
  eventType: OrderEventType;
  fromValue?: string | null;
  toValue?: string | null;
  note?: string | null;
  actor: string;
  customerVisible?: boolean;
  /** Backdate the event (e.g. "this actually shipped on Aug 5th"). Omit to
   * timestamp it at the moment this is called, same as before. */
  occurredAt?: string | null;
}): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("order_events").insert({
    order_id: input.orderId,
    event_type: input.eventType,
    from_value: input.fromValue ?? null,
    to_value: input.toValue ?? null,
    note: input.note ?? null,
    actor: input.actor,
    customer_visible: input.customerVisible ?? true,
    ...(input.occurredAt ? { created_at: input.occurredAt } : {}),
  });

  // Timeline logging is best-effort -- never let it break the actual status
  // change it's recording.
  if (error) {
    console.error("[order_events] insert failed", error.message);
  }
}

export async function listOrderEvents(orderId: string): Promise<OrderEventRecord[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("order_events")
    .select("*")
    .eq("order_id", orderId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as OrderEventRecord[];
}

/* =========================================================
   ADMIN STATUS CONTROLS (order_status / shipping_status / shipping info)
========================================================= */

/**
 * When a status control is saved without actually changing the status
 * value (e.g. just editing the note), log the note on its own instead of
 * silently doing nothing -- an admin should be able to update a note at
 * any time without being forced to toggle the status away and back.
 */
async function logNoteOnlyUpdate(
  orderId: string,
  actor: string,
  note: string | undefined,
  occurredAt: string | undefined
): Promise<void> {
  if (!note?.trim()) return;
  await logOrderEvent({
    orderId,
    eventType: "note",
    note,
    actor,
    occurredAt,
    customerVisible: false,
  });
}

export async function updateOrderLifecycleStatus(
  id: string,
  status: OrderLifecycleStatus,
  actor: string,
  note?: string,
  occurredAt?: string
): Promise<OrderRecord | null> {
  const existing = await getOrderById(id);
  if (!existing) return null;
  if (existing.order_status === status) {
    await logNoteOnlyUpdate(id, actor, note, occurredAt);
    return existing;
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("orders")
    .update({ order_status: status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) throw error;
  const updated = data as OrderRecord | null;

  if (updated) {
    await logOrderEvent({
      orderId: id,
      eventType: "order_status",
      fromValue: existing.order_status,
      toValue: status,
      actor,
      note,
      occurredAt,
    });
  }

  return updated;
}

/** The coarse admin control layer (Active/On Hold/Cancelled/Completed/
 * Refunded) -- independent of order_status/shipping_status, so putting an
 * order on hold or cancelling it never loses its processing/shipping
 * progress. */
export async function updateControlStatus(
  id: string,
  status: ControlStatus,
  actor: string,
  note?: string,
  occurredAt?: string
): Promise<OrderRecord | null> {
  const existing = await getOrderById(id);
  if (!existing) return null;
  if (existing.control_status === status) {
    await logNoteOnlyUpdate(id, actor, note, occurredAt);
    return existing;
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("orders")
    .update({ control_status: status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) throw error;
  const updated = data as OrderRecord | null;

  if (updated) {
    await logOrderEvent({
      orderId: id,
      eventType: "control_status",
      fromValue: existing.control_status,
      toValue: status,
      actor,
      note,
      occurredAt,
    });
  }

  return updated;
}

export async function updateShippingStatusRecord(
  id: string,
  status: ShippingStatus,
  actor: string,
  note?: string,
  occurredAt?: string
): Promise<OrderRecord | null> {
  const existing = await getOrderById(id);
  if (!existing) return null;
  if (existing.shipping_status === status) {
    await logNoteOnlyUpdate(id, actor, note, occurredAt);
    return existing;
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("orders")
    .update({ shipping_status: status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) throw error;
  const updated = data as OrderRecord | null;

  if (updated) {
    await logOrderEvent({
      orderId: id,
      eventType: "shipping_status",
      fromValue: existing.shipping_status,
      toValue: status,
      actor,
      note,
      occurredAt,
    });
  }

  return updated;
}

export type ShippingInfoInput = {
  carrier?: string | null;
  trackingNumber?: string | null;
  shipmentOrigin?: string | null;
  shipmentDestination?: string | null;
  shipmentReference?: string | null;
  shipmentNotes?: string | null;
  shipmentType?: string | null;
  currentLocation?: string | null;
  estimatedDeliveryStart?: string | null;
  estimatedDeliveryEnd?: string | null;
};

export async function updateShippingInfo(
  id: string,
  input: ShippingInfoInput,
  actor: string
): Promise<OrderRecord | null> {
  const supabase = getSupabaseAdmin();
  const locationChanged = input.currentLocation !== undefined;
  const { data, error } = await supabase
    .from("orders")
    .update({
      carrier: input.carrier,
      tracking_number: input.trackingNumber,
      shipment_origin: input.shipmentOrigin,
      shipment_destination: input.shipmentDestination,
      shipment_reference: input.shipmentReference,
      shipment_notes: input.shipmentNotes,
      shipment_type: input.shipmentType,
      ...(locationChanged
        ? {
            shipment_current_location: input.currentLocation,
            shipment_current_location_updated_at: input.currentLocation
              ? new Date().toISOString()
              : null,
          }
        : {}),
      estimated_delivery_start: input.estimatedDeliveryStart,
      estimated_delivery_end: input.estimatedDeliveryEnd,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) throw error;
  const updated = data as OrderRecord | null;

  if (updated) {
    await logOrderEvent({
      orderId: id,
      eventType: "note",
      actor,
      note: "Shipping information updated",
      customerVisible: false,
    });
  }

  return updated;
}

export const ORDER_PROCESSING_STATUS_LABELS: Record<OrderLifecycleStatus, string> = {
  order_received: "Order Received",
  processing: "Processing",
  preparing_order: "Preparing Order",
  verification: "Order Verification",
  ready_for_shipment: "Ready for Shipment",
  processing_complete: "Processing Complete",
};

export const CONTROL_STATUS_LABELS: Record<ControlStatus, string> = {
  active: "Active",
  on_hold: "On Hold",
  cancelled: "Cancelled",
  completed: "Completed",
  refunded: "Refunded",
};

export const SHIPPING_HOLD_REASON_LABELS: Record<ShippingHoldReason, string> = {
  customs_clearance: "Customs Clearance",
  documentation_required: "Documentation Required",
  customs_inspection: "Customs Inspection",
  documentation_review: "Shipping Documentation Review",
  address_verification: "Address Verification",
  carrier_delay: "Carrier Delay",
  other: "Other",
};

/**
 * Places a shipment on hold without losing its underlying shipping_status
 * (e.g. still "in_transit" underneath) -- resuming just clears the hold
 * flag rather than requiring a guess at what status to snap back to.
 * `customerNote` is shown on the Track Order page; `internalNote` never is.
 */
export async function startShippingHold(
  id: string,
  reason: ShippingHoldReason,
  customerNote: string | null,
  internalNote: string | undefined,
  actor: string
): Promise<OrderRecord | null> {
  const supabase = getSupabaseAdmin();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("orders")
    .update({
      shipping_hold_active: true,
      shipping_hold_reason: reason,
      shipping_hold_note: customerNote,
      shipping_hold_updated_at: now,
      updated_at: now,
    })
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) throw error;
  const updated = data as OrderRecord | null;

  if (updated) {
    await logOrderEvent({
      orderId: id,
      eventType: "shipment_hold",
      toValue: SHIPPING_HOLD_REASON_LABELS[reason],
      note: internalNote || customerNote,
      actor,
      customerVisible: true,
    });
  }

  return updated;
}

/** Clears an active hold. The hold placement/resolution stay in the
 * timeline as history -- only the "currently on hold" state is cleared. */
export async function resumeShipping(
  id: string,
  actor: string,
  note?: string
): Promise<OrderRecord | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("orders")
    .update({
      shipping_hold_active: false,
      shipping_hold_reason: null,
      shipping_hold_note: null,
      shipping_hold_updated_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) throw error;
  const updated = data as OrderRecord | null;

  if (updated) {
    await logOrderEvent({
      orderId: id,
      eventType: "shipment_hold",
      toValue: "Resumed",
      note: note || "Clearance completed — shipment resumed",
      actor,
      customerVisible: true,
    });
  }

  return updated;
}

/**
 * Admin-authored, customer-visible status message -- e.g. "Your order is
 * currently in transit and expected to arrive soon." Independent of the
 * structured status fields; the admin is the sole author, matching the
 * fully-manual tracking model (no carrier feed writes this).
 */
export async function updateCustomerMessage(
  id: string,
  message: string | null,
  actor: string
): Promise<OrderRecord | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("orders")
    .update({
      customer_message: message,
      customer_message_updated_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) throw error;
  const updated = data as OrderRecord | null;

  if (updated) {
    await logOrderEvent({
      orderId: id,
      eventType: "note",
      actor,
      note: message ? "Customer message updated" : "Customer message cleared",
      customerVisible: false,
    });
  }

  return updated;
}

/**
 * Permanently deletes an order. order_items, payments, and order_events all
 * have ON DELETE CASCADE on order_id, so this is the only row that needs to
 * be removed -- the customer record is left untouched (it may belong to
 * other orders, and is worth keeping even if this one order is deleted).
 */
export async function deleteOrderRecord(id: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("orders").delete().eq("id", id);
  if (error) throw error;
}

export async function markConfirmationSent(id: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  await supabase
    .from("orders")
    .update({ confirmation_sent_at: new Date().toISOString() })
    .eq("id", id)
    .is("confirmation_sent_at", null);
}
