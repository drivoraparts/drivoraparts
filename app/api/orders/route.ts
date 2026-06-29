import { NextResponse } from "next/server";
import { listPlacedOrders } from "@/lib/db/orders";
import { requireAdminApi } from "@/lib/auth/require-admin";

export async function GET() {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;

  const orders = await listPlacedOrders();
  return NextResponse.json(orders);
}
