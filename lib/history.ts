// Kaydedilen tariflerin geçmişi (localStorage tabanlı).
// Depo mekanizması ortak createArrayStore fabrikasından gelir; bozuk kayıtları
// okurken elemek için bir doğrulayıcı verilir.

import { createArrayStore } from "./store";
import type { Recipe, SavedRecipe, SuggestionMode } from "./types";

const MAX_ITEMS = 20; // en fazla tutulacak kayıt sayısı

// Bir kaydın geçerli olup olmadığını kontrol eder.
// Bozuk/eksik kayıt (geçersiz savedAt, eksik recipe.name vb.) asla gösterilmez.
function isValidSavedRecipe(item: unknown): item is SavedRecipe {
  if (typeof item !== "object" || item === null) return false;
  const record = item as Record<string, unknown>;
  const recipe = record.recipe as Record<string, unknown> | undefined;
  return (
    typeof record.id === "string" &&
    typeof record.savedAt === "string" &&
    Number.isFinite(new Date(record.savedAt).getTime()) &&
    typeof record.mode === "string" &&
    typeof recipe === "object" &&
    recipe !== null &&
    typeof recipe.name === "string" &&
    recipe.name.trim().length > 0
  );
}

// Ortak dizi deposu fabrikasıyla depoyu oluştur (bozuk kayıtlar otomatik elenir)
const store = createArrayStore<SavedRecipe>({
  storageKey: "foof-suggestion-history",
  changeEvent: "foof-history-changed",
  isValid: isValidSavedRecipe,
});

// useSyncExternalStore bağlantı noktaları (dışa açılan isimler korunur)
export const getSnapshot = store.getSnapshot;
export const getServerSnapshot = store.getServerSnapshot;
export const subscribe = store.subscribe;

// Yeni bir tarifi geçmişin başına ekler (eski kayıtlar MAX_ITEMS'e göre düşer)
export function addToHistory(mode: SuggestionMode, recipe: Recipe): void {
  const item: SavedRecipe = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, // benzersiz kimlik
    savedAt: new Date().toISOString(),
    mode,
    recipe,
  };
  store.write([item, ...store.getSnapshot()].slice(0, MAX_ITEMS));
}

// Belirtilen kimliğe sahip kaydı geçmişten siler
export function removeFromHistory(id: string): void {
  store.write(store.getSnapshot().filter((item) => item.id !== id));
}
