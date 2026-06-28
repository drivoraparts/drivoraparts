import { NextResponse } from "next/server";

/** Cryptomus has been removed from DrivoraParts. Use NOWPayments instead. */
export async function POST() {
  return NextResponse.json(
    { error: "Cryptomus is no longer supported. Use NOWPayments." },
    { status: 410 }
  );
}
