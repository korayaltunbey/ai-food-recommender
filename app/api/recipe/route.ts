// /api/recipe — seçilen yemeğin tam tarifini üreten uç.
// Kullanıcı öneri listesinden bir yemek seçtiğinde bu uç çağrılır;
// kişi sayısına ölçeklenmiş ölçülerle tam tarif döndürülür.

import { NextResponse } from "next/server";
import { callDeepSeek } from "@/lib/deepseek"; // ortak API çağrısı
import {
  buildRecipeUserPrompt,
  parseRecipe,
  RECIPE_SYSTEM_PROMPT,
} from "@/lib/recipes"; // tarif promptu ve doğrulayıcı
import { parseRecipeRequest } from "@/lib/requests"; // istek doğrulama

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

  // Ortak alanları + seçilen yemek adını doğrula
  const { req, dishName, error } = parseRecipeRequest(body);
  if (error || !req || !dishName) {
    return NextResponse.json({ error }, { status: 400 });
  }

  try {
    // DeepSeek'ten tam tarif JSON'unu al (seçilen yemek adıyla)
    const parsed = await callDeepSeek(
      RECIPE_SYSTEM_PROMPT,
      buildRecipeUserPrompt({ ...req, dishName }),
      1500 // tarif için daha geniş token bütçesi
    );
    // Gelen JSON'u doğrula ve Recipe nesnesine çevir
    const recipe = parseRecipe(parsed);
    return NextResponse.json({ recipe });
  } catch (err) {
    console.error("Tarif üretilirken hata:", err);
    // API anahtarı eksikse anlaşılır mesaj, değilse genel hata
    const message =
      err instanceof Error && err.message.includes("API anahtarı")
        ? "Sunucuda DEEPSEEK_API_KEY tanımlı değil. .env.local dosyasına ekleyin."
        : "Tarif üretilemedi. Lütfen tekrar deneyin.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
