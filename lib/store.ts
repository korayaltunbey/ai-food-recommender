// Genel amaçlı localStorage dizi deposu fabrikası.
// useSyncExternalStore ile React'e bağlanan tüm dizi depoları (geçmiş,
// yaptığım yemekler, öneri geçmişi) bu tek fabrikadan üretilir.
// Böylece cached/subscribe/write kalıbı bir kez yazılır, her depoda tekrarlanmaz.

export interface ArrayStore<T> {
  // useSyncExternalStore için anlık değer (önbellekli, stabil referans)
  getSnapshot: () => T[];
  // Sunucuda (SSR/hydration) kullanılacak değer.
  // React'in "getServerSnapshot cached olmalı" kuralı için SABİT referans döner.
  getServerSnapshot: () => T[];
  // Değişikliklerde React'i bilgilendiren abonelik
  subscribe: (cb: () => void) => () => void;
  // Depoya yazma (bellek + localStorage + abone bildirimi)
  write: (next: T[]) => void;
}

interface CreateArrayStoreOptions<T> {
  storageKey: string; // localStorage anahtarı
  changeEvent: string; // aynı sekmede değişiklik bildirimi için olay adı
  isValid?: (item: unknown) => item is T; // okurken bozuk kayıtları elemek için
}

export function createArrayStore<T>({
  storageKey,
  changeEvent,
  isValid,
}: CreateArrayStoreOptions<T>): ArrayStore<T> {
  // Anlık liste önbelleği: her render'da localStorage'a gitmeyi önler
  let cached: T[] | null = null;

  // Sunucu anlık görüntüsü için sabit boş dizi (referans hiç değişmez)
  const EMPTY_SNAPSHOT: T[] = [];

  // localStorage'dan listeyi okur; hata durumunda boş dizi.
  // isValid verildiyse bozuk/eksik kayıtlar sessizce elenir.
  function readFromStorage(): T[] {
    if (typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return isValid ? parsed.filter(isValid) : (parsed as T[]);
    } catch {
      return [];
    }
  }

  // useSyncExternalStore için anlık değer (ilk okumada önbelleğe alınır)
  function getSnapshot(): T[] {
    if (cached === null) cached = readFromStorage();
    return cached;
  }

  // Sunucuda (SSR/hydration) kullanılacak sabit boş değer
  function getServerSnapshot(): T[] {
    return EMPTY_SNAPSHOT;
  }

  // Değişikliklerde React'e haber veren abonelik.
  // storage olayı (başka sekme) + özel olay (aynı sekme) dinlenir.
  function subscribe(cb: () => void): () => void {
    const onChange = () => {
      cached = readFromStorage();
      cb();
    };
    window.addEventListener("storage", onChange);
    window.addEventListener(changeEvent, onChange);
    return () => {
      window.removeEventListener("storage", onChange);
      window.removeEventListener(changeEvent, onChange);
    };
  }

  // Listeyi belleğe + localStorage'a yazar ve aboneleri uyarır
  function write(next: T[]) {
    cached = next;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      // depolama dolu olabilir; sessizce geç
    }
    window.dispatchEvent(new CustomEvent(changeEvent));
  }

  return { getSnapshot, getServerSnapshot, subscribe, write };
}
