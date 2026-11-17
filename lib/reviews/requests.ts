import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { isSupabaseConfigured, getSiteUrl } from "@/lib/env";
import { getProductById, isPubliclyListed } from "@/lib/inventory";
import { resolveProductCondition } from "@/lib/inventory/condition";
import { CHECKOUT_TEST_PRODUCT_ID } from "@/lib/inventory/pricing";
import { logError, logInfo } from "@/lib/monitoring/logger";
import { COMPANY_SUPPORT_EMAIL } from "@/lib/content/company";
import { sendEmailTracked } from "@/lib/email/send";
import { buildReviewRequestEmail } from "@/lib/email/review-request";
import { createReviewToken, readReviewToken, reviewEmailHash, REVIEW_LINK_TTL_DAYS } from "./review-link";
import { questionSetsFor, schemaIdFor, validateAnswers, INSTALLED_BY_OPTIONS } from "./questions";

/* =========================================================
   VERIFIED REVIEW REQUESTS
   ---------------------------------------------------------
   After an order is delivered, each item in it gets a review
   request (review_requests). When it falls due, the customer
   is emailed a single-use link per item at the order's own
   address. A review submitted through that link is the only
   kind that carries Verified Buyer.

   No incentive, no star gate: every rating goes to the same
   form and into the same moderation queue.

   Only deliveries from REVIEW_REQUESTS_START onward are
   asked. Earlier customers were never told to expect this
   email, and a first batch sent to every past buyer at once
   would read as spam. Move the date back deliberately if
   past customers should be asked.
========================================================= */

export const REVIEW_REQUESTS_START = "2026-11-18T00:00:00Z";

/** Days after delivery before asking: long enough to have installed and used the part. */
const WAIT_DAYS_BY_CATEGORY: Record<string, number> = {
  engine: 45,
  transmission: 45,
  turbocharger: 30,
  suspension: 21,
  brakes: 14,
};
const DEFAULT_WAIT_DAYS = 7;
/** Used and refurbished parts are judged on arrival, so they are asked sooner. */
const USED_WAIT_DAYS = 5;

const MAX_ORDERS_EMAILED_PER_RUN = 20;
const DAY_MS = 24 * 60 * 60 * 1000;

const CLOSED_ORDER_STATUSES = new Set(["cancelled", "refunded", "failed"]);

type OrderRow = {
  id: string;
  order_number: string | null;
  status: string | null;
  order_status: string | null;
  customer_id: string;
};

type ItemRow = { id: string; order_id: string; product_id: number; name: string; image: string | null };
type CustomerRow = { id: string; email: string; full_name: string };

export type ReviewRequestRow = {
  id: string;
  order_id: string;
  order_item_id: string;
  product_id: number;
  email_hash: string;
  delivered_at: string;
  due_at: string;
  sent_at: string | null;
  expires_at: string | null;
  used_at: string | null;
  review_id: string | null;
  skipped_reason: string | null;
};

/** PostgREST / Postgres errors meaning migration 017 has not been run. */
export function isMissingReviewSchema(error: unknown): boolean {
  const e = error as { code?: string; message?: string } | null;
  return (
    e?.code === "42P01" ||
    e?.code === "PGRST205" ||
    e?.code === "PGRST204" ||
    e?.code === "42703" ||
    /review_requests|review_email_optouts|order_item_id|answers_schema/.test(e?.message ?? "")
  );
}

function isClosed(order: OrderRow): boolean {
  return (
    CLOSED_ORDER_STATUSES.has(order.status ?? "") ||
    CLOSED_ORDER_STATUSES.has(order.order_status ?? "")
  );
}

function waitDays(productId: number): number {
  const product = getProductById(productId);
  if (!product) return DEFAULT_WAIT_DAYS;
  if (resolveProductCondition(product) !== "brand-new") return USED_WAIT_DAYS;
  return WAIT_DAYS_BY_CATEGORY[product.category] ?? DEFAULT_WAIT_DAYS;
}

/** "Marcus Taylor" -> "Marcus T." -- never the full surname. */
export function publicReviewerName(fullName: string | null | undefined): string {
  const parts = (fullName ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "Verified buyer";
  const first = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
  return parts.length > 1 ? `${first} ${parts[parts.length - 1].charAt(0).toUpperCase()}.` : first;
}

/* ---------- 1. Schedule: one request per delivered item ---------- */

async function scheduleNewRequests(now: Date): Promise<number> {
  const supabase = getSupabaseAdmin();

  const { data: events, error: eventsError } = await supabase
    .from("order_events")
    .select("order_id, created_at")
    .eq("event_type", "shipping_status")
    .eq("to_value", "delivered")
    .gte("created_at", REVIEW_REQUESTS_START)
    .order("created_at", { ascending: true })
    .limit(1000);
  if (eventsError) throw eventsError;

  const deliveredAt = new Map<string, string>();
  for (const event of events ?? []) {
    if (!deliveredAt.has(event.order_id)) deliveredAt.set(event.order_id, event.created_at);
  }
  if (deliveredAt.size === 0) return 0;

  const orderIds = [...deliveredAt.keys()];
  const { data: existing, error: existingError } = await supabase
    .from("review_requests")
    .select("order_id")
    .in("order_id", orderIds);
  if (existingError) throw existingError;

  const scheduled = new Set((existing ?? []).map((row) => row.order_id as string));
  const pending = orderIds.filter((id) => !scheduled.has(id));
  if (pending.length === 0) return 0;

  const [{ data: orders, error: ordersError }, { data: items, error: itemsError }] = await Promise.all([
    supabase.from("orders").select("id, order_number, status, order_status, customer_id").in("id", pending),
    supabase.from("order_items").select("id, order_id, product_id, name, image").in("order_id", pending),
  ]);
  if (ordersError) throw ordersError;
  if (itemsError) throw itemsError;

  const customerIds = [...new Set((orders ?? []).map((o) => o.customer_id as string))];
  const { data: customers, error: customersError } = await supabase
    .from("customers")
    .select("id, email, full_name")
    .in("id", customerIds);
  if (customersError) throw customersError;

  const customerById = new Map((customers ?? []).map((c) => [c.id as string, c as CustomerRow]));
  const rows: Omit<ReviewRequestRow, "id" | "sent_at" | "expires_at" | "used_at" | "review_id">[] = [];

  for (const order of (orders ?? []) as OrderRow[]) {
    const customer = customerById.get(order.customer_id);
    const delivered = deliveredAt.get(order.id)!;
    const emailHash = customer?.email ? await reviewEmailHash(customer.email) : "";

    for (const item of ((items ?? []) as ItemRow[]).filter((i) => i.order_id === order.id)) {
      // Recorded even when skipped, so the order is not reconsidered every run.
      const skipped =
        item.product_id === CHECKOUT_TEST_PRODUCT_ID
          ? "test_product"
          : !customer?.email
            ? "no_email"
            : isClosed(order)
              ? "order_closed"
              : !isPubliclyListed(item.product_id)
                ? "not_listed"
                : null;

      rows.push({
        order_id: order.id,
        order_item_id: item.id,
        product_id: item.product_id,
        email_hash: emailHash,
        delivered_at: delivered,
        due_at: new Date(new Date(delivered).getTime() + waitDays(item.product_id) * DAY_MS).toISOString(),
        skipped_reason: skipped,
      });
    }
  }

  if (rows.length === 0) return 0;
  const { error: insertError } = await supabase
    .from("review_requests")
    .upsert(rows, { onConflict: "order_item_id", ignoreDuplicates: true });
  if (insertError) throw insertError;

  logInfo("review_requests_scheduled", { orders: pending.length, items: rows.length, at: now.toISOString() });
  return rows.length;
}

/* ---------- 2. Send: due requests, one email per order ---------- */

async function sendDueRequests(now: Date): Promise<{ emailed: number; skipped: number }> {
  const supabase = getSupabaseAdmin();

  const { data: due, error: dueError } = await supabase
    .from("review_requests")
    .select("*")
    .is("sent_at", null)
    .is("skipped_reason", null)
    .lte("due_at", now.toISOString())
    .order("due_at", { ascending: true })
    .limit(200);
  if (dueError) throw dueError;
  if (!due?.length) return { emailed: 0, skipped: 0 };

  const byOrder = new Map<string, ReviewRequestRow[]>();
  for (const row of due as ReviewRequestRow[]) {
    byOrder.set(row.order_id, [...(byOrder.get(row.order_id) ?? []), row]);
  }

  const orderIds = [...byOrder.keys()].slice(0, MAX_ORDERS_EMAILED_PER_RUN);
  const [{ data: orders }, { data: items }, { data: optouts }] = await Promise.all([
    supabase.from("orders").select("id, order_number, status, order_status, customer_id").in("id", orderIds),
    supabase.from("order_items").select("id, order_id, product_id, name, image").in("order_id", orderIds),
    supabase
      .from("review_email_optouts")
      .select("email_hash")
      .in("email_hash", [...new Set(orderIds.flatMap((id) => byOrder.get(id)!.map((r) => r.email_hash)))]),
  ]);
  const optedOut = new Set((optouts ?? []).map((o) => o.email_hash as string));
  const customerIds = [...new Set((orders ?? []).map((o) => o.customer_id as string))];
  const { data: customers } = await supabase.from("customers").select("id, email, full_name").in("id", customerIds);
  const customerById = new Map((customers ?? []).map((c) => [c.id as string, c as CustomerRow]));
  const itemById = new Map(((items ?? []) as ItemRow[]).map((i) => [i.id, i]));

  let emailed = 0;
  let skipped = 0;
  const skip = async (ids: string[], reason: string) => {
    skipped += ids.length;
    await supabase.from("review_requests").update({ skipped_reason: reason }).in("id", ids);
  };

  for (const order of (orders ?? []) as OrderRow[]) {
    const requests = byOrder.get(order.id) ?? [];
    const ids = requests.map((r) => r.id);
    const customer = customerById.get(order.customer_id);

    // Re-checked at send time: an order can be refunded after delivery.
    if (isClosed(order)) { await skip(ids, "order_closed"); continue; }
    if (!customer?.email) { await skip(ids, "no_email"); continue; }
    if (requests.some((r) => optedOut.has(r.email_hash))) { await skip(ids, "opted_out"); continue; }

    const expiresAt = new Date(now.getTime() + REVIEW_LINK_TTL_DAYS * DAY_MS);
    const site = getSiteUrl().replace(/\/$/, "");
    const lines = await Promise.all(
      requests.map(async (request) => {
        const token = await createReviewToken(request.id, expiresAt);
        const item = itemById.get(request.order_item_id);
        return {
          name: item?.name ?? getProductById(request.product_id)?.name ?? `Part #${request.product_id}`,
          url: `${site}/review?t=${encodeURIComponent(token)}`,
          optOutUrl: `${site}/review/unsubscribe?t=${encodeURIComponent(token)}`,
        };
      })
    );

    const email = buildReviewRequestEmail({
      firstName: publicReviewerName(customer.full_name).replace(/ .*$/, ""),
      orderNumber: order.order_number ?? order.id.slice(0, 8).toUpperCase(),
      items: lines,
      optOutUrl: lines[0].optOutUrl,
    });

    const result = await sendEmailTracked({
      to: customer.email,
      subject: email.subject,
      html: email.html,
      replyTo: COMPANY_SUPPORT_EMAIL,
    });
    if (!result.ok) {
      logError("review_request_send_failed", new Error("email not sent"), { orderId: order.id });
      continue; // left unsent: retried on the next run
    }

    emailed += 1;
    await supabase
      .from("review_requests")
      .update({ sent_at: now.toISOString(), expires_at: expiresAt.toISOString() })
      .in("id", ids);
  }

  return { emailed, skipped };
}

export async function runReviewRequests(now = new Date()) {
  if (!isSupabaseConfigured()) return { ok: false as const, reason: "supabase_not_configured" };
  try {
    const scheduled = await scheduleNewRequests(now);
    const sent = await sendDueRequests(now);
    return { ok: true as const, scheduled, ...sent };
  } catch (error) {
    if (isMissingReviewSchema(error)) {
      return { ok: false as const, reason: "migration_017_not_applied" };
    }
    logError("review_requests_run_failed", error);
    return { ok: false as const, reason: "error" };
  }
}

/* ---------- 3. Open a link ---------- */

export type ReviewLinkContext =
  | {
      state: "ready";
      request: ReviewRequestRow;
      productId: number;
      productName: string;
      productImage: string | null;
      category: string;
      condition: string;
      reviewerName: string;
    }
  | { state: "used" | "expired" | "invalid" | "unavailable" | "order_closed" };

export async function loadReviewLink(token: string | null | undefined): Promise<ReviewLinkContext> {
  const check = await readReviewToken(token);
  // strict:false does not narrow the union, so read the failure branch explicitly.
  if (check.ok === false) return { state: (check as { reason: "invalid" | "expired" }).reason };
  if (!isSupabaseConfigured()) return { state: "unavailable" };

  try {
    const supabase = getSupabaseAdmin();
    const { data: request, error } = await supabase
      .from("review_requests")
      .select("*")
      .eq("id", check.requestId)
      .maybeSingle();
    if (error) throw error;
    if (!request || !request.sent_at) return { state: "invalid" };
    if (request.used_at) return { state: "used" };
    if (request.expires_at && new Date(request.expires_at).getTime() < Date.now()) return { state: "expired" };

    const [{ data: order }, { data: item }] = await Promise.all([
      supabase.from("orders").select("id, order_number, status, order_status, customer_id").eq("id", request.order_id).maybeSingle(),
      supabase.from("order_items").select("id, order_id, product_id, name, image").eq("id", request.order_item_id).maybeSingle(),
    ]);
    if (!order || !item) return { state: "invalid" };
    if (isClosed(order as OrderRow)) return { state: "order_closed" };

    const { data: customer } = await supabase
      .from("customers")
      .select("id, email, full_name")
      .eq("id", (order as OrderRow).customer_id)
      .maybeSingle();

    const product = getProductById(request.product_id);
    return {
      state: "ready",
      request: request as ReviewRequestRow,
      productId: request.product_id,
      productName: product?.name ?? (item as ItemRow).name,
      productImage: product?.thumbnail ?? (item as ItemRow).image ?? null,
      category: product?.category ?? "",
      condition: product ? resolveProductCondition(product) : "brand-new",
      reviewerName: publicReviewerName((customer as CustomerRow | null)?.full_name),
    };
  } catch (error) {
    if (isMissingReviewSchema(error)) return { state: "unavailable" };
    logError("review_link_load_failed", error);
    return { state: "unavailable" };
  }
}

/* ---------- 4. Submit through a link ---------- */

export type VerifiedReviewInput = {
  token: string;
  rating: unknown;
  review: unknown;
  vehicle: unknown;
  installedBy: unknown;
  wouldBuyAgain: unknown;
  answers: unknown;
};

const MIN_REVIEW_LENGTH = 40;
const MAX_REVIEW_LENGTH = 4000;

export async function submitVerifiedReview(
  input: VerifiedReviewInput
): Promise<{ ok: true } | { ok: false; status: number; error: string }> {
  const link = await loadReviewLink(input.token);
  if (link.state !== "ready") {
    const messages: Record<string, string> = {
      used: "A review has already been submitted for this item.",
      expired: "This review link has expired.",
      order_closed: "This order was cancelled or refunded, so it can't be reviewed.",
      unavailable: "Reviews are unavailable right now. Please try again later.",
      invalid: "This review link isn't valid.",
    };
    return { ok: false, status: link.state === "unavailable" ? 503 : 400, error: messages[link.state] };
  }

  const rating = Math.round(Number(input.rating));
  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    return { ok: false, status: 400, error: "Choose a rating from 1 to 5 stars." };
  }
  const review = typeof input.review === "string" ? input.review.trim() : "";
  if (review.length < MIN_REVIEW_LENGTH) {
    return { ok: false, status: 400, error: `Please write at least ${MIN_REVIEW_LENGTH} characters about the part.` };
  }
  const vehicle = typeof input.vehicle === "string" ? input.vehicle.trim().slice(0, 80) : "";
  if (!vehicle) {
    return { ok: false, status: 400, error: "Please tell us which vehicle it went on (e.g. 2016 Tacoma 3.5L)." };
  }
  const installedBy =
    typeof input.installedBy === "string" && INSTALLED_BY_OPTIONS.some((o) => o.value === input.installedBy)
      ? input.installedBy
      : null;
  if (!installedBy) return { ok: false, status: 400, error: "Please say who installed it." };
  const wouldBuyAgain = input.wouldBuyAgain === true ? true : input.wouldBuyAgain === false ? false : null;

  const sets = questionSetsFor(link.category, link.condition);
  const { answers, error: answersError } = validateAnswers(sets, input.answers);
  if (answersError) return { ok: false, status: 400, error: answersError };

  const supabase = getSupabaseAdmin();
  const { data: inserted, error } = await supabase
    .from("product_reviews")
    .insert({
      product_id: link.productId,
      user_id: `order-item-${link.request.order_item_id}`,
      // From the order, not the form: nobody can review under another name.
      reviewer_name: link.reviewerName,
      rating,
      review: review.slice(0, MAX_REVIEW_LENGTH),
      // Earned by holding the emailed link -- see lib/reviews/review-link.ts.
      verified_purchase: true,
      verification_method: "signed_link",
      order_item_id: link.request.order_item_id,
      answers,
      answers_schema: schemaIdFor(sets),
      vehicle,
      installed_by: installedBy,
      would_buy_again: wouldBuyAgain,
      profile_image: null,
      source: "storefront",
      // Moderated like every review. Moderation may remove personal data,
      // abuse or spam (see /admin/reviews) -- never a review for its rating.
      status: "pending",
    })
    .select("id")
    .single();

  if (error) {
    if ((error as { code?: string }).code === "23505") {
      return { ok: false, status: 409, error: "A review has already been submitted for this item." };
    }
    if (isMissingReviewSchema(error)) {
      return { ok: false, status: 503, error: "Reviews are unavailable right now. Please try again later." };
    }
    logError("verified_review_insert_failed", error, { productId: link.productId });
    return { ok: false, status: 500, error: "We couldn't save your review. Please try again." };
  }

  await supabase
    .from("review_requests")
    .update({ used_at: new Date().toISOString(), review_id: inserted.id })
    .eq("id", link.request.id);

  return { ok: true };
}

/* ---------- 5. Opt out ---------- */

export async function optOutOfReviewRequests(token: string): Promise<boolean> {
  // An expired link can still be used to opt out.
  const check = await readReviewToken(token, { allowExpired: true });
  const requestId = check.ok ? check.requestId : null;
  if (!requestId || !isSupabaseConfigured()) return false;

  try {
    const supabase = getSupabaseAdmin();
    const { data: request } = await supabase
      .from("review_requests")
      .select("email_hash")
      .eq("id", requestId)
      .maybeSingle();
    if (!request?.email_hash) return false;

    await supabase
      .from("review_email_optouts")
      .upsert({ email_hash: request.email_hash }, { onConflict: "email_hash", ignoreDuplicates: true });
    await supabase
      .from("review_requests")
      .update({ skipped_reason: "opted_out" })
      .eq("email_hash", request.email_hash)
      .is("sent_at", null);
    return true;
  } catch (error) {
    logError("review_optout_failed", error);
    return false;
  }
}
