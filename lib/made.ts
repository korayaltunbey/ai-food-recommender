// "Yaptığım yemekler" listesi (localStorage tabanlı).
// Bu listedeki yemek adları ve benzerleri önerilerde dışlanır.
// Depo mekanizması ortak createArrayStore fabrikasından gelir.

import { createArrayStore } from "./store";

const MAX_ITEMS = 50; // en fazla tutulacak yemek adı

// Ortak dizi deposu fabrikasıyla depoyu oluştur
const store = createArrayStore<string>({
  storageKey: "foof-made",
  changeEvent: "foof-made-changed",
});

// useSyncExternalStore bağlantı noktaları (dışa açılan isimler korunur)
export const getMadeSnapshot = store.getSnapshot;
export const getMadeServerSnapshot = store.getServerSnapshot;
export const subscribeMade = store.subscribe;

// Yeni bir yemek adı ekler (büyük-küçük harf duyarsız tekrar kontrolü)
export function addMadeDish(name: string): void {
  const trimmed = name.trim();
  if (!trimmed) return;
  const current = store.getSnapshot();
  const exists = current.some((d) => d.toLowerCase() === trimmed.toLowerCase());
  if (exists) return;
  store.write([...current, trimmed].slice(0, MAX_ITEMS));
}

// Belirtilen yemek adını listeden çıkarır (harf duyarsız eşleşme)
export function removeMadeDish(name: string): void {
  store.write(store.getSnapshot().filter((d) => d.toLowerCase() !== name.toLowerCase()));
}
