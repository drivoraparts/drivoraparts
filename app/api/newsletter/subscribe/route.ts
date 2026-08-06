import { NextResponse } from "next/server";
import { subscribeToNewsletter } from "@/lib/db/newsletter";
import { isSupabaseConfigured } from "@/lib/env";
import { logActivity } from "@/lib/monitoring/activity";
import { getClientIp } from "@/lib/security/ip";

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(req: Request) {
  const ip = getClientIp(req);

  try {
    const body = await req.json().catch(() => null);
    const email = typeof body?.email === "string" ? body.email.trim() : "";
    const source = typeof body?.source === "string" ? body.source.slice(0, 60) : undefined;

    if (!email || !isValidEmail(email) || email.length > 254) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: "Newsletter signup is temporarily unavailable." },
        { status: 503 }
      );
    }

    const result = await subscribeToNewsletter(email, source);
    if (!result.ok) {
      await logActivity("error", "newsletter.subscribe_failed", { ip, error: result.error });
      return NextResponse.json({ error: "Could not subscribe right now." }, { status: 500 });
    }

    await logActivity("info", "newsletter.subscribed", {
      ip,
      alreadySubscribed: result.alreadySubscribed,
    });

    return NextResponse.json({ success: true, alreadySubscribed: result.alreadySubscribed });
  } catch {
    return NextResponse.json({ error: "Could not subscribe right now." }, { status: 500 });
  }
}
