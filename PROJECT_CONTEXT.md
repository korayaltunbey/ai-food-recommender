# Project Context — ai-food-recommender / Akşam Ne Yesem?

## Mevcut durum

Uygulama, kullanıcının malzemelerine veya filtrelerine göre yerel tarif kataloğundan yemek önerir. Runtime recommendation ve tarif detay akışlarında harici AI/DeepSeek API kullanılmaz.

- Tarif kataloğu: `data/ai-food-recommender.db`
- Veritabanı: SQLite
- ORM: Drizzle
- Güncel katalog: 194 tarif
- API route'ları: `/api/suggest`, `/api/recipe`
- Recommendation regression testleri: `scripts/test-recommendations.ts`
- Son doğrulama: recommendation testleri, lint ve build başarılı

## Mimari

```text
OneriClient
  -> POST /api/suggest
  -> parseSuggestionRequest
  -> getRecommendations
  -> recipe-repository
  -> SQLite + Drizzle
```

Tarif detay akışı:

```text
OneriClient
  -> POST /api/recipe
  -> parseRecipeRequest
  -> recipe-repository
  -> recipe-mapper
  -> ölçeklenmiş tarif
```

### Önemli dosyalar

- `app/api/suggest/route.ts`: Yerel recommendation sonuçlarını döndürür.
- `app/api/recipe/route.ts`: SQLite kataloğundan tarif detayını döndürür.
- `components/OneriClient.tsx`: Öneri, filtre, tarif detay ve geçmiş akışı.
- `components/MalzemeGirisi.tsx`: Elle malzeme girişi ve hızlı seçimler.
- `lib/requests.ts`: İstek gövdesi doğrulama ve temizleme.
- `lib/db.ts`: `data/ai-food-recommender.db` için server-side Drizzle bağlantısı.
- `lib/recipe-repository.ts`: Tarif ve ilişkili ingredient/diyet/adım sorguları.
- `lib/recommendations.ts`: Normalization, ingredient matching, coverage, scoring, filtreleme ve exclusion.
- `lib/recipe-mapper.ts`: Database tariflerini mevcut response modeline ve porsiyon ölçeklemeye dönüştürür.
- `db/schema.ts`: SQLite + Drizzle şeması.
- `db/seed.ts`: Idempotent tarif kataloğu seed'i.
- `scripts/test-recommendations.ts`: Recommendation regression testleri.

## Recommendation davranışı

Dolaptakiler modunda ingredient filtresi olan tarifler gösterilir. Sıralama:

1. Kullanıcının kaç farklı malzemesinin karşılandığı (`ingredientCoverage`)
2. Gerekli tarif malzemelerinin eşleşme oranı (`matchScore`)
3. Eşleşen ingredient sayısı
4. Süre
5. Tarif adı

Ingredient matching normalizasyon ve token-aware eşleşme kullanır. Bu nedenle `tavuk`, `tavuk göğsü` gibi anlamlı alt türleri eşleştirebilir. Diyet, mutfak, süre, `excludeNames` ve `excludeIngredients` filtreleri repository/recommendation katmanında uygulanır.

Genel `Bana Öner` modunda ingredient filtresi uygulanmaz; diğer filtreler korunur. `/api/suggest` sonucu yoksa Dolaptakiler modunda öneri geçmişini güvenli fallback olarak kaldırıp uygun tarifleri yeniden kullanabilir.

## Seed kataloğu

`db/seed.ts` mevcut tarifleri koruyan ve slug üzerinden idempotent çalışan katalog seed'idir. Katalog Türk, İtalyan, Asya, Meksika, Akdeniz ve diğer desteklenen mutfakları; kahvaltı, çorba, ana yemek, salata/meze, hamur işi ve tatlı kategorilerini kapsar. Diyet etiketleri ve farklı süre aralıkları seed verisinde tutulur.

Seed komutları:

```bash
npm run db:migrate
npm run db:seed
```

## Kullanıcı verileri

Authentication olmadığı için anonim kullanıcı tercihleri ve geçmişleri browser localStorage'da tutulur. Mevcut legacy anahtarlar bilinçli olarak korunur:

- `foof-suggestion-history`
- `foof-made`
- `foof-suggested`
- `foof-theme`

Bu anahtarlar değiştirilmemelidir.

## Doğrulama

```bash
npm run test:recommendations
npm run lint
npm run build
```

Bu dosya, mevcut local SQLite + Drizzle recommendation mimarisini ve 194 tariflik katalog durumunu yansıtır.
