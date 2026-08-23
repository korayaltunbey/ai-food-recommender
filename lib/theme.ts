// Tema yönetimi (açık / koyu).
// Kullanıcı tercihi localStorage'da saklanır; varsayılan tema KOYU'dur
// (açık tema yalnızca kullanıcı açıkça seçerse uygulanır).

export type Theme = "light" | "dark";

// localStorage anahtarı ve aynı sekmeler arası senkron için özel olay adı
const STORAGE_KEY = "foof-theme";
const CHANGE_EVENT = "foof-theme-changed";

// Anlık tema önbelleği: her render'da localStorage'a gitmeyi önler
// (React'in "getSnapshot should be cached" kuralına uyum sağlar)
let cached: Theme | null = null;

// Kayıtlı tercihi okur. "light" dışındaki her değer koyu kabul edilir.
function readFromStorage(): Theme {
  if (typeof window === "undefined") return "dark";
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "light" ? "light" : "dark";
  } catch {
    return "dark";
  }
}

// useSyncExternalStore için anlık tema değerini döndürür (önbellekli, stabil)
export function getThemeSnapshot(): Theme {
  if (cached === null) cached = readFromStorage();
  return cached;
}

// Sunucuda (SSR/hydration sırasında) kullanılacak değer:
// sunucu her zaman koyu varsayar, istemci gerçek tercihi devralır
export function getThemeServerSnapshot(): Theme {
  return "dark";
}

// Temada değişiklik olduğunda React'i bilgilendirmek için abonelik kurar.
// storage olayı (başka sekme) ve özel olayımız (aynı sekme) dinlenir.
export function subscribeTheme(cb: () => void): () => void {
  const onChange = () => {
    cached = readFromStorage();
    cb();
  };
  window.addEventListener("storage", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

// <html> öğesine/öğesinden "dark" sınıfını ekler/çıkarır.
// Tüm koyu tema stilleri bu sınıfa bağlı olduğu için sayfa anında değişir.
export function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

// Temayı kalıcı olarak kaydeder, önbelleği günceller ve hemen uygular.
export function setTheme(theme: Theme) {
  cached = theme;
  try {
    window.localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // depolama erişilemez olabilir; sessizce geç
  }
  applyTheme(theme);
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
}

// Tıklamada açık/koyu arasında geçiş yapar.
export function toggleTheme(current: Theme): Theme {
  const next: Theme = current === "dark" ? "light" : "dark";
  setTheme(next);
  return next;
}

// <head> içine gömülecek küçük senaryo: sayfa boyanmadan önce
// kayıtlı temayı uygular, böylece "yanıp sönme" (FOUC) yaşanmaz.
export function themeInitScript(): string {
  return `(function(){try{var t=localStorage.getItem("${STORAGE_KEY}");var dark=t!=="light";document.documentElement.classList.toggle("dark",dark);}catch(e){document.documentElement.classList.add("dark");}})();`;
}
