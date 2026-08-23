// /api/suggest — yemek öneri listesi ucu.
// İstekteki malzemeler/filtreler ve dışlama kurallarıyla DeepSeek'ten
// 5 farklı yemek adı ister, doğrular ve { suggestions } olarak döndürür.

import { NextResponse } from "next/server";
import { callDeepSeek } from "@/lib/deepseek"; // ortak API çağrısı
import {
  buildListUserPrompt,
  LIST_SYSTEM_PROMPT,
  parseSuggestionList,
  SUGGEST_COUNT,
} from "@/lib/recipes"; // liste promptu ve doğrulayıcı
import { parseSuggestionRequest } from "@/lib/requests"; // istek doğrulama

// Sunucu işlevinin en fazla çalışabileceği süre (Vercel limiti)
export const maxDuration = 60;

export async function POST(request: Request) {
  // İstek gövdesini JSON olarak çöz; geçersizse 400 döndür
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz istek gövdesi" }, { status: 400 });
  }

  // Ortak alanları doğrula ve temizle
  const { req, error } = parseSuggestionRequest(body);
  if (error || !req) {
    return NextResponse.json({ error }, { status: 400 });
  }

  try {
    // DeepSeek'ten öneri listesi JSON'unu al
    const parsed = await callDeepSeek(
      LIST_SYSTEM_PROMPT,
      buildListUserPrompt(req),
      900 // liste için küçük token bütçesi yeterlidir
    );
    // Gelen JSON'u doğrula ve 5 yemeğe dönüştür
    const suggestions = parseSuggestionList(parsed);
    return NextResponse.json({ suggestions, count: SUGGEST_COUNT });
  } catch (err) {
    console.error("Öneri listesi üretilirken hata:", err);
    // API anahtarı eksikse anlaşılır mesaj, değilse genel hata
    const message =
      err instanceof Error && err.message.includes("API anahtarı")
        ? "Sunucuda DEEPSEEK_API_KEY tanımlı değil. .env.local dosyasına ekleyin."
        : "Öneriler üretilemedi. Lütfen tekrar deneyin.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
