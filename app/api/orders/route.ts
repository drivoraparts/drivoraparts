import { NextResponse } from "next/server";
import { getOrders } from "@/lib/marketplace";

export const runtime = "edge";

export async function GET() {
  return NextResponse.json(getOrders());
}
