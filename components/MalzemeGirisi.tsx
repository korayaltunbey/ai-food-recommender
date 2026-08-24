// Malzeme giriş bileşeni (dolap modu).
// Kullanıcı malzemeleri yazıp Enter'a basarak ya da "Ekle" butonuyla ekler;
// sık kullanılan malzemeler çip olarak tek tıkla seçilebilir.
// Eklenen malzemeler çarpı butonuyla tek tek çıkarılabilir.

"use client";

import { useState } from "react";

// Tek tıkla eklenebilen sık kullanılan malzemeler
const QUICK_INGREDIENTS = [
  "Yumurta",
  "Domates",
  "Soğan",
  "Patates",
  "Makarna",
  "Pirinç",
  "Tavuk",
  "Kıyma",
  "Peynir",
  "Biber",
  "Sarımsak",
  "Yoğurt",
  "Un",
  "Bezelye",
  "Süt",
];

interface MalzemeGirisiProps {
  value: string[]; // seçili malzemeler (üst bileşenden gelir)
  onChange: (items: string[]) => void; // liste değişince üst bileşeni bilgilendirir
}

export default function MalzemeGirisi({ value, onChange }: MalzemeGirisiProps) {
  // Yazılan metin için geçici durum
  const [draft, setDraft] = useState("");

  // Malzemeyi listeye ekler; boşsa ve varsa (harf duyarsız) yok sayar
  function addIngredient(raw: string) {
    const item = raw.trim();
    if (!item) return;
    const normalized = item.toLowerCase();
    if (!value.some((v) => v.toLowerCase() === normalized)) {
      onChange([...value, item]);
    }
  }

  // "Ekle" butonu: draft metnini listeye ekler ve kutu içeriğini temizler
  function handleAdd() {
    addIngredient(draft);
    setDraft("");
  }

  // Enter tuşu: sayfa yenilenmesin diye önlenir ve malzeme eklenir
  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  }

  // Sık kullanılan çipi: seçiliyse kaldırır, değilse ekler
  function toggleQuick(item: string) {
    if (value.some((v) => v.toLowerCase() === item.toLowerCase())) {
      onChange(value.filter((v) => v.toLowerCase() !== item.toLowerCase()));
    } else {
      onChange([...value, item]);
    }
  }

  return (
    <div className="space-y-3">
      {/* Yazma kutusu + Ekle butonu */}
      <div className="flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Malzeme yaz, Enter'a bas (örn. kabak)"
          className="flex-1 rounded-lg border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 dark:placeholder-stone-500"
        />
        <button
          type="button"
          onClick={handleAdd}
          className="rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-orange-500"
        >
          Ekle
        </button>
      </div>

      {/* Eklenen malzemelerin çipleri */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-1.5 rounded-md border border-orange-600/40 bg-orange-50 px-2.5 py-1 text-xs text-orange-700 dark:border-orange-900 dark:bg-orange-950/40 dark:text-orange-300"
            >
              {item}
              <button
                type="button"
                onClick={() => onChange(value.filter((v) => v !== item))}
                aria-label={`${item} kaldır`}
                className="text-orange-500 hover:text-orange-700 dark:hover:text-orange-300"
              >
                &times;
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Sık kullanılan malzemeler: tek tıkla seç/kaldır */}
      <div>
        <p className="mb-1.5 text-xs font-bold text-stone-500 dark:text-stone-400">
          Sık Kullanılanlar
        </p>
        <div className="flex flex-wrap gap-1.5">
          {QUICK_INGREDIENTS.map((item) => {
            // Bu malzeme seçili mi?
            const active = value.some((v) => v.toLowerCase() === item.toLowerCase());
            return (
              <button
                key={item}
                type="button"
                onClick={() => toggleQuick(item)}
                className={`rounded-md border px-2.5 py-1 text-xs font-medium transition ${
                  active
                    ? "border-orange-600 bg-orange-600 text-white"
                    : "border-stone-300 bg-white text-stone-600 hover:border-orange-500 hover:text-orange-600 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300 dark:hover:border-orange-500 dark:hover:text-orange-400"
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
