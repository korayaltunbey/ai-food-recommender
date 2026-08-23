// Tarif kartı bileşeni: seçilen yemeğin tam tarifini gösterir.
// Başlık + meta rozetler (süre/zorluk/kişi), ölçeklenmiş malzeme listesi,
// eksik olabilecek malzemeler uyarısı, adım adım hazırlanış ve ipucu içerir.

"use client";

import type { Recipe } from "@/lib/types";

interface TarifKartiProps {
  recipe: Recipe; // gösterilecek tarif
}

// Zorluk seviyesine göre rozet renkleri (açık + koyu mod)
const DIFFICULTY_STYLES: Record<Recipe["difficulty"], string> = {
  Kolay: "border-emerald-600/50 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300",
  Orta: "border-amber-600/50 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300",
  Zor: "border-red-600/50 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300",
};

export default function TarifKarti({ recipe }: TarifKartiProps) {
  return (
    <article className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-lg shadow-black/10 dark:border-stone-800 dark:bg-stone-900 dark:shadow-black/30">
      {/* Başlık bandı: yemek adı + meta bilgiler */}
      <div className="border-b border-stone-800 bg-gradient-to-r from-orange-600 to-amber-600 px-6 py-5 text-white">
        <h2 className="text-2xl font-bold">{recipe.name}</h2>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-semibold">
          {/* Toplam süre */}
          <span className="inline-flex items-center gap-1.5 rounded-md bg-black/25 px-2.5 py-1">
            &#9200; {recipe.timeMinutes} dk
          </span>
          {/* Zorluk rozeti */}
          <span className={`inline-flex items-center rounded-md border px-2.5 py-1 ${DIFFICULTY_STYLES[recipe.difficulty]}`}>
            {recipe.difficulty}
          </span>
          {/* Kaç kişilik */}
          <span className="inline-flex items-center gap-1.5 rounded-md bg-black/25 px-2.5 py-1">
            &#128100; {recipe.servings} kişilik
          </span>
        </div>
      </div>

      <div className="space-y-6 p-6">
        {/* Malzeme listesi: ölçüler sağa hizalı mono yazı tipinde */}
        <section>
          <h3 className="mb-2 text-xs font-bold text-stone-500 dark:text-stone-400">
            Malzemeler ({recipe.servings} kişilik ölçüler)
          </h3>
          <ul className="divide-y divide-stone-100 dark:divide-stone-800">
            {recipe.ingredients.map((ing, i) => (
              <li key={i} className="flex items-baseline justify-between gap-4 py-2">
                <span className="text-sm text-stone-800 dark:text-stone-200">{ing.name}</span>
                <span className="font-mono text-xs font-semibold text-stone-500 dark:text-stone-400">
                  {ing.amount}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* Dolap modunda kullanıcıda olmayabilecek malzemeler */}
        {recipe.missingIngredients.length > 0 && (
          <section className="rounded-lg border border-dashed border-orange-600/50 bg-orange-50 px-4 py-3 dark:border-orange-900 dark:bg-orange-950/40">
            <h3 className="mb-1 text-xs font-bold text-orange-700 dark:text-orange-300">
              &#9888; Eksik Olabilecek Malzemeler
            </h3>
            <p className="text-sm text-orange-700 dark:text-orange-400">
              {recipe.missingIngredients.join(", ")}
            </p>
          </section>
        )}

        {/* Adım adım hazırlanış: numaralı zaman çizelgesi */}
        <section>
          <h3 className="mb-3 text-xs font-bold text-stone-500 dark:text-stone-400">
            Hazırlanışı
          </h3>
          <ol className="space-y-0">
            {recipe.steps.map((step, i) => (
              <li key={i} className="relative flex gap-4 pb-5 last:pb-0">
                {/* Adımlar arası dikey bağlantı çizgisi */}
                {i < recipe.steps.length - 1 && (
                  <span className="absolute left-[13px] top-7 h-full w-px bg-stone-200 dark:bg-stone-700" />
                )}
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-orange-600 bg-orange-600/10 font-mono text-xs font-bold text-orange-600 dark:text-orange-400">
                  {i + 1}
                </span>
                <p className="text-sm leading-relaxed text-stone-700 dark:text-stone-300">{step}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* İsteğe bağlı ipucu notu */}
        {recipe.note && (
          <section className="rounded-lg border border-stone-200 bg-stone-50 px-4 py-3 dark:border-stone-800 dark:bg-stone-950/60">
            <h3 className="mb-1 text-xs font-bold text-stone-500 dark:text-stone-400">İpucu</h3>
            <p className="text-sm text-stone-600 dark:text-stone-400">{recipe.note}</p>
          </section>
        )}
      </div>
    </article>
  );
}
