import { NextRequest, NextResponse } from "next/server";

const ALLOWED_HOSTS = new Set([
  "edmundstruckparts.com",
  "www.edmundstruckparts.com",
]);

const UA =
  "Mozilla/5.0 (compatible; DrivoraParts/1.0; +https://drivoraparts.com)";

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("u");
  if (!raw) {
    return new NextResponse("Missing image URL", { status: 400 });
  }

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return new NextResponse("Invalid image URL", { status: 400 });
  }

  if (url.protocol !== "https:" || !ALLOWED_HOSTS.has(url.hostname)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  try {
    const upstream = await fetch(url.toString(), {
      headers: {
        "User-Agent": UA,
        Accept: "image/*,*/*;q=0.8",
      },
      next: { revalidate: 60 * 60 * 24 * 7 },
    });

    if (!upstream.ok) {
      return new NextResponse("Upstream error", { status: upstream.status });
    }

    const contentType = upstream.headers.get("content-type") ?? "image/jpeg";
    const body = await upstream.arrayBuffer();

    if (body.byteLength < 500) {
      return new NextResponse("Invalid image", { status: 502 });
    }

    return new NextResponse(body, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control":
          "public, max-age=604800, stale-while-revalidate=86400, immutable",
      },
    });
  } catch {
    return new NextResponse("Fetch failed", { status: 502 });
  }
}
