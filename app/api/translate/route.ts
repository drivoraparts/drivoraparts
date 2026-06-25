import { NextResponse } from "next/server";
import { BASE_LANGUAGE } from "@/lib/i18n/constants";

export const dynamic = "force-dynamic";

const CACHE = new Map<string, string>();
const MAX_CHUNK = 450;

type MyMemoryResponse = {
  responseData?: { translatedText?: string };
};

function normalizeTargetLang(lang: string): string {
  const map: Record<string, string> = {
    zh: "zh-CN",
    cn: "zh-CN",
    pt: "pt-PT",
    no: "nb",
  };
  return map[lang] ?? lang;
}

function chunkText(text: string): string[] {
  if (text.length <= MAX_CHUNK) return [text];

  const chunks: string[] = [];
  let remaining = text;

  while (remaining.length > MAX_CHUNK) {
    let splitAt = remaining.lastIndexOf("\n", MAX_CHUNK);
    if (splitAt < MAX_CHUNK * 0.4) {
      splitAt = remaining.lastIndexOf(" ", MAX_CHUNK);
    }
    if (splitAt < MAX_CHUNK * 0.4) splitAt = MAX_CHUNK;

    chunks.push(remaining.slice(0, splitAt));
    remaining = remaining.slice(splitAt).trimStart();
  }

  if (remaining) chunks.push(remaining);
  return chunks;
}

async function translateChunk(text: string, targetLang: string): Promise<string> {
  const normalizedLang = normalizeTargetLang(targetLang);
  const cacheKey = `${normalizedLang}:${text}`;
  const cached = CACHE.get(cacheKey);
  if (cached) return cached;

  const url =
    "https://api.mymemory.translated.net/get?q=" +
    encodeURIComponent(text) +
    "&langpair=en|" +
    encodeURIComponent(normalizedLang);

  const res = await fetch(url, { next: { revalidate: 86400 } });
  if (!res.ok) return text;

  const data = (await res.json()) as MyMemoryResponse;
  const translated = data.responseData?.translatedText?.trim() || text;

  if (translated.includes("MYMEMORY WARNING")) {
    return text;
  }

  CACHE.set(cacheKey, translated);
  return translated;
}

async function translateText(text: string, targetLang: string): Promise<string> {
  if (!text.trim() || targetLang === BASE_LANGUAGE) return text;

  const chunks = chunkText(text);
  const translated = await Promise.all(
    chunks.map((chunk) => translateChunk(chunk, targetLang))
  );
  return translated.join("\n");
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      texts?: string[];
      targetLang?: string;
    };

    const texts = Array.isArray(body.texts) ? body.texts : [];
    const targetLang = body.targetLang ?? BASE_LANGUAGE;

    if (!texts.length) {
      return NextResponse.json({ translations: [] });
    }

    if (texts.length > 40) {
      return NextResponse.json({ error: "Too many texts in one request" }, { status: 400 });
    }

    const translations = await Promise.all(
      texts.map((text) => translateText(String(text ?? ""), targetLang))
    );

    return NextResponse.json(
      { translations },
      {
        headers: {
          "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
        },
      }
    );
  } catch {
    return NextResponse.json({ error: "Translation failed" }, { status: 500 });
  }
}
