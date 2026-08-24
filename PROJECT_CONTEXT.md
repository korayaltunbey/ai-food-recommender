# Project Context — ai-food-recommender / Akşam Ne Yesem?

> Bu dosya, yeni Codex sohbetlerinde projenin mevcut durumunu hızlıca anlamak için yaşayan proje hafızasıdır.
> Önemli görevlerin sonunda tamamlanan işler, mimari kararlar, değişiklikler ve sıradaki iş güncellenmelidir.

## Projenin amacı

Kullanıcının elindeki malzemeleri veya genel tercihlerini kullanarak yemek önerileri sunan web uygulaması. Uygulama:

- Dolaptaki malzemelere göre yemek önerir.
- Malzeme girmeden genel yemek önerisi sunar.
- Her öneri için kişi sayısına göre ölçeklenmiş tam tarif gösterir.
- Diyet, maksimum süre ve mutfak/yöre filtrelerini destekler.
- Daha önce önerilen ve kullanıcının yaptığı yemekleri tekrar önermemeye çalışır.
- Tarifleri kopyalama ve tarayıcıda saklama özellikleri sunar.

## Tech stack

- Next.js `16.3.1`
- React `19.2.8`
- TypeScript `^5`
- Tailwind CSS `^4` ve `@tailwindcss/postcss`
- ESLint `^9`, `eslint-config-next`
- Next.js App Router
- Local SQLite database ve Drizzle ORM altyapısı eklendi.
- SQLite bağlantısı `better-sqlite3` üzerinden server tarafında çalışır.
- İlk Türk Mutfağı seed kataloğu eklendi; `/api/suggest` ve `/api/recipe` artık SQLite + Drizzle üzerinden runtime’da çalışıyor.

## Mevcut mimari

Uygulama küçük bir Next.js App Router uygulamasıdır:

```text
app/page.tsx                  Ana sayfa
app/oneri/page.tsx            Server Component; URL mode parametresini okur
components/OneriClient.tsx    Client Component; öneri ve tarif akışının merkezi
app/api/suggest/route.ts      Yemek listesi API route’u
app/api/recipe/route.ts       Tam tarif API route’u
lib/types.ts                  Ortak TypeScript veri tipleri
lib/requests.ts               API istek doğrulama/temizleme
lib/*.ts                      localStorage depoları ve tema altyapısı
```

Kullanıcı arayüzü istemci ağırlıklıdır. API route’ları server tarafında çalışır ve SQLite + Drizzle tarif kataloğuna erişir.

## Ana veri akışları

### Dolaptakilerle veya genel öneri akışı

```text
Ana sayfa
  -> /oneri?mode=dolap veya /oneri?mode=bana
  -> OneriClient formu
  -> POST /api/suggest
  -> parseSuggestionRequest
  -> getRecommendations()
  -> SQLite + Drizzle ingredient matching / scoring / filtreler
  -> 5 DishSuggestion
  -> suggested localStorage geçmişine ekleme
```

### Tarif görüntüleme akışı

```text
Kullanıcı bir yemek seçer
  -> POST /api/recipe
  -> parseRecipeRequest
  -> SQLite + Drizzle tarif repository’si
  -> recipe mapper ile porsiyon ölçekleme
  -> TarifKarti ile gösterim
```

### Kullanıcı işlemleri

```text
Tarifi kaydet       -> foof-suggestion-history
Yaptım, önermesin   -> foof-made
Öneri tekrarını engelle -> foof-suggested
Tema tercihi        -> foof-theme
```

## Önemli dosyalar ve görevleri

### Uygulama ve sayfalar

- `app/page.tsx`: İki mod kartı, yapılan yemekler, öneri geçmişi ve kaydedilen tarifleri gösterir.
- `app/oneri/page.tsx`: `searchParams` içindeki `mode` değerini okur ve `OneriClient`’a başlangıç modu verir.
- `app/layout.tsx`: Kök layout, metadata, font, tema başlangıç script’i ve ortak Header.
- `app/components/InlineScript.tsx`: Tema script’ini hydration güvenli şekilde inline çalıştırır.
- `app/error.tsx`, `app/global-error.tsx`: Sayfa ve global hata ekranları.

### Bileşenler

- `components/OneriClient.tsx`: Form durumu, filtreler, `/api/suggest`, `/api/recipe`, kayıt, kopyalama ve “yaptım” işlemleri.
- `components/MalzemeGirisi.tsx`: Malzeme ekleme/çıkarma ve hızlı malzeme çipleri.
- `components/TarifKarti.tsx`: Tarif bilgileri, malzemeler, eksik malzemeler, adımlar ve not.
- `components/Header.tsx`: Ortak üst bar.
- `components/ThemeToggle.tsx`: Açık/koyu tema geçişi.

### Sunucu ve domain yardımcıları

- `app/api/suggest/route.ts`: SQLite + Drizzle recommendation servisinden filtrelenmiş ve puanlanmış yemek listesi döndürür.
- `app/api/recipe/route.ts`: Seçilen yemeği SQLite + Drizzle repository’sinden bulur ve mevcut `Recipe` tipine map eder.
- `lib/requests.ts`: API gövdelerini temizler ve sınırlar; kişi sayısı 1–20, dışlama listeleri en fazla 50 öğe.
- `lib/types.ts`: `SuggestionMode`, `Recipe`, `DishSuggestion`, `SuggestionRequest`, `RecipeRequest`, `SavedRecipe` ve ilgili tipler.
- `db/schema.ts`: SQLite + Drizzle tarif kataloğu şeması.
- `lib/db.ts`: Local `data/ai-food-recommender.db` için server-side Drizzle bağlantısı.
- `drizzle.config.ts`: Drizzle Kit schema, migration ve SQLite database yapılandırması.
- `drizzle/`: İlk SQL migration’ı ve Drizzle metadata dosyaları.
- `db/seed.ts`: Tekrarlanabilir 25 tariflik Türk Mutfağı seed verisi ve idempotent seed işlemi.
- `lib/recipe-repository.ts`: SQLite + Drizzle üzerinden tarif sorgulama ve ilişkili verileri yükleme katmanı.
- `lib/recommendations.ts`: Ingredient normalization, eşleşme, skor, filtreleme ve yerel öneri algoritması.
- `lib/recipe-mapper.ts`: Database tariflerini mevcut `Recipe` tipine dönüştürme ve porsiyon ölçekleme katmanı.
- `npm run db:seed`: Seed dosyasını local SQLite database’e uygular.

## Runtime veri kaynağı

Tarif ve öneri verileri local SQLite kataloğundan gelir. Porsiyon ölçekleme `lib/recipe-mapper.ts`, eksik malzeme hesabı `lib/recommendations.ts` üzerinden deterministik olarak yapılır.

## Mevcut yemek/veri modeli

Kalıcı yemek kataloğu local SQLite database’de bulunuyor. Öneri ve tarif API’leri bu kataloğu kullanıyor; runtime veri üretimi harici bir AI servisine bağlı değil.

Mevcut `Recipe` yapısında malzeme miktarı string’dir:

```ts
{
  name: string;
  timeMinutes: number;
  difficulty: "Kolay" | "Orta" | "Zor";
  servings: number;
  ingredients: { name: string; amount: string }[];
  steps: string[];
  missingIngredients: string[];
  note?: string;
}
```

Database geçişinde gerçek ölçekleme için miktarların sayısal miktar + birim olarak modellenmesi tercih edilmelidir. Örneğin `baseQuantity: 300`, `unit: "gr"`.

## localStorage yapısı

Ortak altyapı `lib/store.ts` içindeki `createArrayStore` fabrikasıdır. Cache, `useSyncExternalStore`, aynı sekme için CustomEvent ve sekmeler arası `storage` event’i kullanılır.

- `lib/history.ts`
  - Key: `foof-suggestion-history`
  - En fazla 20 kaydedilmiş tarif.
  - Tam `SavedRecipe`/`Recipe` verisi saklanır.

- `lib/made.ts`
  - Key: `foof-made`
  - En fazla 50 yapılan yemek adı.
  - Büyük/küçük harf duyarsız tekrar kontrolü.
  - Sonraki önerilerden dışlanır.

- `lib/suggested.ts`
  - Key: `foof-suggested`
  - En fazla 100 daha önce önerilmiş yemek adı.
  - Sonraki API isteklerinde `excludeNames` olarak gönderilir.

- `lib/theme.ts`
  - Key: `foof-theme`
  - Açık/koyu tema tercihi.
  - Database migration’ından bağımsız tutulabilir.

Authentication olmadığı için kullanıcıya özel geçmişin database’e taşınması şu an doğrudan mümkün değildir. Database’e taşınması gereken esas veri yemek kataloğudur; kullanıcı geçmişleri ilk aşamada localStorage’da kalabilir.

## Tamamlanan işler

- Next.js App Router tabanlı temel uygulama oluşturuldu.
- Dolaptaki malzemelerle öneri modu oluşturuldu.
- Genel “Bana Öner” modu oluşturuldu.
- 5 yemeklik öneri listesi akışı tamamlandı.
- Seçilen yemek için tam tarif akışı tamamlandı.
- Kişi sayısı, diyet, süre ve mutfak/yöre filtreleri eklendi.
- Tarif kaydetme, kopyalama ve “yaptım, önermesin” işlevleri eklendi.
- Öneri tekrarını engelleme mantığı eklendi.
- Açık/koyu tema ve hydration güvenli başlangıç script’i eklendi.
- API request ve AI response doğrulama katmanları oluşturuldu.
- Mevcut proje mimarisi ve AI → database dönüşüm kapsamı analiz edildi.
- `PROJECT_CONTEXT.md` proje hafızası olarak oluşturuldu.
- `drizzle-orm`, `better-sqlite3`, `drizzle-kit` ve `@types/better-sqlite3` paketleri eklendi.
- Local SQLite database dosyası `data/ai-food-recommender.db` olarak tutulur ve gitignore’a alınır.
- `recipes`, `ingredients`, `recipe_ingredients`, `recipe_steps` ve `recipe_diets` tabloları için ilk migration üretildi ve uygulandı.
- Database tabloları, index’ler ve foreign key’ler SQLite metadata’sından doğrulandı.
- `db/seed.ts` ile 25 gerçek ve yaygın Türk Mutfağı tarifi seed edildi.
- Seed sonrası database’de 25 tarif, 54 unique ingredient, 216 tarif-malzeme, 127 tarif adımı ve 44 diyet ilişkisi doğrulandı.
- Seed ikinci kez çalıştırılarak tarif ve ingredient duplicate’i üretmediği doğrulandı.
- Kategori dağılımı doğrulandı: 4 Kahvaltı, 4 Çorba, 6 Ana yemek, 4 Hamur işi, 4 Salata/meze, 3 Tatlı.
- Proje adı `ai-food-recommender` olarak güncellendi.
- SQLite dosyası mevcut veriler korunarak `data/ai-food-recommender.db` yoluna taşındı.
- Paket adı, README ve Drizzle database yolu yeni proje adıyla tutarlı hale getirildi.
- `lib/recipe-repository.ts` oluşturuldu.
- `lib/recommendations.ts` oluşturuldu.
- `lib/recipe-mapper.ts` oluşturuldu.
- SQLite + Drizzle üzerinden local recommendation altyapısı hazırlandı.
- Ingredient normalization, ingredient matching ve `matchScore` sistemi hazırlandı.
- Diyet, mutfak/yöre ve süre filtreleri; `excludeNames` ve `excludeIngredients` desteği hazırlandı.
- Eksik zorunlu malzeme hesaplama ve varsayılan 5 öneri davranışı hazırlandı.
- Recipe mapper, database tariflerini mevcut `Recipe` tipine dönüştürüyor.
- Porsiyon miktarlarının ölçeklenmesi hazırlandı.
- `Domates + Yumurta → Menemen` smoke testi başarılı oldu.
- 2 → 4 kişilik miktar ölçekleme, `excludeNames`, diyet ve süre filtreleri başarılı oldu.
- `/api/suggest` route’u local recommendation servisine bağlandı; `domates + yumurta → Menemen` smoke testi başarılı oldu.
- `/api/recipe` route’u SQLite repository + recipe mapper katmanına bağlandı; gerçek `Menemen` tarifi, miktarlar ve adımlar endpoint üzerinden doğrulandı.
- Öneri listesinden seçilen yemeğin `/api/recipe` ile açıldığı uçtan uca contract testi başarılı oldu.
- Lint başarılı oldu.
- Build başarılı oldu.

## Şu anda üzerinde çalışılan işler

Database altyapısı, ilk Türk Mutfağı seed kataloğu, proje adlandırma temizliği, local recommendation servisleri ve iki API route entegrasyonu tamamlandı. `/api/suggest` ve `/api/recipe` local SQLite + Drizzle altyapısına bağlı. Frontend contract’ları korunarak öneri listesi ve tarif görüntüleme akışları gerçek database verisiyle çalışıyor. Kullanılmayan eski AI altyapısı temizlendi; localStorage anahtarları bilinçli olarak legacy `foof-*` isimleriyle korunuyor.

## Önemli mimari kararlar

- UI, öneri listesi ve tarif detayını iki ayrı API çağrısıyla alır.
- API route’ları `app/api/**/route.ts` altında App Router Route Handler olarak kalır.
- Database katmanı UI’dan ayrılmalı; route’lar repository/service fonksiyonlarını çağırmalıdır.
- Local recommendation katmanı `lib/recipe-repository.ts`, `lib/recommendations.ts` ve `lib/recipe-mapper.ts` altında route’lardan bağımsız tutulur.
- `/api/suggest` ve `/api/recipe` local SQLite + Drizzle tabanlıdır.
- Database recommendation katmanı mevcut `Recipe` response tipini ve porsiyon ölçekleme davranışını korur.
- Öneri algoritması database sorgusu + uygulama katmanında puanlama şeklinde çalışmalıdır.
- `dishName` yerine database geçişinde `recipeId` veya `slug` kullanılması tercih edilir.
- Database tarif kataloğu için tercih Drizzle ORM + local SQLite’tır.
- Database dosyası `data/ai-food-recommender.db` altında tutulur; Turso/libSQL veya başka harici database kullanılmaz.
- Drizzle schema `db/schema.ts`, bağlantı `lib/db.ts`, migration çıktısı `drizzle/` altındadır.
- Local SQLite dosyaları repository’ye eklenmez; migration dosyaları kaynak kontrolünde tutulur.
- LocalStorage anahtarları (`foof-*`) bu aşamada değiştirilmez; mevcut kullanıcı verilerini korumak için ayrı migration planlanır.
- Authentication eklenene kadar tema, anonim geçmiş ve yapılan yemekler localStorage’da kalabilir.
- Tarif malzeme miktarları database’de sayısal miktar ve birim olarak tutulmalıdır.

## Bilinen problemler ve riskler

- Seed kataloğu şu anda yalnızca Türk Mutfağı tariflerinden oluşuyor; dünya mutfakları henüz eklenmedi.
- AI yanıtlarına bağımlılık nedeniyle aynı istek her zaman aynı sonucu vermeyebilir.
- Kişi sayısına göre ölçekleme şu anda AI promptuna bağlıdır; deterministik değildir.
- `RecipeIngredient.amount` string olduğu için database tarafında güvenilir ölçekleme yapılamaz.
- `excludeNames` yalnızca yemek adları üzerinden çalışır; benzer yemek dışlama mantığı AI’ye bırakılmıştır.
- localStorage cihaz/tarayıcı bazlıdır; kullanıcı hesabı veya cihazlar arası senkronizasyon yoktur.
- AI tarafından üretilen tariflerin içerik doğruluğu uygulama tarafından tamamen garanti edilemez.
- Database’e geçişte filtrelerin ve malzeme eşleşmesinin Türkçe karakter/normalizasyon davranışı ayrıca tasarlanmalıdır.
- README ve environment dokümantasyonu local SQLite + Drizzle akışını yansıtır.

## Sıradaki yapılacak iş

Local recommendation servisleri, iki API route entegrasyonu ve kullanılmayan AI altyapısının temizliği tamamlandı.

1. Regression testlerini genişlet.
2. Tarif kataloğunu ve desteklenen mutfakları genişlet.

## AI → database migration planı

1. **Şemayı tasarla**
   - `recipes`
   - `ingredients`
   - `recipe_ingredients`
   - Tarif adımları
   - Yemek türü, mutfak, diyet etiketleri

2. **Tipleri database modeline uyarla**
   - `Recipe` ve `DishSuggestion` tiplerine `id`/`slug` ekle.
   - String miktar yerine sayısal miktar + birim kullan.

3. **Seed kataloğu oluştur**
   - 25 gerçek ve doğrulanmış Türk Mutfağı tarifi `db/seed.ts` ile eklendi.

4. **Database katmanını ekle**
   - Drizzle + local SQLite bağlantısı.
   - Server-only `lib/db.ts`.
   - Tarif repository fonksiyonları.

    - Database altyapısı ve repository/recommendation servisleri tamamlandı; route entegrasyonu sıradaki iştir.

5. **Öneri repository’sini yaz**
   - `getRecipeById`
   - `findRecipes`
   - `findRecipesByIngredients`
   - `getRandomRecipes`

6. **`/api/suggest` route’unu dönüştür — tamamlandı**
   - Harici AI çağrısı kaldırıldı; local recommendation servisi kullanılıyor.
   - Filtreler, malzeme eşleşme puanı, `excludeNames` ve `excludeIngredients` uygulanıyor.
   - 5 farklı sonuç response contract korunarak döndürülüyor.

7. **`/api/recipe` route’unu dönüştür — tamamlandı**
   - Mevcut frontend contract’ı korunarak `dishName` ile database tarif sorgulanıyor.
   - Kişi sayısına göre miktarlar deterministik ölçekleniyor.
   - Dolap modunda eksik malzemeler kullanıcının malzemeleriyle karşılaştırılarak hesaplanıyor.

8. **İstemciyi güncelle**
   - `OneriClient.tsx` içinde id/slug taşı.
   - AI’ye özel varsayımları kaldır.
   - Database kaynaklı hata ve boş sonuç durumlarını ele al.

9. **Kullanılmayan AI kodunu temizle — tamamlandı**
   - Kullanılmayan prompt/parser ve harici AI istemcisi dosyaları kaldırıldı.
   - Harici AI environment ve README referansları kaldırıldı.

10. **localStorage kararını uygula**
    - Tema localStorage’da kalır.
    - Authentication yoksa anonim geçmiş ve yapılan yemekler localStorage’da kalır.
    - Kullanıcı hesapları eklenirse bunlar kullanıcıya bağlı database tablolarına taşınır.

11. **Test ve doğrulama yap**
    - Malzeme eşleşmesi
    - Filtreler
    - Dışlama kuralları
    - Tarif ölçekleme
    - Boş sonuç
    - API hata durumları
    - Lint ve production build

## Context güncelleme notu

Bu dosya son olarak local SQLite + Drizzle recommendation servislerinin iki API route’a bağlanması ve smoke testlerinin tamamlanması sonrasında güncellenmiştir. Yeni önemli görevlerin sonunda bu bölüm ve ilgili bölümler güncellenmelidir.

## Güncelleme

- Tarih: 2026-08-24
- Recommendation sÄ±ralamasÄ±nda Dolaptakilerle modu iÃ§in `ingredientCoverage` birincil kriter olarak eklendi; `matchScore`, eÅŸit coverage durumunda ikincil kriter olarak korunuyor.
- Malzeme giriÅŸindeki hÄ±zlÄ± seÃ§im listesine Bezelye eklendi.
- Bezelye, bezelye + domates, manuel/hÄ±zlÄ± seÃ§im eÅŸitliÄŸi ve tavuk â†’ tavuk gÃ¶ÄŸsÃ¼ regression testleri doÄŸrulandÄ±; test, lint ve build baÅŸarÄ±lÄ±.
- Mevcut aşama: `/api/suggest` ve `/api/recipe` local SQLite + Drizzle altyapısına bağlı; eski AI altyapısı temizlendi, gerçek tarif ve öneri akışları test edildi.
