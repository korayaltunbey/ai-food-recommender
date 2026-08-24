# Akşam Ne Yesem?

Elindeki malzemelere veya seçtiğin filtrelere göre yemek öneren, tarifleri kişi sayısına göre ölçekleyen yerel yemek öneri uygulaması.

## Özellikler

- Dolaptaki malzemelerle öneri
- Malzeme girmeden genel öneri
- En fazla 5 yemeklik sonuç listesi
- Diyet, mutfak ve maksimum süre filtreleri
- Tarif detayları ve kişi sayısına göre miktar ölçekleme
- Daha önce önerilen ve yapılan yemekleri localStorage ile tekrar önermeme
- Tarif kaydetme, kopyalama ve tema tercihi

## Veri ve çalışma şekli

Tarif kataloğu `data/ai-food-recommender.db` içindeki SQLite veritabanında tutulur. Drizzle ORM, repository ve recommendation katmanları birlikte çalışır; runtime sırasında DeepSeek veya başka bir AI API çağrısı yapılmaz.

Mevcut katalog 194 tarif içerir ve birden fazla mutfak, kategori, diyet etiketi ve süre aralığını kapsar. Seed işlemi idempotenttir.

Akış:

```text
OneriClient
  -> POST /api/suggest
  -> parseSuggestionRequest
  -> recipe-repository + recommendations
  -> SQLite tarif kataloğu

Tarif seçimi
  -> POST /api/recipe
  -> SQLite repository
  -> kişi sayısına göre ölçeklenmiş tarif
```

## Kurulum

1. Bağımlılıkları kur:

   ```bash
   npm install
   ```

2. Veritabanını oluştur ve seed et:

   ```bash
   npm run db:migrate
   npm run db:seed
   ```

3. Geliştirme sunucusunu başlat:

   ```bash
   npm run dev
   ```

4. Tarayıcıda `http://localhost:3000` adresini aç.

## Komutlar

```bash
npm run dev                    # geliştirme sunucusu
npm run build                  # production build
npm run start                  # production sunucusu
npm run lint                   # ESLint
npm run test:recommendations   # recommendation regression testleri
npm run db:migrate             # SQLite migration
npm run db:seed                # idempotent seed
```

## Proje yapısı

```text
app/api/suggest/route.ts       Recommendation endpoint'i
app/api/recipe/route.ts        Tarif detay endpoint'i
components/OneriClient.tsx     Öneri ve tarif detay akışı
components/MalzemeGirisi.tsx   Malzeme girişi ve hızlı seçimler
lib/db.ts                      SQLite + Drizzle bağlantısı
lib/recipe-repository.ts       Tarif sorguları
lib/recommendations.ts         Ingredient matching, scoring ve filtreler
lib/recipe-mapper.ts           Tarif ve miktar ölçekleme
db/schema.ts                   Veritabanı şeması
db/seed.ts                     Tarif kataloğu seed'i
scripts/test-recommendations.ts Recommendation regression testleri
```

Kullanıcıya ait anonim geçmiş verileri mevcut `foof-*` localStorage anahtarlarıyla korunur.
