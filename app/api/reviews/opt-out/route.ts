import { NextResponse } from "next/server";
import { optOutOfReviewRequests } from "@/lib/reviews/requests";

export const dynamic = "force-dynamic";

/*
 * POST only. The email's opt-out link opens a page with a button rather than
 * acting on GET, because mail scanners open every link in a message and would
 * otherwise opt customers out without their asking.
 */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { token?: unknown } | null;
  const ok = typeof body?.token === "string" && (await optOutOfReviewRequests(body.token));
  return ok
    ? NextResponse.json({ ok: true })
    : NextResponse.json({ error: "We couldn't process that link. Please email us instead." }, { status: 400 });
}
