import { NextResponse } from "next/server";
import { getOrderById } from "@/lib/db/orders";
import { createCheckoutPayment } from "@/lib/payments";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const orderId = typeof body?.orderId === "string" ? body.orderId : null;

  if (!orderId) {
    return NextResponse.json({ error: "orderId required" }, { status: 400 });
  }

  const order = await getOrderById(orderId);

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const invoice = await createCheckoutPayment(
    {
      orderId,
      amount: Number(order.total),
      customerEmail: order.customer?.email ?? "",
    },
    "cryptomus"
  );

  return NextResponse.json(invoice);
}
