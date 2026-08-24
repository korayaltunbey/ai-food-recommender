// /api/recipe — SQLite tarif kataloğundan seçilen tarifin tam verisini döndürür.

import { NextResponse } from "next/server";
import { findRecipes } from "@/lib/recipe-repository";
import { getMissingIngredients, normalizeSearchText } from "@/lib/recommendations";
import { mapDatabaseRecipeToRecipe } from "@/lib/recipe-mapper";
import { parseRecipeRequest } from "@/lib/requests";

// better-sqlite3 yalnızca Node.js runtime'ında çalışır.
export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz istek gövdesi" }, { status: 400 });
  }

  const { req, dishName, error } = parseRecipeRequest(body);
  if (error || !req || !dishName) {
    return NextResponse.json({ error }, { status: 400 });
  }

  try {
    const normalizedDishName = normalizeSearchText(dishName);
    const recipe = findRecipes().find(
      (candidate) => normalizeSearchText(candidate.name) === normalizedDishName
    );

    if (!recipe) {
      return NextResponse.json(
        { error: "Seçilen tarif bulunamadı." },
        { status: 404 }
      );
    }

    const missingIngredients =
      req.mode === "dolap"
        ? getMissingIngredients(recipe, req.ingredients)
        : [];
    const mappedRecipe = mapDatabaseRecipeToRecipe(recipe, {
      servings: req.servings,
      missingIngredients,
    });

    return NextResponse.json({ recipe: mappedRecipe });
  } catch (err) {
    console.error("Yerel tarif yüklenirken hata:", err);
    return NextResponse.json(
      { error: "Tarif yüklenemedi. Lütfen tekrar deneyin." },
      { status: 500 }
    );
  }
}
