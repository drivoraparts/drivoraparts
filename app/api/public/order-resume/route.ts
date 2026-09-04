import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/env";

export const dynamic = "force-dynamic";

/**
 * Everything needed to put a customer back into checkout for an order they
 * already placed.
 *
 * "Return to Checkout" used to be a bare link to /checkout, so the page fell
 * back to localStorage for both the cart and the form. A customer who opened
 * the payment-not-completed email on their phone, or in a different browser, or
 * after clearing site data, arrived at an empty checkout and a lost order. The
 * order itself was never lost -- it is in the database with its own item
 * snapshot -- but nothing carried it across the gap.
 *
 * Scope is deliberately narrow:
 *
 *  - PENDING ORDERS ONLY. A paid or cancelled order has nothing to resume, and
 *    refusing them keeps this from becoming a way to read the details of any
 *    completed sale.
 *  - The order id is a v4 UUID and is the capability. It is unguessable, it is
 *    only ever delivered to the address on the order, and a malformed or
 *    unknown id is answered identically to one that is not pending, so the
 *    response never distinguishes "wrong shape", "no such order", "not yours"
 *    and "already paid".
 *  - No payment credentials, no invoice url, no internal ids beyond the order's
 *    own. Continue Payment already has its own route for that.
 */
export async function GET(req: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Unavailable" }, { status: 503 });
  }

  const orderId = new URL(req.url).searchParams.get("orderId");
  const notFound = NextResponse.json({ error: "Not found" }, { status: 404 });

  if (
    !orderId ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderId)
  ) {
    return notFound;
  }

  try {
    const supabase = getSupabaseAdmin();

    /*
     * shipping_method is NOT selected here, deliberately. That column arrives
     * with migration 013, which has not been applied -- createOrderRecord
     * already carries a retry for exactly this. PostgREST rejects an unknown
     * column with 42703 for the whole statement, so asking for it turned every
     * lookup into an error and every resume into a 404. The shipping amount is
     * on the order and is all this needs; the method is re-derived at checkout
     * from the address anyway.
     */
    const { data: order } = await supabase
      .from("orders")
      .select("id, order_number, status, customer_id, shipping")
      .eq("id", orderId)
      .maybeSingle();

    // Only an order still awaiting payment can be resumed.
    if (!order || order.status !== "pending") return notFound;

    const [{ data: items }, { data: customer }] = await Promise.all([
      supabase
        .from("order_items")
        .select("product_id, name, price, image, category, brand, quantity")
        .eq("order_id", orderId),
      supabase
        .from("customers")
        .select("full_name, email, phone, shipping_address")
        .eq("id", order.customer_id)
        .maybeSingle(),
    ]);

    if (!items?.length) return notFound;

    /*
     * The address is stored composed, as
     *
     *     street
     *     city, zip
     *     country
     *
     * by app/api/checkout/route.ts. Splitting it back is best-effort by
     * definition -- a city containing a comma, or a field left blank at
     * checkout, makes the shape ambiguous. That is acceptable here because the
     * customer lands on an editable form and can correct anything wrong; the
     * point is to spare them retyping, not to be authoritative. Whatever cannot
     * be parsed confidently comes back as an empty string rather than a guess.
     */
    const lines = String(customer?.shipping_address ?? "")
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    const [street = "", cityZip = "", country = ""] =
      lines.length >= 3 ? lines : [lines[0] ?? "", lines[1] ?? "", ""];
    const commaAt = cityZip.lastIndexOf(",");
    const city = commaAt >= 0 ? cityZip.slice(0, commaAt).trim() : cityZip;
    const zip = commaAt >= 0 ? cityZip.slice(commaAt + 1).trim() : "";

    return NextResponse.json(
      {
        orderId: order.id,
        orderNumber: order.order_number,
        shipping: Number(order.shipping ?? 0),
        items: items.map((i) => ({
          id: Number(i.product_id),
          name: String(i.name),
          price: Number(i.price),
          image: (i.image as string | null) ?? "",
          category: (i.category as string | null) ?? "",
          brand: (i.brand as string | null) ?? undefined,
          quantity: Number(i.quantity),
        })),
        customer: {
          fullName: customer?.full_name ?? "",
          email: customer?.email ?? "",
          phone: customer?.phone ?? "",
          address: street,
          city,
          zip,
          country,
        },
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return NextResponse.json({ error: "Lookup failed" }, { status: 500 });
  }
}
