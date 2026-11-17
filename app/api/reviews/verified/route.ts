import { NextResponse } from "next/server";
import { submitVerifiedReview } from "@/lib/reviews/requests";

export const dynamic = "force-dynamic";

/*
 * The only way to submit a Verified Buyer review: with the single-use token
 * from a post-delivery review email. See lib/reviews/requests.ts.
 */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body || typeof body.token !== "string") {
    return NextResponse.json({ error: "This review link isn't valid." }, { status: 400 });
  }

  const result = await submitVerifiedReview({
    token: body.token,
    rating: body.rating,
    review: body.review,
    vehicle: body.vehicle,
    installedBy: body.installedBy,
    wouldBuyAgain: body.wouldBuyAgain,
    answers: body.answers,
  });

  if (result.ok === false) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({ ok: true });
}
