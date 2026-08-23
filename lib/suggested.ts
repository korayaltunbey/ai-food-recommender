// Öneri geçmişi (tekrar engelleme listesi) - localStorage tabanlı.
// Her önerilen yemek adı buraya otomatik eklenir; bir sonraki istekte
// "excludeNames" olarak API'ye gönderilir, böylece aynı yemek bir daha önerilmez.
// Depo mekanizması ortak createArrayStore fabrikasından gelir.

import { createArrayStore } from "./store";

const MAX_ITEMS = 100; // en fazla hatırlanacak yemek adı (aşınca en eskiler düşer)

// Ortak dizi deposu fabrikasıyla depoyu oluştur
const store = createArrayStore<string>({
  storageKey: "foof-suggested",
  changeEvent: "foof-suggested-changed",
});

// useSyncExternalStore bağlantı noktaları (dışa açılan isimler korunur)
export const getSuggestedSnapshot = store.getSnapshot;
export const getSuggestedServerSnapshot = store.getServerSnapshot;
export const subscribeSuggested = store.subscribe;

// Bir öneri listesinden gelen yemek adlarını tekrar etmeden geçmişe ekler.
// En yeni adlar başa gelecek şekilde MAX_ITEMS ile sınırlanır.
export function addSuggestedNames(names: string[]): void {
  if (names.length === 0) return;
  const current = store.getSnapshot();
  const seen = new Set(current.map((n) => n.toLowerCase()));
  const additions = names.filter((n) => !seen.has(n.toLowerCase()));
  if (additions.length === 0) return;
  store.write([...additions, ...current].slice(0, MAX_ITEMS));
}

// Geçmişi tamamen temizler: kullanıcı "sıfırla" dediğinde tüm yemekler
// yeniden önerilebilir hale gelir.
export function clearSuggested(): void {
  store.write([]);
}
