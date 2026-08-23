// Hata sınırı (error boundary): bir sayfa render sırasında hata verirse
// tüm uygulama çökmesin, kullanıcıya dostça bir ekran gösterip
// "Tekrar Dene" ile sayfayı yeniden denetme imkanı verir.

"use client";

import Link from "next/link";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-4 py-16 text-center">
      <div className="mb-4 text-5xl">😕</div>
      <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
        Bir şeyler ters gitti
      </h1>
      <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
        Beklenmeyen bir hata oluştu. Tekrar dene ya da ana sayfaya dön.
      </p>
      {/* Geliştirme aşamasında hatayı görünür kılar (üretimde silinebilir) */}
      {process.env.NODE_ENV === "development" && (
        <p className="mt-4 w-full max-w-md break-words rounded-lg border border-stone-200 bg-stone-50 px-4 py-3 font-mono text-xs text-red-600 dark:border-stone-800 dark:bg-stone-950/60 dark:text-red-400">
          {error.message || "Bilinmeyen hata"}
        </p>
      )}
      <div className="mt-6 flex gap-2">
        <button
          onClick={reset}
          className="rounded-lg bg-orange-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-orange-500"
        >
          Tekrar Dene
        </button>
        <Link
          href="/"
          className="rounded-lg border border-stone-300 px-5 py-2.5 text-sm font-bold text-stone-600 transition hover:bg-stone-100 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800"
        >
          Ana Sayfa
        </Link>
      </div>
    </main>
  );
}
