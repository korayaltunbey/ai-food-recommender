// Üst bar (header) — her sayfada sabit görünür.
// Solda kase logolu uygulama adı, sağda tema değiştirme butonu.
// Açık modda açık zemin, koyu modda koyu zemin kullanır.

import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";

export default function Header() {
  return (
    // Sticky: kaydırırken üstte kalır; backdrop-blur arkayı yumuşak bulanıklaştırır
    <header className="sticky top-0 z-40 border-b border-stone-200 bg-stone-50/90 backdrop-blur dark:border-stone-800 dark:bg-stone-950/85">
      <div className="mx-auto flex w-full max-w-2xl items-center gap-3 px-4 py-3">
        {/* Logo + uygulama adı: tıklayınca ana sayfaya döner */}
        <Link href="/" className="flex items-center gap-2">
          {/* Küçük kase ikonu */}
          <svg
            className="h-6 w-6 text-orange-500"
            viewBox="0 0 64 64"
            fill="none"
            aria-hidden="true"
          >
            <path d="M14 30c0-8 8-13 18-13s18 5 18 13H14z" fill="currentColor" />
            <path
              d="M13 30h38v4a10 10 0 0 1-10 10H23a10 10 0 0 1-10-10v-4z"
              fill="#fdba74"
            />
            <path
              d="M32 14v-3m0 3a6 6 0 0 1 6 6"
              stroke="#fbbf24"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </svg>
          <span className="text-sm font-bold text-stone-900 dark:text-stone-100">
            Akşam Ne Yesem
          </span>
        </Link>

        {/* Sağ tarafta tema değiştirici */}
        <div className="ml-auto flex items-center gap-3">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
