// Tema değiştirme butonu (güneş/ay ikonu).
// Tema durumunu useSyncExternalStore ile okur; tıklamada açık/koyu arasında
// geçiş yapar. Görünümü hem açık hem koyu modda üst bara uyumludur.

"use client";

import { useCallback, useLayoutEffect, useSyncExternalStore } from "react";
import {
  applyTheme,
  getThemeServerSnapshot,
  getThemeSnapshot,
  subscribeTheme,
  toggleTheme,
} from "@/lib/theme";

export default function ThemeToggle() {
  // Tema deposunu React'e bağla; tema değişince bileşen yeniden çizilir
  const theme = useSyncExternalStore(subscribeTheme, getThemeSnapshot, getThemeServerSnapshot);

  // Tema değiştiğinde <html> sınıfını güncelle (koyu/açık stiller buradan devreye girer).
  // useLayoutEffect: boyamadan ÖNCE çalışır; böylece dev'de StrictMode remount'unda
  // inline script'in koyduğu sınıf kaybolup sayfa yanıp sönmez.
  useLayoutEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Tıklama: mevcut temanın tersini uygula
  const handleClick = useCallback(() => {
    toggleTheme(theme);
  }, [theme]);

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={theme === "dark" ? "Açık temaya geç" : "Koyu temaya geç"}
      title={theme === "dark" ? "Açık tema" : "Koyu tema"}
      className="rounded-lg border border-stone-300 bg-white p-2 text-stone-600 transition hover:border-orange-500 hover:text-orange-600 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300 dark:hover:border-orange-500 dark:hover:text-orange-400"
    >
      {/* Koyu moddayken güneş (açığa geç), açık moddayken ay (koyuya geç) ikonu */}
      {theme === "dark" ? (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.36 6.36l-.7-.7M6.34 6.34l-.7-.7m12.72 0l-.7.7M6.34 17.66l-.7.7" />
          <circle cx="12" cy="12" r="4" />
        </svg>
      ) : (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
        </svg>
      )}
    </button>
  );
}
