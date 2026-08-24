// /api/suggest — SQLite tarif kataloğundan yemek öneri listesi ucu.

import { NextResponse } from "next/server";
import { getRecommendations } from "@/lib/recommendations";
import { parseSuggestionRequest } from "@/lib/requests";

// better-sqlite3 yalnızca Node.js runtime'ında çalışır.
export const runtime = "nodejs";

const SUGGEST_COUNT = 5;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz istek gövdesi" }, { status: 400 });
  }

  const { req, error } = parseSuggestionRequest(body);
  if (error || !req) {
    return NextResponse.json({ error }, { status: 400 });
  }

  try {
    let localSuggestions = getRecommendations({
      ingredients: req.ingredients,
      diet: req.diet,
      maxTime: req.maxTime,
      cuisine: req.cuisine,
      excludeNames: req.excludeNames,
      excludeIngredients: req.excludeIngredients,
      limit: SUGGEST_COUNT,
    });

    // Dolap modunda geçmişteki tüm öneriler uygun tarifleri dışladıysa,
    // geçmişi yok sayarak güvenli bir geri dönüş yap.
    if (
      req.mode === "dolap" &&
      localSuggestions.length === 0 &&
      req.excludeNames.length > 0
    ) {
      localSuggestions = getRecommendations({
        ingredients: req.ingredients,
        diet: req.diet,
        maxTime: req.maxTime,
        cuisine: req.cuisine,
        excludeIngredients: req.excludeIngredients,
        limit: SUGGEST_COUNT,
      });
    }

    // OneriClient'in mevcut response contract'ını koru.
    const suggestions = localSuggestions.map(({ name, type, reason }) => ({
      name,
      type,
      reason,
    }));

    return NextResponse.json({ suggestions, count: suggestions.length });
  } catch (err) {
    console.error("Yerel öneri listesi oluşturulurken hata:", err);
    return NextResponse.json(
      { error: "Öneriler oluşturulamadı. Lütfen tekrar deneyin." },
      { status: 500 }
    );
  }
}
