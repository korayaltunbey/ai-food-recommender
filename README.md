# Akşam Ne Yesem?

Elinizdeki malzemelere ve tercihlerinize göre uygun yemekleri keşfetmenizi sağlayan bir yemek öneri uygulaması.

## Özellikler

- Dolaptaki malzemelere göre yemek önerme
- Malzeme girmeden genel yemek önerileri alma
- En fazla 5 yemeklik sonuç listesi
- Mutfak, diyet ve maksimum süre filtreleri
- Elle malzeme girişi ve sık kullanılan malzeme seçenekleri
- Tarif detaylarını görüntüleme
- Tarif miktarlarını kişi sayısına göre ölçekleme
- Daha önce önerilen veya yapılan yemekleri tekrar önermeme
- Tarif kaydetme, kopyalama ve tema tercihi

## Kullanılan teknolojiler

- Next.js 16 ve App Router
- React 19
- TypeScript
- Tailwind CSS
- SQLite
- Drizzle ORM
- better-sqlite3

## Nasıl çalışır?

Tarif kataloğu yerel SQLite veritabanından okunur. Recommendation katmanı malzeme eşleşmesini, ingredient coverage değerini, skorlamayı ve filtreleri uygular. Tarif seçildiğinde aynı katalogdan tarif detayları alınır ve miktarlar kişi sayısına göre ölçeklenir.

Uygulama çalışma sırasında harici bir yemek üretim servisine ihtiyaç duymaz.

Mevcut katalogda 194 tarif bulunur. Katalog farklı mutfakları, kategorileri, diyet etiketlerini ve süre aralıklarını kapsar.

## Kurulum

Bağımlılıkları kurun:

```bash
npm install
```

Veritabanı şemasını hazırlayın ve seed kataloğunu uygulayın:

```bash
npm run db:migrate
npm run db:seed
```

Geliştirme sunucusunu başlatın:

```bash
npm run dev
```

Ardından `http://localhost:3000` adresini açın.

## Komutlar

```bash
npm run dev                    # Geliştirme sunucusu
npm run build                  # Production derlemesi
npm run start                  # Production sunucusu
npm run lint                   # ESLint kontrolü
npm run test:recommendations   # Recommendation regression testleri
npm run db:generate            # Drizzle migration dosyası oluşturma
npm run db:migrate             # SQLite migration'larını uygulama
npm run db:seed                # Idempotent seed işlemi
```

## Proje yapısı

| Dosya veya klasör | Görevi |
| --- | --- |
| `app/api/suggest/route.ts` | Öneri endpoint'i |
| `app/api/recipe/route.ts` | Tarif detay endpoint'i |
| `components/OneriClient.tsx` | Öneri ve tarif detay akışı |
| `components/MalzemeGirisi.tsx` | Malzeme girişi ve hızlı seçimler |
| `lib/db.ts` | SQLite + Drizzle bağlantısı |
| `lib/recipe-repository.ts` | Tarif sorguları |
| `lib/recommendations.ts` | Eşleşme, scoring ve filtreler |
| `lib/recipe-mapper.ts` | Tarif ve miktar ölçekleme |
| `db/schema.ts` | Veritabanı şeması |
| `db/seed.ts` | Tarif kataloğu seed'i |
| `scripts/test-recommendations.ts` | Recommendation regression testleri |

## Test

Recommendation testlerini çalıştırın:

```bash
npm run test:recommendations
```

Bu testler malzeme eşleşmesini, çoklu malzeme coverage sıralamasını, filtreleri, dışlama kurallarını ve porsiyon ölçeklemeyi kontrol eder.

## Build

Production derlemesini doğrulayın:

```bash
npm run build
```

## Veritabanı

Uygulamanın çalışma zamanında kullandığı veritabanı, yerel SQLite dosyası `data/aksam-ne-yesem.db` konumundadır. Şema `db/schema.ts` ve migration dosyaları `drizzle/` altında tutulur.

194 tariflik katalog `db/seed.ts` üzerinden oluşturulur. Yeni bir yerel veritabanı hazırlamak için migration ve seed komutlarını çalıştırabilirsiniz:

```bash
npm run db:migrate
npm run db:seed
```

Bu işlem katalog verisini seed tanımlarından yeniden oluşturur.
