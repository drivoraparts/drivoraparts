export const runtime = 'edge';

import { NextResponse } from "next/server";

/** @deprecated Use /api/payments/webhook/cryptomus */
export async function POST(req: Request) {
  const rawBody = await req.text();
  const forward = await fetch(new URL("/api/payments/webhook/cryptomus", req.url), {
    method: "POST",
    headers: {
      "Content-Type": req.headers.get("Content-Type") ?? "application/json",
      sign: req.headers.get("sign") ?? "",
    },
    body: rawBody,
  });

  const data = await forward.json().catch(() => ({ success: true }));
  return NextResponse.json(data, { status: forward.status });
}
