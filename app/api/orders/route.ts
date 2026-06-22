import { NextResponse } from "next/server";
import { listOrders } from "@/lib/db/orders";
import { requireAdminApi } from "@/lib/auth/require-admin";

export const runtime = "edge";

export async function GET() {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;

  const orders = await listOrders();
  return NextResponse.json(orders);
}
