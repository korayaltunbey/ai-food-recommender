import type { DishSuggestion } from "@/lib/types";
import {
  findRecipes,
  type DatabaseRecipe,
  type DatabaseRecipeIngredient,
  type RecipeSearchFilters,
} from "@/lib/recipe-repository";

const DEFAULT_LIMIT = 5;

export interface RecommendationRequest {
  ingredients?: string[];
  diet?: string;
  maxTime?: number | null;
  cuisine?: string;
  excludeNames?: string[];
  excludeIngredients?: string[];
  limit?: number;
}

export interface LocalDishSuggestion extends DishSuggestion {
  id: number;
  slug: string;
  matchedIngredientCount: number;
  matchScore: number;
}

const DIET_ALIASES: Record<string, string> = {
  vejetaryen: "vegetarian",
  vegetarian: "vegetarian",
  vegan: "vegan",
  glutensiz: "gluten_free",
  "gluten free": "gluten_free",
  "dusuk karbonhidrat": "low_carb",
  "low carb": "low_carb",
  "dusuk kalorili": "low_calorie",
  "low calorie": "low_calorie",
};

export function normalizeSearchText(value: string): string {
  return value
    .trim()
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/İ/g, "i")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function toDietCode(value: string | undefined): string | undefined {
  if (!value?.trim()) return undefined;
  const normalized = normalizeSearchText(value);
  return DIET_ALIASES[normalized] || normalized;
}

function normalizeCuisine(value: string | undefined): string | undefined {
  if (!value?.trim()) return undefined;
  return normalizeSearchText(value) === normalizeSearchText("Türk Mutfağı")
    ? "Türk Mutfağı"
    : value.trim();
}

function getRequiredIngredients(
  recipeIngredients: DatabaseRecipeIngredient[]
): DatabaseRecipeIngredient[] {
  const nonPantry = recipeIngredients.filter(
    (ingredient) => !ingredient.isOptional && !ingredient.isPantryStaple
  );

  if (nonPantry.length > 0) return nonPantry;
  return recipeIngredients.filter((ingredient) => !ingredient.isOptional);
}

export function getMissingIngredients(
  recipe: DatabaseRecipe,
  userIngredients: string[]
): string[] {
  const userIngredientSet = new Set(
    userIngredients.map(normalizeSearchText).filter((name) => name.length > 0)
  );

  return getRequiredIngredients(recipe.ingredients)
    .filter((ingredient) => !userIngredientSet.has(ingredient.normalizedName))
    .map((ingredient) => ingredient.name);
}

function calculateMatch(
  recipe: DatabaseRecipe,
  userIngredients: Set<string>
): { matchedIngredientCount: number; matchScore: number } {
  if (userIngredients.size === 0) {
    return { matchedIngredientCount: 0, matchScore: 0 };
  }

  const matchedIngredientCount = recipe.ingredients.filter((ingredient) =>
    userIngredients.has(ingredient.normalizedName)
  ).length;

  const requiredIngredients = getRequiredIngredients(recipe.ingredients);
  const matchedRequiredCount = requiredIngredients.filter((ingredient) =>
    userIngredients.has(ingredient.normalizedName)
  ).length;

  const matchScore =
    requiredIngredients.length === 0
      ? 0
      : matchedRequiredCount / requiredIngredients.length;

  return { matchedIngredientCount, matchScore };
}

function isExcluded(
  recipe: DatabaseRecipe,
  excludeNames: Set<string>,
  excludeIngredients: Set<string>
): boolean {
  const recipeNames = [recipe.name, recipe.slug].map(normalizeSearchText);
  if (recipeNames.some((name) => excludeNames.has(name))) return true;

  return recipe.ingredients.some((ingredient) =>
    excludeIngredients.has(ingredient.normalizedName)
  );
}

function buildReason(
  recipe: DatabaseRecipe,
  matchedIngredientCount: number,
  hasIngredientFilter: boolean
): string {
  if (hasIngredientFilter && matchedIngredientCount > 0) {
    return `${matchedIngredientCount} malzemen elinde var`;
  }

  return `${recipe.category} kategorisinden uygun bir tarif`;
}

export function getRecommendations(
  request: RecommendationRequest = {}
): LocalDishSuggestion[] {
  const userIngredients = new Set(
    (request.ingredients ?? [])
      .map(normalizeSearchText)
      .filter((ingredient) => ingredient.length > 0)
  );
  const excludeNames = new Set(
    (request.excludeNames ?? [])
      .map(normalizeSearchText)
      .filter((name) => name.length > 0)
  );
  const excludeIngredients = new Set(
    (request.excludeIngredients ?? [])
      .map(normalizeSearchText)
      .filter((name) => name.length > 0)
  );

  const filters: RecipeSearchFilters = {
    maxTime: request.maxTime ?? null,
    cuisine: normalizeCuisine(request.cuisine),
    diet: toDietCode(request.diet),
  };

  const recipes = findRecipes(filters);
  const hasIngredientFilter = userIngredients.size > 0;
  const limit = Math.min(Math.max(Math.round(request.limit ?? DEFAULT_LIMIT), 1), 20);

  return recipes
    .filter((recipe) =>
      !isExcluded(recipe, excludeNames, excludeIngredients)
    )
    .map((recipe) => {
      const match = calculateMatch(recipe, userIngredients);
      return {
        id: recipe.id,
        slug: recipe.slug,
        name: recipe.name,
        type: recipe.category,
        reason: buildReason(
          recipe,
          match.matchedIngredientCount,
          hasIngredientFilter
        ),
        matchedIngredientCount: match.matchedIngredientCount,
        matchScore: match.matchScore,
        timeMinutes: recipe.timeMinutes,
      };
    })
    .sort((a, b) => {
      if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
      if (b.matchedIngredientCount !== a.matchedIngredientCount) {
        return b.matchedIngredientCount - a.matchedIngredientCount;
      }
      if (a.timeMinutes !== b.timeMinutes) return a.timeMinutes - b.timeMinutes;
      return a.name.localeCompare(b.name, "tr");
    })
    .slice(0, limit)
    .map((suggestion) => ({
      id: suggestion.id,
      slug: suggestion.slug,
      name: suggestion.name,
      type: suggestion.type,
      reason: suggestion.reason,
      matchedIngredientCount: suggestion.matchedIngredientCount,
      matchScore: suggestion.matchScore,
    }));
}
