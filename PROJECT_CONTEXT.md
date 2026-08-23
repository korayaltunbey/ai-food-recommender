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
- İlk Türk Mutfağı seed kataloğu eklendi; mevcut API’ler hâlâ DeepSeek tarafından runtime’da çalışıyor.

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
lib/recipes.ts                AI promptları ve AI çıktısı doğrulama
lib/deepseek.ts               DeepSeek API istemcisi
lib/*.ts                      localStorage depoları ve tema altyapısı
```

Kullanıcı arayüzü istemci ağırlıklıdır. API route’ları server tarafında çalışır ve DeepSeek API anahtarını tarayıcıya açmaz.

## Ana veri akışları

### Dolaptakilerle veya genel öneri akışı

```text
Ana sayfa
  -> /oneri?mode=dolap veya /oneri?mode=bana
  -> OneriClient formu
  -> POST /api/suggest
  -> parseSuggestionRequest
  -> DeepSeek promptu
  -> 5 DishSuggestion
  -> suggested localStorage geçmişine ekleme
```

### Tarif görüntüleme akışı

```text
Kullanıcı bir yemek seçer
  -> POST /api/recipe
  -> parseRecipeRequest
  -> DeepSeek tarif promptu
  -> Recipe JSON doğrulaması
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

- `app/api/suggest/route.ts`: DeepSeek’ten 5 farklı yemek önerisi ister ve doğrulanmış liste döndürür.
- `app/api/recipe/route.ts`: Seçilen yemek için DeepSeek’ten tam tarif ister ve doğrular.
- `lib/deepseek.ts`: `DEEPSEEK_API_KEY` ve `DEEPSEEK_MODEL` ile DeepSeek chat/completions çağrısı yapar; JSON parse ve hata yönetimi burada.
- `lib/recipes.ts`: Liste/tarif system promptları, user promptları, JSON doğrulayıcıları ve `SUGGEST_COUNT = 5`.
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

## DeepSeek’in mevcut kullanım alanları

DeepSeek şu anda uygulamanın temel yemek motorudur:

1. `POST /api/suggest` içinde filtreler, malzemeler ve dışlama listeleriyle 5 yemek adı üretir.
2. `POST /api/recipe` içinde seçilen yemek için tam tarif üretir.
3. Kişi sayısına göre malzeme miktarlarını prompt aracılığıyla ölçekler.
4. Dolap modunda eksik olabilecek tamamlayıcı malzemeleri `missingIngredients` alanında üretir.
5. Üretilen JSON, `lib/recipes.ts` içindeki doğrulayıcılarla UI’a ulaşmadan kontrol edilir.

DeepSeek’e ait environment değişkenleri:

- `DEEPSEEK_API_KEY`: Zorunlu API anahtarı.
- `DEEPSEEK_MODEL`: Varsayılan `deepseek-chat`.

## Mevcut yemek/veri modeli

Kalıcı yemek kataloğu local SQLite database’de bulunuyor. Öneri ve tarif API’leri henüz bu kataloğu kullanmıyor; runtime veri üretimi hâlâ DeepSeek üzerinden.

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
- Lint başarılı oldu.
- Build başarılı oldu.

## Şu anda üzerinde çalışılan işler

Database altyapısı, ilk Türk Mutfağı seed kataloğu, proje adlandırma temizliği ve local recommendation servisleri tamamlandı. Şu anda `/api/suggest` ve `/api/recipe` hâlâ eski DeepSeek sistemini kullanıyor. Yeni local recommendation servisi henüz API route’larına bağlanmadı. DeepSeek henüz kaldırılmadı ve frontend henüz değiştirilmedi. LocalStorage anahtarları bilinçli olarak legacy `foof-*` isimleriyle korunuyor; migration daha sonraki ayrı bir iştir.

## Önemli mimari kararlar

- DeepSeek API anahtarı yalnızca server tarafında tutulur.
- UI, öneri listesi ve tarif detayını iki ayrı API çağrısıyla alır.
- API route’ları `app/api/**/route.ts` altında App Router Route Handler olarak kalır.
- Database katmanı UI’dan ayrılmalı; route’lar repository/service fonksiyonlarını çağırmalıdır.
- Local recommendation katmanı `lib/recipe-repository.ts`, `lib/recommendations.ts` ve `lib/recipe-mapper.ts` altında route’lardan bağımsız tutulur.
- `/api/suggest` ve `/api/recipe` henüz DeepSeek tabanlıdır; local recommendation servisleri henüz route’lara bağlanmamıştır.
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
- README ve environment dokümantasyonu DeepSeek merkezlidir; migration sonrasında güncellenmelidir.

## Sıradaki yapılacak iş

Local recommendation servisleri hazır; henüz API route entegrasyonu yapılmadı.

1. `/api/suggest` route’unu local recommendation servisine bağla.
2. Entegrasyonu ve mevcut frontend akışını test et.
3. `/api/recipe` route’unu database tarif sorgulama ve mapper katmanına geçir.
4. DeepSeek bağımlılıklarını, prompt/parser katmanını ve ilgili environment/dokümantasyon referanslarını kaldır.

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

6. **`/api/suggest` route’unu dönüştür**
   - DeepSeek çağrısını kaldır.
   - Filtreleri uygula.
   - Dolap modunda malzeme eşleşme puanı hesapla.
   - `excludeNames` ve “yaptığım yemekler” listesini uygula.
   - 5 farklı sonuç döndür.

7. **`/api/recipe` route’unu dönüştür**
   - `recipeId`/`slug` ile database’den tarif getir.
   - Kişi sayısına göre miktarları deterministik ölçekle.
   - Eksik malzemeleri kullanıcının malzemeleriyle karşılaştırarak hesapla.

8. **İstemciyi güncelle**
   - `OneriClient.tsx` içinde id/slug taşı.
   - AI’ye özel varsayımları kaldır.
   - Database kaynaklı hata ve boş sonuç durumlarını ele al.

9. **AI kodunu temizle**
   - `lib/deepseek.ts` kaldırılabilir.
   - `lib/recipes.ts` içindeki prompt ve AI parse bölümleri kaldırılabilir.
   - DeepSeek environment değişkenleri ve README talimatları silinmelidir.

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

Bu dosya son olarak local SQLite + Drizzle recommendation servislerinin oluşturulması ve smoke testlerinin tamamlanması sonrasında güncellenmiştir. Yeni önemli görevlerin sonunda bu bölüm ve ilgili bölümler güncellenmelidir.

## Güncelleme

- Tarih: 2026-08-23
- Mevcut aşama: Local SQLite + Drizzle recommendation servisleri hazır; API route entegrasyonu henüz yapılmadı.
